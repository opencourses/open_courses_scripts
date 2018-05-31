#!/usr/bin/env node

const chalk = require('chalk')
var yargs = require('yargs')
var configs = require('./configs')
var utils = require('./utils');
var log = require("loglevel");

const set_logger = argv => log.setLevel(argv.verbosity);

// XXX Until the middleware function of yargs will be fixed the verbosity level
// will be setted here and will not be correlated with the value given in the
// terminal
log.setLevel('debug');
configs.read_config_file(function(err) {
    if (err) {
        console.log(chalk.red('Your project does not contains a config file.'));
        console.log(chalk.red('You can init your project using the init command.'));
    }
    yargs.commandDir('commands')
        .completion()
        .epilogue('You can read more about the Open Courses project on https://github.com/opencourses/manifesto')
        .demandCommand(1, 'You need at least one command before moving on')
        .option('verbosity', {
            alias: 'v',
            describe: 'choose the verbosity level',
            default: 'error',
            choices: ['error', 'warning', 'info', 'debug']
        })
        .help()
        .middleware([set_logger])
        .argv
});
