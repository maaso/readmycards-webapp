(function () {
    'use strict';

    angular.module('app.summary')
        .service('SummaryUtils', SummaryUtils);

    function SummaryUtils($http) {
        this.downloadDocument = downloadDocument;
        this.downloadRaw = downloadRaw;

        function downloadDocument(documentName) {
            return $http.post('api/cards/be/download', { documentName: documentName }, { responseType: 'arraybuffer' });
        }

        function downloadRaw(viewLink) {
            return $http.post('api/cards/lux/download', { url: viewLink });

        }
    }


})();