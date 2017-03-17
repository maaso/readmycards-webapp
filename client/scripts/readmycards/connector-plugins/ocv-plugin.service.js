(function () {
    'use strict';

    angular.module('app.readmycards.plugins')
        .service('OCV', OCV);


    function OCV($q, Core) {

        // === T1C Methods ===
        // --- OCV ---
        this.validateCertificateChain = validateCertificateChain;

        const connector = Core.getConnector();


        /// ==============================
        /// ===== OCV FUNCTIONALITY ======
        /// ==============================
        function validateCertificateChain(certs) {
            let data = $q.defer();
            connector.ocv().validateCertificateChain(certs, (err, info) => {
                callbackHelper(err, info, data);
            });
            return data.promise;
        }


        // Helper function to reject or resolve the promise when appropriate
        function callbackHelper(err, result, promise) {
            if (err) promise.reject(err);
            else promise.resolve(result);
        }
    }
})();