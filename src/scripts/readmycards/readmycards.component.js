(function () {
    'use strict';

    angular.module('app.readmycards')
        .component('cardVisualizer', {
            templateUrl: 'views/demo/components/card-viz.html',
            bindings: {
                readerId: '<'
            },
            controller: function ($scope, CardService, T1C) {
                var controller = this;
                controller.readAnother = readAnother;
                this.$onInit = function () {
                    controller.loading = true;
                    console.log(controller.readerId);
                    // Detect Type and read data
                    T1C.getReader(controller.readerId).then(function (readerInfo) {
                        console.log(readerInfo);
                        controller.cardType = CardService.detectType(readerInfo.data.card);
                        T1C.readAllData(readerInfo.data.id, readerInfo.data.card).then(function (res) {
                            controller.card = readerInfo.data.card;
                            controller.cardData = res.data;
                            console.log(controller.cardData);
                            controller.loading = false;
                        }, function (error) {
                            controller.errorReadingCard = true;
                            controller.loading = false;
                            console.log(error);
                        });
                    })
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
        .component('readerSelect', {
            templateUrl: 'views/readmycards/components/reader-list.html',
            controller: function ($scope, $state, T1C, CardService, _) {
                var controller = this;
                this.$onInit = function () {
                    T1C.getReadersWithCards().then(function (res) {
                        console.log(res);
                        controller.readers = res.data;
                        _.forEach(controller.readers, function (reader) {
                            reader.cardType = CardService.detectType(reader.card);
                        })
                    })
                };
            }
        })
        .component('readerIcon', {
            templateUrl: 'views/readmycards/components/reader-icon.html',
            bindings: {
                index: '<',
                reader: '<'
            }
        })
        .component('rmcHeader', {
            templateUrl: 'views/readmycards/components/header.html'
        })
        .component('rmcFooter', {
            templateUrl: 'views/readmycards/components/footer.html'
        })
})();
