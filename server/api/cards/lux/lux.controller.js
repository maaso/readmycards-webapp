'use strict';
const commonService = require('../cards.common.service.js');
const luxService = require('./lux.service.js');
const response = require(__base + 'server/util/response.util.js');
const request = require('request');

module.exports = {
    download: download,
    generateSummaryToSign: generateSummaryToSign,
    getDataToSign: getDataToSign,
    uploadXMLToSign: uploadXMLToSign,
    workflowSign: workflowSign
};

function download(req, res) {
    return request.get(req.body.url).pipe(res);
    // return commonService.download(req.body.documentName, req.jwt).pipe(res);
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

function uploadXMLToSign(req, res) {
    luxService.uploadXML(req.jwt).then(result => {
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