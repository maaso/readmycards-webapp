(function () {
    'use strict';

    const dnieVisualizer = {
        templateUrl: 'views/cards/dnie/dnie-viz.html',
        bindings: {
            cardData: '<',
        },
        controller: function ($rootScope, $uibModal, $compile, $http, $stateParams, $timeout, DNIeUtils, T1C, Analytics) {
            let controller = this;
            //
            controller.$onInit = () => {
                controller.certStatus = 'checking';
                controller.pinStatus = 'idle';
                controller.doCollapse = true;

                const filter = ['authentication-certificate', 'citizen-certificate', 'intermediate-certificate'];
                // T1C.dnie.allCerts($stateParams.readerId, filter).then(res => {
                //     let validationReq = {
                //         certificateChain: [
                //             { order: 0, certificate: res.data.authentication_certificate },
                //             { order: 1, certificate: res.data.citizen_certificate },
                //             { order: 2, certificate: res.data.intermediate_certificate },
                //         ]
                //     };
                //     Analytics.trackEvent('dnie', 'cert-check', 'Start certificate check');
                //     T1C.ocv.validateCertificateChain(validationReq).then(res => {
                //         if (res.crlResponse.status && res.ocspResponse.status) {
                //             Analytics.trackEvent('dnie', 'cert-valid', 'Certificates are valid');
                //             controller.certStatus = 'valid';
                //         }
                //         else {
                //             Analytics.trackEvent('dnie', 'cert-invalid', 'Certificates are not valid');
                //             controller.certStatus = 'invalid';
                //         }
                //     }, () => {
                //         Analytics.trackEvent('dnie', 'cert-error', 'Error occurred while checking certificate validity');
                //         controller.certStatus = 'error';
                //     });
                // });
            };

            controller.checkPin = () => {
                Analytics.trackEvent('button', 'click', 'PIN check clicked');
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
                            return T1C.dnie;
                        }
                    },
                    backdrop: 'static',
                    controller: 'ModalPinCheckCtrl'
                });

                modal.result.then(function () {
                    Analytics.trackEvent('dnie', 'pin-correct', 'Correct PIN entered');
                    controller.pinStatus = 'valid';
                }, function (err) {
                    Analytics.trackEvent('dnie', 'pin-incorrect', 'Incorrect PIN entered');
                    switch (err.code) {
                        case 103:
                            controller.pinStatus = '2remain';
                            break;
                        case 104:
                            controller.pinStatus = '1remain';
                            break;
                        case 105:
                            Analytics.trackEvent('dnie', 'pin-blocked', 'Card blocked; too many incorrect attempts');
                            controller.pinStatus = 'blocked';
                            break;
                    }
                });
            };

            controller.toggleCerts = () => {
                Analytics.trackEvent('button', 'click', 'Extended info clicked');
                controller.doCollapse = !controller.doCollapse;
            };

            controller.downloadSummary = () => {
                Analytics.trackEvent('button', 'click', 'Print button clicked');
                let modal = $uibModal.open({
                    templateUrl: "views/readmycards/modals/summary-download.html",
                    resolve: {
                        readerId: () => {
                            return $stateParams.readerId
                        },
                        pinpad: () => {
                            return T1C.core.getReader($stateParams.readerId).then(function (res) {
                                return res.data.pinpad;
                            })
                        }
                    },
                    backdrop: 'static',
                    controller: 'BeIDSummaryDownloadCtrl',
                    size: 'lg'
                });

                modal.result.then(function () {

                }, function (err) {

                });
            };

            controller.trackCertificatesClick = () => {
                Analytics.trackEvent('button', 'click', 'Click on certificates feature');
            }
        }};

    const dnieCertificateStatus = {
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

    const dniePinCheckStatus = {
        templateUrl: 'views/cards/pin-check-status.html',
        bindings: {
            status: '<'
        },
        require: {
            parent: '^dnieVisualizer'
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

    const dnieCard = {
        templateUrl: 'views/cards/dnie/dnie-card.html',
        bindings: {
            cardData: '<'
        },
        controller: function (DNIeUtils) {
            let controller = this;

            controller.$onInit = () => {
                let mrs = DNIeUtils.constructMachineReadableStrings(controller.cardData.info);

                controller.machineReadable1 = mrs[0];
                controller.machineReadable2 = mrs[1];
                controller.machineReadable3 = mrs[2];
            };
        }
    };

    angular.module('app.cards.dnie')
        .component('dnieVisualizer', dnieVisualizer)
        .component('dnieCertificateStatus', dnieCertificateStatus)
        .component('dniePinCheckStatus', dniePinCheckStatus)
        .component('dnieCard', dnieCard);
})();
