(function () {
    'use strict';

    const documentViewer = {
        templateUrl: 'views/file-exchange/components/document-viewer.html',
        bindings: {
            doc: '<'
        },
        controller: function($scope, $q, $sce, $filter, $timeout, FileService, DOC_VIEWER) {
            let controller = this;
            controller.loading = true;
            controller.trustedLink = trustedLink;
            // Make sure the DOM has loaded our frame
            $timeout(function () {
                let viewerId = 'pdf-viewer';
                let pdfjsFrame = document.getElementById(viewerId);
                // get doc data
                FileService.retrieveFile(controller.doc.path).then(res => {
                    console.log(res);
                    controller.loading = false;
                    let fileReader = new FileReader();
                    fileReader.onload = function() {
                        pdfjsFrame.contentWindow.PDFViewerApplication.open(this.result);
                    };
                    fileReader.readAsArrayBuffer(res.data);
                }, () => {
                    controller.loading = false;
                    controller.fail = true;
                });
            }, 250);

            let viewerUrl = DOC_VIEWER.PDFJS_VIEWER_BASE_URL;

            function trustedLink() {
                return $sce.trustAsResourceUrl(viewerUrl);
            }
        },
    };

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
                    FileService.updateDownloadFiles();
                });
            }

            function setUpload() {
                return FileService.setUploadPath().then(() => {
                    FileService.updateUploadFiles();
                });
            }

        }
    };

    const feFileList = {
        templateUrl: 'views/file-exchange/components/file-list.html',
        bindings: {
            fileList: '<',
            showActions: '<'
        },
        controller: function($uibModal, FileService, toastr) {
            let controller = this;
            controller.signFile = signFile;
            controller.setFileTypeClass = setFileTypeClass;
            controller.viewFile = viewFile;

            function signFile(file) {
                // check download path is set
                if (FileService.isDownloadSet()) {
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
                        toastr.success('The signed PDF is now available in the download folder', 'Signed PDF downloaded');
                    }, function (err) {
                        // TODO handle error
                    });
                } else {
                    toastr.info('Please set the download path first!', 'Download path not set')
                }
            }

            function viewFile(file) {
                if (file.extension === '.pdf') {
                    $uibModal.open({
                        templateUrl: "views/file-exchange/modals/document-view.html",
                        resolve: {
                            file: () => {
                                return file;
                            }
                        },
                        controller: 'DocumentViewController',
                        size: 'lg'
                    });
                } else {
                    toastr.info('Currently only viewing PDF files is supported', 'File type not supported');
                }

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
           .component('documentViewer', documentViewer)
           .component('feButtons', feButtons)
           .component('feFileList', feFileList);
})();