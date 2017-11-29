(function () {
    'use strict';

    angular.module('app.cards.mobib')
        .service('MobibUtils', MobibUtils);

    function MobibUtils($q, _) {
        this.getContractName = getContractName;
        this.formatBirthDate = formatBirthDate;
        this.formatValidity = formatValidity;

        const contracts = {
            '250': 'SNCB Route (mono-operator)',
            '260': 'SNCB Net (mono-operator)',
            '280': 'SNCB School (mono-operator)',
            '300': 'GO UNLIMITED, 1 Holiday Period (mono-operator)',
            '301': 'GO UNLIMITED, 1 year (mono-operator)',
            '15361': 'JUMP 1 Trip',
            '15362': 'JUMP 5 Trips',
            '15363': 'JUMP 10 Trips',
            '15364': 'JUMP 24 H',
            '15365': 'JUMP 48 H',
            '15366': 'JUMP 72 H',
            '15367': 'JUMP Roundtrip',
            '15416': 'LP Patriotique',
            '3086': 'Abo SNCB Route,STIB',
            '3092': 'Abo SNCB School,STIB',
            '3098': 'Abo SNCB Net,STIB',
            '9230': 'Abo SNCB Route,TEC NEXT',
            '9231': 'Abo SNCB Route,TEC HORIZON',
            '9232': 'Abo SNCB Route,TEC HORIZON+',
            '9236': 'Abo SNCB School,TEC NEXT',
            '9237': 'Abo SNCB School,TEC HORIZON',
            '9238': 'Abo SNCB School,TEC HORIZON+',
            '9242': 'Abo SNCB Net,TEC NEXT',
            '9243': 'Abo SNCB Net,TEC HORIZON',
            '9244': 'Abo SNCB Net,TEC HORIZON+',
            '11278': 'Abo SNCB Route,STIB,TEC NEXT',
            '11279': 'Abo SNCB Route,STIB,TEC HORIZON',
            '11280': 'Abo SNCB Route,STIB,TEC HORIZON+',
            '11284': 'Abo SNCB School,STIB,TEC NEXT',
            '11285': 'Abo SNCB School,STIB,TEC HORIZON',
            '11286': 'Abo SNCB School,STIB,TEC HORIZON+',
            '11290': 'Abo SNCB Net,STIB,TEC NEXT',
            '11291': 'Abo SNCB Net,STIB,TEC HORIZON',
            '11292': 'Abo SNCB Net,STIB,TEC HORIZON+',
            '5134': 'Abo SNCB Route,DELIJN OMNIPAS',
            '13326': 'Abo SNCB Route,DELIJN OMNIPAS,TEC NEXT',
            '13327': 'Abo SNCB Route,DELIJN OMNIPAS,TEC HORIZON',
            '13328': 'Abo SNCB Route,DELIJN OMNIPAS,TEC HORIZON+',
            '5137': 'Abo SNCB Route,DELIJN BUZZY',
            '13329': 'Abo SNCB Route,DELIJN BUZZY,TEC NEXT',
            '13330': 'Abo SNCB Route,DELIJN BUZZY,TEC HORIZON',
            '13331': 'Abo SNCB Route,DELIJN BUZZY,TEC HORIZON+',
            '7182': 'Abo SNCB Route,STIB,DELIJN OMNIPAS',
            '7185': 'Abo SNCB Route,STIB,DELIJN BUZZY',
            '5140': 'Abo SNCB School,DELIJN Buzzy',
            '13332': 'Abo SNCB School,DELIJN Buzzy,TEC NEXT',
            '13333': 'Abo SNCB School,DELIJN Buzzy,TEC HORIZON',
            '13334': 'Abo SNCB School,DELIJN Buzzy,TEC HORIZON+',
            '5143': 'Abo SNCB School,DELIJN OMNIPAS',
            '13335': 'Abo SNCB School,DELIJN OMNIPAS,TEC NEXT',
            '13336': 'Abo SNCB School,DELIJN OMNIPAS,TEC HORIZON',
            '13337': 'Abo SNCB School,DELIJN OMNIPAS,TEC HORIZON+',
            '7188': 'Abo SNCB School,STIB,DELIJN Buzzy ',
            '7191': 'Abo SNCB School,STIB,DELIJN OMNIPAS ',
            '5146': 'Abo SNCB Net,DELIJN OMNIPAS',
            '13338': 'Abo SNCB Net,DELIJN OMNIPAS,TEC NEXT',
            '13339': 'Abo SNCB Net,DELIJN OMNIPAS,TEC HORIZON',
            '13340': 'Abo SNCB Net,DELIJN OMNIPAS,TEC HORIZON+',
            '5149': 'Abo SNCB Net,DELIJN BUZZY',
            '13341': 'Abo SNCB Net,DELIJN BUZZY,TEC NEXT',
            '13342': 'Abo SNCB Net,DELIJN BUZZY,TEC HORIZON',
            '13343': 'Abo SNCB Net,DELIJN BUZZY,TEC HORIZON+',
            '7194': 'Abo SNCB Net,STIB,DELIJN OMNIPAS  ',
            '7197': 'Abo SNCB Net,STIB,DELIJN BUZZY',
            '8206': 'Abo TEC Next',
            '8207': 'Abo TEC Horizon',
            '8208': 'Abo TEC Horizon+',
            '2062': 'Abo STIB CityNet',
            '10254': 'Abo TEC Next , STIB CityNet',
            '10255': 'Abo TEC Horizon, STIB CityNet',
            '10256': 'Abo TEC Horizon+, STIB CityNet',
            '4110': 'Abo DELIJN OMNIPAS ',
            '12302': 'Abo DELIJN OMNIPAS + TEC Next',
            '12303': 'Abo DELIJN OMNIPAS + TEC Horizon',
            '12304': 'Abo DELIJN OMNIPAS + TEC Horizon+',
            '6158': 'Abo DELIJN OMNIPAS + STIB CityNet',
            '4113': 'Abo DELIJN BUZZY',
            '12305': 'Abo DELIJN BUZZY + TEC Next',
            '12306': 'Abo DELIJN  BUZZY + TEC Horizon',
            '12307': 'Abo DELIJN  BUZZY + TEC Horizon+',
            '6161': 'Abo DELIJN  BUZZY + STIB CityNet',
            '9254': 'TEC Next+ SNCB Agglomeration, 12-24 ans, plein tarif',
            '9255': 'TEC Next+ SNCB Agglomeration, 25-64 ans, plein tarif',
            '9256': 'TEC Next+ SNCB Agglomeration, 12-24 ans, tarif reduit',
            '9257': 'TEC Next+ SNCB Agglomeration, 25-64 ans, tarif reduit',
            '13350': 'TEC Next+ SNCB Agglomeration+De Lijn, 12-24 ans, plein tarif',
            '13351': 'TEC Next+ SNCB Agglomeration+De Lijn, 25-64 ans, plein tarif',
            '13352': 'TEC Next+ SNCB Agglomeration+De Lijn, 12-24 ans, tarif reduit',
            '13353': 'TEC Next+ SNCB Agglomeration+De Lijn, 25-64 ans, tarif reduit',
            '9273': 'TEC Next+ SNCB Agglomeration, 12-24 ans, plein tarif',
            '9274': 'TEC Next+ SNCB Agglomeration, 25-64 ans, plein tarif',
            '9275': 'TEC Next+ SNCB Agglomeration, 12-24 ans, tarif reduit',
            '9276': 'TEC Next+ SNCB Agglomeration, 25-64 ans, tarif reduit',
            '13369': 'TEC Next+ SNCB Agglomeration+De Lijn, 12-24 ans, plein tarif',
            '13370': 'TEC Next+ SNCB Agglomeration+De Lijn, 25-64 ans, plein tarif',
            '13371': 'TEC Next+ SNCB Agglomeration+De Lijn, 12-24 ans, tarif reduit',
            '13372': 'TEC Next+ SNCB Agglomeration+De Lijn, 25-64 ans, tarif reduit',
            '605': 'MTB 1 mois',
            '655': 'MTB annuel 25-64 MOBIB',
            '351': 'Abo SNCB Route+STIB Abo - Semaine (25-64 ans)',
            '352': 'Abo SNCB Route+STIB Abo - 1 Mois (25-64 ans)',
            '353': 'Abo SNCB Route+STIB Abo - 3 Mois (25-64 ans)',
            '354': 'Abo SNCB Route+STIB Abo - 12 Mois (25-64 ans)',
            '355': 'Abo SNCB Route+STIB Abo - Semaine (-25 ans)',
            '356': 'Abo SNCB Route+STIB Abo - 1 Mois (-25 ans)',
            '357': 'Abo SNCB Route+STIB Abo - 3 Mois (-25 ans)',
            '358': 'Abo SNCB Route+STIB Abo - 12 Mois (-25 ans)',
            '359': 'Abo SNCB Route+STIB Abo - Semaine (65+ ans)',
            '360': 'Abo SNCB Route+STIB Abo - 1 Mois (65+ ans)',
            '361': 'Abo SNCB Route+STIB  Abo - 3 Mois (65+ ans)',
            '362': 'Abo SNCB Route+STIB Abo - 12 Mois (65+ ans)',
            '380': 'Abo scol SNCB+STIB - Semaine (base)',
            '381': 'Abo scol SNCB+STIB - 1 Mois (base)',
            '382': 'Abo scol SNCB+STIB - 3 Mois (base)',
            '384': 'Abo scol SNCB+STIB - Semaine (Junior)',
            '385': 'Abo scol SNCB+STIB - 1 Mois (Junior)',
            '386': 'Abo scol SNCB+STIB - 3 Mois (Junior)',
            '388': 'Abo SNCB Net+STIB - Semaine (25-64)',
            '389': 'Abo SNCB Net+STIB - 1 Mois (base)',
            '390': 'Abo SNCB Net+STIB - 3 Mois (25-64)',
            '392': 'Abo SNCB Net+STIB - Semaine (Junior)',
            '393': 'Abo SNCB Net+STIB - 1 Mois (Junior)',
            '394': 'Abo SNCB Net+STIB - 3 Mois (Junior)',
            '396': 'Abo SNCB Net+STIB - Semaine (65+)',
            '397': 'Abo SNCB Net+STIB - 1 Mois (65+)',
            '398': 'Abo SNCB Net+STIB - 3 Mois (65+)',
            '321': 'MTB Région annuel',
            '610': 'MTB Mensuel',
            '960': 'MTB MOBIB Annuel LP Annuel O Ay droit payant',
            '935': 'MTB MOBIB annuel Agent gratuit',
            '936': 'MTB MOBIB annuel 1er Ay droit gratuit',
            '720': 'MTB Scolaire FO 1er enfant',
            '721': 'MTB Scolaire FO 2ième entant',
            '722': 'MTB Scolaire FO 2ième enfant CF',
            '725': 'MTB Scolaire FO 1er enfant CF',
            '730': 'MTB Scolaire  1er enfant',
            '731': 'MTB Scolaire  2ième enfant',
            '732': 'MTB Scolaire  3ième et plus',
            '734': 'MTB Scolaire FN 4ième et plus',
            '735': 'MTB Scolaire FN 1er enfant CF',
            '736': 'MTB Scolaire FN 2ième enfant CF',
            '737': 'MTB Scolaire FN 3ième et plus CF',
            '738': 'MTB Scolaire FN 4ième et plus CF',
            '350': 'Billet SNCB+STIB 1 day',
            '363': 'B-Excursion indiv. SNCB+STIB ENFANT',
            '365': 'B-Excursion indiv. SNCB+STIB Adulte',
            '366': 'B-Excursion groupe scolaire SNCB+STIB',
            '367': 'B-Excursion groupe SNCB+STIB',
            '364': 'B-Excursion Indiv.SNCB +STIB 1j'
        };
        const counterTypes = {
            '1': { fields: ['date', 'journeys']},
            '2': { fields: ['journeys']},
            '3': { fields: ['journeys']}, // reverse order!
            '4': { fields: ['time']},
            '5': { fields: ['days', 'date']}, // date = date of last validation, days = remaining days
            '6': { fields: ['time', 'journeys']},
            '7': { fields: ['time', 'days']},
        };


        function getContractName(typeId) {
            if (_.has(contracts, typeId)) return contracts[typeId];
            else return 'Unknown Contract Type'
        }

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