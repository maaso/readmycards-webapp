(function () {
    'use strict';

    angular.module('app.readmycards')
           .service('T1C', ConnectorService)
           .service('CardService', CardService)
           .service('CheckDigit', CheckDigit)
           .service('RMC', ReadMyCardsService)
           .service('API', API);


    function ConnectorService($q, Core, DS, BeID, EMV, LuxId, LuxTrust, Mobib, OCV, PIV,DNIe, _) {

        // === T1C Methods ===
        // --- Core ---
        this.core = Core;
        // --- DS ---
        this.ds = DS;
        // --- OCV ---
        this.ocv = OCV;
        // --- BeID ---
        this.beid = BeID;
        // --- EMV ---
        this.emv = EMV;
        // --- LuxId ---
        this.luxId = LuxId;
        // --- LuxTrust ---
        this.luxtrust = LuxTrust;
        // --- Mobib ---
        this.mobib = Mobib;
        // --- PIV ---
        this.piv = PIV;
        // --- DNIe ---
        this.dnie = DNIe;
        // --- Utility ---
        this.readAllData = readAllData;

        /// ==============================
        /// ===== UTILITY FUNCTIONS ======
        /// ==============================

        function readAllData(readerId) {
            return Core.getConnector().containerFor(readerId).then(res => {
                // luxeid/piv is a special case and cannot work without a PIN, so skip it
                if (_.includes(['luxeid', 'piv'], res.data)) { return $q.when('Not Supported'); }
                // Reading certs from PT eID takes a long time, initially only read id Data
                if (res.data === 'pteid') { return Core.getConnector().pteid(readerId).idData(); }
                else { return Core.getConnector().dumpData(readerId, {}); }
            }).catch(() => {
                return $q.when('Not Supported');
            });
        }
    }

    function CheckDigit(_) {
        this.calc = calculateCheckDigit;

        const dict = { '<': 0, '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
            'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17, 'I': 18, 'J': 19,
            'K': 20, 'L': 21, 'M': 22, 'N': 23, 'O': 24, 'P': 25, 'Q': 26, 'R': 27, 'S': 28, 'T': 29, 'U': 30, 'V': 31,
            'W': 32, 'X': 33, 'Y': 34, 'Z': 35
        };

        function calculateCheckDigit(string) {
            return _.sum(_.map(_.map(string, (letter) => {
                    return dict[letter.toUpperCase()];
                }), (val, index) => {
                    let weighted = val;
                    switch (index % 3) {
                        case 0:
                            weighted = val * 7;
                            break;
                        case 1:
                            weighted = val * 3;
                            break;
                        case 2:
                            break;
                    }
                    return weighted;
                })) % 10;
        }
    }

    function ReadMyCardsService($rootScope, $timeout, T1C, EVENTS, _) {
        this.monitorCardRemoval = monitorCardRemoval;
        this.checkCardRemoval = checkCardRemoval;
        this.checkReaderRemoval = checkReaderRemoval;

        function monitorCardRemoval(readerId, card) {
            $timeout(function () {
                checkCardRemoval(readerId, card).then(function (removed) {
                    if (removed) $rootScope.$broadcast(EVENTS.START_OVER);
                    else monitorCardRemoval(readerId, card);
                });
            }, 500);
        }

        function checkCardRemoval(readerId, card) {
            // Check reader still connected
            // Check card still inserted
            // Check same card inserted
            return $timeout(function() {
                return T1C.core.getReadersWithCards().then(function (readerData) {
                    $rootScope.$broadcast(EVENTS.READERS_WITH_CARDS, readerData);
                    if (!_.has(readerData, 'data') || _.isEmpty(readerData.data)) {
                        // no connected readers with cards
                        // removal is true
                        return true;
                    } else {
                        // check if readerId still present
                        let reader = _.find(readerData.data, function (reader) {
                            return reader.id === readerId;
                        });
                        // check if card with same atr is present
                        // TODO deeper check to see if it is really the same card and not just a card of same type?
                        return !(reader && reader.card && card && reader.card.atr === card.atr);
                    }
                }, function () {
                    // console.log('error occurred, assume card removed');
                    return true;
                });
            }, 500);
        }

        function checkReaderRemoval() {
            // check reader still connected
            return T1C.core.getReaders().then(function (readerData) {
                if (!_.has(readerData, 'data') || _.isEmpty(readerData.data)) {
                    // no connected readers
                    // broadcast removal event
                    $rootScope.$broadcast(EVENTS.START_OVER);
                    return true;
                } else {
                    return false;
                }
            }, function (error) {
                if (error.message === EVENTS.NETWORK_ERROR) {
                    // try again after short delay
                    $timeout(function () {
                        return checkCardRemoval();
                    }, 100);
                }
            });
        }
    }

    function CardService(_, Core) {
        this.detectType = detectContainer;
        this.getCardTypeName = getCardTypeName;


        function detectContainer(readerId) {
            return Core.getConnector().containerFor(readerId).then(res => {
                // change result for unsupported card types
                if (res.data === 'aventra') { return 'unknown'; }
                return res.data;
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
    }

    function API($http, $q, T1C, _) {
        this.convertJPEG2000toJPEG = convertJPEG2000toJPEG;
        this.storeUnknownCardInfo = storeUnknownCardInfo;
        this.storeDownloadInfo = storeDownloadInfo;


        function convertJPEG2000toJPEG(base64JPEG2000) {
            let data = {
                base64: base64JPEG2000
            };
            return $http.post('/api/jp2tojpeg', data);
        }

        function storeUnknownCardInfo(card, description) {
            let data = {
                type: 'UnknownCard',
                atr: card.atr,
                payload: createPayload(card, description)
            };
            return $http.post('/api/unknown-card', data);

            function createPayload(card, description) {
                let payload = [];
                _.forEach(card, function (value, key) {
                    if (key !== 'atr') payload.push({ name: key, value: value });
                });
                if (description) payload.push({ name: 'user description', value: description });
                return payload;
            }
        }

        function storeDownloadInfo(mail, mailOptIn, dlUrl) {
            let promises = [ $http.get('//ipinfo.io').then(function (data) {
                return data;
            }, function () {
                return {};
            }), T1C.core.browserInfo().then(function (data) {
                return data;
            }, function () {
                return {};
            })];

            $q.all(promises).then(function (results) {
                let data = {
                    email: mail,
                    emailOptIn: mailOptIn,
                    dlUrl: dlUrl,
                    platformName: results[1].os.name,
                    type: 'GCLdownload',
                    payload: createPayload(results[0].data, results[1])
                };
                return $http.post('/api/dl', data);
            }, function (err) {
                console.log(err);
            });

            function createPayload(ipInfo, browserInfo) {
                let payload = [];
                _.forEach(ipInfo, function (value, key) {
                    payload.push({ name: key, value: value});
                });
                _.forEach(browserInfo, function (value, key) {
                    payload.push({ name: key, value: value});
                });
                return payload;
            }
        }
    }

})();
