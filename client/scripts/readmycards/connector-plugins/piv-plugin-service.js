(function () {
    'use strict';

    angular.module('app.readmycards.plugins')
        .service('PIV', PIV);


    function PIV($q, Core) {

        // === T1C Methods ===
        // --- PIV ---
        this.validateCertificateChain = validateCertificateChain;

        const connector = Core.getConnector();


        /// ==============================
        /// ===== PIV FUNCTIONALITY ======
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