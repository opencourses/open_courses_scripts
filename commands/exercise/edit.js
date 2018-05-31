const chalk = require('chalk');
var readline = require('readline');
var configs = require('../../configs');
var utils = require('../../utils');
var exercise = require('./exercise');
var prompt = require('prompt');
var toTOMLString = require('toml-stream').toTOMLString

exports.command = 'edit <number>'
exports.desc = 'Edits the exercise content in an iterative way'
exports.builder = function(yargs) {
    return yargs.number('number');
}
exports.handler = function (argv) {
    if (isNaN(argv.number)) {
        console.log("You should provide an exercise number");
        return;
    }
    edit(argv.number, function(err) {
        console.log(err? "Error during the edit process": "Modification ompleted");
    });
}


var schema;
function edit(number, cb) {
    prompt.message = "new";
    prompt.start();
    var exercise_path = exercise.get_exercise_path(exercise.get_exercise_name(number));
    utils.parse_toml(exercise_path, function(err, data) {
        if (err) {
            console.error(chalk.red('Error while reading the exercise configuration file'));
            return cb(err);
        }
        exercise.read_schema(configs.parsed.exercise_schema, function(err, readed_schema) {
            if (err) {
                console.log("Error reading schema");
                return cb(err);
            }
            schema = readed_schema;

            edit_dict(Object.entries(data).entries(), data, function(err) {
                if (err) {
                    return cb(err);
                }
                exercise.validate_data(data, function(err, result) {
                    if (err) {
                        return cb(err);
                    }
                    if (!result.valid) {
                        console.log("The given data does not passes validation. Correct this errors:");
                        console.log(result.errors);
                        return cb(new Error("validation error"));
                    } else {
                        exercise.store(number, data, function(err) {
                            return cb(err);
                        });
                    }
                });
            });
        });
    });
}

function edit_dict(iterator, dict, callback) {
    var item = iterator.next().value;
    if (!item) {
        return callback(null);
    }
    var key = item[1][0];
    var value = item[1][1];
    if (key.match('comment\d*')) {
        return edit_dict(iterator, dict, callback);
    }
    console.log("current: "+ chalk.grey(key)+ ": " + value);
    var item = {
        properties: {}
    };
    item.properties[key] = schema["properties"][key];
    item.properties[key].required = false;
    prompt.get(item, function(err, result) {
        if (err) {
            return callback(err);
        }
        if (result[key] != undefined && result[key] != '') {
            dict[key] = result[key];
        }
        return edit_dict(iterator, dict, callback);
    });
}
