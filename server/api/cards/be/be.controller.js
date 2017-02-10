'use strict';
const service = require('./be.service.js');

module.exports = {
    download: download,
    generateSummaryToSign: generateSummaryToSign,
    getDataToSign: getDataToSign,
    workflowSign: workflowSign
};

function download(req, res) {
    console.log(req.body);
    return service.download(req.body.documentName, req.jwt).pipe(res);
}

function generateSummaryToSign(req, res) {
    service.generateSummaryToSign(req.body, req.jwt).then((result) => {
        return res.status(200).json(result);
    })
}

function getDataToSign(req, res) {
    service.getDataToSign(req.body, req.jwt).then((result) => {
        return res.status(200).json(result);
    })
}

function workflowSign(req, res) {
    service.workflowSign(req.body, req.jwt).then((result) => {
        return res.status(200).json(result);
    })

}