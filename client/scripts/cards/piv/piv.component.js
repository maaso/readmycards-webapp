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

    angular.module('app.cards.piv')
        .component('pivCard', pivCard)
        // .component('pivPinCheckStatus', pivPinCheckStatus)
        .component('pivVisualizer', pivViz);

})();
