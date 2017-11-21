"use strict";
const request = require('request');
const rp = require('request-promise-native');
const config = require(__base + 'modules/t1t-config');
const q = require('q');


/**
 * Assign a document to the RMC workflow
 */
function assignDocumentToWorkflow(documentId, jwt) {
    let options = {
        uri: config.signbox.uri + config.signbox.path + '/organizations/divisions/' + config.signbox.division_id + '/workflows/assign',
        headers: { apikey: config.signbox.apikey, 'x-consumer-jwt': jwt, 'authorization': 'bearer ' + jwt },
        json: true,
        body: {
            docId: documentId,
            workflowId: config.signbox.workflow_id
        }
    };

    return rp.post(options);
}

/**
 * Downloads document from Signbox
 * @param documentName Document name of the document to download
 * @param jwt Valid JWT token
 */
function downloadDocument(documentName, jwt) {
    let options = {
        uri: config.signbox.uri + config.signbox.path + '/documents/' + documentName + '/download?jwt=' + jwt + '&apikey=' + config.signbox.apikey,
    };
    return request.get(options);
}

/**
 * Get dataToSign for a previously uploaded document
 * @param data Payload for the dataToSign request
 * @param jwt Valid JWT token
 */
function getDataToSign(data, jwt) {
    let options = {
        uri: config.signbox.uri + config.signbox.path + '/organizations/divisions/' + config.signbox.division_id + '/workflows/dataToSign',
        headers: { apikey: config.signbox.apikey, 'x-consumer-jwt': jwt, 'authorization': 'bearer ' + jwt },
        json: true,
        body: data
    };

    options.body.additionalInformation.role = config.signbox.role;

    return rp.post(options).then(res => {
        console.log(res);
        return res;
    }, err => {
        console.log('error');
        console.log(err.message);
        return err;
    });
}

/**
 *
 */
function uploadDocument(fileBuffer, fileName, fileType, jwt) {
    let options = {
        uri: config.signbox.uri + config.signbox.path + '/documents/upload',
        headers: { apikey: config.signbox.apikey, 'x-consumer-jwt': jwt, 'authorization': 'bearer ' + jwt },
        formData: {
            skipConversion: 'true',
            file: {
                value:  fileBuffer,
                options: {
                    filename: fileName,
                    contentType: fileType
                }
            }
        }
    };
    return rp.post(options);
}

/**
 * Sign a document in a workflow
 * @param data Payload for the workflowSign request
 * @param jwt Valid JWT token
 */
function workflowSign(data, jwt) {
    let options = {
        uri: config.signbox.uri + config.signbox.path + '/organizations/divisions/' + config.signbox.division_id + '/workflows/sign',
        headers: { apikey: config.signbox.apikey, 'x-consumer-jwt': jwt, 'authorization': 'bearer ' + jwt },
        json: true,
        body: data
    };
    options.body.additionalInformation.role = config.signbox.role;

    return rp.post(options);
}


module.exports = {
    assignDocumentToWorkflow: assignDocumentToWorkflow,
    downloadDocument: downloadDocument,
    getDataToSign: getDataToSign,
    uploadDocument: uploadDocument,
    workflowSign: workflowSign
};