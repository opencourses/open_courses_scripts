var configs = require('../../configs');
var utils = require('../../utils');
var revalidator = require('revalidator');
var fs = require('fs');
var ncp = require('ncp').ncp;
var mkdirp = require('mkdirp');
var toTOMLString = require('toml-stream').toTOMLString;
var log = require("loglevel");

module.exports = {
    get_exercise_name: function(number) {
        return configs.parsed.exercise_prefix+'_'+utils.pad(number);
    },

    get_exercise_path: function(name) {
        return configs.parsed.exercise_dir+'/'+name+'/exercise.toml';
    },

    remove_matching: function(data, exclude_regex) {
        for (var item in data) {
            exclude_regex.forEach(function(exclude) {
                if (item.match(exclude)) {
                    delete data[item];
                }
            });
        }
    },

    /*
     * Args must contain: number <- the numeber of the exercise to be validated
     */
    validate: function(args, cb) {
        var exercise_name = module.exports.get_exercise_name(args.number);
        var exercise_path = module.exports.get_exercise_path(exercise_name);
        var exclude_regex = [ 'comment\d*' ];

        utils.parse_toml(exercise_path, function(err, data) {
            if (err) {
                log.error('Error while reading the exercise configuration file');
                return;
            }
            module.exports.remove_matching(data, exclude_regex);
            module.exports.validate_data(data, function(err, result) {
                if (err) {
                    return cb(err);
                }
                return cb(null, result);
            });
        });
    },

    validate_data: function(data, cb) {
        module.exports.read_schema(configs.parsed.exercise_schema, function(err, schema) {
            if (err) {
                log.error("Error reading exercise schema");
                return cb(err);
            }
            return cb(null, revalidator.validate(data, schema));
        });
    },

    read_schema: function(schema_path, cb) {
            fs.readFile(schema_path, 'utf8', function(err, parsed_json) {
                if (err) {
                    return cb(err);
                }
                var schema = JSON.parse(parsed_json);
                return cb(null, schema);
            });
    },

    get_items: function(number, cb) {
        var exercise_name = module.exports.get_exercise_name(number);
        var exercise_path = module.exports.get_exercise_path(exercise_name);

        var exclude_regex = ["comment\d*"];
        utils.parse_toml(exercise_path, function(err, data) {
            if (err) {
                log.error('Error while reading the exercise configuration file');
                cb(err, null);
                return;
            }
            module.exports.remove_matching(data, exclude_regex);
            cb(null, data);
            return;
        });
    },

    get_exercise_list: function(deep) {
        return utils.get_dirs(configs.parsed.exercise_dir);
    },

    exercise_add: function(template, cb) {
        // (0) Find the number of the new exercise
        var dirs = utils.get_dirs(configs.parsed.exercise_dir);
        var max = 0;
        dirs.forEach(function(item) {
            var arr = item.split('_');
            var number = parseInt(arr[1], 10);
            if (number > max) {
                max = number;
            }
        });
        // (1) Create a new folder
        var name = module.exports.get_exercise_name(max+1);
        if (template == "empty") {
            mkdirp(configs.parsed.exercise_dir + '/' + name, function(err) {
                if (err) {
                    log.error("Error creating exercise dir " + name);
                    return cb(err);
                }
                ncp(configs.parsed.exercise_template, module.exports.get_exercise_path(name), function(err) {
                    return cb(err);
                });
            });
        } else {
            if (!utils.check_dir_existence('templates/'+argv.template)) {
                log.error("The template "+argv.template+" does not exists");
                return cb(err);
            }
            ncp('templates/'+argv.template, get_exercise_path(name), function(err) {
                return cb(err);
            });
        }
    },

    store: function(number, data, cb) {
        var exercise_path = module.exports.get_exercise_path(module.exports.get_exercise_name(number));
        toTOMLString(data, function(err, output) {
            if (err) {
                return cb(err);
            }
            fs.writeFile(exercise_path, output, function(err) {
                if(err) {
                    return cb(err);
                }
                log.debug("The file has been saved correctly");
                return cb(null);
            });
        });
    }

}
