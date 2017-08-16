'use strict';

const express = require('express');
const jwtMW = require(__base + 'server/middleware/jwt.js');
const ctrlCards = require('./cards.common.controller.js');

module.exports = function createRouter(app) {
    const router = new express.Router();

    router.route('/api/cards/download')
          .post(jwtMW.validateJWT, ctrlCards.download);

    router.route('/api/cards/datatosign')
          .post(jwtMW.validateJWT, ctrlCards.getDataToSign);

    router.route('/api/cards/sign')
          .post(jwtMW.validateJWT, ctrlCards.workflowSign);

    // Register our routes
    app.use(router);
};