'use strict';

const express = require('express');
const jwtMW = require(__base + 'server/middleware/jwt.js');
const ctrlPt = require('./pt.controller.js');

module.exports = function createRouter(app) {
    const router = new express.Router();

    router.route('/api/cards/be/download')
        .post(jwtMW.validateJWT, ctrlPt.download);

    router.route('/api/cards/be/summarytosign')
        .post(jwtMW.validateJWT, ctrlPt.generateSummaryToSign);

    router.route('/api/cards/be/datatosign')
        .post(jwtMW.validateJWT, ctrlPt.getDataToSign);

    router.route('/api/cards/be/sign')
        .post(jwtMW.validateJWT, ctrlPt.workflowSign);

    // Register our routes
    app.use(router);
};