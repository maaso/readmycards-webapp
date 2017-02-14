'use strict';
require('marko/node-require').install();
let template = require('./lux.summary.marko');
const request = require('request');
const config = require(__base + 'modules/t1t-config');
const cloudconvert = new (require('cloudconvert'))(config.cloudconvert.apikey);
const q = require('q');
const miss = require('mississippi2');
const _ = require('lodash');


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
        .on('finished', function(conversion) {
            miss.toPromise(request.get('http:' + conversion.output.url)).then(function (buffer) {
                request.post({
                    uri: config.signbox.uri + config.signbox.path + '/documents/upload',
                    headers: { apikey: config.signbox.apikey, 'x-consumer-jwt': jwt },
                    formData: {
                        file: {
                            value:  buffer,
                            options: {
                                filename: data.rnData.name + '_' + _.join(_.split(data.rnData.first_names, ' '), '_') + '_'
                                + data.rnData.third_name + '_summary.pdf',
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


module.exports = {
    generateSummaryToSign: generateSummaryToSign
};