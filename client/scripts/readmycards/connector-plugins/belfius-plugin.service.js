(function () {
    'use strict';

    angular.module('app.readmycards.plugins')
           .service('Belfius', Belfius);


    function Belfius($q, $state, $location, Core, _, Citrix) {

        // --- BeID ---
        this.openSession = openSession;
        this.sendCommand = sendCommand;
        this.sendSTX = sendSTX;
        this.closeSession = closeSession;


        const connector = Core.getConnector();


        /// ==================================
        /// ===== Belfius FUNCTIONALITY ======
        /// ==================================

        // Open session
        function openSession(readerId) {
            let data = $q.defer();
            connector.belfius(readerId).openSession(function (err, result) {
                callbackHelper(err, result, data);
            }, Citrix.port());
            return data.promise;
        }

        // Send command
        function sendCommand(readerId, command) {
            let data = $q.defer();
            connector.belfius(readerId).command({ data: command }, function (err, result) {
                callbackHelper(err, result, data);
            }, Citrix.port());
            return data.promise;
        }

        // Send STX
        function sendSTX(readerId, stx) {
            let data = $q.defer();
            connector.belfius(readerId).stx({ data: stx }, function (err, result) {
                callbackHelper(err, result, data);
            }, Citrix.port());
            return data.promise;
        }

        // Close session
        function closeSession(readerId) {
            let data = $q.defer();
            connector.belfius(readerId).closeSession(function (err, result) {
                callbackHelper(err, result, data);
            }, Citrix.port());
            return data.promise;
        }

        // Helper function to reject or resolve the promise when appropriate
        function callbackHelper(err, result, promise) {
            if (err) {
                if (err.data.code === 802) {
                    // invalid HTTP request, probably agent is gone
                    // reset app
                    window.location.reload();
                } else {
                    promise.reject(err);
                }
            }
            else promise.resolve(result);
        }
    }
})();