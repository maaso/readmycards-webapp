(function () {
    'use strict';

    const emvCard = {
        templateUrl: 'views/cards/emv/emv-card.html',
        bindings: {
            cardData: '<',
        },
        controller: function (_) {
            let controller = this;

            controller.$onInit = () => {
                console.log(controller.cardData);
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
