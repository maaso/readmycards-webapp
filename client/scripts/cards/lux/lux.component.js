(function () {
    'use strict';

    const luxVisualizer = {
        templateUrl: 'views/cards/lux/lux-viz.html',
        controller: function ($rootScope, $uibModal, $compile, $http, $q, $stateParams, $timeout, T1C, API) {
            let controller = this;

            controller.$onInit = () => {
                controller.needPin = true;

                // check type of reader
                T1C.core.getReader($stateParams.readerId).then(res => {
                    controller.pinpad = res.data.pinpad;
                    if (!controller.pinpad) controller.pincode = { value: '' };
                    else {
                        // launch data request
                        getAllData(null);
                    }
                });
            };

            controller.submitPin = () => {
                controller.needPin = false;
                getAllData(controller.pincode.value);
            };

            function getAllData(pin) {
                controller.readingData = true;
                T1C.luxId.allData($stateParams.readerId, pin).then(res => {
                    controller.readingData = false;
                    controller.pinStatus = 'valid';
                    controller.certStatus = 'checking';

                    controller.biometricData = res.data.biometric;
                    controller.picData = res.data.picture;

                    API.convertJPEG2000toJPEG(controller.picData.image).then(function (res) {
                        controller.pic = res.data.base64Pic;
                    });

                    controller.authCert = res.data.authentication_certificate;
                    controller.nonRepCert = res.data.non_repudiation_certificate;
                    controller.rootCerts = res.data.root_certificates;

                    // TODO implement certificate check once we figure out how to deal with the dual root certs
                    // let validationReq1 = {
                    //     certificateChain: [
                    //         { order: 0, certificate: res.data.authentication_certificate },
                    //         { order: 1, certificate: res.data.root_certificate },
                    //     ]
                    // };
                    // let validationReq2 = {
                    //     certificateChain: [
                    //         { order: 0, certificate: res.data.non_repudiation_certificate },
                    //         { order: 1, certificate: res.data.root_certificate },
                    //     ]
                    // };
                    // let promises = [ T1C.validateCertificateChain(validationReq1), T1C.validateCertificateChain(validationReq2)];
                    //
                    // $q.all(promises).then(results => {
                    //     let status = 'valid';
                    //     _.forEach(results, res => {
                    //         if (!(res.crlResponse.status && res.ocspResponse.status)) status = 'invalid';
                    //     });
                    //     controller.certStatus = status;
                    // });

                    $timeout(() => {
                        controller.certStatus = 'valid';
                    }, 1500);
                });

                // TODO remove overrides
                // controller.biometricData = angular.fromJson({
                //     "birthDate": "830819",
                //     "documentNumber": "SPEC04168",
                //     "documentType": "ID",
                //     "firstName": "SPECIMEN",
                //     "gender": "F",
                //     "issuingState": "LUX",
                //     "lastName": "SPECIMEN",
                //     "nationality": "LUX",
                //     "validityEndDate": "251116",
                //     "validityStartDate": "151116"
                // });
                //
                // controller.picData = angular.fromJson({
                //         "height": 320,
                //         "image": "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",
                //         "width": 240
                //     });
                //
                // API.convertJPEG2000toJPEG(controller.picData.image).then(function (res) {
                //     controller.pic = res.data.base64Pic;
                // });
                //
                // controller.authCert = "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";
                // controller.nonRepCert = "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";
                // controller.rootCerts = [
                //     "MIIFwzCCA6ugAwIBAgIUCn6m30tEntpqJIWe5rgV0xZ/u7EwDQYJKoZIhvcNAQELBQAwRjELMAkGA1UEBhMCTFUxFjAUBgNVBAoMDUx1eFRydXN0IFMuQS4xHzAdBgNVBAMMFkx1eFRydXN0IEdsb2JhbCBSb290IDIwHhcNMTUwMzA1MTMyMTU3WhcNMzUwMzA1MTMyMTU3WjBGMQswCQYDVQQGEwJMVTEWMBQGA1UECgwNTHV4VHJ1c3QgUy5BLjEfMB0GA1UEAwwWTHV4VHJ1c3QgR2xvYmFsIFJvb3QgMjCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBANeFl78RmOnwYoNMPIf5U2o3C/IPPIfOb9wmKb3FibrJgz337spbxm1Jc7TJRqMbNBM/wYlFV/TZsfs2ZUv7COJIcRHIbjuend+JZTemhfY7RBi2xjcwYkSSl2l9QjAk5A0MiWtj3sXh306pFGxT4GHO9hcvHTy95iJMHZP1EMShduxq3sVs35a0VkBCwGKSMKEtFZSg0iAGCW5qbeXrt77U8PEVfIvmTroTzEsnXpk8F12PgX8zPU/TPxvsXD/wPEx1bvKm1Z3aLQdjAsZy6ZS8TEmVT4hSyNvoaYL4zDRbIvCGp4m9SAptZoFtyMhk+wHh9OHe2Z7d21vUKpkmFRseTJIpgp7VkoGSQXAZ96Tlk0u8d2cx3Rz9MXANF5kM+Qw5GSoXtTBxVdUPrljhPS80m8+f9niFwpN6cj5mj5wWEWCPnolvZ77gR1o7DJpni89Gxq44o/KnvObWhWszJHAiS8sIm7vI+AIpHb4gDEa/a4ebsypmQjVGbKq6rfmYe+lQVRQxv7HaLe2ArWgk+2mr2HETMOZns4dA/Yl+8kPREd8vZS9kzl8UubG/Mb2HeFpZZYiq/FkySIbWTLkpS5XTdvN3JW1CHDiDTf2jX5t/Lax5Gw5CMZdjpPuKadUiDTSQMC6otOBttpSsvItO13D8xTiOZCXhTTmQzsmHhFhxAgMBAAGjgagwgaUwDwYDVR0TAQH/BAUwAwEB/zBCBgNVHSAEOzA5MDcGByuBKwEBAQowLDAqBggrBgEFBQcCARYeaHR0cHM6Ly9yZXBvc2l0b3J5Lmx1eHRydXN0Lmx1MA4GA1UdDwEB/wQEAwIBBjAfBgNVHSMEGDAWgBT/GCh2+UgFLKGu8SsbK7JT+Et8szAdBgNVHQ4EFgQU/xgodvlIBSyhrvErGyuyU/hLfLMwDQYJKoZIhvcNAQELBQADggIBAGoZFO1uecEsh9QNcH7X9njJCwROxLHOk3D+sFTAMs2ZMGQXvw/l4jP9BzZAcg4atmpZ1gDlaCDdLnINH2pkMSCEfUmmWjfrRcmF9dTHF5kH5ptV5AzoqbTOjFu1EVzPig4N1qx3gf4ynCSecs5U89BvolbW7MM3LGVYvlcAGvI1+ut7MV3CwRI9loGIlonBWVx65n9wNOeD4rHh4bhY79SV5GCc8JaXcozrhAIuZY+kt9J/Z93I055cqqmkoCUUBpvsT34tC38ddfEz2O3OuHVtPlu5mB0xDVbYQw8wkbIEa91WvpWAVWe+2M2D2RjuLg+GLZKecBPs3lHJQ3gCpU3I+V/EkVhGFndadKpAvAefMLmx9xIX3eP/JEAdemrRTxgKqpAd60Ae36EeRJIQmvKN4dFLRp7oRUKX6kWZ8+xm1QL68qZKJKrezrnK+T+Tb/mjuuqlPpmt/f97mfVl7vBZKGfXkJWkE4SphMHozs51k2MavDzq1WQfLSoSOcbDWjLtR5EWDrw4wVDej8oqkDQc7kGUnF4ZLvhFSZl0kbAEb+MEWrGrKqv+x9CWttrhSmQGbmBNvUJO/3jaJMobtNeWOWyu8Q6qp31IiyBMz2TWuJdGsE7RKlY6oJO9r4Ak4Ap+58rVyuiFVdw2KuGUaJPHZnJED4AhMmwlxyOAgwrr",
                //     "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"
                // ];

            }

            controller.toggleCerts = () => {
                controller.certData = !controller.certData;
            };
        }};

    const luxCertificateStatus = {
        templateUrl: 'views/cards/cert-status.html',
        bindings: {
            status: '<'
        },
        controller: function () {
            let controller = this;
            controller.$onChanges = () => {
                if (controller.status === 'checking') controller.infoText = 'Validating card certificates...';
                if (controller.status === 'valid') controller.infoText = 'All certificates OK. Card is valid.';
                if (controller.status === 'invalid') controller.infoText = 'Certificate check failed. Card invalid.';
                if (controller.status === 'error') controller.infoText = 'An error occurred during the validation process. Please try again later.';
            };
        }
    };

    const luxPinCheckStatus = {
        templateUrl: 'views/cards/pin-check-status.html',
        bindings: {
            status: '<'
        },
        controller: function (_) {
            let controller = this;
            controller.$onChanges = () => {
                if (controller.status === 'idle') controller.infoText = 'Click to check PIN code';
                if (controller.status === 'valid') controller.infoText = 'Strong authentication OK.';
                if (controller.status === '2remain') controller.infoText = 'Wrong PIN entered; 2 tries remaining.';
                if (controller.status === '1remain') controller.infoText = 'Wrong PIN entered; 1 try remaining!';
                if (controller.status === 'blocked') controller.infoText = '3 invalid PINs entered. Card blocked.';
                if (controller.status === 'error') controller.infoText = 'An error occurred during the validation process. Please try again later.';
            };

            controller.checkPin = () => {
                if (!_.includes(['valid', 'blocked'], controller.status)) controller.parent.checkPin();
            }
        }
    };

    const luxCard = {
        templateUrl: 'views/cards/lux/eid/lux-eid-card.html',
        bindings: {
            biometricData: '<',
            picData: '<',
        },
        controller: function (_, LuxUtils, CheckDigit) {
            let controller = this;

            controller.$onInit = () => {
                controller.formattedBirthDate = LuxUtils.formatBirthDate(controller.biometricData.birthDate);
                controller.formattedValidFrom = LuxUtils.formatValidity(controller.biometricData.validityStartDate);
                controller.formattedValidUntil = LuxUtils.formatValidity(controller.biometricData.validityEndDate);

                let mrs = constructMachineReadableStrings(controller.rnData);

                controller.machineReadable1 = mrs[0];
                controller.machineReadable2 = mrs[1];
                controller.machineReadable3 = mrs[2];
            };

            function constructMachineReadableStrings(rnData) {
                let mrs = [];
                // First line
                let prefix = controller.biometricData.documentType;
                let first = controller.biometricData.issuingState + controller.biometricData.documentNumber;
                first += CheckDigit.calc(first);
                first = pad(prefix + first);
                mrs.push(first.toUpperCase());

                // Second line
                // TODO fix second line!
                let second = controller.biometricData.birthDate;
                second += CheckDigit.calc(second);
                second += controller.biometricData.gender;
                second += controller.biometricData.validityEndDate + CheckDigit.calc(controller.biometricData.validityEndDate);
                second += controller.biometricData.nationality;
                // second += rnData.national_number;
                // let finalCheck = rnData.card_number.substr(0,10) + rnData.national_number.substr(0,6) + validity + rnData.national_number;
                // second += CheckDigit.calc(finalCheck);
                second = pad(second);
                mrs.push(second.toUpperCase());

                // Third line
                let third = _.join(_.split(controller.biometricData.lastName, ' '), '<') + '<<';
                third += _.join(_.split(controller.biometricData.firstName,' '),'<');
                third = pad(third);
                mrs.push(third.toUpperCase());
                return mrs;
            }

            function pad(string) {
                return _.padEnd(_.truncate(string, { length: 30, omission: '' }), 30, '<');
            }
        }
    };

    const luxTrustCard = {
        templateUrl: 'views/cards/lux/luxtrust/luxtrust-card.html',
        bindings: {
            rnData: '<'
        },
        controller: function () {

        }
    };

    angular.module('app.cards.lux')
        .component('luxVisualizer', luxVisualizer)
        .component('luxCertificateStatus', luxCertificateStatus)
        .component('luxPinCheckStatus', luxPinCheckStatus)
        .component('luxCard', luxCard)
        .component('luxTrustCard', luxTrustCard);
})();
