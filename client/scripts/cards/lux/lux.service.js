(function () {
    'use strict';

    angular.module('app.cards.lux')
        .service('LuxUtils', LuxUtils);

    function LuxUtils($http, $q, T1C, API) {
        this.formatBirthDate = formatBirthDate;
        this.formatValidity = formatValidity;
        this.generateSummaryToSign = generateSummaryToSign;
        this.signDocumentWithPin = signDocumentWithPin;

        let rootCertificate1, rootCertificate2, authenticationCertificate, nonRepudiationCertificate, fullName;

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
            fullName = '';
            nonRepudiationCertificate = '';
            authenticationCertificate = '';
            rootCertificate1 = '';
            rootCertificate2 = '';

            let signing = $q.defer();

            getName(readerId, pin)
                .then(rootCert)
                .then(authCert)
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
                    fullName = '';
                    nonRepudiationCertificate = '';
                    authenticationCertificate = '';
                    rootCertificate1 = '';
                    rootCertificate2 = '';
                    signing.resolve();
                });

            return signing.promise;
        }

        // OK
        function getName(readerId, pin) {
            return T1C.luxeid.biometric(readerId, pin).then(function (result) {
                fullName = result.data.firstName + ' ' + result.data.lastName;
                return { readerId: readerId, pin: pin };
            });
        }

        // OK
        function signWithGcl(readerId, pin, hash, algorithm) {
            return T1C.luxeid.signData(readerId, pin, algorithm, hash).then(function (res) {
                return res.data;
            }, function (err) {
                return $q.reject(err);
            });
        }

        // OK
        function rootCert(input) {
            return T1C.luxeid.rootCert(input.readerId, input.pin).then(function (res) {
                rootCertificate1 = res.data[0];
                rootCertificate2 = res.data[1];
                return input;
            });
        }

        // OK
        function authCert(input) {
            return T1C.luxeid.authCert(input.readerId, input.pin).then(function (res) {
                authenticationCertificate = res.data;
                return input;
            });
        }

        // OK
        function nonRepudiationCert(input) {
            return T1C.luxeid.nonRepudiationCert(input.readerId, input.pin).then(function (res) {
                nonRepudiationCertificate = res.data;
                return input;
            });
        }

        // Needs proxy
        function dataToSign(documentId) {
            return $http.post('api/cards/lux/datatosign', {
                docId: documentId,
                signCertificate: nonRepudiationCertificate,
                certificates: [
                    authenticationCertificate,
                    rootCertificate2,
                    rootCertificate1
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
            return $http.post('api/cards/lux/sign', {
                docId: inputObj.documentId,
                signCertificate: nonRepudiationCertificate,
                certificates: [
                    authenticationCertificate,
                    rootCertificate2,
                    rootCertificate1
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