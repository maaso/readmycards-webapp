(function () {
    'use strict';

    angular.module('app.connector', [])
           .controller('ConsentCtrl', ConsentCtrl)
           .service('ConsentService', ConsentService)
           .service('Connector', Connector);

    function ConsentCtrl($scope, $uibModalInstance, Connector) {
        // Define pool of chars to use
        const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        // Generate random code
        $scope.code = Random.string(pool)(Random.engines.browserCrypto, 6);

        Connector.get().core().getConsent('Grant access to ReadMyCards?', $scope.code, 1).then(res => {
            $uibModalInstance.close(res);
        })
    }

    function ConsentService($uibModal) {
        this.showConsentModal = showConsentModal;

        function showConsentModal() {
            return $uibModal.open({
                templateUrl: "views/readmycards/modals/consent.html",
                backdrop: 'static',
                controller: 'ConsentCtrl'
            }).result;
        }
    }

    function Connector($q, $rootScope) {
        let connector;
        this.core = sendCoreRequest;
        this.generic = sendGenericRequest;
        this.ocv = sendOcvRequest;
        this.plugin = sendPluginRequest;
        this.get = get;
        this.init = initializeLib;

        // TODO make sure connector is initialized before sending requests

        function errorHandler(erroredRequest) {
            if (!erroredRequest.pluginArgs) { erroredRequest.pluginArgs = []; }
            const error = erroredRequest.error;
            if (error.status === 401) {
                // Unauthorized, need to request consent
                const consent = $q.defer();
                $rootScope.$emit('consent-required');

                $rootScope.$on('consent-result', (event, result) => {
                    consent.resolve(result);
                });

                return consent.promise.then(res => {
                    if (res.data) {
                        // consent given, re-fire original request
                        if (erroredRequest.plugin) {
                            return connector[erroredRequest.plugin](...erroredRequest.pluginArgs)[erroredRequest.func](...erroredRequest.args);
                        } else { return connector[erroredRequest.func](...erroredRequest.args); }
                    } else {
                        // TODO handle denied consent
                    }
                }, err => {
                    // TODO handle error?
                });
            } else {
                return $q.reject(error);
            }
        }

        function sendCoreRequest(func, args) {
            if (!args) { args = []; }
            return connector.core()[func](...args).then(res => {
                return $q.when(res);
            }, error => {
                return $q.when({ error, plugin: 'core', func, args }).then(errorHandler);
            });
        }

        function sendGenericRequest(func, args) {
            if (!args) { args = []; }
            return connector[func](...args).then(res => {
                return $q.when(res);
            }, error => {
                return $q.when({ error, func, args }).then(errorHandler);
            });
        }

        function sendOcvRequest(func, args) {
            if (!args) { args = []; }
            return connector.ocv()[func](...args).then(res => {
                return $q.when(res);
            }, error => {
                return $q.when({ error, plugin: 'ocv', func, args }).then(errorHandler);
            });
        }

        function sendPluginRequest(plugin, func, pluginArgs, args) {
            if (!args) { args = []; }
            if (!pluginArgs) { pluginArgs = []; }
            return connector[plugin](...pluginArgs)[func](...args).then(res => {
                return $q.when(res);
            }, error => {
                return $q.when({ error, plugin, func, pluginArgs, args }).then(errorHandler);
            });
        }

        function get() {
            return connector;
        }

        // Initialize the T1C connector with some custom config
        function initializeLib(agentPort) {
            let gclConfig = new GCLLib.GCLConfig();
            gclConfig.apiKey = "7de3b216-ade2-4391-b2e2-86b80bac4d7d"; //test apikey rate limited
            gclConfig.gclUrl = "https://localhost:10443/v1"; //override config for local dev
            gclConfig.dsUrl = "https://accapim.t1t.be:443"; //trust1team/gclds/v1
            gclConfig.allowAutoUpdate = true;
            gclConfig.implicitDownload = false;
            if (agentPort && agentPort > -1) { gclConfig.agentPort = agentPort; }
            connector = GCLLib.GCLClient.initialize(gclConfig).then(client => {
                connector = client;
            });
            return $q.when(connector);
        }
    }

})();