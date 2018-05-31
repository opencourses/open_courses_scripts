const chalk = require('chalk');
var configs = require('../../configs');
var utils = require('../../utils');
var exercise = require('./exercise');

exports.command = 'print <number>'
exports.desc = 'Prints the exercise data'
exports.builder = function(yargs) {
    return yargs.number('number');
}
exports.handler = function (argv) {
    if (isNaN(argv.number)) {
        console.log("You should provide an exercise number");
        return;
    }
    exercise.get_items(argv.number, function(err, data) {
        if (err) throw err;
        console.log(chalk.green('Exercise '+argv.number+' ('+exercise.get_exercise_name(argv.number)+')'));
        for (var item in data) {
            console.log(chalk.green(name+": ")+item);
        }
    });
}
