"use strict";
const config = require(__base + 'modules/t1t-config');
const request = require('request');
const jwt = require('jsonwebtoken');
const moment = require('moment');


let token;


/**
 * Returns JWT token. Will request a new token if needed.
 * @param fn Callback function
 */
function getJWT(fn) {
    console.log('check jwt');

    let options = {
        method: "GET",
        url: config.auth.uri + config.auth.path + "/login/application/token",
        headers: {apikey: config.auth.apikey, "content-type": "application/json"},
        json: true
    };

    // TODO check if current token still valid

    request(options, fn);
}

/**
 * Refresh a JWT token
 * @param token Current valid token
 * @param fn Callback function
 */
function jwtRefresh(token, fn) {
    let options = {
        method: "POST",
        url: config.auth.uri + config.auth.path +
        "/login/idp/token/refresh",
        headers: { apikey: config.auth.apikey, "content-type": "application/json" },
        body: { originalJWT: token },
        json: true
    };
    let date = new Date();
    let exp = new Date();
    token = jwt.decode(token);
    if (token) {
        exp.setTime(token.exp * 1000);
        if (exp.getTime() > date.getTime()) {
            request(options, fn);
        }
    }
}


module.exports = {
    getJWT: getJWT
};