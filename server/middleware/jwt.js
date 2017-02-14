"use strict";
const config = require(__base + 'modules/t1t-config');
const authApi = require("../components/auth.service");
const q = require('q');
const _ = require('lodash');
const JWT = require(__base + 'server/classes/jwt/jwt.class.js');

let jwt;

/**
 * Initialize or refresh the JWT token for the current session
 * @param req
 * @param res
 * @param next Function
 */
function validateJWT(req, res, next) {

    let checkJWT = q.defer();

    if (jwt && jwt instanceof JWT) {
        if (jwt.expired()) {
            authApi.getJWT(handleJWT);
        } else {
            // check if valid for more than 5 minutes
            if (jwt.validFor(10, 'minutes')) checkJWT.resolve();
            else authApi.refreshJWT(jwt.token, handleJWT);
        }
    } else {
        authApi.getJWT(handleJWT);
    }

    checkJWT.promise.then(function () {
        req.jwt = jwt.token;
        next();
    }, function (error) {
        let response = {
            errorCode: Number.parseInt(error.errno) || 404,
            message: error.Error
        };
        return res.status(response.errorCode).json(response);
    });

    function handleJWT(error, response, body) {
        if (error) checkJWT.reject(error);
        if (body.jwt && !_.isEmpty(body.jwt)) jwt = new JWT(body.jwt);
        else jwt = new JWT(body.token);
        checkJWT.resolve();
    }
}

module.exports = {
    validateJWT: validateJWT
};
