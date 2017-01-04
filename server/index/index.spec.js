'use strict';

/* eslint-disable*/
// Dependencies
const expect = require('chai').expect;
const supertest = require('supertest');

// Config
const config = require(__base + 'modules/t1t-config');
const api = supertest('http://localhost:' + config.port);


describe('Public assets', function onDescribe() {

    it('can be accessed', function onIt(done) {
        api.get('/keycloak.json')
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .end(function validate(err, res) {

                if (err) {
                    return done(err);
                }

                expect(res.text).to.contain("realm-public-key");


                done();
            });
    });


    it('redirects to index if not found', function onIt(done) {
        api.get('/arandomfilethatdoesnotexist')
            .expect(302)
            .expect('Location', config.scheme + '://' + config.domain + ':' + config.port)
            .end(function validate(err, res) {
                if (err) {
                    return done(err);
                }
                done();
            });
    });
});