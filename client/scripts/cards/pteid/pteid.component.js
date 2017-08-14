(function () {
    'use strict';

    const pteidVisualizer = {
        templateUrl: 'views/cards/pteid/pteid-viz.html',
        bindings: {
            cardData: '<'
        },
        controller: function ($rootScope, $q, $uibModal, $compile, $http, $stateParams, $timeout, Core, T1C, API, PtUtils, Analytics, _) {
            let controller = this;

            controller.$onInit = () => {
                controller.certStatus = 'checking';
                controller.pinStatus = 'idle';

                // validate certificate chain
                Core.getConnector().pteid($stateParams.readerId).allCerts({ filter: [], parseCerts: false}).then(res => {
                    API.convertJPEG2000toJPEG(controller.cardData.photo).then(converted => {
                        controller.photo = converted.data.base64Pic
                    });

                    const validationReq = {
                        certificateChain: [
                            { order: 0, certificate: res.data.authentication_certificate.base64 },
                            { order: 1, certificate: res.data.root_authentication_certificate.base64 },
                            { order: 2, certificate: res.data.root_certificate.base64 },
                        ]
                    };
                    const validationReq2 = {
                        certificateChain: [
                            { order: 0, certificate: res.data.non_repudiation_certificate.base64 },
                            { order: 1, certificate: res.data.root_non_repudiation_certificate.base64 },
                            { order: 2, certificate: res.data.root_certificate.base64 },
                        ]
                    };
                    const promises = [ T1C.ocv.validateCertificateChain(validationReq), T1C.ocv.validateCertificateChain(validationReq2) ];

                    $q.all(promises).then(results => {
                        let status = 'valid';
                        _.forEach(results, res => {
                            if (!(res.crlResponse.status && res.ocspResponse.status)) status = 'invalid';
                        });
                        controller.certStatus = status;
                    });
                });
            };

            controller.checkPin = () => {
                // Analytics.trackEvent('button', 'click', 'PIN check clicked');
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
                            return PtUtils;
                        }
                    },
                    backdrop: 'static',
                    controller: 'ModalPinCheckCtrl'
                });

                modal.result.then(function () {
                    // Analytics.trackEvent('beid', 'pin-correct', 'Correct PIN entered');
                    controller.pinStatus = 'valid';
                }, function (err) {
                    // Analytics.trackEvent('beid', 'pin-incorrect', 'Incorrect PIN entered');
                    switch (err.code) {
                        case 103:
                            controller.pinStatus = '2remain';
                            break;
                        case 104:
                            controller.pinStatus = '1remain';
                            break;
                        case 105:
                            // Analytics.trackEvent('beid', 'pin-blocked', 'Card blocked; too many incorrect attempts');
                            controller.pinStatus = 'blocked';
                            break;
                        case 109:
                            // cancelled on reader
                            controller.pinStatus = 'cancelled';
                            break;
                    }
                });
            };

            controller.toggleCerts = () => {
                if (controller.certData) {
                    controller.certData = undefined;
                } else {
                    if (!controller.loadingCerts) {
                        controller.loadingCerts = true;
                        Core.getConnector().pteid($stateParams.readerId).allCerts({ filter: [], parseCerts: false}).then(res => {
                            controller.loadingCerts = false;
                            controller.certData = res.data;
                        });
                    }
                }
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
                        },
                        needPinToGenerate: () => {
                            return false;
                        },
                        util: () => {
                            return BeUtils;
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

            controller.trackCertificatesClick = () => {
                Analytics.trackEvent('button', 'click', 'Click on certificates feature');
            }
        }
    };


    const pteidCard = {
        templateUrl: 'views/cards/pteid/pteid-card.html',
        bindings: {
            idData: '<',
            photo: '<'
        },
        controller: function (_) {
            let controller = this;

            controller.$onInit = () => {
                let documentNumberComponents = _.split(controller.idData.document_number, " ");
                controller.docNumberPart1 = _.pullAt(documentNumberComponents, 0)[0];
                controller.docNumberPart2 = _.join(documentNumberComponents, " ");
            };
        }
    };

    angular.module('app.cards.beid')
           .component('pteidVisualizer', pteidVisualizer)
           .component('pteidCard', pteidCard);
})();
