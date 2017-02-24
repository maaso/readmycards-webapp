(function () {
    'use strict';

    const luxVisualizer = {
        templateUrl: 'views/cards/lux/eid/lux-viz.html',
        controller: function ($rootScope, $uibModal, $compile, $http, $q, $stateParams, $timeout, LuxUtils, T1C, API, _) {
            let controller = this;

            controller.$onInit = () => {
                controller.needPin = true;

                // check type of reader
                T1C.core.getReader($stateParams.readerId).then(res => {
                    controller.pinpad = res.data.pinpad;
                    if (!controller.pinpad) {
                        controller.pincode = { value: '' };
                        // // TODO remove
                        // controller.submitPin('1234');
                    }
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

            controller.downloadSummary = () => {
                let modal = $uibModal.open({
                    templateUrl: "views/readmycards/modals/summary-download.html",
                    resolve: {
                        readerId: () => {
                            return $stateParams.readerId
                        },
                        pinpad: () => {
                            return controller.pinpad;
                        },
                        util: () => {
                            return LuxUtils;
                        }
                    },
                    backdrop: 'static',
                    controller: 'SummaryDownloadCtrl',
                    size: 'lg'
                });

                modal.result.then(function () {

                }, function (err) {

                });
            };

            controller.toggleCerts = () => {
                controller.certData = !controller.certData;
            };

            function getAllData(pin) {
                controller.readingData = true;
                T1C.luxId.allData($stateParams.readerId, pin).then(res => {
                    console.log(res);
                    controller.pinStatus = 'valid';
                    controller.certStatus = 'checking';
                    controller.biometricData = res.data.biometric;
                    controller.picData = res.data.picture;

                    API.convertJPEG2000toJPEG(controller.picData.image).then(function (res) {
                        controller.pic = res.data.base64Pic;
                    });

                    if (!_.isEmpty(res.data.signature_image)) {
                        API.convertJPEG2000toJPEG(res.data.signature_image).then(sig => {
                            controller.signature = sig.data.base64Pic;
                        });
                    }

                    controller.authCert = res.data.authentication_certificate;
                    controller.nonRepCert = res.data.non_repudiation_certificate;
                    controller.rootCerts = res.data.root_certificates;

                    controller.readingData = false;

                    let validationReq1 = {
                        certificateChain: [
                            { order: 0, certificate: res.data.authentication_certificate },
                            { order: 1, certificate: res.data.root_certificates[1] },
                            { order: 2, certificate: res.data.root_certificates[0] },
                        ]
                    };
                    let validationReq2 = {
                        certificateChain: [
                            { order: 0, certificate: res.data.non_repudiation_certificate },
                            { order: 1, certificate: res.data.root_certificates[1] },
                            { order: 2, certificate: res.data.root_certificates[0] },
                        ]
                    };
                    let promises = [ T1C.ocv.validateCertificateChain(validationReq1), T1C.ocv.validateCertificateChain(validationReq2)];

                    $q.all(promises).then(results => {
                        let status = 'valid';
                        _.forEach(results, res => {
                            if (!(res.crlResponse.status && res.ocspResponse.status)) status = 'invalid';
                        });
                        controller.certStatus = status;
                    });
                });
            }
        }};

    const luxTrustVisualizer = {
        templateUrl: 'views/cards/lux/luxtrust/luxtrust-viz.html',
        bindings: {
            cardData: '<'
        },
        controller: function ($q, $stateParams, $timeout, $uibModal, T1C, _) {
            let controller = this;

            controller.$onInit = () => {
                console.log(controller.cardData);
                controller.pinStatus = 'idle';
                controller.certStatus = 'checking';

                let validationReq1 = {
                    certificateChain: [
                        { order: 0, certificate: controller.cardData.authentication_certificate },
                        { order: 1, certificate: controller.cardData.root_certificates[1] },
                        { order: 2, certificate: controller.cardData.root_certificates[0] },
                    ]
                };
                let validationReq2 = {
                    certificateChain: [
                        { order: 0, certificate: controller.cardData.signing_certificate },
                        { order: 1, certificate: controller.cardData.root_certificates[1] },
                        { order: 2, certificate: controller.cardData.root_certificates[0] },
                    ]
                };
                let promises = [ T1C.ocv.validateCertificateChain(validationReq1), T1C.ocv.validateCertificateChain(validationReq2)];

                $q.all(promises).then(results => {
                    console.log(results);
                    let status = 'valid';
                    _.forEach(results, res => {
                        if (!(res.crlResponse.status && res.ocspResponse.status)) status = 'invalid';
                    });
                    controller.certStatus = status;
                });
            };

            controller.checkPin = () => {
                let modal = $uibModal.open({
                    templateUrl: "views/readmycards/modals/check-pin.html",
                    resolve: {
                        readerId: () => {
                            return $stateParams.readerId
                        },
                        pinpad: () => {
                            return T1C.core.getReader($stateParams.readerId).then(function (res) {
                                return res.data.pinpad;
                            })
                        },
                        plugin: () => {
                            return T1C.luxtrust;
                        }
                    },
                    backdrop: 'static',
                    controller: 'ModalPinCheckCtrl'
                });

                modal.result.then(function () {
                    controller.pinStatus = 'valid';
                }, function (err) {
                    switch (err.code) {
                        case 103:
                            controller.pinStatus = '2remain';
                            break;
                        case 104:
                            controller.pinStatus = '1remain';
                            break;
                        case 105:
                            controller.pinStatus = 'blocked';
                            break;
                    }
                });
            };

            controller.toggleCerts = () => {
                controller.certData = !controller.certData;
            };
        }};

    const luxOtpVisualizer = {
        templateUrl: 'views/cards/lux/otp/luxotp-viz.html',
        bindings: {
            cardData: '<'
        },
        controller: function ($q, $stateParams, $timeout, $uibModal, T1C, _) {
            let controller = this;

            controller.$onInit = () => {

            };

            controller.checkPin = () => {
                let modal = $uibModal.open({
                    templateUrl: "views/readmycards/modals/check-pin.html",
                    resolve: {
                        readerId: () => {
                            return $stateParams.readerId
                        },
                        pinpad: () => {
                            return T1C.core.getReader($stateParams.readerId).then(function (res) {
                                return res.data.pinpad;
                            })
                        },
                        plugin: () => {
                            return T1C.luxotp;
                        }
                    },
                    backdrop: 'static',
                    controller: 'ModalPinCheckCtrl'
                });

                modal.result.then(function () {
                    controller.pinStatus = 'valid';
                }, function (err) {
                    switch (err.code) {
                        case 103:
                            controller.pinStatus = '2remain';
                            break;
                        case 104:
                            controller.pinStatus = '1remain';
                            break;
                        case 105:
                            controller.pinStatus = 'blocked';
                            break;
                    }
                });
            };

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

    const luxTrustPinCheckStatus = {
        templateUrl: 'views/cards/pin-check-status.html',
        bindings: {
            status: '<'
        },
        require: {
            parent: '^luxTrustVisualizer'
        },
        controller: function (_) {
            let controller = this;
            controller.$onChanges = () => {
                if (controller.status === 'idle') controller.infoText = 'Click to check PIN code';
                if (controller.status === 'valid') controller.infoText = 'PIN check OK.';
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

    const luxOtpCard = {
        templateUrl: 'views/cards/lux/otp/luxotp-card.html',
    };

    angular.module('app.cards.lux')
        .component('luxVisualizer', luxVisualizer)
        .component('luxOtpVisualizer', luxOtpVisualizer)
        .component('luxTrustVisualizer', luxTrustVisualizer)
        .component('luxCertificateStatus', luxCertificateStatus)
        .component('luxPinCheckStatus', luxPinCheckStatus)
        .component('luxTrustPinCheckStatus', luxTrustPinCheckStatus)
        .component('luxCard', luxCard)
        .component('luxOtpCard', luxOtpCard)
        .component('luxTrustCard', luxTrustCard);
})();
