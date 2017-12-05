(function () {
    'use strict';

    const feButtons = {
        templateUrl: 'views/file-exchange/components/buttons.html',
        controller: function (FileService, $timeout) {
            let controller = this;
            controller.setDownload = setDownload;
            controller.setUpload = setUpload;
            controller.uploadPath = FileService.getUploadPath();
            controller.downloadPath = FileService.getDownloadPath();


            function setDownload() {
                return FileService.setDownloadPath().then(() => {
                    $timeout(() => {
                        FileService.updateDownloadFiles().then(res => {
                            console.log(res);
                        });
                    }, 1000);
                });
            }

            function setUpload() {
                return FileService.setUploadPath().then(() => {
                    $timeout(() => {
                        FileService.updateUploadFiles().then(res => {
                            console.log(res);
                        });
                    }, 1000);
                });
            }

        }
    };

    const feFileList = {
        templateUrl: 'views/file-exchange/components/file-list.html',
        bindings: {
            fileList: '<'
        },
        controller: function($uibModal) {
            let controller = this;
            controller.signFile = signFile;
            controller.setFileTypeClass = setFileTypeClass;
            console.log(controller.fileList);


            function signFile(file) {
                console.log(file);

                let modal = $uibModal.open({
                    templateUrl: "views/file-exchange/modals/sign-and-download.html",
                    resolve: {
                        file: () => {
                            return file;
                        }
                    },
                    backdrop: 'static',
                    controller: 'FileSignController',
                    size: 'lg'
                });

                modal.result.then(function () {
                    // TODO handle result
                }, function (err) {
                    // TODO handle error
                });
            }

            function setFileTypeClass(file) {
                switch (file.extension.toLowerCase()) {
                    case '.doc':
                    case '.docx':
                        file.fileTypeClass = 'fa-file-word-o';
                        file.fileTypeName = 'Word';
                        break;
                    case '.jpg':
                    case '.jpeg':
                    case '.gif':
                    case '.png':
                        file.fileTypeClass = 'fa-file-image-o';
                        file.fileTypeName = 'Image';
                        break;
                    case '.ppt':
                    case '.pptx':
                        file.fileTypeClass = 'fa-file-powerpoint-o';
                        file.fileTypeName = 'PowerPoint';
                        break;
                    case '.pdf':
                        file.fileTypeClass = 'fa-file-pdf-o';
                        file.fileTypeName = 'PDF';
                        break;
                    case '.xls':
                    case '.xlsx':
                        file.fileTypeClass = 'fa-file-excel-o';
                        file.fileTypeName = 'Excel';
                        break;
                    default:
                        file.fileTypeClass = 'fa-file-text-o';
                        file.fileTypeName = 'Other';
                }
            }
        }
    };



    angular.module('app.file-exchange')
           .component('feButtons', feButtons)
           .component('feFileList', feFileList);
})();
