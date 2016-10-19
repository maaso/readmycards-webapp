(function () {
    'use strict';

    angular.module('app.readmycards')
        .component('cardVisualizer', {
            templateUrl: 'views/demo/components/card-viz.html',
            bindings: {
                readerId: '<'
            },
            controller: function ($scope, $rootScope, CardService, T1C, WebTask) {
                var controller = this;
                controller.readAnother = readAnother;
                this.registerUnknownType = registerUnknownType;
                this.showSupportedCardTypes = toggleCardTypes;

                this.$onInit = function () {
                    controller.loading = true;
                    controller.errorReadingCard = false;
                    controller.unknownCard = false;
                    // Detect Type and read data
                    T1C.getReader(controller.readerId).then(function (readerInfo) {
                        controller.cardType = CardService.detectType(readerInfo.data.card);
                        controller.card = readerInfo.data.card;
                        console.log(readerInfo);

                        if (controller.cardType === 'Unknown') {
                            // TODO Now manually triggered, should this not be automatic?
                            // registerUnknownType();
                            controller.unknownCard = true;
                            controller.loading = false;
                        } else {
                            T1C.readAllData(readerInfo.data.id, readerInfo.data.card).then(function (res) {
                                controller.cardData = res.data;
                                controller.loading = false;
                            }, function (error) {
                                controller.errorReadingCard = true;
                                controller.loading = false;
                                console.log(error);
                            });
                        }
                    })
                };

                $scope.$on('reinit-viz', function () {
                    controller.$onInit();
                });

                function registerUnknownType(cardDescription) {
                    controller.submitted = true;
                    WebTask.storeUnknownCardInfo(controller.card, cardDescription);
                }

                function toggleCardTypes() {
                    $rootScope.$broadcast('card-type-toggle');
                }

                function readAnother() {
                    $scope.$emit('read-another-card', controller.readerId);
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
                var controller = this;
                this.$onInit = function () {
                    pollForGcl();
                };
                this.registerDownload = registerDownload;

                function pollForGcl() {
                    $timeout(function () {
                        T1C.getInfo().then(function (res) {
                            // Info retrieved, GCL is installed
                            $scope.$emit('gcl');
                        }, function (err) {
                            pollForGcl();
                        });
                    }, 2500)
                }

                function registerDownload(mail) {
                    controller.waitingForInstall = true;
                    WebTask.storeDownloadInfo(mail, controller.dlUrl);
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
            controller: function ($scope, $state, $timeout, T1C, CardService, _) {
                var controller = this;
                this.$onInit = function () {
                    controller.readers = [];
                    refreshList();
                };

                function refreshList() {
                    T1C.getReadersWithCards().then(function (res) {
                        if (res.data.length != controller.readers.length) {
                            controller.readers = res.data;
                            _.forEach(controller.readers, function (reader) {
                                reader.cardType = CardService.detectType(reader.card);
                            });
                        }
                    })
                }

                function timedRefresh() {
                    $timeout(function () {
                        refreshList();
                        timedRefresh();
                    }, 2500)
                }

                timedRefresh();

                $scope.$on('reinit-viz', function () {
                    refreshList();
                });
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
            templateUrl: 'views/readmycards/components/header.html',
            controller: function ($scope) {
                var controller = this;
                this.toggleCardTypes = toggleCardTypes;

                function toggleCardTypes() {
                    $scope.$emit('card-type-toggle');
                }

                $scope.$on('card-type-toggle', function () {
                    controller.menuOpen = !controller.menuOpen;
                });

                $scope.$on('close-sidebar', function () {
                    controller.menuOpen = false;
                })
            }
        })
        .component('rmcFaq', {
            templateUrl: 'views/readmycards/components/faq.html'
        })
        .component('rmcFooter', {
            templateUrl: 'views/readmycards/components/footer.html',
            controller: function ($scope) {
                this.toggleFAQ = toggleFAQ;

                function toggleFAQ() {
                    $scope.$emit('faq-toggle');
                }
            }
        })
})();
