(function () {
    'use strict';

    const mobibBasic = {
        templateUrl: 'views/cards/mobib/variants/mobib-basic.html',
        binding: {
            rnData: '>'
        }
    };

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
            rnData: '<',
            lang: '<'
        },
        controller: function () {
            let controller = this;

            controller.$onInit = () => {
                if (controller.lang === 'nl') {
                    controller.dobLabel = 'Geboortedatum :';
                    controller.cardNumberLabel = 'Nº kaart :';
                    controller.validityLabel = 'Geldigheid :';
                    controller.logoUrl = 'images/nmbs-mobility.jpg';
                }

                if (controller.lang === 'fr') {
                    controller.dobLabel = 'Date de naissance :';
                    controller.cardNumberLabel = 'Nº carte :';
                    controller.validityLabel = 'Validité :';
                    controller.logoUrl = 'images/sncb-mobility.jpg'
                }
            }

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
        .component('mobibBasic', mobibBasic)
        .component('mobibDeLijn', mobibDeLijn)
        .component('mobibMivb', mobibMivb)
        .component('mobibNmbs', mobibNmbs)
        .component('mobibTec', mobibTec)
        .component('mobibViz', mobibViz);
})();
