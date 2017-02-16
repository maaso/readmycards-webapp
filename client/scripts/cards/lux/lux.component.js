(function () {
    'use strict';

    const luxVisualizer = {
        templateUrl: 'views/cards/lux/lux-viz.html',
        bindings: {
            rnData: '<'
        },
        controller: function ($rootScope, $uibModal, $compile, $http, $q, $stateParams, $timeout, T1C, _) {
            let controller = this;

            controller.$onInit = () => {
                controller.needPin = true;

                // check type of reader
                T1C.getReader($stateParams.readerId).then(res => {
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
            }

            controller.toggleCerts = () => {
                if (controller.certData) {
                    controller.certData = undefined;
                } else {
                    if (!controller.loadingCerts) {
                        controller.loadingCerts = true;
                        T1C.getAllCerts($stateParams.readerId).then(res => {
                            controller.loadingCerts = false;
                            controller.certData = res.data;
                        });
                    }
                }
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
                console.log(controller.biometricData);

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
