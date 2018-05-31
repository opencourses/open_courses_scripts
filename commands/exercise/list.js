const chalk = require('chalk');
var configs = require('../../configs');
var utils = require('../../utils');
var exercise = require('./exercise');

exports.command = 'list'
exports.desc = 'Lists all the available exercises'
exports.builder = {
    deep: {
        alias: ['d'],
        description: "Shows the content of all the folders"
    }
}
exports.handler = function (argv) {
    var dirs = exercise.get_exercise_list(argv.deep);
    console.log(configs.parsed.exercise_dir+"/");
    dirs.forEach(function(item) {
       console.log("    ├──"+item);
    });
}

