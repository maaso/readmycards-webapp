'use strict';

const express = require('express');
const multer  = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const ctrlApi = require('./api.controller.js');

module.exports = function createRouter(app) {
    const router = new express.Router();

    router.route('/api/dl')
        .post(ctrlApi.processDownload);

    router.route('/api/unknown-card')
        .post(ctrlApi.processUnknownCard);

    router.route('/api/jp2tojpeg')
        .post(upload.single('file'), ctrlApi.convertJP2toJPEG);

    // Register our routes
    app.use(router);
};