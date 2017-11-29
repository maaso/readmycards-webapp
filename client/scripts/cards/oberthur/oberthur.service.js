(function () {
    'use strict';

    angular.module('app.cards.oberthur')
        .service('OberthurUtils', OberthurUtils);

    function OberthurUtils($http, $q) {
        this.generateXMLToSign = generateXMLToSign;


        function generateXMLToSign() {
            // TODO update urls
            return $http.post('api/cards/lux/xmltosign').then(res => {
                return res.data;
            })
        }
    }


})();