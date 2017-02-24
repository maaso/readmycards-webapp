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

                signboxApi.uploadDocument(buffer, fileName, 'application/pdf', jwt).then(res => {
                    let parsedBody = JSON.parse(res);

                    signboxApi.assignDocumentToWorkflow(parsedBody[0].uuid, jwt).then(result => {
                        return summaryPromise.resolve(result);
                    }, err => {
                        return summaryPromise.reject(err);
                    });
                }, err => {
                    return summaryPromise.reject(err);
                });
            }, err => {
                return summaryPromise.reject(err);
            });
        });

    return summaryPromise.promise;
}


module.exports = {
    generateSummaryToSign: generateSummaryToSign
};