(function () {
    'use strict';

    angular.module('app.file-exchange')
           .service('FileService', FileService);


    function FileService($q, Connector, _) {
        this.getUploadPath = getUploadPath;
        this.getUploadFiles = getUploadFiles;
        this.getDownloadPath = getDownloadPath;
        this.getDownloadFiles = getDownloadFiles;
        this.updateUploadFiles = updateUploadFiles;
        this.updateDownloadFiles = updateDownloadFiles;
        this.setUploadPath = setUploadPath;
        this.setDownloadPath = setDownloadPath;

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
    }

})();