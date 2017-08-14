(function () {
    'use strict';

    angular.module('app.cards.dnie')
        .service('DNIeUtils', DNIeUtils);

    function DNIeUtils($http, $q, CheckDigit, T1C, _) {
        this.constructMachineReadableStrings = constructMachineReadableStrings;
        this.formatCardNumber = formatCardNumber;
        this.formatRRNR = formatRRNR;
        this.generateSummaryToSign = generateSummaryToSign;
        this.signDocument = signDocumentWithPin;
        this.downloadDocument = downloadDocument;

        let rootCertificate, citizenCertificate, nonRepudiationCertificate, fullName;

        function formatCardNumber(card) {
            return card.substr(0,3) + '-' + card.substr(3,7) + '-' + card.substr(10,2);
        }

        function formatRRNR(rrnrString) {
            return rrnrString.substr(0, 2) + '.' + rrnrString.substr(2, 2) + '.' + rrnrString.substr(4,2) + '-' + rrnrString.substr(6,3) + '.' + rrnrString.substr(9,2);
        }

        function generateSummaryToSign(readerId) {
            let promises = [
                T1C.dnie.getRnData(readerId),
                T1C.dnie.getAddress(readerId),
                T1C.dnie.getPic(readerId)
            ];

            return $q.all(promises).then(function (results) {
                let data = prepareSummaryData(results[0].data, results[1].data, results[2].data);
                return $http.post('api/cards/be/summarytosign', data).then(function (res) {
                    return res.data;
                })
            })
        }

        function downloadDocument(documentName) {
            return $http.post('api/cards/be/download', { documentName: documentName }, { responseType: 'arraybuffer' });
        }

        function signDocumentWithPin(documentId, readerId, hasPinpad, pin) {
            citizenCertificate = '';
            fullName = '';
            nonRepudiationCertificate = '';
            rootCertificate = '';

            let signing = $q.defer();

            readRnData(readerId)
                .then(rootCert)
                .then(citizenCert)
                .then(nonRepudiationCert)
                .then(function () {
                    return $q.when(documentId);
                })
                .then(dataToSign)
                .then(function (dataToSign) {
                    if (hasPinpad) return $q.when({ readerId: readerId, pin: undefined, dataToSign: dataToSign });
                    else return $q.when({ readerId: readerId, pin: pin, dataToSign: dataToSign });
                })
                .then(signWithEid)
                .then(function (signedData) {
                    return $q.when({ documentId: documentId, signedData: signedData });
                })
                .then(workflowSign)
                .then(function () {
                    citizenCertificate = '';
                    fullName = '';
                    nonRepudiationCertificate = '';
                    rootCertificate = '';
                    signing.resolve();
                });

            return signing.promise;
        }

        // OK
        function readRnData(readerId) {
            return T1C.dnie.getRnData(readerId).then(function (result) {
                fullName = result.data.first_names.split(" ", 1) + ' ' + result.data.name;
                return readerId;
            });
        }

        // OK
        function signWithGcl(readerId, pin, hash, algorithm) {
            return T1C.dnie.signData(readerId, pin, algorithm, hash).then(function (res) {
                return res.data;
            }, function (err) {
                return $q.reject(err);
            });
        }

        // OK
        function rootCert(readerId) {
            return T1C.dnie.getRootCert(readerId).then(function (res) {
                rootCertificate = res.data.base64;
                return readerId;
            });
        }

        // OK
        function citizenCert(readerId) {
            return T1C.dnie.getCitizenCert(readerId).then(function (res) {
                citizenCertificate = res.data.base64;
                return readerId;
            });
        }

        // OK
        function nonRepudiationCert(readerId) {
            return T1C.dnie.getNonRepCert(readerId).then(function (res) {
                nonRepudiationCertificate = res.data.base64;
                return readerId;
            });
        }

        // Needs proxy
        function dataToSign(documentId) {
            return $http.post('api/cards/be/datatosign', {
                docId: documentId,
                signCertificate: nonRepudiationCertificate,
                certificates: [
                    nonRepudiationCertificate,
                    citizenCertificate,
                    rootCertificate
                ],
                additionalInformation: {
                    name: fullName
                }
            }).then(function (res) {
                return res.data;
            })
        }

        // OK
        function signWithEid (inputObj) {
            let readerId = inputObj.readerId;
            let pin = inputObj.pin;
            let dataToSign = inputObj.dataToSign;
            return $q.when(signWithGcl(readerId, pin, dataToSign.bytes, dataToSign.digestAlgorithm));
        }

        // Needs proxy
        function workflowSign(inputObj) {
            return $http.post('api/cards/be/sign', {
                docId: inputObj.documentId,
                signCertificate: nonRepudiationCertificate,
                certificates: [
                    nonRepudiationCertificate,
                    citizenCertificate,
                    rootCertificate
                ],
                signedData: inputObj.signedData,
                additionalInformation: {
                    name: fullName
                }
            }).then(function (res) {
                return res.data;
            });
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
            let first = 'ESP' + rnData.idesp;
            first += CheckDigit.calc(rnData.idesp);
            first += rnData.number;
            first = pad(prefix + first);
            mrs.push(first.toUpperCase());

            // Second line
            let second = "000000000000000ESP";
            second += CheckDigit.calc(second);
            second = pad(second);
            mrs.push(second.toUpperCase());

            // Third line
            let third = rnData.firstLastName+"<"+rnData.secondLastName+"<<"+rnData.firstName.replace(" ","<");
            third = pad(third);
            mrs.push(third.toUpperCase());
            return mrs;
        }

        function pad(string) {
            return _.padEnd(_.truncate(string, { length: 30, omission: '' }), 30, '<');
        }
    }

})();