'use strict';
const request = require('request');
const config = require(__base + 'modules/t1t-config');
const q = require('q');
const signboxApi = require(__base + "server/components/signbox.service");


function download(documentName, jwt) {
    return signboxApi.downloadDocument(documentName, jwt);
}

function getDataToSign(data, jwt) {
    return signboxApi.getDataToSign(data, jwt);
}

function workflowSign(data, jwt) {
    return signboxApi.workflowSign(data, jwt);
}


module.exports = {
    download: download,
    getDataToSign: getDataToSign,
    workflowSign: workflowSign
};