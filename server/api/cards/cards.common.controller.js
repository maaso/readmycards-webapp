'use strict';
const cardService = require('./cards.common.service.js');
const response = require(__base + 'server/util/response.util.js');

module.exports = {
    download: download,
    getDataToSign: getDataToSign,
    workflowSign: workflowSign
};

function download(req, res) {
    return cardService.download(req.body.documentName, req.jwt).pipe(res);
}

function getDataToSign(req, res) {
    cardService.getDataToSign(req.body, req.jwt).then(result => {
        return res.status(200).json(result);
    }, error => {
        return response.error(error, res);
    })
}

function workflowSign(req, res) {
    cardService.workflowSign(req.body, req.jwt).then(result => {
        return res.status(200).json(result);
    }, error => {
        return response.error(error, res);
    })

}