(function () {
    'use strict';

    angular.module('app.cards.pteid')
           .service('PtUtils', PtUtils);

    function PtUtils($q, $http, API, Core, _) {
        this.address = address;
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

        function address(readerId, pin) {
            // console.log(readerId);
            // console.log(pin);
            // return $q.when({
            //     data: {
            //         abbr_building_type: "",
            //         abbr_street_type: "AV",
            //         building_type: "",
            //         civil_parish: "110623",
            //         civil_parish_description: "Nossa Senhora de Fátima",
            //         district: "11",
            //         district_description: "Lisboa",
            //         door_no: "202",
            //         floor: "",
            //         gen_address_num: "200801",
            //         is_national: true,
            //         locality: "Lisboa",
            //         municipality: "1106",
            //         municipality_description: "Lisboa",
            //         place: "",
            //         postal_locality: "LISBOA",
            //         raw_data: "TgBQVAAAMTEAAExpc2JvYQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAxMTA2AAAAAExpc2JvYQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAxMTA2MjMAAAAAAABOb3NzYSBTZW5ob3JhIGRlIEbDoXRpbWEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQVYAAAAAAAAAAAAAAAAAAAAAAABBdmVuaWRhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANSBkZSBPdXR1YnJvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAyMDIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAExpc2JvYQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAxMDUwAAAAADA2NQAAAExJU0JPQQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwODAxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            //         side: "",
            //         street_name: "5 de Outubro",
            //         street_type: "Avenida",
            //         type: "N",
            //         zip3: "065",
            //         zip4: "1050"
            //     },
            //     success: true
            // });
            return Core.getConnector().pteid(readerId).address({ pin });
        }

        function verifyPin(readerId, pin) {
            return Core.getConnector().verifyPin(readerId, { pin });
        }
    }


})();