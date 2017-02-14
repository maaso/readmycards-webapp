'use strict';
require('marko/node-require').install();
let template = require('./be.summary.marko');
const request = require('request');
const config = require(__base + 'modules/t1t-config');
const cloudconvert = new (require('cloudconvert'))(config.cloudconvert.apikey);
const fs = require('fs');
const q = require('q');
const miss = require('mississippi2');


function download(documentName, jwt) {
    let options = {
        uri: config.signbox.uri + config.signbox.path + '/documents/' + documentName + '/download?jwt=' + jwt + '&apikey=' + config.signbox.apikey,
    };
    return request.get(options);
}

function generateSummaryToSign(data, jwt) {
    let summaryPromise  = q.defer();

    template.stream(data)
        .pipe(cloudconvert.convert({
            inputformat: 'html',
            outputformat: 'pdf',
        }))
        .on('error', function (err) {
            return summaryPromise.reject(err);
        })
        .on('finished', function(data) {
            miss.toPromise(request.get('http:' + data.output.url)).then(function (buffer) {
                request.post({
                    uri: config.signbox.uri + config.signbox.path + '/documents/upload',
                    headers: { apikey: config.signbox.apikey, 'x-consumer-jwt': jwt },
                    formData: {
                        file: {
                            value:  buffer,
                            options: {
                                filename: "summary.pdf",
                                contentType: "application/pdf"
                            }
                        }
                    }
                }, function (err, resp, body) {
                    if (err) return summaryPromise.reject(err);
                    else {
                        let parsedBody = JSON.parse(body);

                        let options = {
                            uri: config.signbox.uri + config.signbox.path + '/organizations/divisions/' + config.signbox.division_id + '/workflows/assign',
                            headers: { apikey: config.signbox.apikey, 'x-consumer-jwt': jwt },
                            json: true,
                            body: {
                                docId: parsedBody[0].uuid,
                                workflowId: config.signbox.workflow_id
                            }
                        };

                        request.post(options, function (err, resp, body) {
                            if (err) {
                                return summaryPromise.reject(err);
                            } else {
                                return summaryPromise.resolve(body)
                            }
                        });
                    }

                });
            }, function (err) {
                return summaryPromise.reject(err);
            });
        });

    return summaryPromise.promise;
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
    generateSummaryToSign: generateSummaryToSign,
    getDataToSign: getDataToSign,
    workflowSign: workflowSign
};