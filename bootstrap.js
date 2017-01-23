'use strict';

global.__base = __dirname + '/';

const DEV_ENVS = ['local', 'development'];

const fs = require('fs');
const async = require('async');
const express = require('express');
const config = require('./modules/t1t-config');
const logger = require('./modules/t1t-log');
const path = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const chalk = require('chalk');
const glob = require('glob');
const cors = require('cors');
const blocked = require('blocked');
const _ = require('lodash');

let app;

if (!process.env.hasOwnProperty('NODE_ENV')){
    //default to development environment
    process.env.NODE_ENV = 'development';
}

function setupEnv() {
    if ( process.env.NODE_ENV.toLowerCase() !== 'test') {
        process.env.NODE_ENV = config.environment;
    }
}

function loadRoutes() {
    const routes = glob.sync('./server/**/*.router.js');
    routes.forEach((file) => require(file)(app));
}

function initializeExpress(callback) {
    app = express();
    app.set('port', process.env.PORT || config.port);
    app.use(helmet());

    // Use compression to save bandwidth
    if (process.env.NODE_ENV !== 'test') {
        app.use(require('compression')());
    }

    blocked(function (ms) {
        if (ms < 50) {
            logger.info('Event loop blocked for ' + ms + 'ms');
        } else if (ms < 100) {
            logger.log('Event loop blocked for ' + ms + 'ms');
        } else {
            logger.warn('Event loop blocked for ' + ms + 'ms');
        }
    });

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({ limit: '4096kb' }));

    // Uncomment to enable request logging
    // app.use(logger.middleware);

    app.set('views', path.join(__dirname + '/server/', 'views'));
    app.set('view engine', 'ejs');

    // Include routes if exists
    loadRoutes();


    // Set public folder
    if (_.includes(DEV_ENVS, process.env.NODE_ENV.toLowerCase())) {
        app.use('/' , express.static(__dirname + '/.local'));
        app.use('/bower_components', express.static(__dirname + '/bower_components'));
    } else app.use('/' , express.static(__dirname + '/dist'));


    // Error handling middleware should be loaded after the loading the routes
    if (_.includes(DEV_ENVS, process.env.NODE_ENV.toLowerCase())) {
        app.use(require('morgan')('dev'));
        app.use(require('errorhandler')());
    }

    // Redirect unmatched requests to index
    app.all('*', redirectUnmatched);

    return callback();
}

function redirectUnmatched(req, res) {
    if (config.redirect.port) res.redirect(config.redirect.scheme + '://' + config.redirect.domain + ':' + config.redirect.port);
    else res.redirect(config.redirect.scheme + '://' + config.redirect.domain);
}

function startListening(callback) {
    app.listen(app.get('port'), function onListen() {
        //noinspection JSAnnotator
        logger.log(`\n ${chalk.white.bgGreen.bold(' T1T ')} ${chalk.grey.bgBlack(' Express server listening on port ' + app.get('port'))}`);
        return callback();
    });
}

function start(cb) {
    setupEnv();
    // give some time for pre-initialization
    async.series([
        initializeExpress,
        startListening
    ], (err) => {
        if (err) {
            logger.error('Error occurred' + err);
            return process.exit(1);
        }
        if (cb && typeof cb === 'function') {
        return cb(err);
    }
});
}

function stop() {
    app.close();
}

module.exports = {
    start: start,
    stop: stop
};