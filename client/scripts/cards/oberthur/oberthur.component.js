(function () {
    'use strict';

    const oberthurVisualizer = {
        templateUrl: 'views/cards/oberthur/oberthur-viz.html',
        bindings: {
            cardData: '<',
        },
        controller: function ($rootScope, $uibModal, $compile, $http, $stateParams, $timeout, Core, OberthurUtils, T1C, Analytics) {
            let controller = this;

            controller.$onInit = () => {
                controller.certStatus = 'checking';
                controller.pinStatus = 'idle';

                controller.doCollapse = true;

                let validationReq = {
                    certificateChain: [
                        { order: 0, certificate: controller.cardData.authentication_certificate.base64 },
                        { order: 1, certificate: controller.cardData.issuer_certificate.base64 },
                        { order: 2, certificate: controller.cardData.root_certificate.base64 }
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
                            return false;
                        },
                        plugin: () => {
                            return {
                                verifyPin: function verifyPin(readerId, pin) {
                                    let data = {};
                                    if (pin) data.pin = pin;
                                    return Core.getConnector().oberthur(readerId).verifyPin(data);
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

            controller.sign = () => {
                let modal = $uibModal.open({
                    templateUrl: "views/readmycards/modals/xml-download.html",
                    resolve: {
                        readerId: () => {
                            return $stateParams.readerId
                        },
                        pinpad: () => {
                            // Oberthur cards can have very long pins, incompatible with pin card readers
                            return false;
                        },
                        needPinToGenerate: () => {
                            return false;
                        },
                        util: () => {
                            return OberthurUtils;
                        }
                    },
                    backdrop: 'static',
                    controller: 'XMLDownloadCtrl',
                    size: 'lg'
                });

                modal.result.then(function () {

                }, function (err) {

                });
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
           .component('oberthurCard', oberthurCard);
})();
