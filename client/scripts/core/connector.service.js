(function () {
    'use strict';

    angular.module('app.connector', [])
           .controller('ConsentCtrl', ConsentCtrl)
           .service('ConsentService', ConsentService)
           .service('Connector', Connector);

    function ConsentCtrl($scope, $location, $uibModalInstance, Connector, file, _) {
        // Define pool of chars to use
        const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        // Generate random code
        $scope.file = file;
        $scope.code = Random.string(pool)(Random.engines.browserCrypto, 6);

        let port = '';
        if (!_.includes([ 80, 443], $location.port())) { port = ':' + $location.port(); }

        // "Please confirm that https://www.belfius.be is currently displaying the code ‘ABCDEFG’.”

        let title = 'Grant access to ' + $location.protocol() + '://' + $location.host() + port + '?';
        let type = 'reader';
        if (file) {
            title = 'Grant file access to ' + $location.protocol() + '://' + $location.host() + port + '?'
            type = 'file_exchange'
        }

        Connector.get().core().getConsent(title,
            'Please confirm that ' + $location.protocol() + '://' + $location.host() + port + ' is currently displaying the code ' + $scope.code, 1, 'warning', 'bottom_right', type).then(res => {
            $uibModalInstance.close(res);
        }, () => {
            // TODO inspect error and react accordingly
            $uibModalInstance.close({ data: false, success: true });
        })
    }

    function ConsentService($uibModal) {
        this.showConsentModal = showConsentModal;
        this.showFileConsentModal = showFileConsentModal;

        function showConsentModal() {
            return $uibModal.open({
                templateUrl: "views/readmycards/modals/consent.html",
                backdrop: 'static',
                resolve: {
                    file: () => {
                        return false;
                    }
                },
                controller: 'ConsentCtrl'
            }).result;
        }

        function showFileConsentModal() {
            return $uibModal.open({
                templateUrl: "views/readmycards/modals/consent.html",
                backdrop: 'static',
                resolve: {
                    file: () => {
                        return true;
                    }
                },
                controller: 'ConsentCtrl'
            }).result;
        }
    }

    function Connector($q, $rootScope, $state) {
        let connector;
        let consent;
        this.core = sendCoreRequest;
        this.generic = sendGenericRequest;
        this.ocv = sendOcvRequest;
        this.plugin = sendPluginRequest;
        this.promise = connectorPromise;
        this.get = get;
        this.init = initializeLib;

        // TODO make sure connector is initialized before sending requests

        function connectorPromise() {
            return $q.when(connector);
        }

        function errorHandler(erroredRequest) {
            console.log(erroredRequest);
            if (!erroredRequest.pluginArgs) { erroredRequest.pluginArgs = []; }
            const error = erroredRequest.error;
            if (error.status === 401) {
                // Unauthorized, need to request consent
                if (!consent) {
                    consent = $q.defer();

                    if (erroredRequest.plugin === 'fileExchange') {
                        $rootScope.$emit('file-consent-required');
                    } else { $rootScope.$emit('consent-required'); }

                    $rootScope.$on('consent-result', (event, result) => {
                        consent.resolve(result);
                    });
                }

                return consent.promise.then(res => {
                    if (res.data) {
                        // consent given, re-fire original request
                        if (erroredRequest.plugin) {
                            return connectorPromise().then(conn => {
                                return conn[erroredRequest.plugin](...erroredRequest.pluginArgs)[erroredRequest.func](...erroredRequest.args);
                            });
                        } else { return connectorPromise().then(conn => { return conn[erroredRequest.func](...erroredRequest.args); }); }
                    } else {
                        $state.go('consent-required');
                        return $q.reject({ noConsent: true });
                    }
                }, () => {
                    // TODO handle error?
                    return $q.reject({ noConsent: true });
                }).finally(() => {
                    consent = undefined;
                });
            } else {
                return $q.reject(error);
            }
        }

        function sendCoreRequest(func, args) {
            if (!args) { args = []; }
            return connectorPromise().then(conn => {
                return conn.core()[func](...args).then(res => {
                    return $q.when(res);
                }, error => {
                    return $q.when({ error, plugin: 'core', func, args }).then(errorHandler);
                });
            });
        }

        function sendGenericRequest(func, args) {
            if (!args) { args = []; }
            return connectorPromise().then(conn => {
                return conn[func](...args).then(res => {
                    return $q.when(res);
                }, error => {
                    return $q.when({ error, func, args }).then(errorHandler);
                });
            });
        }

        function sendOcvRequest(func, args) {
            if (!args) { args = []; }
            return connectorPromise().then(conn => {
                return conn.ocv()[func](...args).then(res => {
                    return $q.when(res);
                }, error => {
                    return $q.when({ error, plugin: 'ocv', func, args }).then(errorHandler);
                });
            });
        }

        function sendPluginRequest(plugin, func, pluginArgs, args) {
            if (!args) { args = []; }
            if (!pluginArgs) { pluginArgs = []; }
            return connectorPromise().then(conn => {
                return conn[plugin](...pluginArgs)[func](...args).then(res => {
                    return $q.when(res);
                }, error => {
                    return $q.when({ error, plugin, func, pluginArgs, args }).then(errorHandler);
                });
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