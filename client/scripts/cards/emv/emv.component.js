(function () {
    'use strict';

    angular.module('app.cards.emv')
        .component('emvVisualizer', {
            templateUrl: 'views/cards/emv/emv-viz.html',
            bindings: {
                panData: '<'
            },
            controller: function () {
                let controller = this;
            }
        });
})();
