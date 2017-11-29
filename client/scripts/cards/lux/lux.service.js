(function () {
    'use strict';

    angular.module('app.cards.lux')
           .service('LuxUtils', LuxUtils)
           .service('LuxTrustUtils', LuxTrustUtils);

    function LuxUtils($http, $q, Connector, API, CheckDigit, _) {
        this.constructMachineReadableStrings = constructMachineReadableStrings;
        this.formatBirthDate = formatBirthDate;
        this.formatValidity = formatValidity;
        this.generateXMLToSign = generateXMLToSign;
        this.generateSummaryToSign = generateSummaryToSign;

        function constructMachineReadableStrings(biometricData) {
            let mrs = [];
            // First line
            let prefix = biometricData.documentType;
            let first = biometricData.issuingState + biometricData.documentNumber;
            first += CheckDigit.calc(first);
            first = pad(prefix + first);
            mrs.push(first.toUpperCase());

            // Second line
            // TODO fix second line!
            let second = biometricData.birthDate;
            second += CheckDigit.calc(second);
            second += biometricData.gender;
            second += biometricData.validityEndDate + CheckDigit.calc(biometricData.validityEndDate);
            second += biometricData.nationality;
            second = pad(second);
            mrs.push(second.toUpperCase());

            // Third line
            let third = _.join(_.split(biometricData.lastName, ' '), '<') + '<<';
            third += _.join(_.split(biometricData.firstName,' '),'<');
            third = pad(third);
            mrs.push(third.toUpperCase());
            return mrs;
        }

        function pad(string) {
            return _.padEnd(_.truncate(string, { length: 30, omission: '' }), 30, '<');
        }

        function formatBirthDate(dob) {
            // assume 1900
            let prefix = '19';
            let dobYear = parseInt(dob.substr(0,2));

            if (dobYear < parseInt(moment().format('YY'))) {
                // probably 2000
                prefix = '20';
            }
            return moment(prefix + dob, 'YYYYMMDD').format('DD.MM.YYYY');
        }

        function formatValidity(date) {
            return moment(date, 'YYMMDD').format('DD.MM.YYYY');
        }

        function generateXMLToSign(readerId) {
            return $http.post('api/cards/lux/xmltosign').then(res => {
                return res.data;
            })
        }

        function generateSummaryToSign(readerId, pin) {
            return Connector.plugin('luxeid', 'allData', [readerId, pin]).then(results => {
                let conversions = [];
                conversions.push(API.convertJPEG2000toJPEG(results.data.picture.image));

                if (!_.isEmpty(results.data.signature_image) && !_.isEmpty(results.data.signature_image.image)) {
                    conversions.push(API.convertJPEG2000toJPEG(results.data.signature_image.image));
                }

                return $q.all(conversions).then(converted => {
                    let data;
                    if (converted.length === 2) {
                        data = prepareSummaryData(results.data.biometric, converted[0].data.base64Pic, converted[1].data.base64Pic);
                    } else {
                        data = prepareSummaryData(results.data.biometric, converted[0].data.base64Pic, null);
                    }
                    return $http.post('api/cards/lux/summarytosign', data).then(res => {
                        return res.data;
                    })
                }, error => {
                    // TODO handle conversion failure
                });
            })
        }

        function prepareSummaryData(biometric, picBase64, sigBase64) {
            let mrs = constructMachineReadableStrings(biometric);
            return {
                biometric: biometric,
                pic: picBase64,
                signature: sigBase64,
                formattedBirthDate: formatBirthDate(biometric.birthDate),
                validFrom: formatValidity(biometric.validityStartDate),
                validUntil: formatValidity(biometric.validityEndDate),
                machineReadable1: mrs[0],
                machineReadable2: mrs[1],
                machineReadable3: mrs[2],
                printDate: moment().format('MMMM D, YYYY'),
                printedBy: '@@name v@@version'
            };
        }
    }

    function LuxTrustUtils($http, $q, _) {
        this.generateSummaryToSign = generateSummaryToSign;
        this.generateXMLToSign = generateXMLToSign;

        function generateSummaryToSign(readerId) {
            let data = {
                printDate: moment().format('MMMM D, YYYY'),
                printedBy: '@@name v@@version'
            };

            return $http.post('api/cards/luxtrust/summarytosign', data).then(res => {
                return res.data;
            });
        }

        function generateXMLToSign(readerId) {
            return $http.post('api/cards/lux/xmltosign').then(res => {
                return res.data;
            })
        }
    }


})();