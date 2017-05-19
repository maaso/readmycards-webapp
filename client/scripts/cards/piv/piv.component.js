(function () {
    'use strict';

    const pivViz = {
        templateUrl: 'views/cards/piv/piv-viz.html',
        bindings: {
            cardData: '<'
        },
        controller: function ($uibModal, $stateParams, T1C) {
            let controller = this;

            controller.$onInit = () => {
                controller.pinStatus = 'idle';
                controller.needPin = true;

                // check type of reader
                T1C.core.getReader($stateParams.readerId).then(res => {
                    controller.pinpad = res.data.pinpad;
                    if (!controller.pinpad) {
                        controller.pincode = { value: '' };
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

            function getAllData(pin) {
                controller.readingData = true;
                T1C.piv.printedInformation($stateParams.readerId, pin).then(res => {
                    console.log(res);
                    controller.cardData = res.data;
                    controller.pinStatus = 'valid';
                    controller.readingData = false;
                });
            }

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
                // console.log(controller.cardData);
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
                if (controller.status === '4remain') controller.infoText = 'Wrong PIN entered; 4 tries remaining.';
                if (controller.status === '3remain') controller.infoText = 'Wrong PIN entered; 3 tries remaining.';
                if (controller.status === '2remain') controller.infoText = 'Wrong PIN entered; 2 tries remaining.';
                if (controller.status === '1remain') controller.infoText = 'Wrong PIN entered; 1 try remaining!';
                if (controller.status === 'blocked') controller.infoText = 'Too many invalid PINs entered. Card blocked.';
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
