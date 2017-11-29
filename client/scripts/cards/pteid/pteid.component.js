(function () {
    'use strict';

    const pteidVisualizer = {
        templateUrl: 'views/cards/pteid/pteid-viz.html',
        bindings: {
            cardData: '<',
            readerId: '<'
        },
        controller: function ($rootScope, $q, $uibModal, $compile, $http, $timeout, Connector, API, PtUtils, Analytics, _) {
            let controller = this;
            controller.addressData = addressData;
            controller.checkPin = checkPin;
            controller.toggleCerts = toggleCerts;
            controller.downloadSummary = downloadSummary;
            controller.trackCertificatesClick = trackCertificatesClick;

            controller.$onInit = () => {
                controller.certStatus = 'checking';
                controller.addressPinStatus = 'idle';
                controller.signPinStatus = 'idle';

                // validate certificate chain
                Connector.plugin('pteid', 'allCerts', [controller.readerId], [ { filter: [], parseCerts: false }]).then(res => {
                    API.convertJPEG2000toJPEG(controller.cardData.id.photo).then(converted => {
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
                    const promises = [ Connector.ocv('validateCertificateChain', [validationReq]), Connector.ocv('validateCertificateChain', [validationReq2]) ];

                    $q.all(promises).then(results => {
                        let status = 'valid';
                        _.forEach(results, res => {
                            if (!(res.crlResponse.status && res.ocspResponse.status)) status = 'invalid';
                        });
                        controller.certStatus = status;
                    });
                });
            };

            function addressData() {
                let modal = $uibModal.open({
                    templateUrl: "views/readmycards/modals/check-pin.html",
                    resolve: {
                        readerId: () => {
                            return controller.readerId
                        },
                        pinpad: () => {
                            return Connector.core('reader', [controller.readerId]).then(res => {
                                return res.data.pinpad;
                            })
                        }
                    },
                    backdrop: 'static',
                    controller: 'ModalPtAddressPinCheckCtrl'
                });

                modal.result.then(function (addressResponse) {
                    // Analytics.trackEvent('beid', 'pin-correct', 'Correct PIN entered');
                    controller.addressPinStatus = 'valid';
                    controller.addressInfo = addressResponse.data;
                }, function (err) {
                    // Analytics.trackEvent('beid', 'pin-incorrect', 'Incorrect PIN entered');
                    switch (err.code) {
                        case 103:
                            controller.addressPinStatus = '2remain';
                            break;
                        case 104:
                            controller.addressPinStatus = '1remain';
                            break;
                        case 105:
                            // Analytics.trackEvent('beid', 'pin-blocked', 'Card blocked; too many incorrect attempts');
                            controller.addressPinStatus = 'blocked';
                            break;
                        case 109:
                            // cancelled on reader
                            controller.addressPinStatus = 'cancelled';
                            break;
                    }
                });
            }

            function checkPin() {
                // Analytics.trackEvent('button', 'click', 'PIN check clicked');
                let modal = $uibModal.open({
                    templateUrl: "views/readmycards/modals/check-pin.html",
                    resolve: {
                        readerId: () => {
                            return controller.readerId
                        },
                        pinpad: () => {
                            return Connector.core('reader', [controller.readerId]).then(res => {
                                return res.data.pinpad;
                            })
                        }
                    },
                    backdrop: 'static',
                    controller: 'ModalPinCheckCtrl'
                });

                modal.result.then(function () {
                    // Analytics.trackEvent('beid', 'pin-correct', 'Correct PIN entered');
                    controller.signPinStatus = 'valid';
                }, function (err) {
                    // Analytics.trackEvent('beid', 'pin-incorrect', 'Incorrect PIN entered');
                    switch (err.code) {
                        case 103:
                            controller.signPinStatus = '2remain';
                            break;
                        case 104:
                            controller.signPinStatus = '1remain';
                            break;
                        case 105:
                            // Analytics.trackEvent('beid', 'pin-blocked', 'Card blocked; too many incorrect attempts');
                            controller.signPinStatus = 'blocked';
                            break;
                        case 109:
                            // cancelled on reader
                            controller.signPinStatus = 'cancelled';
                            break;
                    }
                });
            }

            function toggleCerts() {
                if (controller.certData) {
                    controller.certData = undefined;
                } else {
                    if (!controller.loadingCerts) {
                        controller.loadingCerts = true;
                        Connector.plugin('pteid', 'allCerts', [controller.readerId], [{ filter: [], parseCerts: false }]).then(res => {
                            controller.loadingCerts = false;
                            controller.certData = res.data;
                        });
                    }
                }
            }

            function downloadSummary() {
                // Analytics.trackEvent('button', 'click', 'Print button clicked');
                let modal = $uibModal.open({
                    templateUrl: "views/readmycards/modals/summary-download.html",
                    resolve: {
                        readerId: () => {
                            return controller.readerId
                        },
                        pinpad: () => {
                            return Connector.core('reader', [controller.readerId]).then(res => {
                                return res.data.pinpad;
                            })
                        },
                        needPinToGenerate: () => {
                            return false;
                        },
                        util: () => {
                            return PtUtils;
                        }
                    },
                    backdrop: 'static',
                    controller: 'SummaryDownloadCtrl',
                    size: 'lg'
                });

                modal.result.then(function () {

                }, function (err) {

                });
            }

            function trackCertificatesClick() {
                // Analytics.trackEvent('button', 'click', 'Click on certificates feature');
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

    angular.module('app.cards.pteid')
           .component('pteidVisualizer', pteidVisualizer)
           .component('pteidCard', pteidCard);
})();
