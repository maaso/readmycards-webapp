(function () {
    'use strict';

    angular.module('app.readmycards')
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
                    }, function (error) {
                        controller.errorReadingCard = true;
                        controller.loading = false;
                        console.log(error);
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
        })
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
            },
            controller: function ($scope, T1C, $timeout, WebTask) {
                this.$onInit = function () {
                    pollForGcl();
                };
                this.registerDownload = registerDownload;

                function pollForGcl() {
                    $timeout(function () {
                        T1C.getInfo().then(function (res) {
                            // Info retrieved, GCL is installed
                            console.log(res);
                            $scope.$emit('gcl');
                        }, function (err) {
                            pollForGcl();
                        });
                    }, 2500)
                }

                function registerDownload() {
                    WebTask.storeDownloadInfo();
                }
            }
        })
        .component('readerPolling', {
            templateUrl: 'views/readmycards/components/reader-polling.html',
            bindings: {
                error: '<'
            },
            controller: function ($scope) {
                this.tryAgain = tryAgain;

                function tryAgain() {
                    $scope.$emit('retry-reader');
                }
            }
        })
        .component('cardPolling', {
            templateUrl: 'views/readmycards/components/card-polling.html',
            bindings: {
                error: '<'
            },
            controller: function ($scope) {
                this.tryAgain = tryAgain;

                function tryAgain() {
                    $scope.$emit('retry-card');
                }
            }
        })
        .component('rmcHeader', {
            templateUrl: 'views/readmycards/components/header.html'
        })
        .component('rmcFooter', {
            templateUrl: 'views/readmycards/components/footer.html'
        })
})();
