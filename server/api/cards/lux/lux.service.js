'use strict';
require('marko/node-require').install();
let template = require('./lux.summary.marko');
const request = require('request');
const config = require(__base + 'modules/t1t-config');
const cloudconvert = new (require('cloudconvert'))(config.cloudconvert.apikey);
const q = require('q');
const miss = require('mississippi2');
const _ = require('lodash');
const signboxApi = require(__base + "server/components/signbox.service");
const fs = require('fs');


function generateSummaryToSign(data, jwt) {
    let summaryPromise  = q.defer();

    template.stream(data)
        .pipe(cloudconvert.convert({
            inputformat: 'html',
            outputformat: 'pdf',
        }))
        .on('error', err => {
            return summaryPromise.reject(err);
        })
        .on('finished', conversion => {
            miss.toPromise(request.get('http:' + conversion.output.url)).then(buffer => {

                let fileName = _.join(_.split(data.biometric.lastName, ' '), '_') + '_' + _.join(_.split(data.biometric.firstName, ' '), '_')
                    + '_summary.pdf';

                uploadAndAssign(buffer, fileName, 'application/pdf', jwt).then(res => {
                    return summaryPromise.resolve(res);
                }, err => {
                    return summaryPromise.reject(err);
                })
            }, err => {
                return summaryPromise.reject(err);
            });
        });

    return summaryPromise.promise;
}

function uploadXML(jwt) {
    let xmlUpload = q.defer();

    miss.toPromise(fs.createReadStream('example.xml')).then(buffer => {
        uploadAndAssign(buffer, 'example.xml', 'text/xml', jwt).then(result => {
            return xmlUpload.resolve(result);
        }, err => {
            return xmlUpload.reject(err);
        })
    }, err => {
        return xmlUpload.reject(err);
    });

    return xmlUpload.promise;
}

function uploadAndAssign(fileBuffer, fileName, fileType, jwt, skipConversion) {
    return signboxApi.uploadDocument(fileBuffer, fileName, fileType, jwt, skipConversion).then(res => {
        let parsedBody = JSON.parse(res);
        return signboxApi.assignDocumentToWorkflow(parsedBody[0].uuid, jwt)
    });
}


module.exports = {
    generateSummaryToSign: generateSummaryToSign,
    uploadXML: uploadXML
};