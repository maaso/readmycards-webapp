(function () {
    'use strict';

    angular.module('app.readmycards.plugins')
        .service('DNIe', DNIe);


    function DNIe($q, Core) {
        this.allCerts = allCerts;
        this.allData = allData;
        this.challenge = challenge;
        this.filteredCerts = filteredCerts;
        this.intermediateCert = intermediateCert;
        this.authCert = authCert;
        this.signingCert = signingCert;
        this.signData = signData;
        this.verifyPin = verifyPin;

        const connector = Core.getConnector();

        function wrapper(readerId, functionName) {
            let deferred = $q.defer();
            console.log("DNIe: " + functionName);
            connector.dnie(readerId)[functionName](function (err, result) {
                callbackHelper(err, result, deferred);
            });
            return deferred.promise;
        }

        function filteredWrapper(readerId, functionName, filters) {
            let filtered = $q.defer();
            console.log("DNIe: " + functionName);
            console.log(filters);
            connector.dnie(readerId)[functionName](filters, function (err, result) {
                callbackHelper(err, result, filtered);
            });
            return filtered.promise;
        }

        // Helper function to reject or resolve the promise when appropriate
        function callbackHelper(err, result, promise) {
            if (err) promise.reject(err);
            else promise.resolve(result);
        }

        function allCerts(readerId) {
            return filteredWrapper(readerId, 'allCerts', []);
        }

        function allData(readerId) {
            console.log("Retrieving all info")
            return filteredWrapper(readerId, 'allData', []);
        }

        function filteredCerts(readerId, filter) {
            return filteredWrapper(readerId, 'allCerts', filter);
        }

        function intermediateCert(readerId) {
            return wrapper(readerId, 'intermediateCertificate');
        }

        function authCert(readerId) {
            return wrapper(readerId, 'authenticationCertificate');
        }

        function signingCert(readerId) {
            return wrapper(readerId, 'signingCertificate');
        }

        // Verify PIN code
        function verifyPin(readerId, pin) {
            let pinDeferred = $q.defer();
            let data = {};
            if (pin) data.pin = pin;
            connector.dnie(readerId).verifyPin(data, function (err, result) {
                callbackHelper(err, result, pinDeferred);
            });
            return pinDeferred.promise;
        }

        // OTP challenge
        function challenge(readerId, pin) {
            let challengeDeferred = $q.defer();
            let data = {};
            if (pin) data.pin = pin;
            connector.dnie(readerId).challenge(data, (err, result) => {
                callbackHelper(err, result, challengeDeferred);
            });
            return challengeDeferred.promise;
        }

        // Sign data with certificates stored on the smartcard
        function signData(readerId, pin, algo, dataToSign) {
            let signDeferred = $q.defer();
            let data = {
                algorithm_reference: algo,
                data: dataToSign
            };
            if (pin) data.pin = pin;
            connector.dnie(readerId).signData(data, function (err, result) {
                callbackHelper(err, result, signDeferred);
            });
            return signDeferred.promise;
        }
    }
})();