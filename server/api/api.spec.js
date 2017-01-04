'use strict';

/* eslint-disable*/
// Dependencies
const expect = require('chai').expect;
const supertest = require('supertest');


// Start the application
require('../../app.js');

// Config
const config = require(__base + 'modules/t1t-config');
const api = supertest('http://localhost:' + config.port + '/api');


describe('Download API', function onTestExample() {

    it('will reject requests without email parameter', function (done) {
        api.post('/dl')
            .expect(400)
            .end(function validate(err, res) {
                if (err) {
                    return done(err);
                }
                expect(res.text).to.contain('Missing email parameter');
                done();
            });
    });


    it('will reject requests without download url parameter', function (done) {
        api.post('/dl')
            .send({ email: 'some@email.com' })
            .expect(400)
            .end(function validate(err, res) {
                if (err) {
                    return done(err);
                }
                expect(res.text).to.contain('Missing download link parameter');
                done();
            });
    });


    it('will reject requests without platform name parameter', function (done) {
        api.post('/dl')
            .send({ email: 'some@email.com', dlUrl: 'anurltodownload' })
            .expect(400)
            .end(function validate(err, res) {
                if (err) {
                    return done(err);
                }
                expect(res.text).to.contain('Missing platform name parameter');
                done();
            });
    });


    it('will reject requests without type identifier parameter', function (done) {
        api.post('/dl')
            .send({ email: 'some@email.com', dlUrl: 'anurltodownload', platformName: 'theOS' })
            .expect(400)
            .end(function validate(err, res) {
                if (err) {
                    return done(err);
                }
                expect(res.text).to.contain('Missing type identifier');
                done();
            });
    });


    it('will reject requests without payload parameter', function (done) {
        api.post('/dl')
            .send({ email: 'some@email.com', dlUrl: 'anurltodownload', platformName: 'theOS', type: 'thetype' })
            .expect(400)
            .end(function validate(err, res) {
                if (err) {
                    return done(err);
                }
                expect(res.text).to.contain('Missing payload data');
                done();
            });
    });


});

describe('Unknown Card API', function onTestExample() {

    it('will reject requests without atr parameter', function (done) {
        api.post('/unknown-card')
            .expect(400)
            .end(function validate(err, res) {
                if (err) {
                    return done(err);
                }
                expect(res.text).to.contain('Missing atr parameter');
                done();
            });
    });


    it('will reject requests without type identifier parameter', function (done) {
        api.post('/unknown-card')
            .send({ atr: 1234567890 })
            .expect(400)
            .end(function validate(err, res) {
                if (err) {
                    return done(err);
                }
                expect(res.text).to.contain('Missing type identifier');
                done();
            });
    });


    it('will reject requests without payload parameter', function (done) {
        api.post('/unknown-card')
            .send({ atr: 1234567890, type: 'theType' })
            .expect(400)
            .end(function validate(err, res) {
                if (err) {
                    return done(err);
                }
                expect(res.text).to.contain('Missing payload');
                done();
            });
    });


});
