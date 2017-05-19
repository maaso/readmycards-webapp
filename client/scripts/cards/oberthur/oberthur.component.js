(function () {
    'use strict';

    const oberthurVisualizer = {
        templateUrl: 'views/cards/oberthur/oberthur-viz.html',
        bindings: {
            cardData: '<',
        },
        controller: function ($rootScope, $uibModal, $compile, $http, $stateParams, $timeout, BeUtils, T1C, Analytics) {
            let controller = this;

            controller.$onInit = () => {
                controller.certStatus = 'checking';
                controller.pinStatus = 'idle';

                controller.doCollapse = true;

                let validationReq = {
                    certificateChain: [
                        { order: 0, certificate: controller.cardData.authentication_certificate },
                        { order: 1, certificate: controller.cardData.issuer_certificate },
                        { order: 2, certificate: controller.cardData.root_certificate }
                    ]
                };
                Analytics.trackEvent('oberthur', 'cert-check', 'Start certificate check');
                T1C.ocv.validateCertificateChain(validationReq).then(res => {
                    if (res.crlResponse.status && res.ocspResponse.status) {
                        Analytics.trackEvent('oberthur', 'cert-valid', 'Certificates are valid');
                        controller.certStatus = 'valid';
                    }
                    else {
                        Analytics.trackEvent('oberthur', 'cert-invalid', 'Certificates are not valid');
                        controller.certStatus = 'invalid';
                    }
                }, () => {
                    Analytics.trackEvent('oberthur', 'cert-error', 'Error occurred while checking certificate validity');
                    controller.certStatus = 'error';
                });
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
                            return {
                                verifyPin: function verifyPin(readerId, pin) {
                                    let data = {};
                                    if (pin) data.pin = pin;
                                    return T1C.getConnector().oberthur(readerId).verifyPin(data);
                                }
                            };
                        }
                    },
                    backdrop: 'static',
                    controller: 'ModalPinCheckCtrl'
                });

                modal.result.then(function () {
                    Analytics.trackEvent('oberthur', 'pin-correct', 'Correct PIN entered');
                    controller.pinStatus = 'valid';
                }, function (err) {
                    Analytics.trackEvent('oberthur', 'pin-incorrect', 'Incorrect PIN entered');
                    switch (err.code) {
                        case 103:
                            controller.pinStatus = '2remain';
                            break;
                        case 104:
                            controller.pinStatus = '1remain';
                            break;
                        case 105:
                            Analytics.trackEvent('oberthur', 'pin-blocked', 'Card blocked; too many incorrect attempts');
                            controller.pinStatus = 'blocked';
                            break;
                    }
                });
            };

            controller.toggleCerts = () => {
                Analytics.trackEvent('button', 'click', 'Extended info clicked');
                controller.doCollapse = !controller.doCollapse;
            };

            // controller.downloadSummary = () => {
            //     Analytics.trackEvent('button', 'click', 'Print button clicked');
            //     let modal = $uibModal.open({
            //         templateUrl: "views/readmycards/modals/summary-download.html",
            //         resolve: {
            //             readerId: () => {
            //                 return $stateParams.readerId
            //             },
            //             pinpad: () => {
            //                 return T1C.core.getReader($stateParams.readerId).then(function (res) {
            //                     return res.data.pinpad;
            //                 })
            //             },
            //             needPinToGenerate: () => {
            //                 return false;
            //             },
            //             util: () => {
            //                 return BeUtils;
            //             }
            //         },
            //         backdrop: 'static',
            //         controller: 'SummaryDownloadCtrl',
            //         size: 'lg'
            //     });
            //
            //     modal.result.then(function () {
            //
            //     }, function (err) {
            //
            //     });
            // };

            controller.trackCertificatesClick = () => {
                Analytics.trackEvent('button', 'click', 'Click on certificates feature');
            }
        }};

    const oberthurCertificateStatus = {
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

    const oberthurPinCheckStatus = {
        templateUrl: 'views/cards/pin-check-status.html',
        bindings: {
            status: '<'
        },
        require: {
            parent: '^oberthurVisualizer'
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

    const oberthurCard = {
        templateUrl: 'views/cards/oberthur/oberthur-card.html',
        bindings: {},
        controller: function () {
            let controller = this;

            controller.$onInit = () => {

            };
        }
    };

    angular.module('app.cards.oberthur')
           .component('oberthurVisualizer', oberthurVisualizer)
           .component('oberthurCertificateStatus', oberthurCertificateStatus)
           .component('oberthurPinCheckStatus', oberthurPinCheckStatus)
           .component('oberthurCard', oberthurCard);
})();
