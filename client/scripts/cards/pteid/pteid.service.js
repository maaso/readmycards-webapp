(function () {
    'use strict';

    angular.module('app.cards.pteid')
           .service('PtUtils', PtUtils);

    function PtUtils($http, API, Core, _) {
        this.generateSummaryToSign = generateSummaryToSign;
        this.verifyPin = verifyPin;

        function generateSummaryToSign(readerId) {
            let pt = Core.getConnector().pteid(readerId);

            return pt.idData().then(idData => {
                return API.convertJPEG2000toJPEG(idData.data.photo).then(photo => {
                    let documentNumberComponents = _.split(idData.data.document_number, " ");
                    let summaryData = {
                        idData: idData.data,
                        photo: photo.data.base64Pic,
                        printDate: moment().format('MMMM D, YYYY'),
                        printedBy: '@@name v@@version',
                        docNumberPart1: _.pullAt(documentNumberComponents, 0)[0],
                        docNumberPart2: _.join(documentNumberComponents, " ")
                    };

                    return $http.post('api/cards/pt/summarytosign', summaryData).then(function (res) {
                        return res.data;
                    });
                });
            });
        }

        function verifyPin(readerId, pin) {
            return Core.getConnector().verifyPin(readerId, { pin });
        }
    }


})();