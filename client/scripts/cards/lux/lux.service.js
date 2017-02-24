(function () {
    'use strict';

    angular.module('app.cards.lux')
        .service('LuxUtils', LuxUtils);

    function LuxUtils($http, $q, T1C, API) {
        this.formatBirthDate = formatBirthDate;
        this.formatValidity = formatValidity;
        this.generateSummaryToSign = generateSummaryToSign;
        this.signDocumentWithPin = signDocumentWithPin;

        let rootCertificate, citizenCertificate, nonRepudiationCertificate, fullName;

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

        function generateSummaryToSign(readerId) {
            let promises = [
                T1C.luxId.biometric(readerId, pin),
                T1C.luxId.pic(readerId, pin)
            ];

            return $q.all(promises).then(function (results) {
                return API.convertJPEG2000toJPEG(results[1].data.image).then(converted => {
                    let data = prepareSummaryData(results[0].data, converted.data.base64Pic);
                    return $http.post('api/cards/lux/summarytosign', data).then(function (res) {
                        return res.data;
                    })
                });
            })
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
            return T1C.beid.getRnData(readerId).then(function (result) {
                fullName = result.data.first_names.split(" ", 1) + ' ' + result.data.name;
                return readerId;
            });
        }

        // OK
        function signWithGcl(readerId, pin, hash, algorithm) {
            return T1C.beid.signData(readerId, pin, algorithm, hash).then(function (res) {
                return res.data;
            }, function (err) {
                return $q.reject(err);
            });
        }

        // OK
        function rootCert(readerId) {
            return T1C.beid.getRootCert(readerId).then(function (res) {
                rootCertificate = res.data;
                return readerId;
            });
        }

        // OK
        function citizenCert(readerId) {
            return T1C.beid.getCitizenCert(readerId).then(function (res) {
                citizenCertificate = res.data;
                return readerId;
            });
        }

        // OK
        function nonRepudiationCert(readerId) {
            return T1C.beid.getNonRepCert(readerId).then(function (res) {
                nonRepudiationCertificate = res.data;
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

        function prepareSummaryData(biometric, picBase64) {
            return {
                rnData: biometric,
                pic: picBase64,
                formattedBirthDate: formatBirthDate(biometric.birthDate),
                validFrom: formatValidity(biometric.validityStartDate),
                validUntil: formatValidity(biometric.validityEndDate),
                printDate: moment().format('MMMM D, YYYY'),
                printedBy: '@@name v@@version'
            };
        }


    }

})();