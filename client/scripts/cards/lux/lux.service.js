(function () {
    'use strict';

    angular.module('app.cards.lux')
        .service('LuxUtils', LuxUtils);

    function LuxUtils($http, $q, T1C, _) {
        this.formatBirthDate = formatBirthDate;
        this.formatValidity = formatValidity;


        function formatBirthDate(dob) {
            // assume 1900
            let prefix = '19';
            let dobYear = parseInt(dob.substr(0,2));

            if (dobYear < parseInt(moment().format('YY'))) {
                // probably 2000
                prefix = '20';
            }
            return moment(prefix + dob, 'YYYYMMDD').format('DD.MM.YYYY');
        }


        function formatValidity(date) {
            return moment(date, 'YYMMDD').format('DD.MM.YYYY');
        }

    }

})();