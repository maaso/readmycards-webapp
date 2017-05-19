(function () {
    'use strict';

    angular.module('app.cards.oberthur')
        .service('OberthurUtils', OberthurUtils);

    function OberthurUtils($http, $q, Core) {
        this.generateXMLToSign = generateXMLToSign;
        this.signDocument = signDocumentWithPin;

        let rootCertificate, authenticationCertificate, signingCertificate;

        function generateXMLToSign() {
            // TODO update urls
            return $http.post('api/cards/lux/xmltosign').then(res => {
                return res.data;
            })
        }

        function signDocumentWithPin(documentId, readerId, hasPinpad, pin) {
            signingCertificate = '';
            authenticationCertificate = '';
            rootCertificate = '';

            let signing = $q.defer();

            prepareSign(readerId, pin).then(function () {
                return $q.when(documentId);
            })
                                      .then(dataToSign)
                                      .then(function (dataToSign) {
                                          if (hasPinpad) return $q.when({ readerId: readerId, pin: undefined, dataToSign: dataToSign });
                                          else return $q.when({ readerId: readerId, pin: pin, dataToSign: dataToSign });
                                      })
                                      .then(signWithEid)
                                      .then(function (signedData) {
                                          return $q.when({ documentId: documentId, signedData: signedData.data });
                                      })
                                      .then(workflowSign)
                                      .then(function () {
                                          signingCertificate = '';
                                          authenticationCertificate = '';
                                          rootCertificate = '';
                                          signing.resolve();
                                      });

            return signing.promise;
        }

        // OK
        function prepareSign(readerId, pin) {
            return Core.getConnector().oberthur(readerId).allData([]).then(function (result) {
                rootCertificate = result.data.root_certificate;
                authenticationCertificate = result.data.authentication_certificate;
                signingCertificate = result.data.signing_certificate;
                return { readerId: readerId, pin: pin };
            });
        }

        // OK
        function signWithGcl(readerId, pin, hash, algorithm) {
            return Core.getConnector().oberthur(readerId).signData({ pin: pin, algorithm_reference: algorithm, data: hash});
        }

        // Needs proxy
        function dataToSign(documentId) {
            // TODO update urls!
            return $http.post('api/cards/lux/datatosign', {
                docId: documentId,
                signCertificate: signingCertificate,
                certificates: [
                    authenticationCertificate,
                    rootCertificate
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
                signCertificate: signingCertificate,
                certificates: [
                    authenticationCertificate,
                    rootCertificate
                ],
                signedData: inputObj.signedData,
                additionalInformation: {}
            }).then(function (res) {
                return res.data;
            });
        }
    }


})();