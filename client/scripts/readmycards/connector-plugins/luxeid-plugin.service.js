(function () {
    'use strict';

    angular.module('app.readmycards.plugins')
        .service('LuxId', LuxId);


    function LuxId($q, Core) {
        this.address = address;
        this.allCerts = allCerts;
        this.allData = allData;
        this.biometric = biometric;
        this.filteredInfo = filteredInfo;
        this.filteredCerts = filteredCerts;
        this.pic = pic;
        this.rootCert = rootCert;
        this.authCert = authCert;
        this.nonRepudiationCert = nonRepudiationCert;

        const connector = Core.getConnector();

        function wrapper(readerId, pin, functionName) {
            let deferred = $q.defer();
            connector.luxeid(readerId, pin)[functionName](function (err, result) {
                callbackHelper(err, result, deferred);
            });
            return deferred.promise;
        }

        function filteredWrapper(readerId, pin, functionName, filters) {
            let filtered = $q.defer();
            connector.luxeid(readerId, pin)[functionName](filters, function (err, result) {
                callbackHelper(err, result, filtered);
            });
            return filtered.promise;
        }

        // Helper function to reject or resolve the promise when appropriate
        function callbackHelper(err, result, promise) {
            if (err) promise.reject(err);
            else promise.resolve(result);
        }

        function address(readerId, pin) {
            console.log('get address');
            return wrapper(readerId, pin, 'address');
        }

        function allCerts(readerId, pin) {
            return filteredWrapper(readerId, pin, 'allCerts', []);
        }

        function allData(readerId, pin) {
            return filteredWrapper(readerId, pin, 'allData', []);
        }

        function biometric(readerId, pin) {
            return wrapper(readerId, pin, 'biometric');
        }

        function filteredCerts(readerId, pin, filter) {
            return filteredWrapper(readerId, pin, 'allCerts', filter);
        }

        function filteredInfo(readerId, pin, filter) {
            return filteredWrapper(readerId, pin, 'allData', filter);
        }

        function pic(readerId, pin) {
            return wrapper(readerId, pin, 'picture');
        }

        function rootCert(readerId, pin) {
            return wrapper(readerId, pin, 'rootCertificate');
        }

        function authCert(readerId, pin) {
            return wrapper(readerId, pin, 'authenticationCertificate');
        }

        function nonRepudiationCert(readerId, pin) {
            return wrapper(readerId, pin, 'nonRepudiationCertificate');
        }
    }
})();