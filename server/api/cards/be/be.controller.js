'use strict';
const service = require('./be.service.js');

module.exports = {
    generateSummary: generateSummary
};


function generateSummary(req, res) {
    service.generateSummary(req.body, req.jwt).then(function () {
        return res.status(200).end();
    });
}