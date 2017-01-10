'use strict';

const express = require('express');
const ctrlIndex = require('./index.controller.js');

module.exports = function createRouter(app) {
    const router = new express.Router();

    router.route('/')
        .get(ctrlIndex.index);

    // Register our routes
    app.use(router);
};