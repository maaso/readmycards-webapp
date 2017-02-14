'use strict';
const request = require('request');
const config = require(__base + 'modules/t1t-config');
const q = require('q');


function download(documentName, jwt) {
    let options = {
        uri: config.signbox.uri + config.signbox.path + '/documents/' + documentName + '/download?jwt=' + jwt + '&apikey=' + config.signbox.apikey,
    };
    return request.get(options);
}

function getDataToSign(data, jwt) {
    let dataToSign = q.defer();

    let options = {
        uri: config.signbox.uri + config.signbox.path + '/organizations/divisions/' + config.signbox.division_id + '/workflows/dataToSign',
        headers: { apikey: config.signbox.apikey, 'x-consumer-jwt': jwt },
        json: true,
        body: data
    };
    options.body.additionalInformation.role = config.signbox.role;

    request.post(options, function (err, resp, body) {
        if (err) dataToSign.reject(err);
        else dataToSign.resolve(body);
    });

    return dataToSign.promise;
}

function workflowSign(data, jwt) {
    let workflowSign = q.defer();

    let options = {
        uri: config.signbox.uri + config.signbox.path + '/organizations/divisions/' + config.signbox.division_id + '/workflows/sign',
        headers: { apikey: config.signbox.apikey, 'x-consumer-jwt': jwt },
        json: true,
        body: data
    };
    options.body.additionalInformation.role = config.signbox.role;

    request.post(options, function (err, resp, body) {
        if (err) workflowSign.reject(err);
        else workflowSign.resolve(body);
    });

    return workflowSign.promise;
}


module.exports = {
    download: download,
    getDataToSign: getDataToSign,
    workflowSign: workflowSign
};