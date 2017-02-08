'use strict';
const promise = require('bluebird');
require('marko/node-require').install();
let template = require('./be.summary.marko');
const request = require('request');
const _ = require('lodash');
const config = require(__base + 'modules/t1t-config');
const cloudconvert = new (require('cloudconvert'))(config.cloudconvert.apikey);



function generateSummary(data, jwt) {

    template.stream(data).pipe(cloudconvert.convert({
        inputformat: 'html',
        outputformat: 'pdf'
    }).pipe(request.post({
        uri: config.signbox.uri + config.signbox.path + '/documents/upload',
        headers: { apikey: config.signbox.apikey, 'x-consumer-jwt': jwt },
        formData: {
            file: {
                value:  this,
                options: {
                    filename: "summary.pdf",
                    contentType: "application/pdf"
                }
            }
        }
    }, function (err, response, body) {
        console.log(err);
        console.log(response);
        console.log(body);
        return promise.resolve('OK');
    })));

}


module.exports = {
    generateSummary: generateSummary
};