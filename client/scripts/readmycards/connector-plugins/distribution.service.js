(function () {
    'use strict';

    angular.module('app.readmycards.plugins')
        .service('DS', DS);


    function DS($q, Core) {

        // === T1C Methods ===
        // --- DS ---
        this.getDSUrl = getDSUrl;
        this.getJwt = getJwt;
        this.refreshJwt = refreshJwt;
        this.sendJwtToGcl = sendJwtToGcl;
        this.getDownloadLink = getDownloadLink;

        const connector = Core.getConnector();


        /// =============================
        /// ===== DS FUNCTIONALITY ======
        /// =============================
        function getDSUrl() {
            console.log('get ds url');
            let url = $q.defer();
            connector.ds().getUrl(function (err, result) {
                console.log(result);
                callbackHelper(err, result, url);
            });
            return url.promise;
        }


        function getJwt() {
            let dsDeferred = $q.defer();
            connector.ds().getJWT(function (err, result) {
                callbackHelper(err, result, dsDeferred);
            });
            return dsDeferred.promise;
        }

        function refreshJwt() {
            let dsDeferred = $q.defer();
            connector.ds().refreshJWT(function (err, result) {
                callbackHelper(err, result, dsDeferred);
            });
            return dsDeferred.promise;
        }


        function sendJwtToGcl() {
            let dsDeferred = $q.defer();
            connector.core().manage(function (err, result) {
                callbackHelper(err, result, dsDeferred);
            });
            return dsDeferred.promise;
        }

        function getDownloadLink() {
            let dlDeferred = $q.defer();
            connector.core().infoBrowser(function (err, info) {
                if (err) dlDeferred.reject(err);
                connector.ds().downloadLink(info, function (err, result) {
                    callbackHelper(err, result, dlDeferred);
                });
            });
            return dlDeferred.promise;
        }


        // Helper function to reject or resolve the promise when appropriate
        function callbackHelper(err, result, promise) {
            if (err) promise.reject(err);
            else promise.resolve(result);
        }
    }
})();