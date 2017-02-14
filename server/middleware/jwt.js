/**
 * Singbox related endpoints
 */
"use strict";
const config = require(__base + 'modules/t1t-config');
const authApi = require("../components/auth.service");

/**
 * Initialize or refresh the JWT token for the current session
 * @param req
 * @param res
 * @param next Function
 */
function validateJWT(req, res, next) {
    authApi.getJWT(function(error, response, body) {
        if (error) {
            let response = {
                errorCode: Number.parseInt(error.errno) || 404,
                message: error.Error
            };
            return res.status(response.errorCode).json(response);
        }
        req.jwt = body.token;
        next();
    });
}

module.exports = {
    validateJWT: validateJWT
};

// /**
//  * Proxies dataToSign method with Signbox API
//  *
//  * @param req
//  * @param res
//  */
// export function dataToSign(req, res) {
//     var signbox = new Signbox({
//         domain: config.SIGNBOX.API_URI + config.SIGNBOX.SIGNBOX_PATH,
//         apikey: config.SIGNBOX.KEY,
//         jwt: req.session.t1t.token
//     });
//
//     signbox
//         .dataToSign({
//             divId: req.params.divId,
//             orgId: req.params.orgId,
//             body: req.body
//         })
//         .then(
//             function(response, body) {
//                 return res.status(200).json(response.body);
//             },
//             function(error, body) {
//                 console.log(error.body);
//                 return res.status(error.body.errorCode).json(error.body);
//             }
//         );
// }
//
// /**
//  * Proxies sign method with Signbox API
//  *
//  * @param req
//  * @param res
//  */
// export function sign(req, res) {
//     var signbox = new Signbox({
//         domain: config.SIGNBOX.API_URI + config.SIGNBOX.SIGNBOX_PATH,
//         apikey: config.SIGNBOX.KEY,
//         jwt: req.session.t1t.token
//     });
//
//     //TODO Hardcode role for testing
//     req.body.additionalInformation.role = "developer";
//
//     signbox
//         .sign({ divId: req.params.divId, orgId: req.params.orgId, body: req.body })
//         .then(
//             function(response, body) {
//                 return res.status(200).json(response.body);
//             },
//             function(error, body) {
//                 console.log(error.body);
//                 return res.status(error.body.errorCode).json(error.body);
//             }
//         );
// }
