(function () {
    'use strict';


    const printSummary = {
        template: '<span class="btn btn-lg btn-primary btn-summary-download" ng-click="$ctrl.printFunction()()">Print legal copy of my card</span>',
        bindings: {
            printFunction: '&'
        }
    };

    angular.module('app.cards')
        .component('printSummary', printSummary);
})();
