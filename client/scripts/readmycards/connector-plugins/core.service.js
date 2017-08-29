(function () {
    'use strict';

    angular.module('app.readmycards.plugins')
           .service('Core', Core);


    function Core($q, _, Citrix, Connector) {
        let connector = Connector.get();

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

        /// ===============================
        /// ===== CORE FUNCTIONALITY ======
        /// ===============================

        // Get the connector instance
        function getConnector() {
            return connector;
        }

        // Get info about the T1C installation
        function getInfo() {
            let infoDeferred = $q.defer();
            connector.core().info(function (err, result) {
                callbackHelper(err, result, infoDeferred);
            }, Citrix.port());
            return infoDeferred.promise;
        }

        // Get a list of all connected readers
        function getReaders() {
            let readersDeferred = $q.defer();
            connector.core().readers(function (err, result) {
                callbackHelperExempt(err, result, readersDeferred);
            }, Citrix.port());
            return readersDeferred.promise;
        }

        // Poll for readers for a number of seconds
        function pollForReaders(secondsToPoll) {
            let readersDeferred = $q.defer();
            connector.core().pollReaders(secondsToPoll, function (err, result) {
                callbackHelper(err, result, readersDeferred);
            }, Citrix.port());
            return readersDeferred.promise;
        }

        // Get info about a specific reader
        function getReader(readerId) {
            let readerDeferred = $q.defer();
            connector.core().reader(readerId, function (err, result) {
                callbackHelper(err, result, readerDeferred);
            });
            return readerDeferred.promise;
        }

        // Get all readers that currently have a card inserted
        function getReadersWithCards() {
            let readerCardsDeferred = $q.defer();
            connector.core().readersCardAvailable(function (err, result) {
                callbackHelper(err, result, readerCardsDeferred);
            }, Citrix.port());
            return readerCardsDeferred.promise;
        }

        // Get all readers that currently *do not* have a card inserted
        function getReadersWithoutCards() {
            let readerCardsDeferred = $q.defer();
            connector.core().readersCardsUnavailable(function (err, result) {
                callbackHelper(err, result, readerCardsDeferred);
            }, Citrix.port());
            return readerCardsDeferred.promise;
        }

        // Poll for readers with inserted card for a number of seconds
        function pollForReadersWithCardInserted(secondsToPoll) {
            let readersDeferred = $q.defer();
            connector.core().pollCardInserted(secondsToPoll, function (err, result) {
                callbackHelper(err, result, readersDeferred);
            }, Citrix.port());
            return readersDeferred.promise;
        }

        // Returns a list of available plugins and plugin versions
        function listPlugins() {
            let pluginsDeferred = $q.defer();
            connector.core().plugins(function (err, result) {
                callbackHelper(err, result, pluginsDeferred);
            }, Citrix.port());
            return pluginsDeferred.promise;
        }

        // Get information on a specific plugin
        function getPlugin(pluginId) {
            let pluginDeferred = $q.defer();
            connector.core().plugins(pluginId, function (err, result) {
                callbackHelper(err, result, pluginDeferred);
            }, Citrix.port());
            return pluginDeferred.promise;
        }

        // Get browser information that is needed to determine which GCL package to download
        function browserInfo() {
            let browserDeferred = $q.defer();
            connector.core().infoBrowser(function (err, result) {
                callbackHelper(err, result, browserDeferred);
            }, Citrix.port());
            return browserDeferred.promise;
        }

        // Get public key
        function getPubKey() {
            let key = $q.defer();
            connector.core().getPubKey(function (err, result) {
                callbackHelper(err, result, key);
            });
            return key.promise;
        }

        // Set public key
        function setPubKey(pubKey) {
            let key = $q.defer();
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


        // Helper function to reject or resolve the promise when appropriate
        function callbackHelper(err, result, promise) {
            if (err) {
                if (err.data && err.data.code && err.data.code === 802) {
                    // invalid HTTP request, probably agent is gone
                    // reset app
                    window.location.reload();
                } else {
                    promise.reject(err);
                }
            }
            else promise.resolve(result);
        }

        // Helper function to reject or resolve the promise when appropriate
        function callbackHelperExempt(err, result, promise) {
            if (err) {
                promise.reject(err);
            }
            else promise.resolve(result);
        }
    }
})();