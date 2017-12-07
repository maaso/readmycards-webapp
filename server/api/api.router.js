'use strict';

const express = require('express');
const multer  = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const jwtMW = require(__base + 'server/middleware/jwt.js');
const ctrlApi = require('./api.controller.js');

module.exports = function createRouter(app) {
    const router = new express.Router();

    router.route('/api/dl')
        .post(ctrlApi.processDownload);

    router.route('/api/unknown-card')
        .post(ctrlApi.processUnknownCard);

    router.route('/api/jp2tojpeg')
        .post(ctrlApi.convertJP2toJPEG);

    router.route('/api/sign-file')
          .post(upload.single('file'), jwtMW.validateJWT, ctrlApi.uploadFileToSign);

    router.route('/api/sign-file/data')
          .post(jwtMW.validateJWT, ctrlApi.getDataToSign);

    router.route('/api/sign-file/dl')
          .post(jwtMW.validateJWT, ctrlApi.downloadSignedFile);

    router.route('/api/sign-file/workflow-sign')
          .post(jwtMW.validateJWT, ctrlApi.workflowSign);

    // Register our routes
    app.use(router);
};