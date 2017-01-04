'use strict';

var bootstrap = require('./bootstrap');
var logger = require('./modules/t1t-log');
bootstrap.start(function onStart(err) {
    if (err) {
        logger.error('Error=' + err);
    }
    logger.info('app bootstrap finished');
});