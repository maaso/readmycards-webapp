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
        .component('cardVisualizer', {
            templateUrl: 'views/demo/components/card-viz.html',
            bindings: {
                card: '<',
                cardData: '<'
            },
            controller: function (CardService) {
                var controller = this;
                controller.cardType = CardService.detectType(controller.card);
            }
        })
        .component('beidVisualizer', {
            templateUrl: 'views/demo/components/beid-viz.html',
            bindings: {
                rnData: '<',
                addressData: '<',
                picData: '<',
                certData: '<'
            },
            controller: function () {
                var controller = this;
            }
        })
        .component('emvVisualizer', {
            templateUrl: 'views/demo/components/emv-viz.html',
            bindings: {
                panData: '<'
            },
            controller: function () {
                var controller = this;
            }
        });

})();
