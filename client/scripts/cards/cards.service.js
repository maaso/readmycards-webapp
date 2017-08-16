(function () {
    'use strict';

    angular.module('app.cards')
           .service('CardService', CardService);


    function CardService($q, $http, Connector) {
        this.detectType = detectContainer;
        this.getCardTypeName = getCardTypeName;
        this.signDocument = signDocument;

        function detectContainer(readerId) {
            return Connector.get().containerFor(readerId).then(res => {
                // change result for unsupported card types
                if (res.data === 'aventra') { return 'unknown'; }
                return res.data;
            });
        }

        function determineType(readerId, pin) {
            return detectContainer(readerId).then(container => {
                return { readerId, container, pin };
            });
        }

        function getCardTypeName(container, card) {
            switch (container) {
                case 'beid':
                    return 'Belgian eID';
                case 'dnie':
                    return 'Spanish DNIe';
                case 'luxeid':
                    return 'Luxembourg eID';
                case 'luxtrust':
                    return 'LuxTrust';
                case 'ocra':
                    return 'OCRA/OTP';
                case 'mobib':
                    if (findDescription(card.description, 'Basic')) { return 'MOBIB Basic'; }
                    else { return 'MOBIB'; }
                    break;
                case 'emv':
                    return 'EMV';
                case 'oberthur':
                    return 'Oberthur';
                case 'piv':
                    return 'PIV';
                case 'pteid':
                    return 'Portuguese eID';
                default:
                    return 'Unknown';
            }

            function findDescription(descriptions, toFind) {
                return !!_.find(descriptions, desc => {
                    return desc.indexOf(toFind) > -1;
                })
            }
        }

        function getCertificatesForSigning(readerId, container, pin) {
            // Based on type of card, retrieve certificates
            // return object with certificate array and sign certificate
            switch (container) {
                case 'aventra':
                    return getAventraCertificates(readerId);
                case 'beid':
                    return getBeIDCertificates(readerId);
                case 'dnie':
                    return getDNIeCertificates(readerId);
                case 'luxeid':
                    return getLuxIDCertificates(readerId, pin);
                case 'luxtrust':
                    return getLuxTrustCertificates(readerId);
                case 'oberthur':
                    return getOberthurCertificates(readerId);
                case 'piv':
                    return getPIVCertificates(readerId);
                case 'pteid':
                    return getPtEidCertificates(readerId);
                default:
                    return $q.reject('Cannot retrieve certificates');
            }


            function getAventraCertificates(readerId) {
                return Connector.get().aventra(readerId).allCerts(['root-certificate', 'authentication-certificate', 'signing-certificate']).then(certs => {
                    return {
                        digestAlgoWrapper: 'SHA512',
                        certificates:    [ certs.data.signing_certificate.base64, certs.data.authentication_certificate.base64, certs.data.root_certificate.base64 ],
                        signCertificate: certs.data.signing_certificate.base64
                    };
                });
            }

            function getBeIDCertificates(readerId) {
                return Connector.get().beid(readerId).allCerts(['root-certificate', 'citizen-certificate', 'non-repudiation-certificate']).then(certs => {
                    return {
                        digestAlgoWrapper: 'SHA512',
                        certificates:    [ certs.data.non_repudiation_certificate.base64, certs.data.citizen_certificate.base64, certs.data.root_certificate.base64 ],
                        signCertificate: certs.data.non_repudiation_certificate.base64
                    };
                });
            }

            function getDNIeCertificates(readerId) {
                return Connector.get().dnie(readerId).allCerts(['intermediate-certificate', 'authentication-certificate', 'signing-certificate']).then(certs => {
                    return {
                        digestAlgoWrapper: 'SHA512',
                        certificates:    [ certs.data.signing_certificate.base64, certs.data.authentication_certificate.base64, certs.data.intermediate_certificate.base64 ],
                        signCertificate: certs.data.signing_certificate.base64
                    };
                });
            }

            function getLuxIDCertificates(readerId, pin) {
                return Connector.get().luxeid(readerId, pin).allCerts({ filter: ['root-certificates', 'non-repudiation-certificate'] }).then(certs => {
                    return {
                        digestAlgoWrapper: 'SHA256',
                        certificates:    [ certs.data.non_repudiation_certificate.base64, certs.data.root_certificates[1].base64, certs.data.root_certificates[0].base64 ],
                        signCertificate: certs.data.non_repudiation_certificate.base64
                    };
                });
            }

            function getLuxTrustCertificates(readerId) {
                return Connector.get().luxtrust(readerId).allCerts({ filter: ['root-certificates', 'signing-certificate'] }).then(certs => {
                    return {
                        digestAlgoWrapper: 'SHA256',
                        certificates:    [ certs.data.signing_certificate.base64, certs.data.root_certificates[1].base64, certs.data.root_certificates[0].base64 ],
                        signCertificate: certs.data.signing_certificate.base64
                    };
                });
            }

            function getOberthurCertificates(readerId) {
                return Connector.get().oberthur(readerId).allCerts({ filter: ['root-certificate', 'authentication-certificate', 'signing-certificate'] }).then(certs => {
                    return {
                        digestAlgoWrapper: 'SHA512',
                        certificates:    [ certs.data.signing_certificate.base64, certs.data.authentication_certificate.base64, certs.data.root_certificate.base64 ],
                        signCertificate: certs.data.signing_certificate.base64
                    };
                });
            }

            function getPIVCertificates(readerId) {
                return Connector.get().piv(readerId).allCerts({ filter: ['authentication-certificate', 'signing-certificate'] }).then(certs => {
                    return {
                        digestAlgoWrapper: 'SHA512',
                        certificates:    [ certs.data.signing_certificate.base64, certs.data.authentication_certificate.base64 ],
                        signCertificate: certs.data.signing_certificate.base64
                    };
                });
            }

            function getPtEidCertificates(readerId) {
                return Connector.get().pteid(readerId).allCerts({ filter: ['root_certificate','root_non_repudiation_certificate','non_repudiation_certificate'] }).then(certs => {
                    return {
                        digestAlgoWrapper: 'SHA256',
                        certificates:    [ certs.data.non_repudiation_certificate.base64, certs.data.root_non_repudiation_certificate.base64, certs.data.root_certificate.base64 ],
                        signCertificate: certs.data.non_repudiation_certificate.base64
                    };
                });
            }

        }

        function getDataForType(args) {
            return getCertificatesForSigning(args.readerId, args.container, args.pin).then(certs => {
                return getSignerName(args.readerId, args.container, args.pin).then(name => {
                    certs.additionalInformation = { name };
                    return certs;
                })
            });
        }

        function getSignerName(readerId, container, pin) {
            // Based on type of card, retrieve certificates
            // return object with certificate array and sign certificate
            switch (container) {
                case 'aventra':
                    return getAventraSigner(readerId);
                case 'beid':
                    return getBeIDSigner(readerId);
                case 'dnie':
                    return getDNIeSigner(readerId);
                case 'luxeid':
                    return getLuxIDSigner(readerId, pin);
                case 'luxtrust':
                    return getLuxTrustSigner(readerId);
                case 'oberthur':
                    return getOberthurSigner(readerId);
                case 'piv':
                    return getPIVSigner(readerId, pin);
                case 'pteid':
                    return getPtEidSigner(readerId);
                default:
                    return $q.reject('Cannot retrieve certificates');
            }

            function getAventraSigner(readerId) {
                // TODO retrieve name from signing certificate?
                return $q.when('Signed with Aventra card');
            }

            function getBeIDSigner(readerId) {
                return Connector.get().beid(readerId).rnData().then(rnData => {
                    return rnData.data.first_names.split(" ", 1) + ' ' + rnData.data.name;
                });
            }

            function getDNIeSigner(readerId) {
                return Connector.get().dnie(readerId).info().then(info => {
                    return info.data.firstName + ' ' + info.data.firstLastName;
                });
            }


            function getLuxIDSigner(readerId, pin) {
                return Connector.get().luxeid(readerId, pin).biometric().then(biometric => {
                    return biometric.data.firstName + ' ' + biometric.data.lastName;
                });
            }

            function getLuxTrustSigner() {
                // TODO retrieve name from signing certificate?
                return $q.when('Signed with LuxTrust card');
            }

            function getOberthurSigner(readerId) {
                // TODO retrieve name from signing certificate?
                return $q.when('Signed with Oberthur card');
            }

            function getPIVSigner(readerId, pin) {
                return Connector.get().piv(readerId).printedInformation({ pin }).then(info => {
                    if (info.data && info.data.name && info.data.name.length) {
                        return info.data.name;
                    } else { return 'Signed with PIV card'; }
                });
            }

            function getPtEidSigner(readerId) {
                return Connector.get().pteid(readerId).idData().then(idData => {
                    return idData.data.name + ' ' + idData.data.surname;
                })
            }
        }

        function signDocument(documentId, readerId, pin) {
            let signing = $q.defer();

            determineType(readerId, pin).then(getDataForType).then(function(signData) {
                signData.docId = documentId;
                return $q.when(signData)
                         // .then(dataToSign)
                         // .then(function (dataToSign) {
                         //     return $q.when({ readerId: readerId, pin: pin, dataToSign: dataToSign });
                         // })
                         // .then(signWithConnector)
                         // .then(function (signedData) {
                         //     signData.signedData = signedData;
                         //     return $q.when(signData);
                         // })
                         // .then(workflowSign)
                         .then(function () { signing.resolve(); });
            });

            return signing.promise;
        }

        // Needs proxy
        function dataToSign(signData) {
            console.log(signData);
            return $http.post('api/cards/datatosign', signData).then(function (res) { return res.data; });
        }

        function signWithConnector (inputObj) {
            return Connector.get().sign(inputObj.readerId, { pin: inputObj.pin,
                data: inputObj.dataToSign.bytes,
                algorithm_reference: inputObj.dataToSign.digestAlgorithm })
                            .then(res => { return res.data; });
        }

        // Needs proxy
        function workflowSign(signData) {
            return $http.post('api/cards/sign', signData).then(function (res) { return res.data; });
        }
    }

})();
