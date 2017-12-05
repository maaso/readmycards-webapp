(function () {
    'use strict';

    angular.module('app.file-exchange')
           .service('FileService', FileService);


    function FileService($q, Connector, FileSaver, $timeout, $http, _) {
        this.getUploadPath = getUploadPath;
        this.getUploadFiles = getUploadFiles;
        this.getDownloadPath = getDownloadPath;
        this.getDownloadFiles = getDownloadFiles;
        this.updateUploadFiles = updateUploadFiles;
        this.updateDownloadFiles = updateDownloadFiles;
        this.setUploadPath = setUploadPath;
        this.setDownloadPath = setDownloadPath;
        this.uploadFile = uploadFile;
        this.downloadFile = downloadFileToGCL;
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

        function uploadFile(filePath, fileName) {
            return Connector.plugin('fileExchange', 'uploadFile', [], [filePath]).then(res => {
                let fd = new FormData();
                fd.append('file', new Blob([res.data], { type: res.headers['content-type'] }));
                fd.append('fileName', fileName);
                return $http.post('/api/sign-file', fd, { transformRequest: angular.identity, headers: { 'Content-Type': undefined }});
            })
        }

        function downloadFileToGCL(filePath, fileBuffer, fileName) {
            return Connector.plugin('fileExchange', 'downloadFile', [], [filePath, fileBuffer, fileName]).then(res => {
                console.log(res);
            })
        }

        function downloadFromSignbox(documentName) {
            return $http.post('api/sign-file/dl', { documentName: documentName }, { responseType: 'arraybuffer' });
        }

        let citizenCertificate, fullName, nonRepudiationCertificate, rootCertificate;

        function signDocumentWithPin(documentId, readerId, hasPinpad, pin) {
            console.log(documentId);
            console.log(readerId);
            console.log(hasPinpad);
            citizenCertificate = '';
            fullName = '';
            nonRepudiationCertificate = '';
            rootCertificate = '';

            let signing = $q.defer();

            readRnData(readerId)
                .then(rootCert)
                .then(citizenCert)
                .then(nonRepudiationCert)
                .then(function () {
                    return $q.when(documentId);
                })
                .then(dataToSign)
                .then(function (dataToSign) {
                    if (hasPinpad) return $q.when({ readerId: readerId, pin: undefined, dataToSign: dataToSign });
                    else return $q.when({ readerId: readerId, pin: pin, dataToSign: dataToSign });
                })
                .then(signWithEid)
                .then(function (signedData) {
                    return $q.when({ documentId: documentId, signedData: signedData });
                })
                .then(workflowSign)
                .then(function () {
                    citizenCertificate = '';
                    fullName = '';
                    nonRepudiationCertificate = '';
                    rootCertificate = '';
                    signing.resolve();
                });

            return signing.promise;
        }

        // OK
        function readRnData(readerId) {
            return Connector.plugin('beid', 'rnData', [readerId]).then(result => {
                fullName = result.data.first_names.split(" ", 1) + ' ' + result.data.name;
                return readerId;
            });
        }

        // OK
        function signWithGcl(readerId, pin, hash, algorithm) {
            if (pin === null) { pin = undefined; }
            return Connector.plugin('beid', 'signData', [readerId], [{ pin: pin, algorithm_reference: algorithm, data: hash }]).then(res => {
                return res.data;
            }, function (err) {
                return $q.reject(err);
            });
        }

        // OK
        function rootCert(readerId) {
            return Connector.plugin('beid', 'rootCertificate', [readerId]).then(res => {
                rootCertificate = res.data.base64;
                return readerId;
            });
        }

        // OK
        function citizenCert(readerId) {
            return Connector.plugin('beid', 'citizenCertificate', [readerId]).then(res => {
                citizenCertificate = res.data.base64;
                return readerId;
            });
        }

        // OK
        function nonRepudiationCert(readerId) {
            return Connector.plugin('beid', 'nonRepudiationCertificate', [readerId]).then(res => {
                nonRepudiationCertificate = res.data.base64;
                return readerId;
            });
        }

        // Needs proxy
        function dataToSign(documentId) {
            return $http.post('api/sign-file/data', {
                docId: documentId,
                signCertificate: nonRepudiationCertificate,
                certificates: [
                    nonRepudiationCertificate,
                    citizenCertificate,
                    rootCertificate
                ],
                additionalInformation: {
                    name: fullName
                }
            }).then(function (res) {
                return res.data;
            })
        }

        // OK
        function signWithEid (inputObj) {
            let readerId = inputObj.readerId;
            let pin = inputObj.pin;
            let dataToSign = inputObj.dataToSign;
            return $q.when(signWithGcl(readerId, pin, dataToSign.bytes, dataToSign.digestAlgorithm));
        }

        // Needs proxy
        function workflowSign(inputObj) {
            return $http.post('api/sign-file/workflow-sign', {
                docId: inputObj.documentId,
                signCertificate: nonRepudiationCertificate,
                certificates: [
                    nonRepudiationCertificate,
                    citizenCertificate,
                    rootCertificate
                ],
                signedData: inputObj.signedData,
                additionalInformation: {
                    name: fullName
                }
            }).then(function (res) {
                return res.data;
            });
        }
    }

})();