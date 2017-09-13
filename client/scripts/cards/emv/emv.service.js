(function () {
    'use strict';

    angular.module('app.cards.emv')
        .service('EmvUtils', EmvUtils);

    function EmvUtils(_) {
        this.constructCardNumber = constructCardNumber;
        this.constructExpirationDate = constructExpirationDate;

        function constructCardNumber(original) {
            let cardNumber = "";
            _.forEach(original, (comp, idx) => {
                idx % 4 === 0 ? cardNumber += " " + comp : cardNumber += comp;
            });
            return cardNumber;
        }

        function constructExpirationDate(original) {
            return moment(original, "YYMMDD").format("MM/YY");
        }
    }


})();