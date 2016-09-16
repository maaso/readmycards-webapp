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
                readerWithCard: '<'
            },
            controller: function ($scope, CardService, T1C) {
                var controller = this;
                controller.readAnother = readAnother;
                controller.cardType = CardService.detectType(controller.readerWithCard.card);
                this.$onInit = function () {
                    controller.loading = true;
                    // Detect Type and read data
                    T1C.readAllData(controller.readerWithCard.id, controller.readerWithCard.card).then(function (res) {
                        controller.card = controller.readerWithCard.card;
                        controller.cardData = res.data;
                        console.log(controller.cardData);
                        controller.loading = false;
                    });
                };

                function readAnother() {
                    $scope.$emit('read-another-card');
                }

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
