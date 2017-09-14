(function () {
    'use strict';

    const emvCard = {
        templateUrl: 'views/cards/emv/emv-card.html',
        bindings: {
            cardData: '<',
        },
        controller: function (_, EmvUtils) {
            let controller = this;

            controller.$onInit = () => {
                console.log(controller.cardData.application_data);
                controller.cardNumber =
                    EmvUtils.constructCardNumber(controller.cardData.application_data.pan);
                controller.expiration =
                    EmvUtils.constructExpirationDate(controller.cardData.application_data.expiration_date);
                // controller.cardData.application_data.name = "Maarten Somers"
            };
        }
    };

    const emvPinCheckStatus = {
        templateUrl: 'views/cards/pin-check-status.html',
        bindings: {
            status: '<'
        },
        require: {
            parent: '^emvVisualizer'
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

    const emvVisualizer = {
        templateUrl: 'views/cards/emv/emv-viz.html',
        bindings: {
            data: '<',
            readerId: '<'
        },
        controller: function ($uibModal, Connector) {
            let controller = this;

            controller.$onInit = () => {
                controller.pinStatus = 'idle';
            };

            controller.checkPin = () => {
                let modal = $uibModal.open({
                    templateUrl: "views/readmycards/modals/check-pin.html",
                    resolve: {
                        readerId: () => {
                            return controller.readerId
                        },
                        pinpad: () => {
                            return Connector.get().core().reader(controller.readerId).then(function (res) {
                                return res.data.pinpad;
                            })
                        }
                    },
                    backdrop: 'static',
                    controller: 'ModalEmvPinCheckCtrl'
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
                            Analytics.trackEvent('beid', 'pin-blocked', 'Card blocked; too many incorrect attempts');
                            controller.pinStatus = 'blocked';
                            break;
                    }
                });
            };
        }
    };

    angular.module('app.cards.emv')
           .component('emvCard', emvCard)
           .component('emvPinCheckStatus', emvPinCheckStatus)
           .component('emvVisualizer', emvVisualizer);
})();
