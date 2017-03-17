(function () {
    'use strict';

    angular.module('app.readmycards.plugins')
        .service('EMV', Emv);


    function Emv($q, Core) {

        // === T1C Methods ===
        // --- EMV ---
        this.getAllEmvData = getAllEmvData;
        this.getPAN = getPAN;
        this.filterEmvData = filterEmvData;
        this.verifyEmvPin = verifyEmvPin;

        const connector = Core.getConnector();


        /// ==============================
        /// ===== EMV FUNCTIONALITY ======
        /// ==============================

        // Get All available EMV Data
        function getAllEmvData(readerId) {
            let allData = $q.defer();
            connector.emv(readerId).allData([], function (err, res) {
                callbackHelper(err, res, allData);
            });
            return allData.promise;
        }

        // Get Primary Account Number (PAN) associated with a card
        function getPAN(readerId) {
            let panDeferred = $q.defer();
            connector.emv(readerId).pan(function (err, result) {
                callbackHelper(err, result, panDeferred);
            });
            return panDeferred.promise;
        }

        // Filter data
        function filterEmvData(readerId, filter) {
            let emvDeferred = $q.defer();
            connector.emv(readerId).allData(filter, function (err, result) {
                callbackHelper(err, result, emvDeferred);
            });
            return emvDeferred.promise;
        }

        // Verify PIN code
        function verifyEmvPin(readerId, pin) {
            let emvDeferred = $q.defer();
            let data = {
                properties: {}
            };
            if (pin) data.properties.pin = pin;
            connector.emv(readerId).verifyPin(data, function (err, result) {
                callbackHelper(err, result, emvDeferred);
            });
            return emvDeferred.promise;
        }



        // Helper function to reject or resolve the promise when appropriate
        function callbackHelper(err, result, promise) {
            if (err) promise.reject(err);
            else promise.resolve(result);
        }
    }
})();