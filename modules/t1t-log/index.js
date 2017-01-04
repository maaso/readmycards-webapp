'use strict';

var logger = require('./lib/logger');
var middleware = require('./lib/middleware');

module.exports = {
  debug: logger.debug,
  info: logger.log,
  log: logger.log,
  warn: logger.warn,
  error: logger.error,
  middleware: middleware
};
