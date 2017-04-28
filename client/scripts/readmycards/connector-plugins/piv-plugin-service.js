(function () {
    'use strict';

    angular.module('app.readmycards.plugins')
        .service('PIV', PIV);


    function PIV($q, Core, _) {

        // === T1C Methods ===
        // --- PIV ---
        this.allDataFilters = allDataFilters;
        this.allCertFilters = allCertFilters;
        this.allKeyRefs = allKeyRefs;
        this.allAlgoRefsForAuthentication = allAlgoRefsForAuthentication;
        this.allAlgoRefsForSigning = allAlgoRefsForSigning;
        this.printedInformation = printedInformation;
        this.facialImage = facialImage;
        this.allData = allData;
        this.allCerts = allCerts;
        this.authenticationCertificate = authenticationCertificate;
        this.signingCertificate = signingCertificate;
        this.verifyPin = verifyPin;
        this.signData = signData;
        this.authenticate = authenticate;
        // this.validateCertificateChain = validateCertificateChain;

        const connector = Core.getConnector();


        /// ==============================
        /// ===== PIV FUNCTIONALITY ======
        /// ==============================

        function allDataFilters(readerId) {
            return wrapper(readerId, allDataFilters.name);
        }

        function allCertFilters(readerId) {
            return wrapper(readerId, allCertFilters.name);
        }

        function allKeyRefs(readerId) {
            return wrapper(readerId, allKeyRefs.name);
        }
        
        function printedInformation(readerId) {
            // return wrapper(readerId, printedInformation.name);
            return $q.when(angular.fromJson({
                "data": {
                        "name": "Mark Davies",
                        "employee_affiliation": "Chief Operating Officer",
                        "expiration_date": "2017DEC01",
                        "agency_card_serial_number": "123456",
                        "issuer_identification": "Issuer",
                        "organization_affiliation_line_1": "Trust1Team BVBA",
                        "organization_affiliation_line_2": "Ghent Belgium"
                },
                "success": true
            }));
        }
        
        function facialImage(readerId) {
            return wrapper(readerId, facialImage.name);
        }
        
        function authenticationCertificate(readerId) {
            return wrapper(readerId, authenticationCertificate.name);
        }

        function signingCertificate(readerId) {
            return wrapper(readerId, signingCertificate.name);
        }

        function allCerts(readerId, filters) {
            if (_.isEmpty(filters)) { return dataWrapper(readerId, allCerts.name, []); }
            else { return dataWrapper(readerId, allCerts.name, filters); }
        }

        function allData(readerId, filters) {
            if (_.isEmpty(filters)) { return dataWrapper(readerId, allData.name, []); }
            else { return dataWrapper(readerId, allData.name, filters); }
        }

        function verifyPin(readerId, pin) {
            return $q.when({ success: true });
            // let data = { };
            // if (pin) data.pin = pin;
            // return dataWrapper(readerId, verifyPin.name, data);
        }

        function allAlgoRefsForAuthentication(readerId) {
            return wrapper(readerId, allAlgoRefsForAuthentication.name);
        }

        function allAlgoRefsForSigning(readerId) {
            return wrapper(readerId, allAlgoRefsForSigning.name);
        }

        function authenticate(readerId, pin, algo, dataToAuth) {
            let data = {
                algorithm_reference: algo,
                data: dataToAuth
            };
            if (pin) data.pin = pin;
            return dataWrapper(readerId, authenticate.name, data);
        }

        function signData(readerId, pin, algo, dataToSign) {
            let data = {
                algorithm_reference: algo,
                data: dataToSign
            };
            if (pin) data.pin = pin;
            return dataWrapper(readerId, signData.name, data);
        }

        // function validateCertificateChain(certs) {
        //     let data = $q.defer();
        //     connector.ocv().validateCertificateChain(certs, (err, info) => {
        //         callbackHelper(err, info, data);
        //     });
        //     return data.promise;
        // }
        
        /// ============================
        /// ===== HELPER FUNCTIONS =====
        /// ============================

        function wrapper(readerId, functionName) {
            let deferred = $q.defer();
            connector.piv(readerId)[functionName](function (err, result) {
                callbackHelper(err, result, deferred);
            });
            return deferred.promise;
        }

        function dataWrapper(readerId, functionName, data) {
            let dataDeferred = $q.defer();
            connector.piv(readerId)[functionName](data, function (err, result) {
                callbackHelper(err, result, dataDeferred);
            });
            return dataDeferred.promise;
        }

        // Helper function to reject or resolve the promise when appropriate
        function callbackHelper(err, result, promise) {
            if (err) promise.reject(err);
            else promise.resolve(result);
        }
    }
})();