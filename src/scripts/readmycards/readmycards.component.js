(function () {
    'use strict';

    angular.module('app.readmycards')
        .component('rmcFlow', {
            templateUrl: 'views/readmycards/components/flow.html',
            bindings: {
                policies: '<',
                editable: '<',
                type: '@'
            },
            controller: function () {
                var controller = this;
                this.$onInit = function() {

                };
            }
        })
        .component('downloadGcl', {
            templateUrl: 'views/readmycards/components/download.html',
            bindings: {
                dlUrl: '<'
            }
        })
        .component('readerPolling', {
            templateUrl: 'views/readmycards/components/reader-polling.html'
        })
        .component('cardPolling', {
            templateUrl: 'views/readmyCards/components/card-polling.html'
        })
        .component('rmcHeader', {})
        .component('rmcFooter', {})
})();
