'use strict';

const express = require('express');
const jwtMW = require(__base + 'server/middleware/jwt.js');
const ctrlBe = require('./be.controller.js');

module.exports = function createRouter(app) {
    const router = new express.Router();

    router.route('/api/cards/be/download')
          .post(jwtMW.validateJWT, ctrlBe.download);

    router.route('/api/cards/be/summarytosign')
          .post(jwtMW.validateJWT, ctrlBe.generateSummaryToSign);

    router.route('/api/cards/be/datatosign')
          .post(jwtMW.validateJWT, ctrlBe.getDataToSign);

    router.route('/api/cards/be/sign')
          .post(jwtMW.validateJWT, ctrlBe.workflowSign);

    // Register our routes
    app.use(router);
};