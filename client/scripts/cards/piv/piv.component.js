(function () {
    'use strict';

    const pivViz = {
        templateUrl: 'views/cards/piv/piv-viz.html',
        bindings: {
            cardData: '<'
        },
        controller: function () {
            let controller = this;

            controller.$onInit = () => {

            };
        }
    };

    angular.module('app.cards.piv')
        .component('pivVisualizer', pivViz);
})();
