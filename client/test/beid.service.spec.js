(function (expect, describe, it, ng) {
    'use strict';


    describe('BeID Service', function() {

        beforeEach(module('app'));

        var BeUtils;

        beforeEach(inject(function (_BeUtils_) {
            BeUtils = _BeUtils_;
        }));

        describe('Format CardNumber', function() {
            it ('will format an arbitrary card number for display', function() {
                expect(BeUtils.formatCardNumber('000000000000')).to.equal('000-0000000-00');
                expect(BeUtils.formatCardNumber('123456789012')).to.equal('123-4567890-12');
            });
        });

        describe('Format RRNR', function() {
            it ('will format an arbitrary RRNR for display', function() {
                expect(BeUtils.formatRRNR('00000000000')).to.equal('00.00.00-000.00');
                expect(BeUtils.formatRRNR('12345678901')).to.equal('12.34.56-789.01');
            });
        });
    });

})(chai.expect, describe, it, angular);


