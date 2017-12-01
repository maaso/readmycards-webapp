(function () {
    'use strict';

    angular.module('app.file-exchange')
           .service('FileService', FileService);


    function FileService($q, Connector) {
        this.getUploadPath = getUploadPath;
        this.getDownloadPath = getDownloadPath;
        this.setUploadPath = setUploadPath;
        this.setDownloadPath = setDownloadPath;

        let uploadPath = {
            value: ''
        }, downloadPath = {
            value: ''
        };

        function getUploadPath() {
            return uploadPath;
        }

        function getDownloadPath() {
            return downloadPath;
        }

        function setUploadPath() {
            console.log("upload path");
            return Connector.plugin('fileExchange', 'setFolder', [], []).then(res => {
                uploadPath.value = res.data;
                return uploadPath;
            });
        }

        function setDownloadPath() {
            return Connector.plugin('fileExchange', 'setFolder', [], []).then(res => {
                downloadPath.value = res.data;
                return downloadPath;
            });
        }
    }

})();