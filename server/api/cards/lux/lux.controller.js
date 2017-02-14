'use strict';
const commonService = require('../cards.common.service.js');
const luxService = require('./lux.service.js');
const response = require(__base + 'server/util/response.util.js');

module.exports = {
    download: download,
    generateSummaryToSign: generateSummaryToSign,
    getDataToSign: getDataToSign,
    workflowSign: workflowSign
};

function download(req, res) {
    return commonService.download(req.body.documentName, req.jwt).pipe(res);
}

function generateSummaryToSign(req, res) {
    luxService.generateSummaryToSign(req.body, req.jwt).then(result => {
        return res.status(200).json(result);
    }, error => {
        return response.error(error, res);
    })
}

function getDataToSign(req, res) {
    commonService.getDataToSign(req.body, req.jwt).then(result => {
        return res.status(200).json(result);
    }, error => {
        return response.error(error, res);
    })
}

function workflowSign(req, res) {
    commonService.workflowSign(req.body, req.jwt).then(result => {
        return res.status(200).json(result);
    }, error => {
        return response.error(error, res);
    })

}