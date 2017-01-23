(function (expect, describe, it, ng) {
    'use strict';


    describe('BeID Service', function() {

        beforeEach(module('app'));

        var BeID;

        beforeEach(inject(function (_BeID_) {
            BeID = _BeID_;
        }));

        describe('Format CardNumber', function() {
            it ('will format an arbitrary card number for display', function() {
                expect(BeID.formatCardNumber('000000000000')).to.equal('000-0000000-00');
                expect(BeID.formatCardNumber('123456789012')).to.equal('123-4567890-12');
            });
        });

        describe('Format RRNR', function() {
            it ('will format an arbitrary RRNR for display', function() {
                expect(BeID.formatRRNR('00000000000')).to.equal('00.00.00-000.00');
                expect(BeID.formatRRNR('12345678901')).to.equal('12.34.56-789.01');
            });
        });
    });


    describe('CheckDigit Service', function() {

        beforeEach(module('app'));

        var CheckDigit;

        beforeEach(inject(function (_CheckDigit_) {
            CheckDigit = _CheckDigit_;
        }));

        describe('Checkdigit calculation function', function() {
            it ('accepts a string and returns an integer', function() {
                expect(CheckDigit.calc('0')).to.equal(0);
                expect(CheckDigit.calc('1')).to.equal(7);
                expect(CheckDigit.calc('12')).to.equal(3);
            });

            it ('correctly calculates the value of the filler character', function () {
                expect(CheckDigit.calc('<')).to.equal(0);
                expect(CheckDigit.calc('1<<<<<<')).to.equal(7);
                expect(CheckDigit.calc('1<<<2')).to.equal(3);
            });

            it ('correctly calculates the check digit for a complex value', function () {
                expect(CheckDigit.calc('592217646585082225100885082232580')).to.equal(5);
            });
        });
    });

    describe('CardService', function () {

        beforeEach(module('app'));

        var CardService;

        beforeEach(inject(function (_CardService_) {
            CardService = _CardService_;
        }));

        describe('CardService card type detection', function () {
            it ('notifies us of unknown card types', function () {
                var card = {
                    description: [ 'unknown type test' ]
                };
                expect(CardService.detectType(card)).to.equal('Unknown');
            });

            it ('can detect a Belgian eID card', function () {
                var card = {
                    description: [ 'Belgium Electronic ID card' ]
                };
                expect(CardService.detectType(card)).to.equal('BeID');
            });

            it ('can detect an EMV card', function () {
                var card = {
                    description: [ 'Axa Bank (Belgium) Mastercard Gold / Axa Bank Belgium' ]
                };
                expect(CardService.detectType(card)).to.equal('EMV');
            });

            it ('can detect a MOBIB card', function () {
                var card = {
                    description: [ 'MOBIB Card' ]
                };
                expect(CardService.detectType(card)).to.equal('MOBIB');
            });
        });
    })

})(chai.expect, describe, it, angular);


