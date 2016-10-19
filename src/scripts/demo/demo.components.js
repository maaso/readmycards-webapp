(function () {
    'use strict';

    angular.module('app.demo')
        .component('reader', {
            templateUrl: 'views/demo/components/reader.html',
            bindings: {
                reader: '<'
            },
            controller: function ($state, CardService) {
                var controller = this;
                this.CardService = CardService;
                this.selectReader = selectReader;

                function selectReader() {
                    $state.go('root.reader', { readerId: controller.reader.id });
                }
            }
        })


})();
