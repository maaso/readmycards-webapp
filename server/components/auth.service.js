"use strict";
const config = require(__base + 'modules/t1t-config');
const request = require('request');

let token;


/**
 * Returns JWT token. Will request a new token if needed.
 * @param fn Callback function
 */
function getJWT(fn) {
    let options = {
        method: "GET",
        url: config.auth.uri + config.auth.path + "/login/application/token",
        headers: { apikey: config.auth.apikey, "content-type": "application/json"},
        json: true
    };
    request(options, fn);
}

/**
 * Refresh a JWT token
 * @param token Current valid token
 * @param fn Callback function
 */
function refreshJWT(token, fn) {
    let options = {
        method: "POST",
        url: config.auth.uri + config.auth.path +  "/login/token/refresh",
        headers: { apikey: config.auth.apikey, "content-type": "application/json" },
        body: { originalJWT: token },
        json: true
    };
    request(options, fn);
}


module.exports = {
    getJWT: getJWT,
    refreshJWT: refreshJWT
};