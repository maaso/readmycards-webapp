(function () {
    'use strict';


    const mobibNmbs = {
        templateUrl: 'views/cards/mobib/variants/nmbs.html',
        bindings: {
            rnData: '<'
        },
        controller: function () {

        }
    };

    const mobibTec = {
        templateUrl: 'views/cards/mobib/variants/tec.html',
        bindings: {
            rnData: '<'
        },
        controller: function () {

        }
    };

    const mobibViz = {
        templateUrl: 'views/cards/mobib/mobib-viz.html',
        bindings: {
            rnData: '<'
        },
        controller: function () {

        }
    };

    angular.module('app.cards.mobib')
        .component('mobibNmbs', mobibNmbs)
        .component('mobibTec', mobibTec)
        .component('mobibViz', mobibViz);
})();
