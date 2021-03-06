(function () {
    'use strict';

    angular.module('app.readmycards.plugins')
        .service('BeID', BeID);


    function BeID($q, Core, _) {

        // --- BeID ---
        this.getAllData = getAllData;
        this.getAllCerts = getAllCerts;
        this.getRnData = getRnData;
        this.getAddress = getAddress;
        this.getPic = getPic;
        this.getRootCert = getRootCert;
        this.getAuthCert = getAuthCert;
        this.getCitizenCert = getCitizenCert;
        this.getNonRepCert = getNonRepCert;
        this.getRrnCert = getRrnCert;
        this.filterBeIdData = filterBeIdData;
        this.filterBeIdCerts = filterBeIdCerts;
        this.signData = signData;
        this.verifyPin = verifyBeIDPin;
        this.authenticate = authenticate;

        const connector = Core.getConnector();


        /// ===============================
        /// ===== BeID FUNCTIONALITY ======
        /// ===============================

        // Get all data
        function getAllData(readerId) {
            let data = $q.defer();
            connector.beid(readerId).allData([], function (err, result) {
                callbackHelper(err, result, data);
            });
            return data.promise;
        }

        // Get all data
        function getAllCerts(readerId, filter) {
            let data = $q.defer();
            let certFilter = [];
            if (filter && _.isArray(filter)) certFilter = filter;
            connector.beid(readerId).allCerts(certFilter, function (err, result) {
                callbackHelper(err, result, data);
            });
            return data.promise;
        }

        // Get all card holder related data, excluding address and photo
        function getRnData(readerId) {
            let rnDataDeferred = $q.defer();
            connector.beid(readerId).rnData(function (err, result) {
                callbackHelper(err, result, rnDataDeferred);
            });
            return rnDataDeferred.promise;
        }

        // Get card holder's address
        function getAddress(readerId) {
            let addressDeferred = $q.defer();
            connector.beid(readerId).address(function (err, result) {
                callbackHelper(err, result, addressDeferred);
            });
            return addressDeferred.promise;
        }

        // Get card holder's picture
        function getPic(readerId) {
            let picDeferred = $q.defer();
            connector.beid(readerId).picture(function (err, result) {
                callbackHelper(err, result, picDeferred);
            });
            return picDeferred.promise;
        }

        // Get root certificate stored on smart card
        function getRootCert(readerId) {
            let rootDeferred = $q.defer();
            connector.beid(readerId).rootCertificate(function (err, result) {
                callbackHelper(err, result, rootDeferred);
            });
            return rootDeferred.promise;
        }

        // Get authentication certificate stored on smart card
        function getAuthCert(readerId) {
            let authDeferred = $q.defer();
            connector.beid(readerId).authenticationCertificate(function (err, result) {
                callbackHelper(err, result, authDeferred);
            });
            return authDeferred.promise;
        }

        // Get citizen certificate stored on smart card
        function getCitizenCert(readerId) {
            let citizenDeferred = $q.defer();
            connector.beid(readerId).citizenCertificate(function (err, result) {
                callbackHelper(err, result, citizenDeferred);
            });
            return citizenDeferred.promise;
        }

        // Get non-repudiation certificat stored on smart card
        function getNonRepCert(readerId) {
            let nonRepDeferred = $q.defer();
            connector.beid(readerId).nonRepudiationCertificate(function (err, result) {
                callbackHelper(err, result, nonRepDeferred);
            });
            return nonRepDeferred.promise;
        }

        // Get RRN certificate stored on smart card (= private key used to sign Rn and Address data)
        function getRrnCert(readerId) {
            let rrnDeferred = $q.defer();
            connector.beid(readerId).rrnCertificate(function (err, result) {
                callbackHelper(err, result, rrnDeferred);
            });
            return rrnDeferred.promise;
        }

        // Get only a specific subset of data
        function filterBeIdData(readerId, filter) {
            let filterDeferred = $q.defer();
            connector.beid(readerId).allData(filter, function (err, result) {
                callbackHelper(err, result, filterDeferred);
            });
            return filterDeferred.promise;
        }

        // Filter the certificates
        function filterBeIdCerts(readerId, filter) {
            let filterDeferred = $q.defer();
            connector.beid(readerId).allCerts(filter, function (err, result) {
                callbackHelper(err, result, filterDeferred);
            });
            return filterDeferred.promise;
        }

        // Sign data with certificates stored on the smartcard
        function signData(readerId, pin, algo, dataToSign) {
            let signDeferred = $q.defer();
            let data = {
                algorithm_reference: algo,
                data: dataToSign
            };
            if (pin) data.pin = pin;
            connector.beid(readerId).signData(data, function (err, result) {
                callbackHelper(err, result, signDeferred);
            });
            return signDeferred.promise;
        }

        // Verify PIN code
        function verifyBeIDPin(readerId, pin) {
            let pinDeferred = $q.defer();
            let data = {};
            if (pin) data.pin = pin;
            connector.beid(readerId).verifyPin(data, function (err, result) {
                callbackHelper(err, result, pinDeferred);
            });
            return pinDeferred.promise;
        }

        // Authenticate card holder based on challenge
        function authenticate(readerId, pin, algo, challenge) {
            let authDeferred = $q.defer();
            let data = {
                algorithm_reference: algo,
                challenge: challenge
            };
            if (pin) data.pin = pin;
            connector.beid(readerId).authenticate(data, function (err, result) {
                callbackHelper(err, result, authDeferred);
            });
            return authDeferred.promise;
        }


        // Helper function to reject or resolve the promise when appropriate
        function callbackHelper(err, result, promise) {
            if (err) promise.reject(err);
            else promise.resolve(result);
        }
    }
})();