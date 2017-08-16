(function () {
    'use strict';

    angular.module('app.cards.beid')
        .service('BeUtils', BeUtils);

    function BeUtils($http, $q, CheckDigit, T1C, _) {
        this.constructMachineReadableStrings = constructMachineReadableStrings;
        this.formatCardNumber = formatCardNumber;
        this.formatRRNR = formatRRNR;
        this.generateSummaryToSign = generateSummaryToSign;


        function formatCardNumber(card) {
            return card.substr(0,3) + '-' + card.substr(3,7) + '-' + card.substr(10,2);
        }

        function formatRRNR(rrnrString) {
            return rrnrString.substr(0, 2) + '.' + rrnrString.substr(2, 2) + '.' + rrnrString.substr(4,2) + '-' + rrnrString.substr(6,3) + '.' + rrnrString.substr(9,2);
        }

        function generateSummaryToSign(readerId) {
            let promises = [
                T1C.beid.getRnData(readerId),
                T1C.beid.getAddress(readerId),
                T1C.beid.getPic(readerId)
            ];

            return $q.all(promises).then(function (results) {
                let data = prepareSummaryData(results[0].data, results[1].data, results[2].data);
                return $http.post('api/cards/be/summarytosign', data).then(function (res) {
                    return res.data;
                })
            })
        }

        function prepareSummaryData(rnData, addressData, picData) {
            let mrs = constructMachineReadableStrings(rnData);
            return {
                rnData: rnData,
                address: addressData,
                pic: picData,
                dob: moment('' + _.join(_.takeRight(rnData.birth_date, 4), '') + rnData.national_number.substr(2, 4), 'YYYYMMDD').format('MMMM D, YYYY'),
                formattedCardNumber: formatCardNumber(rnData.card_number),
                formattedRRNR: formatRRNR(rnData.national_number),
                machineReadable1: mrs[0],
                machineReadable2: mrs[1],
                machineReadable3: mrs[2],
                validFrom: moment(rnData.card_validity_date_begin, 'DD.MM.YYYY').format('MMMM D, YYYY'),
                validUntil: moment(rnData.card_validity_date_end, 'DD.MM.YYYY').format('MMMM D, YYYY'),
                printDate: moment().format('MMMM D, YYYY'),
                printedBy: '@@name v@@version'
            };
        }

        function constructMachineReadableStrings(rnData) {
            let mrs = [];
            // First line
            let prefix = 'ID';
            let first = 'BEL' + rnData.card_number.substr(0, 9) + '<' + rnData.card_number.substr(9);
            first += CheckDigit.calc(first);
            first = pad(prefix + first);
            mrs.push(first.toUpperCase());

            // Second line
            let second = rnData.national_number.substr(0, 6);
            second += CheckDigit.calc(second);
            second += rnData.sex;
            let validity = rnData.card_validity_date_end.substr(8,2) + rnData.card_validity_date_end.substr(3,2) + rnData.card_validity_date_end.substr(0,2);
            second += validity + CheckDigit.calc(validity);
            second += rnData.nationality.substr(0,3);
            second += rnData.national_number;
            let finalCheck = rnData.card_number.substr(0,10) + rnData.national_number.substr(0,6) + validity + rnData.national_number;
            second += CheckDigit.calc(finalCheck);
            second = pad(second);
            mrs.push(second.toUpperCase());

            // Third line
            let third = _.join(_.split(rnData.name,' '),'<') + '<<' + _.join(_.split(rnData.first_names,' '),'<') + '<' + _.join(_.split(rnData.third_name,' '),'<');
            third = pad(third);
            mrs.push(third.toUpperCase());
            return mrs;
        }

        function pad(string) {
            return _.padEnd(_.truncate(string, { length: 30, omission: '' }), 30, '<');
        }
    }


})();