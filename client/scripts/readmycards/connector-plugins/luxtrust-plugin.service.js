(function () {
    'use strict';

    angular.module('app.readmycards.plugins')
        .service('LuxTrust', LuxTrust);


    function LuxTrust($q, Core) {
        this.allCerts = allCerts;
        this.allData = allData;
        this.filteredCerts = filteredCerts;
        this.filteredInfo = filteredInfo;
        this.rootCert = rootCert;
        this.authCert = authCert;
        this.signingCert = signingCert;
        this.verifyPin = verifyPin;

        const connector = Core.getConnector();

        function wrapper(readerId, functionName) {
            let deferred = $q.defer();
            connector.luxtrust(readerId)[functionName](function (err, result) {
                callbackHelper(err, result, deferred);
            });
            return deferred.promise;
        }

        function filteredWrapper(readerId, functionName, filters) {
            let filtered = $q.defer();
            connector.luxtrust(readerId)[functionName](filters, function (err, result) {
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
            return filteredWrapper(readerId, 'allData', []);
        }

        function filteredCerts(readerId, filter) {
            return filteredWrapper(readerId, 'allCerts', filter);
        }

        function filteredInfo(readerId, filter) {
            return filteredWrapper(readerId, 'allData', filter);
        }

        function rootCert(readerId) {
            return wrapper(readerId, 'rootCertificate');
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
            connector.luxtrust(readerId).verifyPin(data, function (err, result) {
                callbackHelper(err, result, pinDeferred);
            });
            return pinDeferred.promise;
        }

        // Sign data with certificates stored on the smartcard
        function signData(readerId, pin, algo, dataToSign) {
            let signDeferred = $q.defer();
            let data = {
                algorithm_reference: algo,
                data: dataToSign
            };
            if (pin) data.pin = pin;
            connector.luxtrust(readerId).signData(data, function (err, result) {
                callbackHelper(err, result, signDeferred);
            });
            return signDeferred.promise;
        }
    }
})();