/**
 * Singbox related endpoints
 */
"use strict";
const config = require(__base + 'modules/t1t-config');
const authApi = require("../components/auth.service");
const jsonwebtoken = require("jsonwebtoken");
const moment = require("moment");
const q = require('q');
const _ = require('lodash');

let jwt;

/**
 * Initialize or refresh the JWT token for the current session
 * @param req
 * @param res
 * @param next Function
 */
function validateJWT(req, res, next) {

    let checkJWT = q.defer();

    if (jwt) {
        // check if jwt still valid for > 5 mins
        let parsedToken = jsonwebtoken.decode(jwt);
        let expires = moment(parsedToken.exp * 1000);
        let now = moment();

        if (now > expires) {
            authApi.getJWT(handleJWT);
        } else {
            // check if valid for more than 5 minutes
            if (now > expires.subtract(120, 'minutes')) {
                authApi.refreshJWT(jwt, handleJWT);
            } else checkJWT.resolve();
        }
    } else {
        authApi.getJWT(handleJWT);
    }

    checkJWT.promise.then(function () {
        req.jwt = jwt;
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
        if (body.jwt && !_.isEmpty(body.jwt)) jwt = body.jwt;
        else jwt = body.token;
        checkJWT.resolve();
    }
}

module.exports = {
    validateJWT: validateJWT
};
