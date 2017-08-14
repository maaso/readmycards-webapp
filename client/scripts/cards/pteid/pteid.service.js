(function () {
    'use strict';

    angular.module('app.cards.pteid')
           .service('PtUtils', PtUtils);

    function PtUtils(Core) {
        this.verifyPin = verifyPin;
        
        function verifyPin(readerId, pin) {
            return Core.getConnector().verifyPin(readerId, { pin });
        }
    }


})();