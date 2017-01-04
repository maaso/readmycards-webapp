'use strict';

var logger = require('./logger');
var onFinished = require('on-finished');

function getResponseTime(req) {
  if (!req.astart) {
    // missing request start time
    return '-';
  }

  var now = process.hrtime();

  // calculate diff
  var ms = (now[0] - req.astart[0]) * 1e3
    + (now[1] - req.astart[1]) * 1e-6;

  // return truncated value
  return ms.toFixed(3) + 'ms';
}

function logAccess(req, res, next) {
  // request data
  req.astart = process.hrtime();

  function logRequest() {
    var ms = getResponseTime(req);
    var line = res.statusCode + ' ' + (req.originalUrl || req.url) + ' ' + ms;
    logger.log(line);
  }

  onFinished(res, logRequest);

  next();
}

module.exports = logAccess;
