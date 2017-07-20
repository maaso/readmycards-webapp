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
        controller: function (MobibUtils, _) {
            let controller = this;

            controller.$onInit = () => {

            };
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
                controller.validUntil = moment(controller.cardData['card-issuing'].card_expiration_date, cardDateFormat).format(dateFormat);
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
            cardData: '<',
            isBasic: '<'
        },
        controller: function (MobibUtils, _) {
            let controller = this;
            // validityDuration '0' is per 15 minutes, remember to multiply the value with 15!
            const validityDurations = { '0': 'minutes', '1': 'hours', '2': 'days', '3': 'months' };
            const dateFormat = 'DD.MM.YYYY';

            controller.$onInit = () => {
                console.log(controller.cardData);
                if (controller.cardData.active) controller.cardStatus = 'active';
                else controller.cardStatus = 'inactive';

                controller.mobibFrom = moment(controller.cardData['card-issuing'].card_holder_start_date, cardDateFormat);
                controller.mobibTo = moment(controller.cardData['card-issuing'].card_expiration_date, cardDateFormat);

                _.forEach(controller.cardData.contracts, contract => {
                    if (_.has(contract, 'operator_map')) {
                        let validOperators = dec2bin(contract.operator_map);
                        contract.validNMBS = (!_.isEmpty(validOperators[0]) && validOperators[0] === '1');
                        contract.validMIVB = (!_.isEmpty(validOperators[1]) && validOperators[1] === '1');
                        contract.validDeLijn = (!_.isEmpty(validOperators[2]) && validOperators[2] === '1');
                        contract.validTEC = (!_.isEmpty(validOperators[3]) && validOperators[3] === '1');
                    } else {
                        contract.validNMBS = contract.provider === 1;
                        contract.validMIVB = contract.provider === 2;
                        contract.validMIVB = contract.provider === 2;
                        contract.validDeLijn = contract.provider === 3;
                        contract.validTEC = contract.provider === 4;
                    }

                    // Determine contract name
                    contract.name = MobibUtils.getContractName(contract.type_id);

                    // calculated by taking validitystart and adding the validity duration
                    let startDate = moment(contract.validity_start_date, cardDateFormat);
                    if (contract.validity_duration && contract.validity_duration.value > 0) {
                        let endDate = moment(contract.validity_start_date, cardDateFormat);
                        if (contract.validity_duration.unit === 0) endDate.add(contract.validity_duration.value * 15, validityDurations[contract.validity_duration.unit]);
                        else endDate.add(contract.validity_duration.value, validityDurations[contract.validity_duration.unit]);
                        contract.validityEnd = endDate.format(dateFormat);
                    }

                    contract.validityStart = startDate.format(dateFormat);

                    if (_.has(contract, 'tariff.counter.type') && contract.tariff.counter.type != 0) {
                        // Determine further processing based on counter type
                        switch (contract.tariff.counter.type) {
                            case 0:
                                break;
                            case 1:
                                // journeys remaining + last validation
                                contract.countJourneys = true;
                                contract.journeys = contract.tariff.counter.journeys;
                                contract.lastValidation = moment(contact.tariff.counter.date, cardDateFormat).format(dateFormat);
                                break;
                            case 2:
                                // journeys remaining
                                contract.countJourneys = true;
                                contract.journeys = contract.tariff.counter.journeys;
                                break;
                            case 3:
                                // journeys remaining (reversed)
                                contract.countJourneys = true;
                                contract.journeys = contract.tariff.counter.journeys;
                                break;
                            case 4:
                                // start time
                                // todo figure out how to handle
                                contract.validityStart = moment(contact.tariff.counter.time, cardDateFormat).format(dateFormat);
                                break;
                            case 5:
                                // days remaining + last validation date
                                contract.lastValidation = moment(contact.tariff.counter.date, cardDateFormat).format(dateFormat);
                                contract.validityEnd = angular.copy(startDate).add(contract.tariff.counter.days, 'days').format(dateFormat);
                                break;
                            case 6:
                                // start time + remaining journeys
                                contract.countJourneys = true;
                                contract.validityStart = moment(contact.tariff.counter.time, cardDateFormat).format(dateFormat);
                                break;
                            case 7:
                                // start time + remaining days
                                contract.validityStart = moment(contact.tariff.counter.time, cardDateFormat).format(dateFormat);
                                contract.validityEnd = moment(contact.tariff.counter.time, cardDateFormat).add(contract.tariff.counter.days, 'days').format(dateFormat);
                                break;
                        }
                    }

                    // contract.active = moment() < endDate;
                    if (contract.countJourneys) {
                        contract.active = contract.journeys > 0;
                    }
                });

                function dec2bin(n) {
                    return _.reverse(n.toString(2).split(''));
                }
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
