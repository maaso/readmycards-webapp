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
            // TODO remove overrides

            let testData = {};
            testData.authentication_certificate = "MIIGjTCCBHWgAwIBAgIDFuZ1MA0GCSqGSIb3DQEBCwUAME4xCzAJBgNVBAYTAkxVMRYwFAYDVQQKDA1MdXhUcnVzdCBTLkEuMScwJQYDVQQDDB5MdXhUcnVzdCBHbG9iYWwgUXVhbGlmaWVkIENBIDMwHhcNMTUxMTE2MTEwMzU1WhcNMTYxMTE2MTEwMzU1WjCBmzELMAkGA1UEBhMCTFUxJDAiBgNVBAMTG1NwZWNpbWVuLTQxNjggU3BlY2ltZW4tNDE2ODEWMBQGA1UEBBMNU3BlY2ltZW4tNDE2ODEWMBQGA1UEKhMNU3BlY2ltZW4tNDE2ODEdMBsGA1UEBRMUMTE4NzE0NDY5OTAwNzUwODA1OTAxFzAVBgNVBAwTDlByaXZhdGUgUGVyc29uMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4QihIvv4rPqTdzBxUEQMH3HZ0fRn5IaKLgC+tHeZXytK5sU62KwfWxxpsKjuNdmhulUnigmfUr4vZUEiPuYoNdMHErVdGStJrOLxSeZZZGVxgdymWlEDwWv3427VQkXPorIT4g8dD52+D95/x6ejKhfrW91dZVMKnG/zp9/UZCb6WYQCNsdeIlNRKg6ccnhcLpLfpeJZSHsY3FT+NAPZVpNEJB6BN0/j9n752q83XNVIfgWsPKw8degyJ0Q0ARRc8Uu4U4cXUUI3YNQhdWmSUSMc0Jg6qB/EVd98G8fSzp053D29jZZ5y1150olcxJcC0jp571Kq4JEwn/9wi0k+RwIDAQABo4ICJDCCAiAwDAYDVR0TAQH/BAIwADBmBggrBgEFBQcBAQRaMFgwJwYIKwYBBQUHMAGGG2h0dHA6Ly9xY2Eub2NzcC5sdXh0cnVzdC5sdTAtBggrBgEFBQcwAoYhaHR0cDovL2NhLmx1eHRydXN0Lmx1L0xUR1FDQTMuY3J0MIIBMAYDVR0gBIIBJzCCASMwggEVBggrgSsBAQoDETCCAQcwgdgGCCsGAQUFBwICMIHLGoHITHV4VHJ1c3QgSU5URUdSQVRJT04gQ0VSVElGSUNBVEUgb24gZUlEIFNTQ0QgY29tcGxpYW50IHdpdGggRVRTSSBUUyAxMDIgMDQyIExDUCBjZXJ0aWZpY2F0ZSBwb2xpY3kuIEtleSBHZW5lcmF0aW9uIGJ5IENTUC4gU29sZSBBdXRob3Jpc2VkIFVzYWdlOiBBdXRoZW50aWNhdGlvbiBhbmQgRW5jcnlwdGlvbiBmb3IgSW50ZWdyYXRpb24gUHVycG9zZXMwKgYIKwYBBQUHAgEWHmh0dHBzOi8vcmVwb3NpdG9yeS5sdXh0cnVzdC5sdTAIBgYEAI96AQIwCwYDVR0PBAQDAgSwMB8GA1UdIwQYMBaAFGOPwosDsauO2FNHlh2ZqH32rKh1MDMGA1UdHwQsMCowKKAmoCSGImh0dHA6Ly9jcmwubHV4dHJ1c3QubHUvTFRHUUNBMy5jcmwwEQYDVR0OBAoECEmK/gPolg9bMA0GCSqGSIb3DQEBCwUAA4ICAQAIds9urFZL/0x1iACst4iaP7jjImsVQFK2pOS2rt4q+tZW8uenHl3SJnriIc16zzGSzGvn6hdil2KARGXUZshDcdi6jk9yda8LAPTLX9r3EJJSUTj20vIU8p6nB4KAVCYpTnMBRKsb//PfXBzAVF3I6Zm0g6teMBDWpWpu/2+BA29ZpQefLPAR0mpgycTLQWtOFpPOsQ8PhHu0kLPRBwQ7WLGny8fD9wWLwDKVF/0aFmkUI6AdcJMnJghJ2tvxpXOgfos2ehLmVXIjDaJrJG2ETGyL47fKEH1KvSV3jt5mseX00ih/0tt6NEZ10PbDtiSlL02TJPi4H/8OSvNxYzkVG/wv+E6/PA+ZemIJ69E2ncXKGB7Nzoo8UVdVw55udXRnRhCG39VcaPLN5XUDnPfFz5J3vlmaaFmEqh4WqPq2RZzL2EpXup2Te9b9v22Pn3F9+IdZEGSX13LAjZO3RdztNHItnGpqTs5r+P2dBZjQN64Ft6cEKgZp0Vhkq14aoWDEI7b6r21Qncg6iiepm+66KpXr2oHABsAqe1T51I0Y9vOLXh+2kCf7gD5ucJDSK98ovg/x0hdWD4FkbpXdSRPEilHCWUHHdZoYzXIRrCXbx8pQo0CHB9W4y9KgjA1GHLprQlwiGqhKuT9fxtPAJnmQ1OaATHSBO1lwXW+LDSDSEw==";
            testData.signing_certificate = "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";
            testData.root_certificates = [
                "MIIFwzCCA6ugAwIBAgIUCn6m30tEntpqJIWe5rgV0xZ/u7EwDQYJKoZIhvcNAQELBQAwRjELMAkGA1UEBhMCTFUxFjAUBgNVBAoMDUx1eFRydXN0IFMuQS4xHzAdBgNVBAMMFkx1eFRydXN0IEdsb2JhbCBSb290IDIwHhcNMTUwMzA1MTMyMTU3WhcNMzUwMzA1MTMyMTU3WjBGMQswCQYDVQQGEwJMVTEWMBQGA1UECgwNTHV4VHJ1c3QgUy5BLjEfMB0GA1UEAwwWTHV4VHJ1c3QgR2xvYmFsIFJvb3QgMjCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBANeFl78RmOnwYoNMPIf5U2o3C/IPPIfOb9wmKb3FibrJgz337spbxm1Jc7TJRqMbNBM/wYlFV/TZsfs2ZUv7COJIcRHIbjuend+JZTemhfY7RBi2xjcwYkSSl2l9QjAk5A0MiWtj3sXh306pFGxT4GHO9hcvHTy95iJMHZP1EMShduxq3sVs35a0VkBCwGKSMKEtFZSg0iAGCW5qbeXrt77U8PEVfIvmTroTzEsnXpk8F12PgX8zPU/TPxvsXD/wPEx1bvKm1Z3aLQdjAsZy6ZS8TEmVT4hSyNvoaYL4zDRbIvCGp4m9SAptZoFtyMhk+wHh9OHe2Z7d21vUKpkmFRseTJIpgp7VkoGSQXAZ96Tlk0u8d2cx3Rz9MXANF5kM+Qw5GSoXtTBxVdUPrljhPS80m8+f9niFwpN6cj5mj5wWEWCPnolvZ77gR1o7DJpni89Gxq44o/KnvObWhWszJHAiS8sIm7vI+AIpHb4gDEa/a4ebsypmQjVGbKq6rfmYe+lQVRQxv7HaLe2ArWgk+2mr2HETMOZns4dA/Yl+8kPREd8vZS9kzl8UubG/Mb2HeFpZZYiq/FkySIbWTLkpS5XTdvN3JW1CHDiDTf2jX5t/Lax5Gw5CMZdjpPuKadUiDTSQMC6otOBttpSsvItO13D8xTiOZCXhTTmQzsmHhFhxAgMBAAGjgagwgaUwDwYDVR0TAQH/BAUwAwEB/zBCBgNVHSAEOzA5MDcGByuBKwEBAQowLDAqBggrBgEFBQcCARYeaHR0cHM6Ly9yZXBvc2l0b3J5Lmx1eHRydXN0Lmx1MA4GA1UdDwEB/wQEAwIBBjAfBgNVHSMEGDAWgBT/GCh2+UgFLKGu8SsbK7JT+Et8szAdBgNVHQ4EFgQU/xgodvlIBSyhrvErGyuyU/hLfLMwDQYJKoZIhvcNAQELBQADggIBAGoZFO1uecEsh9QNcH7X9njJCwROxLHOk3D+sFTAMs2ZMGQXvw/l4jP9BzZAcg4atmpZ1gDlaCDdLnINH2pkMSCEfUmmWjfrRcmF9dTHF5kH5ptV5AzoqbTOjFu1EVzPig4N1qx3gf4ynCSecs5U89BvolbW7MM3LGVYvlcAGvI1+ut7MV3CwRI9loGIlonBWVx65n9wNOeD4rHh4bhY79SV5GCc8JaXcozrhAIuZY+kt9J/Z93I055cqqmkoCUUBpvsT34tC38ddfEz2O3OuHVtPlu5mB0xDVbYQw8wkbIEa91WvpWAVWe+2M2D2RjuLg+GLZKecBPs3lHJQ3gCpU3I+V/EkVhGFndadKpAvAefMLmx9xIX3eP/JEAdemrRTxgKqpAd60Ae36EeRJIQmvKN4dFLRp7oRUKX6kWZ8+xm1QL68qZKJKrezrnK+T+Tb/mjuuqlPpmt/f97mfVl7vBZKGfXkJWkE4SphMHozs51k2MavDzq1WQfLSoSOcbDWjLtR5EWDrw4wVDej8oqkDQc7kGUnF4ZLvhFSZl0kbAEb+MEWrGrKqv+x9CWttrhSmQGbmBNvUJO/3jaJMobtNeWOWyu8Q6qp31IiyBMz2TWuJdGsE7RKlY6oJO9r4Ak4Ap+58rVyuiFVdw2KuGUaJPHZnJED4AhMmwlxyOAgwrr",
                "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"
            ];

            return $q.when({ data: testData });

            // return filteredWrapper(readerId, 'allData', []);
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
            return $q.when('OK');
            // let pinDeferred = $q.defer();
            // let data = {};
            // if (pin) data.pin = pin;
            // connector.beid(readerId).verifyPin(data, function (err, result) {
            //     callbackHelper(err, result, pinDeferred);
            // });
            // return pinDeferred.promise;
        }
    }
})();