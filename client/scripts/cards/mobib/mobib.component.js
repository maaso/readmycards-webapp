(function () {
    'use strict';

    const mobibDeLijn = {
        templateUrl: 'views/cards/mobib/variants/delijn.html',
        bindings: {
            rnData: '<'
        },
        controller: function () {

        }
    };

    const mobibMivb = {
        templateUrl: 'views/cards/mobib/variants/mivb.html',
        bindings: {
            rnData: '<'
        },
        controller: function () {

        }
    };


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
        .component('mobibDeLijn', mobibDeLijn)
        .component('mobibMivb', mobibMivb)
        .component('mobibNmbs', mobibNmbs)
        .component('mobibTec', mobibTec)
        .component('mobibViz', mobibViz);
})();
