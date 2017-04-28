(function () {
    'use strict';

    const pivViz = {
        templateUrl: 'views/cards/piv/piv-viz.html',
        bindings: {
            cardData: '<'
        },
        controller: function ($uibModal, $stateParams, T1C, Analytics) {
            let controller = this;

            controller.$onInit = () => {
                controller.pinStatus = 'idle';
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

                    },
                    backdrop: 'static',
                    controller: 'PivPinCheckCtrl'
                });

                modal.result.then(function () {
                    Analytics.trackEvent('beid', 'pin-correct', 'Correct PIN entered');
                    controller.pinStatus = 'valid';
                }, function (err) {
                    Analytics.trackEvent('beid', 'pin-incorrect', 'Incorrect PIN entered');
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

    const pivCard = {
        templateUrl: 'views/cards/piv/piv-card.html',
        bindings: {
            cardData: '<'
        },
        controller: function() {
            let controller = this;

            controller.$onInit = () => {
                console.log(controller.cardData);
            }
        }
    };

    const pivPinCheckStatus = {
        templateUrl: 'views/cards/pin-check-status.html',
        bindings: {
            status: '<'
        },
        require: {
            parent: '^pivVisualizer'
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

    angular.module('app.cards.piv')
        .component('pivCard', pivCard)
        .component('pivPinCheckStatus', pivPinCheckStatus)
        .component('pivVisualizer', pivViz);

})();
