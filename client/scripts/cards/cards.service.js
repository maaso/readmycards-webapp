(function () {
    'use strict';

    angular.module('app.cards')
           .service('CardService', CardService);


    function CardService($q, Connector, _) {
        this.detectType = detectType;
        this.determineType = determineType;
        this.getSignDataForType = getDataForType;
        this.identifyCard = identifyCardInReader;


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

        function determineType(readerId, pin) {
            return Connector.get().containerFor(readerId).then(container => {
                return { readerId, container: container.data, pin };
            });
        }

        function getDataForType(args) {
            return getCertificatesForSigning(args.readerId, args.container, args.pin).then(certs => {
                return getSignerName(args.readerId, args.container, args.pin).then(name => {
                    certs.additionalInformation = { name };
                    return certs;
                })
            });
        }

        function identifyCardInReader(reader) {
            return determineType(reader.id).then(type => {
                switch (type.container) {
                    case 'aventra':
                        return 'Aventra Card';
                    case 'beid':
                        return getSignerName(reader.id, type.container).then(res => {
                            return 'BeID Card (' + res + ')';
                        });
                    case 'dnie':
                        return getSignerName(reader.id, type.container).then(res => {
                            return 'DNIe Card (' + res + ')';
                        });
                    case 'luxeid':
                        return 'Lux eID Card';
                    case 'luxtrust':
                        return 'LuxTrust Card';
                    case 'oberthur':
                        return 'Oberthur Card';
                    case 'piv':
                        return 'PIV Card';
                    case 'pteid':
                        return getSignerName(reader.id, type.container).then(res => {
                            return 'Portuguese eID (' + res + ')';
                        });
                    default:
                        return $q.reject('Cannot retrieve certificates');
                }
            })
        }

        function detectType(card) {
            if (!_.isEmpty(card) && !_.isEmpty(card.description)) {
                switch (card.description[0]) {
                    case 'Belgium Electronic ID card':
                        return 'BeID';
                    case 'Grand Duchy of Luxembourg / Identity card with LuxTrust certificate (eID)':
                        return 'LuxID';
                    case 'MOBIB Card':
                        return 'MOBIB';
                    case 'MOBIB Basic (Transport)':
                        return 'MOBIB Basic';
                    case 'Axa Bank (Belgium) Mastercard Gold / Axa Bank Belgium':
                        return 'EMV';
                    default:
                        return 'Unknown';
                }
            } else {
                return 'Unknown';
            }
        }
    }
})();