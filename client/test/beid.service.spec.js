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

})(chai.expect, describe, it, angular);


