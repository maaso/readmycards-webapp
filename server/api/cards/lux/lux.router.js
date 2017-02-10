'use strict';

const express = require('express');
const ctrlLux = require('./lux.controller.js');

module.exports = function createRouter(app) {
    const router = new express.Router();

    router.route('/api/cards/lux/summary')
        .post(ctrlLux.generateSummary);

    // Register our routes
    app.use(router);
};