(function () {
    'use strict';

    angular.module('app.readmycards')
        .service('T1C', ConnectorService)
        .service('CardService', CardService);


    function ConnectorService($q, $timeout, CardService, _) {
        var connector;
        initializeLib();

        // === T1C Methods ===
        // --- Core ---
        this.getConnector = getConnector;
        this.getInfo = getInfo;
        this.getReaders = getReaders;
        this.getReader = getReader;
        this.pollForReaders = pollForReaders;
        this.pollForCards = pollForReadersWithCardInserted;
        this.getReadersWithCards = getReadersWithCards;
        this.getReadersWithoutCards = getReadersWithoutCards;
        this.listPlugins = listPlugins;
        this.getPlugin = getPlugin;
        this.browserInfo = browserInfo;
        this.getPubKey = getPubKey;
        this.setPubKey = setPubKey;
        // --- Config ---
        this.getApiKey = getApiKey;
        // --- DS ---
        this.getDSUrl = getDSUrl;
        this.getJwt = getJwt;
        this.refreshJwt = refreshJwt;
        this.sendJwtToGcl = sendJwtToGcl;
        this.getDownloadLink = getDownloadLink;
        // --- BeID ---
        this.getAllData = getAllData;
        this.getAllCerts = getAllCerts;
        this.getRnData = getRnData;
        this.getAddress = getAddress;
        this.getPic = getPic;
        this.getRootCert = getRootCert;
        this.getAuthCert = getAuthCert;
        this.getCitizenCert = getCitizenCert;
        this.getNonRepCert = getNonRepCert;
        this.getRrnCert = getRrnCert;
        this.filterBeIdData = filterBeIdData;
        this.filterBeIdCerts = filterBeIdCerts;
        this.signData = signData;
        this.verifyBeIDPin = verifyBeIDPin;
        this.authenticate = authenticate;
        // --- EMV ---
        this.getAllEmvData = getAllEmvData;
        this.getPAN = getPAN;
        this.filterEmvData = filterEmvData;
        this.verifyEmvPin = verifyEmvPin;
        // --- Utility ---
        this.isCardTypeBeId = isCardTypeBeId;
        this.isGCLAvailable = isGCLAvailable;
        this.readAllData = readAllData;
        this.initializeAfterInstall = initializeAfterInstall;


        /// ===============================
        /// ===== CORE FUNCTIONALITY ======
        /// ===============================

        // Get the connector instance
        function getConnector() {
            return connector;
        }

        // Get info about the T1C installation
        function getInfo() {
            var infoDeferred = $q.defer();
            connector.core().info(function (err, result) {
                callbackHelper(err, result, infoDeferred);
            });
            return infoDeferred.promise;
        }

        // Get a list of all connected readers
        function getReaders() {
            var readersDeferred = $q.defer();
            connector.core().readers(function (err, result) {
                callbackHelper(err, result, readersDeferred);
            });
            return readersDeferred.promise;
        }

        // Poll for readers for a number of seconds
        function pollForReaders(secondsToPoll) {
            var readersDeferred = $q.defer();
            connector.core().pollReaders(secondsToPoll, function (err, result) {
                callbackHelper(err, result, readersDeferred);
            });
            return readersDeferred.promise;
        }

        // Get info about a specific reader
        function getReader(readerId) {
            var readerDeferred = $q.defer();
            connector.core().reader(readerId, function (err, result) {
                callbackHelper(err, result, readerDeferred);
            });
            return readerDeferred.promise;
        }

        // Get all readers that currently have a card inserted
        function getReadersWithCards() {
            var readerCardsDeferred = $q.defer();
            connector.core().readersCardAvailable(function (err, result) {
                callbackHelper(err, result, readerCardsDeferred);
            });
            return readerCardsDeferred.promise;
        }

        // Get all readers that currently *do not* have a card inserted
        function getReadersWithoutCards() {
            var readerCardsDeferred = $q.defer();
            connector.core().readersCardsUnavailable(function (err, result) {
                callbackHelper(err, result, readerCardsDeferred);
            });
            return readerCardsDeferred.promise;
        }

        // Poll for readers with inserted card for a number of seconds
        function pollForReadersWithCardInserted(secondsToPoll) {
            var readersDeferred = $q.defer();
            connector.core().pollCardInserted(secondsToPoll, function (err, result) {
                callbackHelper(err, result, readersDeferred);
            });
            return readersDeferred.promise;
        }

        // Returns a list of available plugins and plugin versions
        function listPlugins() {
            var pluginsDeferred = $q.defer();
            connector.core().plugins(function (err, result) {
                callbackHelper(err, result, pluginsDeferred);
            });
            return pluginsDeferred.promise;
        }

        // Get information on a specific plugin
        function getPlugin(pluginId) {
            var pluginDeferred = $q.defer();
            connector.core().plugins(pluginId, function (err, result) {
                callbackHelper(err, result, pluginDeferred);
            });
            return pluginDeferred.promise;
        }

        // Get browser information that is needed to determine which GCL package to download
        function browserInfo() {
            var browserDeferred = $q.defer();
            connector.core().infoBrowser(function (err, result) {
                callbackHelper(err, result, browserDeferred);
            });
            return browserDeferred.promise;
        }

        // Get public key
        function getPubKey() {
            var key = $q.defer();
            connector.core().getPubKey(function (err, result) {
                callbackHelper(err, result, key);
            });
            return key.promise;
        }

        // Set public key
        function setPubKey(pubKey) {
            var key = $q.defer();
            connector.core().getPubKey(pubKey, function (err, result) {
                callbackHelper(err, result, key);
            });
            return key.promise;
        }


        /// =================================
        /// ===== CONFIG FUNCTIONALITY ======
        /// =================================
        function getApiKey() {
            return $q.when(connector.config().apiKey);
        }


        /// =============================
        /// ===== DS FUNCTIONALITY ======
        /// =============================
        function getDSUrl() {
            console.log('get ds url');
            var url = $q.defer();
            connector.ds().getUrl(function (err, result) {
                console.log(result);
                callbackHelper(err, result, url);
            });
            return url.promise;
        }


        function getJwt() {
            var dsDeferred = $q.defer();
            connector.ds().getJWT(function (err, result) {
                callbackHelper(err, result, dsDeferred);
            });
            return dsDeferred.promise;
        }

        function refreshJwt() {
            var dsDeferred = $q.defer();
            connector.ds().refreshJWT(function (err, result) {
                callbackHelper(err, result, dsDeferred);
            });
            return dsDeferred.promise;
        }


        function sendJwtToGcl() {
            var dsDeferred = $q.defer();
            connector.core().manage(function (err, result) {
                callbackHelper(err, result, dsDeferred);
            });
            return dsDeferred.promise;
        }

        function getDownloadLink() {
            var dlDeferred = $q.defer();
            connector.core().infoBrowser(function (err, info) {
                if (err) dlDeferred.reject(err);
                connector.ds().downloadLink(info, function (err, result) {
                    callbackHelper(err, result, dlDeferred);
                });
            });
            return dlDeferred.promise;
        }


        /// ===============================
        /// ===== BeID FUNCTIONALITY ======
        /// ===============================

        // Get all data
        function getAllData(readerId) {
            var data = $q.defer();
            connector.beid(readerId).allData([], function (err, result) {
                callbackHelper(err, result, data);
            });
            return data.promise;
        }

        // Get all data
        function getAllCerts(readerId) {
            var data = $q.defer();
            connector.beid(readerId).allCerts([], function (err, result) {
                callbackHelper(err, result, data);
            });
            return data.promise;
        }

        // Get all card holder related data, excluding address and photo
        function getRnData(readerId) {
            var rnDataDeferred = $q.defer();
            connector.beid(readerId).rnData(function (err, result) {
                callbackHelper(err, result, rnDataDeferred);
            });
            return rnDataDeferred.promise;
        }

        // Get card holder's address
        function getAddress(readerId) {
            var addressDeferred = $q.defer();
            connector.beid(readerId).address(function (err, result) {
                callbackHelper(err, result, addressDeferred);
            });
            return addressDeferred.promise;
        }

        // Get card holder's picture
        function getPic(readerId) {
            var picDeferred = $q.defer();
            connector.beid(readerId).picture(function (err, result) {
                callbackHelper(err, result, picDeferred);
            });
            return picDeferred.promise;
        }

        // Get root certificate stored on smart card
        function getRootCert(readerId) {
            var rootDeferred = $q.defer();
            connector.beid(readerId).rootCertificate(function (err, result) {
                callbackHelper(err, result, rootDeferred);
            });
            return rootDeferred.promise;
        }

        // Get authentication certificate stored on smart card
        function getAuthCert(readerId) {
            var authDeferred = $q.defer();
            connector.beid(readerId).authenticationCertificate(function (err, result) {
                callbackHelper(err, result, authDeferred);
            });
            return authDeferred.promise;
        }

        // Get citizen certificate stored on smart card
        function getCitizenCert(readerId) {
            var citizenDeferred = $q.defer();
            connector.beid(readerId).citizenCertificate(function (err, result) {
                callbackHelper(err, result, citizenDeferred);
            });
            return citizenDeferred.promise;
        }

        // Get non-repudiation certificat stored on smart card
        function getNonRepCert(readerId) {
            var nonRepDeferred = $q.defer();
            connector.beid(readerId).nonRepudiationCertificate(function (err, result) {
                callbackHelper(err, result, nonRepDeferred);
            });
            return nonRepDeferred.promise;
        }

        // Get RRN certificate stored on smart card (= private key used to sign Rn and Address data)
        function getRrnCert(readerId) {
            var rrnDeferred = $q.defer();
            connector.beid(readerId).rrnCertificate(function (err, result) {
                callbackHelper(err, result, rrnDeferred);
            });
            return rrnDeferred.promise;
        }

        // Get only a specific subset of data
        function filterBeIdData(readerId, filter) {
            var filterDeferred = $q.defer();
            connector.beid(readerId).allData(filter, function (err, result) {
                callbackHelper(err, result, filterDeferred);
            });
            return filterDeferred.promise;
        }

        // Filter the certificates
        function filterBeIdCerts(readerId, filter) {
            var filterDeferred = $q.defer();
            connector.beid(readerId).allCerts(filter, function (err, result) {
                callbackHelper(err, result, filterDeferred);
            });
            return filterDeferred.promise;
        }

        // Sign data with certificates stored on the smartcard
        function signData(readerId, pin, algo, dataToSign) {
            var signDeferred = $q.defer();
            var data = {
                algorithm_reference: algo,
                data: dataToSign
            };
            if (pin) data.pin = pin;
            connector.beid(readerId).signData(data, function (err, result) {
                callbackHelper(err, result, signDeferred);
            });
            return signDeferred.promise;
        }

        // Verify PIN code
        function verifyBeIDPin(readerId, pin) {
            var pinDeferred = $q.defer();
            var data = {};
            if (pin) data.pin = pin;
            connector.beid(readerId).verifyPin(data, function (err, result) {
                callbackHelper(err, result, pinDeferred);
            });
            return pinDeferred.promise;
        }

        // Authenticate card holder based on challenge
        function authenticate(readerId, pin, algo, challenge) {
            var authDeferred = $q.defer();
            var data = {
                algorithm_reference: algo,
                challenge: challenge
            };
            if (pin) data.pin = pin;
            connector.beid(readerId).authenticate(data, function (err, result) {
                callbackHelper(err, result, authDeferred);
            });
            return authDeferred.promise;
        }


        /// ==============================
        /// ===== EMV FUNCTIONALITY ======
        /// ==============================

        // Get All available EMV Data
        function getAllEmvData(readerId) {
            console.log('get EMV data');
            var allData = $q.defer();
            connector.emv(readerId).allData([], function (err, res) {
                console.log(err);
                callbackHelper(err, res, allData);
            });
            return allData.promise;
        }

        // Get Primary Accound Number (PAN) associated with a card
        function getPAN(readerId) {
            var panDeferred = $q.defer();
            connector.emv(readerId).pan(function (err, result) {
                callbackHelper(err, result, panDeferred);
            });
            return panDeferred.promise;
        }

        // Filter data
        function filterEmvData(readerId, filter) {
            var emvDeferred = $q.defer();
            connector.emv(readerId).allData(filter, function (err, result) {
                callbackHelper(err, result, emvDeferred);
            });
            return emvDeferred.promise;
        }

        // Verify PIN code
        function verifyEmvPin(readerId, pin) {
            var emvDeferred = $q.defer();
            var data = {
                properties: {}
            };
            if (pin) data.properties.pin = pin;
            connector.emv(readerId).verifyPin(data, function (err, result) {
                callbackHelper(err, result, emvDeferred);
            });
            return emvDeferred.promise;
        }



        /// ==============================
        /// ===== UTILITY FUNCTIONS ======
        /// ==============================

        // Check if the car
        function isCardTypeBeId(readerId) {
            var typeDeferred = $q.defer();
            // TODO user direct reader access when available
            getReaders().then(function (result) {
                var reader = _.find(result.data, function (reader) {
                    return reader.id === readerId;
                });

                if (reader.card) {
                    if (reader.card.description[0] === 'Belgium Electronic ID card') typeDeferred.resolve(true);
                    else typeDeferred.resolve(false);
                } else {
                    typeDeferred.reject('No card present in reader');
                }
            });
            return typeDeferred.promise;
        }

        function isGCLAvailable() {
            var available = $q.defer();
            connector.core().info(function (err) {
                if (err) available.resolve(false);
                else available.resolve(true);
            });
            return available.promise;
        }

        function readAllData(readerId, card) {
            switch (CardService.detectType(card)) {
                case 'BeID':
                    return getAllData(readerId);
                case 'EMV':
                    return getAllEmvData(readerId);
                default:
                    return $q.when('Not Supported');
            }
        }



        // Helper function to reject or resolve the promise when appropriate
        function callbackHelper(err, result, promise) {
            if (err) promise.reject(err);
            else promise.resolve(result);
        }

        // Initialize the T1C connector with some custom config
        function initializeLib() {
            var gclConfig = new GCLLib.GCLConfig();
            gclConfig.apiKey = "b644bdc6-74d8-4ee2-9ce5-347d5dc14cb5"; //test apikey rate limited
            gclConfig.gclUrl = "https://localhost:10443/v1"; //override config for local dev
            gclConfig.dsUrl = "https://accapim.t1t.be:443/trust1team/gclds/v1";
            gclConfig.allowAutoUpdate = true;
            gclConfig.implicitDownload = false;
            connector = new GCLLib.GCLClient(gclConfig);
        }

        function initializeAfterInstall() {
            return $q.when(initializeLib());
        }
    }

    function CardService() {
        this.detectType = detectType;

        function detectType(card) {
            switch (card.description[0]) {
                case 'Belgium Electronic ID card':
                    return 'BeID';
                case 'MOBIB Card':
                    return 'MOBIB';
                case 'Axa Bank (Belgium) Mastercard Gold / Axa Bank Belgium':
                    return 'EMV';
                default:
                    return 'Unknown';
            }
        }
    }

})();