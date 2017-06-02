'use strict';

const express = require('express');
const jwtMW = require(__base + 'server/middleware/jwt.js');
const ctrlLux = require('./lux.controller.js');

module.exports = function createRouter(app) {
    const router = new express.Router();

    router.route('/api/cards/lux/download')
        .post(jwtMW.validateJWT, ctrlLux.download);

    router.route('/api/cards/lux/summarytosign')
        .post(jwtMW.validateJWT, ctrlLux.generateSummaryToSign);

    router.route('/api/cards/luxtrust/summarytosign')
        .post(jwtMW.validateJWT, ctrlLux.generateLuxTrustSummaryToSign);

    router.route('/api/cards/lux/xmltosign')
        .post(jwtMW.validateJWT, ctrlLux.uploadXMLToSign);

    router.route('/api/cards/lux/datatosign')
        .post(jwtMW.validateJWT, ctrlLux.getDataToSign);

    router.route('/api/cards/lux/sign')
        .post(jwtMW.validateJWT, ctrlLux.workflowSign);

    // Register our routes
    app.use(router);
};