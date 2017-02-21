(function () {
    'use strict';

    const cardDateFormat = 'YYYY-MM-DD';

    const mobibBasic = {
        templateUrl: 'views/cards/mobib/variants/mobib-basic.html',
        bindings: {
            cardData: '<'
        },
        controller: function () {
            let controller = this;
            controller.$onInit = () => {
                console.log(controller.cardData);

                controller.formattedCardNumber = controller.cardData['card-issuing'].card_holder_id.substr(0,6) + ' / ' +
                    controller.cardData['card-issuing'].card_holder_id.substr(6,10) + ' ' +
                    controller.cardData['card-issuing'].card_holder_id.substr(16,2) + ' / ' +
                    controller.cardData['card-issuing'].card_holder_id.substr(18,1);
            }
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
            cardData: '<'
        },
        controller: function (_) {
            let controller = this;

            controller.$onInit = () => {
                const dateFormat = 'DD/MM/YYYY';
                controller.dob = moment(controller.cardData['card-issuing'].card_holder_birth_date, cardDateFormat).format(dateFormat);

                let names = _.split(controller.cardData['card-issuing'].card_holder_name, '|');
                controller.firstName = _.trim(names[0]);
                controller.lastName = _.trim(names[1]);

                controller.formattedCardNumber1 = controller.cardData['card-issuing'].card_holder_id.substr(0,6);
                controller.formattedCardNumber2 = controller.cardData['card-issuing'].card_holder_id.substr(6,13);
            }

        }
    };

    const mobibMivb = {
        templateUrl: 'views/cards/mobib/variants/mivb.html',
        bindings: {
            cardData: '<'
        },
        controller: function (_) {
            let controller = this;

            controller.$onInit = () => {
                const dateFormat = 'DD/MM/YYYY';
                controller.dob = moment(controller.cardData['card-issuing'].card_holder_birth_date, cardDateFormat).format(dateFormat);

                let names = _.split(controller.cardData['card-issuing'].card_holder_name, '|');
                controller.firstName = _.trim(names[0].toLowerCase());
                controller.lastName = _.trim(names[1].toLowerCase());

                controller.formattedCardNumber1 = controller.cardData['card-issuing'].card_holder_id.substr(0,6) + ' / ';
                controller.formattedCardNumber2 =
                    controller.cardData['card-issuing'].card_holder_id.substr(6,12) + ' / ' +
                    controller.cardData['card-issuing'].card_holder_id.substr(18,1);
            }

        }
    };

    const mobibNmbs = {
        templateUrl: 'views/cards/mobib/variants/nmbs.html',
        bindings: {
            cardData: '<',
            lang: '<'
        },
        controller: function (_) {
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

                const dateFormat = 'DD/MM/YYYY';

                controller.validFrom = moment(controller.cardData['card-issuing'].card_holder_start_date, cardDateFormat).format(dateFormat);
                controller.validUntil = moment(controller.cardData['card-issuing'].card_holder_end_date, cardDateFormat).format(dateFormat);
                controller.dob = moment(controller.cardData['card-issuing'].card_holder_birth_date, cardDateFormat).format(dateFormat);

                let names = _.split(controller.cardData['card-issuing'].card_holder_name, '|');
                controller.firstName = _.trim(names[0].toLowerCase());
                controller.lastName = _.trim(names[1]);
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
            cardData: '<'
        },
        controller: function (_) {
            let controller = this;

            controller.$onInit = () => {
                const dateFormat = 'DD/MM/YYYY';
                controller.dob = moment(controller.cardData['card-issuing'].card_holder_birth_date, cardDateFormat).format(dateFormat);
                controller.cardExpiration = moment(controller.cardData['card-issuing'].card_expiration_date, cardDateFormat).format('MM/YYYY');

                let names = _.split(controller.cardData['card-issuing'].card_holder_name, '|');
                controller.firstName = _.trim(names[0]);
                controller.lastName = _.trim(names[1]);

                controller.formattedCardNumber1 = controller.cardData['card-issuing'].card_holder_id.substr(0,6);
                controller.formattedCardNumber2 = controller.cardData['card-issuing'].card_holder_id.substr(6,4) + ' ' +
                    controller.cardData['card-issuing'].card_holder_id.substr(10,4) + ' ' +
                    controller.cardData['card-issuing'].card_holder_id.substr(14,4) + ' ' +
                    controller.cardData['card-issuing'].card_holder_id.substr(18,1);
            }

        }
    };

    const mobibViz = {
        templateUrl: 'views/cards/mobib/mobib-viz.html',
        bindings: {
            cardData: '<'
        },
        controller: function () {
            let controller = this;

            controller.$onInit = () => {
                controller.mobibFrom = moment().subtract(10, 'days');
                controller.mobibTo = moment().add(5, 'months');
            };

            controller.cardLang = () => {
                switch (controller.cardData['card-issuing'].language) {
                    case 0:
                    case 1:
                        return 'nl';
                    case 2:
                        return 'fr';
                    case 3:
                        return 'de';
                    case 4:
                        return 'en';
                        break;
                }
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
