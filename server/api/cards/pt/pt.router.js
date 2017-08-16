'use strict';

const express = require('express');
const jwtMW = require(__base + 'server/middleware/jwt.js');
const ctrlPt = require('./pt.controller.js');

module.exports = function createRouter(app) {
    const router = new express.Router();

    router.route('/api/cards/pt/summarytosign')
        .post(jwtMW.validateJWT, ctrlPt.generateSummaryToSign);

    // Register our routes
    app.use(router);
};