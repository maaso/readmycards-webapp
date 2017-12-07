(function () {
    'use strict';

    angular.module('app.file-exchange')
           .service('FileService', FileService);


    function FileService($q, Connector, CardService, $http, _) {
        this.getUploadPath = getUploadPath;
        this.getUploadFiles = getUploadFiles;
        this.getDownloadPath = getDownloadPath;
        this.getDownloadFiles = getDownloadFiles;
        this.updateUploadFiles = updateUploadFiles;
        this.updateDownloadFiles = updateDownloadFiles;
        this.setUploadPath = setUploadPath;
        this.setDownloadPath = setDownloadPath;
        this.isUploadSet = isUploadSet;
        this.isDownloadSet = isDownloadSet;
        this.retrieveFile = retrieveFile;
        this.retrieveAnduploadFile = retrieveAndUploadFile;
        this.downloadFileToGCL = downloadFileToGCL;
        this.signDocument = signDocumentWithPin;
        this.downloadFromSignbox = downloadFromSignbox;

        let uploadPath = {
            value: ''
        }, downloadPath = {
            value: ''
        };

        let uploadFiles = [], downloadFiles = [];

        const extensions = [
            '.pdf', '.doc', '.docx',
            '.xls', '.xlsx', '.ppt',
            '.pptx', '.dwg', '.jpg',
            '.jpeg', '.tiff', '.png',
            '.gif', '.bmp'
        ];

        function getUploadPath() {
            return uploadPath;
        }

        function getUploadFiles() {
            return uploadFiles;
        }

        function getDownloadPath() {
            return downloadPath;
        }

        function getDownloadFiles() {
            return downloadFiles;
        }

        function updateUploadFiles() {
            return Connector.plugin('fileExchange', 'listFiles', [], [{ path: uploadPath.value, extensions }]).then(res => {
                processFiles(res.data);
                uploadFiles = res.data;
                return uploadFiles;
            });
            //
            // return $q.when(angular.fromJson({
            //     "data": [
            //         {
            //             "extension": ".jpg",
            //             "last_modification_time": "20171002T162819",
            //             "name": "2017-10-02_18-28-19.jpg",
            //             "path": "/Users/user/FOLDER/2017-10-02_18-28-19.jpg",
            //             "size": 1211387
            //         },
            //         {
            //             "extension": ".pdf",
            //             "last_modification_time": "20171122T124037",
            //             "name": "week-1.pdf",
            //             "path": "/Users/user/FOLDER/week-1.pdf",
            //             "size": 372846
            //         }
            //     ],
            //     "success": true
            // })).then(res => {
            //     _.forEach(res.data, file => {
            //         file.last_modification_date = moment(file.last_modification_time).format('YYYY-MM-DD');
            //         file.last_modification_time = moment(file.last_modification_time).format('HH:MM:SS');
            //     });
            //     uploadFiles = res.data;
            //     return uploadFiles;
            // });
        }

        function updateDownloadFiles() {
            return Connector.plugin('fileExchange', 'listFiles', [], [{ path: downloadPath.value, extensions }]).then(res => {
                processFiles(res.data);
                downloadFiles = res.data;
                return downloadFiles;
            });
        }

        function processFiles(files) {
            _.forEach(files, file => {
                file.last_modification_date = moment(file.last_modification_time).format('YYYY-MM-DD');
                file.last_modification_time = moment(file.last_modification_time).format('HH:MM');
            });
        }

        function setUploadPath() {
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

        function isDownloadSet() {
            return !_.isEmpty(downloadPath.value);
        }

        function isUploadSet() {
            return !_.isEmpty(uploadPath.value);
        }

        function retrieveFile(filePath) {
            return Connector.plugin('fileExchange', 'uploadFile', [], [filePath]);
        }

        function retrieveAndUploadFile(filePath, fileName) {
            return retrieveFile(filePath).then(res => {
                let fd = new FormData();
                fd.append('file', new Blob([res.data], { type: res.headers['content-type'] }));
                fd.append('fileName', fileName);
                return $http.post('/api/sign-file', fd, { transformRequest: angular.identity, headers: { 'Content-Type': undefined }});
            });
        }

        function downloadFileToGCL(filePath, fileBuffer, fileName) {
            return Connector.plugin('fileExchange', 'downloadFile', [], [filePath, fileBuffer, fileName]);
        }

        function downloadFromSignbox(documentName) {
            return $http.post('api/sign-file/dl', { documentName: documentName }, { responseType: 'arraybuffer' });
        }

        function signDocumentWithPin(documentId, readerId, hasPinpad, pin) {

            let signing = $q.defer();

            CardService.determineType(readerId, pin).then(CardService.getSignDataForType).then(prepData => {
                let docData = angular.copy(prepData);
                docData.docId = documentId;

                return dataToSign(docData)
                    .then(function (dataToSign) {
                        return $q.when({ readerId: readerId, pin: pin, dataToSign: dataToSign });
                    })
                    .then(signWithConnector)
                    .then(function (signedData) {
                        docData.signedData = signedData;
                        return $q.when(docData);
                    })
                    .then(workflowSign)
                    .then(() => {
                        signing.resolve();
                    });
            });

            return signing.promise;
        }


        function signWithConnector (inputObj) {
            return Connector.promise().then(connector => {
                return connector.sign(inputObj.readerId,
                    { pin: inputObj.pin, data: inputObj.dataToSign.bytes, algorithm_reference: inputObj.dataToSign.digestAlgorithm }).then(res => {
                    return res.data;
                });
            });
        }

        // Needs proxy
        function dataToSign(docData) {
            return $http.post('api/sign-file/data', docData).then(function (res) {
                return res.data;
            })
        }

        // Needs proxy
        function workflowSign(docData) {
            return $http.post('api/sign-file/workflow-sign', docData).then(function (res) {
                return res.data;
            });
        }
    }

})();