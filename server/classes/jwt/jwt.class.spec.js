'use strict';

/* eslint-disable*/
// Dependencies
const expect = require('chai').expect;

// Start the application
require('../../../app.js');
const JWT = require(__base + 'server/classes/jwt/jwt.class.js');
const jsonwebtoken = require('jsonwebtoken');
const moment = require('moment');


describe('JWT Class', function onTestExample() {

    let jwt, selfSignedToken;

    it('can be constructed from a JWT string', function () {
        let payload = {
            exp: Math.round(moment().add(7, 'minutes') / 1000)
        };
        selfSignedToken = jsonwebtoken.sign(payload, 'this would usually be correctly signed');

        jwt = new JWT(selfSignedToken);
        expect(jwt).to.be.a('object');
    });


    it('can return the original token', function () {
        expect(jwt.token).to.equal(selfSignedToken)
    });


    it('can check expiration time', function () {
        expect(jwt.expired()).to.equal(false);

        let expiredToken = jsonwebtoken.sign({ exp: Math.round(moment().subtract(10, 'minutes') / 1000)}, 'secret');
        expect(new JWT(expiredToken).expired()).to.equal(true);
    });


    it('can check if JWT is still valid for a certain period of time', function () {
        expect(jwt.validFor(5, 'minutes')).to.equal(true);
        expect(jwt.validFor(10, 'minutes')).to.equal(false);
    });

});
