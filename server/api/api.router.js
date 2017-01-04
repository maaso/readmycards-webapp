'use strict';

const express = require('express');
const ctrlApi = require('./api.controller.js');

module.exports = function createRouter(app) {
    const router = new express.Router();

    router.route('/api/dl')
        .post(ctrlApi.processDownload);

    router.route('/api/unknown-card')
        .post(ctrlApi.processUnknownCard);

    // Register our routes
    app.use(router);
};