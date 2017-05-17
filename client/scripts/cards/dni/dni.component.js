(function () {
    'use strict';

    const dniVisualizer = {
        templateUrl: 'views/cards/dni/dni-viz.html',
        bindings: {
            cardData: '<',
        },
        controller: function ($rootScope, $uibModal, $compile, $http, $stateParams, $timeout, T1C, Analytics) {
            let controller = this;
            //
            // controller.$onInit = () => {
            //     controller.certStatus = 'checking';
            //     controller.pinStatus = 'idle';
            //     const filter = ['authentication-certificate', 'citizen-certificate', 'root-certificate'];
            //     T1C.beid.getAllCerts($stateParams.readerId, filter).then(res => {
            //         let validationReq = {
            //             certificateChain: [
            //                 { order: 0, certificate: res.data.authentication_certificate },
            //                 { order: 1, certificate: res.data.citizen_certificate },
            //                 { order: 2, certificate: res.data.root_certificate },
            //             ]
            //         };
            //         Analytics.trackEvent('beid', 'cert-check', 'Start certificate check');
            //         T1C.ocv.validateCertificateChain(validationReq).then(res => {
            //             if (res.crlResponse.status && res.ocspResponse.status) {
            //                 Analytics.trackEvent('beid', 'cert-valid', 'Certificates are valid');
            //                 controller.certStatus = 'valid';
            //             }
            //             else {
            //                 Analytics.trackEvent('beid', 'cert-invalid', 'Certificates are not valid');
            //                 controller.certStatus = 'invalid';
            //             }
            //         }, () => {
            //             Analytics.trackEvent('beid', 'cert-error', 'Error occurred while checking certificate validity');
            //             controller.certStatus = 'error';
            //         });
            //     });
            // };
            //
            // controller.checkPin = () => {
            //     Analytics.trackEvent('button', 'click', 'PIN check clicked');
            //     let modal = $uibModal.open({
            //         templateUrl: "views/readmycards/modals/check-pin.html",
            //         resolve: {
            //             readerId: () => {
            //                 return $stateParams.readerId
            //             },
            //             pinpad: () => {
            //                 return T1C.core.getReader($stateParams.readerId).then(function (res) {
            //                     return res.data.pinpad;
            //                 })
            //             }
            //         },
            //         backdrop: 'static',
            //         controller: 'ModalPinCheckCtrl'
            //     });
            //
            //     modal.result.then(function () {
            //         Analytics.trackEvent('beid', 'pin-correct', 'Correct PIN entered');
            //         controller.pinStatus = 'valid';
            //     }, function (err) {
            //         Analytics.trackEvent('beid', 'pin-incorrect', 'Incorrect PIN entered');
            //         switch (err.code) {
            //             case 103:
            //                 controller.pinStatus = '2remain';
            //                 break;
            //             case 104:
            //                 controller.pinStatus = '1remain';
            //                 break;
            //             case 105:
            //                 Analytics.trackEvent('beid', 'pin-blocked', 'Card blocked; too many incorrect attempts');
            //                 controller.pinStatus = 'blocked';
            //                 break;
            //         }
            //     });
            // };
            //
            // controller.toggleCerts = () => {
            //     Analytics.trackEvent('button', 'click', 'Extended info clicked');
            //     if (controller.certData) {
            //         controller.certData = undefined;
            //     } else {
            //         if (!controller.loadingCerts) {
            //             controller.loadingCerts = true;
            //             T1C.beid.getAllCerts($stateParams.readerId).then(res => {
            //                 controller.loadingCerts = false;
            //                 controller.certData = res.data;
            //             });
            //         }
            //     }
            // };
            //
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
            //             }
            //         },
            //         backdrop: 'static',
            //         controller: 'BeIDSummaryDownloadCtrl',
            //         size: 'lg'
            //     });
            //
            //     modal.result.then(function () {
            //
            //     }, function (err) {
            //
            //     });
            // };
            //
            // controller.trackCertificatesClick = () => {
            //     Analytics.trackEvent('button', 'click', 'Click on certificates feature');
            // }
        }};

    // const dniCertificateStatus = {
    //     templateUrl: 'views/cards/cert-status.html',
    //     bindings: {
    //         status: '<'
    //     },
    //     controller: function () {
    //         let controller = this;
    //         controller.$onChanges = () => {
    //             if (controller.status === 'checking') controller.infoText = 'Validating card certificates...';
    //             if (controller.status === 'valid') controller.infoText = 'All certificates OK. Card is valid.';
    //             if (controller.status === 'invalid') controller.infoText = 'Certificate check failed. Card invalid.';
    //             if (controller.status === 'error') controller.infoText = 'An error occurred during the validation process. Please try again later.';
    //         };
    //     }
    // };
    //
    // const dniPinCheckStatus = {
    //     templateUrl: 'views/cards/pin-check-status.html',
    //     bindings: {
    //         status: '<'
    //     },
    //     require: {
    //         parent: '^beidVisualizer'
    //     },
    //     controller: function (_) {
    //         let controller = this;
    //         controller.$onChanges = () => {
    //             if (controller.status === 'idle') controller.infoText = 'Click to check PIN code';
    //             if (controller.status === 'valid') controller.infoText = 'PIN check OK.';
    //             if (controller.status === '2remain') controller.infoText = 'Wrong PIN entered; 2 tries remaining.';
    //             if (controller.status === '1remain') controller.infoText = 'Wrong PIN entered; 1 try remaining!';
    //             if (controller.status === 'blocked') controller.infoText = '3 invalid PINs entered. Card blocked.';
    //             if (controller.status === 'error') controller.infoText = 'An error occurred during the validation process. Please try again later.';
    //         };
    //
    //         controller.checkPin = () => {
    //             if (!_.includes(['valid', 'blocked'], controller.status)) controller.parent.checkPin();
    //         }
    //     }
    // };

    const dniCard = {
        templateUrl: 'views/cards/dni/dni-card.html',
        bindings: {
            cardData: '<'
        },
        controller: function () {
            let controller = this;

            controller.$onInit = () => {
                // controller.machineReadable1 = mrs[0];
                controller.machineReadable1 = "IDESPAAA1000014<00000023T<<<<<";
                // controller.machineReadable2 = mrs[1];
                controller.machineReadable2 = "7212018F1101236ESP<<<<<<<<<<<8";
                // controller.machineReadable3 = mrs[2];
                controller.machineReadable3 = "ESPANOLA<ESPANOLA<NOMBRE<<<<<<";
            };
        }
    };

    angular.module('app.cards.dni')
        .component('dniVisualizer', dniVisualizer)
        // .component('dniCertificateStatus', dniCertificateStatus)
        // .component('dniPinCheckStatus', dniPinCheckStatus)
        .component('dniCard', dniCard);
})();
