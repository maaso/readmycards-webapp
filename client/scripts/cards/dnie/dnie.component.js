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

                const filter = ['authentication-certificate', 'signing-certificate', 'intermediate-certificate'];
                console.log(filter);
                T1C.dnie.allCerts($stateParams.readerId, filter).then(res => {
                    console.log(res.data);
                    let validationReq = {
                        certificateChain: [
                            { "order": 0, certificate: res.data.authentication_certificate },
                            { "order": 1, certificate: res.data.signing_certificate },
                            { "order": 2, certificate: res.data.intermediate_certificate },
                        ]
                    };
                    Analytics.trackEvent('dnie', 'cert-check', 'Start certificate check');
                    T1C.ocv.validateCertificateChain(validationReq).then(res => {
                        console.log(res);
                        if (res.crlResponse.status || res.ocspResponse.status) {
                            Analytics.trackEvent('dnie', 'cert-valid', 'Certificates are valid');
                            controller.certStatus = 'valid';
                        }
                        else {
                            Analytics.trackEvent('dnie', 'cert-invalid', 'Certificates are not valid');
                            controller.certStatus = 'invalid';
                        }
                    }, () => {
                        Analytics.trackEvent('dnie', 'cert-error', 'Error occurred while checking certificate validity');
                        controller.certStatus = 'error';
                    });
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
                        case 109:
                            controller.pinStatus = 'cancelled';
                            break;
                        default:
                            controller.pinStatus = 'error';
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
        .component('dnieCard', dnieCard);
})();
