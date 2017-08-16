(function () {
    'use strict';

    angular.module('app.connector', [])
           .service('Connector', Connector);

    function Connector() {
        let connector;
        this.get = getConnector;
        this.init = initializeLib;


        function getConnector() {
            return connector;
        }

        // Initialize the T1C connector with some custom config
        function initializeLib() {
            if (!connector) {
                let gclConfig = new GCLLib.GCLConfig();
                gclConfig.apiKey = "7de3b216-ade2-4391-b2e2-86b80bac4d7d"; //test apikey rate limited
                gclConfig.gclUrl = "https://localhost:10443/v1"; //override config for local dev
                gclConfig.dsUrl = "https://accapim.t1t.be:443"; //trust1team/gclds/v1
                gclConfig.allowAutoUpdate = true;
                gclConfig.implicitDownload = false;
                connector = GCLLib.GCLClient.initialize(gclConfig).then(client => {
                    connector = client;
                });
            }
            return connector;
        }
    }

})();



