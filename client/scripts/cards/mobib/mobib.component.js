(function () {
    'use strict';

    const mobibBasic = {
        templateUrl: 'views/cards/mobib/variants/mobib-basic.html',
        binding: {
            rnData: '>'
        }
    };

    const mobibContractTable = {
        templateUrl: 'views/cards/mobib/contract-table.html',
        bindings: {
            contracts: '<'
        },
        controller: function () {
            let controller = this;
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

    const mobibActiveStatus = {
        templateUrl: 'views/cards/mobib/status-card-active.html',
        bindings: {
            status: '<'
        },
        controller: function () {
            let controller = this;
            controller.$onChanges = () => {
                if (controller.status === 'active') controller.infoText = '<b>Active</b>';
                if (controller.status === 'inactive') controller.infoText = '<b>Not active</b>';
            };
        }
    };

    const mobibValidityStatus = {
        templateUrl: 'views/cards/mobib/status-card-valid.html',
        bindings: {
            from: '<',
            to: '<'
        },
        controller: function () {
            let controller = this;
            controller.$onChanges = () => {
                let fromMoment = moment(controller.from);
                let toMoment = moment(controller.to);
                let nowMoment = moment();
                if (fromMoment > nowMoment) {
                    // validity starts in future, show warning
                    controller.status = 'warning';
                    controller.infoText = 'Validity starts on ' + fromMoment.format('DD.MM.YYYY');
                } else if (toMoment < nowMoment) {
                    // validity ended in past, show error
                    controller.status = 'danger';
                    controller.infoText = '<b>Expired</b> on ' + toMoment.format('DD.MM.YYYY');
                } else {
                    // card is valid;
                    controller.status = 'success';
                    controller.infoText = '<b>Valid</b> until ' + toMoment.format('DD.MM.YYYY');
                }
            };
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
            let controller = this;

            controller.$onInit = () => {
                // controller.mobibFrom = moment().add(1, 'days');
                controller.mobibFrom = moment().subtract(10, 'days');
                // controller.mobibTo = moment().subtract(5, 'days');
                controller.mobibTo = moment().add(5, 'months');
            }
        }
    };

    angular.module('app.cards.mobib')
        .component('mobibBasic', mobibBasic)
        .component('mobibContractTable', mobibContractTable)
        .component('mobibDeLijn', mobibDeLijn)
        .component('mobibMivb', mobibMivb)
        .component('mobibNmbs', mobibNmbs)
        .component('mobibTec', mobibTec)
        .component('mobibViz', mobibViz)
        .component('mobibActiveStatus', mobibActiveStatus)
        .component('mobibValidityStatus', mobibValidityStatus);
})();
