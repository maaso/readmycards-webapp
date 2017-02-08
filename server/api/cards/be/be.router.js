'use strict';

const express = require('express');
const jwtMW = require(__base + 'server/middleware/jwt.js');
const ctrlBe = require('./be.controller.js');

module.exports = function createRouter(app) {
    const router = new express.Router();

    router.route('/api/cards/be/summary')
        .post(jwtMW.validateJWT, ctrlBe.generateSummary);

    // Register our routes
    app.use(router);
};