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

    const emvVisualizer = {
        templateUrl: 'views/cards/emv/emv-viz.html',
        bindings: {
            data: '<'
        },
        controller: function () {
            let controller = this;
        }
    };

    angular.module('app.cards.emv')
           .component('emvCard', emvCard)
           .component('emvVisualizer', emvVisualizer);
})();
