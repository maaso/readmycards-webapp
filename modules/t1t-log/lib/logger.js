'use strict';

var winston = require('winston');
var util = require('util');

var loglevel = 'info';

if (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'development') {
  loglevel = 'debug';
}

function timestamp() {
  return new Date().toISOString();
}

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      name: 'console',
      level: loglevel,
      formatter: function format(options) {
        return options.level.toUpperCase() + ': ' + timestamp() + ': ' + options.message;
      }
    })
  ]
});

logger.add(require('winston-daily-rotate-file'), {
  name: 'error-file',
  filename: 'logs/error.log',
  level: 'error'
});

function displayMessage(message) {
  if (typeof message === 'object') {
    return util.inspect(message);
  }
  return message;
}

function debug(message) {
  logger.log('debug', displayMessage(message));
}

function log(message) {
  logger.log('info', displayMessage(message));
}

function warn(message) {
  logger.log('warn', displayMessage(message));
}

function error(message) {
  logger.log('error', displayMessage(message));
}

module.exports = {
  debug: debug,
  info: log,
  log: log,
  warn: warn,
  error: error
};
