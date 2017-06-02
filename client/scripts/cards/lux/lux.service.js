(function () {
    'use strict';

    angular.module('app.cards.lux')
           .service('LuxUtils', LuxUtils)
           .service('LuxTrustUtils', LuxTrustUtils);

    function LuxUtils($http, $q, T1C, API, CheckDigit, _) {
        this.constructMachineReadableStrings = constructMachineReadableStrings;
        this.formatBirthDate = formatBirthDate;
        this.formatValidity = formatValidity;
        this.generateXMLToSign = generateXMLToSign;
        this.generateSummaryToSign = generateSummaryToSign;
        this.signDocument = signDocumentWithPin;

        let rootCertificate1, rootCertificate2, authenticationCertificate, nonRepudiationCertificate, fullName;

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
            return T1C.luxId.allData(readerId, pin).then(function (results) {
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

        function signDocumentWithPin(documentId, readerId, hasPinpad, pin) {
            fullName = '';
            nonRepudiationCertificate = '';
            authenticationCertificate = '';
            rootCertificate1 = '';
            rootCertificate2 = '';

            let signing = $q.defer();

            prepareSign(readerId, pin)
                .then(function () { return $q.when(documentId); })
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
        function prepareSign(readerId, pin) {
            return T1C.luxId.allData(readerId, pin).then(function (result) {
                fullName = result.data.biometric.firstName + ' ' + result.data.biometric.lastName;
                rootCertificate1 = result.data.root_certificates[0];
                rootCertificate2 = result.data.root_certificates[1];
                authenticationCertificate = result.data.authentication_certificate;
                nonRepudiationCertificate = result.data.non_repudiation_certificate;
                return { readerId: readerId, pin: pin };
            });
        }

        // OK
        function signWithGcl(readerId, pin, hash, algorithm) {
            return T1C.luxId.signData(readerId, pin, algorithm, hash).then(function (res) {
                return res.data;
            }, function (err) {
                return $q.reject(err);
            });
        }

        // Needs proxy
        function dataToSign(documentId) {
            return $http.post('api/cards/lux/datatosign', {
                docId: documentId,
                signCertificate: nonRepudiationCertificate,
                certificates: [
                    nonRepudiationCertificate,
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
                    nonRepudiationCertificate,
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

    function LuxTrustUtils($http, $q, T1C, _) {
        this.generateSummaryToSign = generateSummaryToSign;
        this.generateXMLToSign = generateXMLToSign;
        this.signDocument = signDocumentWithPin;

        let rootCertificate1, rootCertificate2, authenticationCertificate, signingCertificate;

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

        function signDocumentWithPin(documentId, readerId, hasPinpad, pin) {
            signingCertificate = '';
            authenticationCertificate = '';
            rootCertificate1 = '';
            rootCertificate2 = '';

            let signing = $q.defer();

            prepareSign(readerId, pin)
                .then(function () { return $q.when(documentId); })
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
                    signingCertificate = '';
                    authenticationCertificate = '';
                    rootCertificate1 = '';
                    rootCertificate2 = '';
                    signing.resolve();
                });

            return signing.promise;
        }

        // OK
        function prepareSign(readerId, pin) {
            return T1C.luxtrust.allData(readerId, pin).then(function (result) {
                rootCertificate1 = result.data.root_certificates[0];
                rootCertificate2 = result.data.root_certificates[1];
                authenticationCertificate = result.data.authentication_certificate;
                signingCertificate = result.data.signing_certificate;
                return { readerId: readerId, pin: pin };
            });
        }

        // OK
        function signWithGcl(readerId, pin, hash, algorithm) {
            return T1C.luxtrust.signData(readerId, pin, algorithm, hash).then(function (res) {
                return res.data;
            }, function (err) {
                return $q.reject(err);
            });
        }

        // Needs proxy
        function dataToSign(documentId) {
            return $http.post('api/cards/lux/datatosign', {
                docId: documentId,
                signCertificate: authenticationCertificate,
                certificates: [
                    authenticationCertificate,
                    rootCertificate2,
                    rootCertificate1
                ],
                additionalInformation: {}
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
                signCertificate: authenticationCertificate,
                certificates: [
                    authenticationCertificate,
                    rootCertificate2,
                    rootCertificate1
                ],
                signedData: inputObj.signedData,
                additionalInformation: {}
            }).then(function (res) {
                return res.data;
            });
        }
    }


})();