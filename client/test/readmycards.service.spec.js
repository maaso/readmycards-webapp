(function (expect, describe, it, ng) {
    'use strict';

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

        describe('CardService card type pretty names', function () {
            it ('notifies us of unknown card types', function () {
                expect(CardService.getCardTypeName('unknown container type')).to.equal('Unknown');
            });

            it ('can name a Belgian eID card', function () {
                expect(CardService.getCardTypeName('beid')).to.equal('Belgian eID');
            });

            it ('can name an EMV card', function () {
                expect(CardService.getCardTypeName('emv')).to.equal('EMV');
            });

            it ('can detect a MOBIB card', function () {
                var card = {
                    description: [ 'MOBIB Card' ]
                };

                var basic = {
                    description: [ 'MOBIB Basic Card' ]
                };
                expect(CardService.getCardTypeName('mobib', card)).to.equal('MOBIB');
                expect(CardService.getCardTypeName('mobib', basic)).to.equal('MOBIB Basic');
            });
        });
    })

})(chai.expect, describe, it, angular);


