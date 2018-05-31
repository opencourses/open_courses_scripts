const chalk = require('chalk');
var configs = require('../../configs.js');
var utils = require('../../utils.js');
var exercise = require('./exercise');

exports.command = 'add'
exports.desc = 'Adds a new exercise'
exports.builder = {
    template: {
        alias: 't',
        describe: 'Build the exercise from a specific template',
        default: 'empty'
    }
}
exports.handler = function (argv) {
    var template = "empty";
    if (argv.template) {
        template = argv.template;
    }
    exercise.exercise_add(template, function(err) {
        if (err) {
            console.error("Error creating the exercise");
            return;
        }
        console.log("Exercise created successfully");
        return;
    });
}
