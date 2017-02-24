(function () {
    'use strict';

    angular.module('app.summary')
        .service('SummaryUtils', SummaryUtils);

    function SummaryUtils($http) {
        this.downloadDocument = downloadDocument;

        function downloadDocument(documentName) {
            return $http.post('api/cards/be/download', { documentName: documentName }, { responseType: 'arraybuffer' });
        }
    }


})();