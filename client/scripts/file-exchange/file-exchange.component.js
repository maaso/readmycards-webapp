(function () {
    'use strict';

    const feButtons = {
        templateUrl: 'views/file-exchange/components/buttons.html',
        controller: function (FileService) {
            let controller = this;
            controller.setDownload = setDownload;
            controller.setUpload = setUpload;
            controller.uploadPath = FileService.getUploadPath();
            controller.downloadPath = FileService.getDownloadPath();


            function setDownload() {
                return FileService.setDownloadPath();
            }

            function setUpload() {
                return FileService.setUploadPath();
            }

        }
    };

    const feFileList = {};



    angular.module('app.file-exchange')
           .component('feButtons', feButtons);
})();
