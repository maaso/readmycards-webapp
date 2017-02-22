(function () {
    'use strict';

    angular.module('app.readmycards')
        .component('cardVisualizer', {
            templateUrl: 'views/demo/components/card-viz.html',
            bindings: {
                readerId: '<'
            },
            controller: function ($scope, $timeout, $rootScope, CardService, T1C, API, RMC, EVENTS) {
                let controller = this;
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

                        if (controller.cardType === 'Unknown') {
                            // TODO Now manually triggered, should this not be automatic?
                            // registerUnknownType();
                            controller.unknownCard = true;
                            controller.loading = false;
                            RMC.monitorCardRemoval(controller.readerId, controller.card);
                        } else if (controller.cardType === 'MOBIB' || controller.cardType === 'MOBIB Basic') {
                            T1C.mobib.allData(controller.readerId).then(function (res) {
                                controller.cardData = res.data;
                                controller.loading = false;
                                RMC.monitorCardRemoval(controller.readerId, controller.card);
                            });
                        } else {
                            T1C.readAllData(readerInfo.data.id, readerInfo.data.card).then(function (res) {
                                controller.cardData = res.data;
                                controller.loading = false;
                                RMC.monitorCardRemoval(controller.readerId, controller.card)
                            }, function (error) {
                                if (error.status === 412 && error.data.code === 900) {
                                    // this usually means the card was removed during reading, check if it is still present
                                    RMC.checkCardRemoval(controller.readerId, controller.card).then(function (removed) {
                                        if (removed) $scope.$emit(EVENTS.START_OVER);
                                        controller.$onInit();
                                    });
                                } else {
                                    controller.errorReadingCard = true;
                                    controller.loading = false;
                                    RMC.monitorCardRemoval(controller.readerId, controller.card)
                                }
                            });
                        }
                    }, function (error) {
                        if (error.message === EVENTS.NETWORK_ERROR) {
                            // try again after short delay
                            $timeout(function () {
                                controller.$onInit();
                            }, 100);
                        }
                    });

                };

                $scope.$on(EVENTS.REINITIALIZE, function () {
                    controller.$onInit();
                });

                function registerUnknownType(cardDescription) {
                    controller.submitted = true;
                    API.storeUnknownCardInfo(controller.card, cardDescription);
                }

                function toggleCardTypes() {
                    $rootScope.$broadcast(EVENTS.OPEN_SIDEBAR);
                }

                function readAnother() {
                    $scope.$emit(EVENTS.START_OVER, controller.readerId);
                }
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
                dlUrl: '<',
                isFirefox: '<'
            },
            controller: function ($scope, $uibModal, T1C, $timeout, API, EVENTS) {
                var controller = this;
                this.firefoxModal = firefoxModal;
                this.registerDownload = registerDownload;

                function pollForGcl() {
                    $timeout(function () {
                        T1C.getInfo().then(function (res) {
                            // Info retrieved, GCL is installed
                            $scope.$emit(EVENTS.GCL_INSTALLED);
                        }, function (err) {
                            pollForGcl();
                        });
                    }, 2500)
                }

                function firefoxModal() {
                    $uibModal.open({
                        templateUrl: "views/readmycards/modals/firefox-restart.html",
                        controller: 'ModalCtrl'
                    });
                }

                function registerDownload(mail) {
                    controller.waitingForInstall = true;
                    if (!controller.isFirefox) pollForGcl();
                    API.storeDownloadInfo(mail, controller.dlUrl);
                }
            }
        })
        .component('readerPolling', {
            templateUrl: 'views/readmycards/components/reader-polling.html',
            bindings: {
                error: '<'
            },
            controller: function ($scope, EVENTS) {
                this.tryAgain = tryAgain;

                function tryAgain() {
                    $scope.$emit(EVENTS.RETRY_READER);
                }
            }
        })
        .component('cardPolling', {
            templateUrl: 'views/readmycards/components/card-polling.html',
            bindings: {
                error: '<'
            },
            controller: function ($scope, EVENTS) {
                this.tryAgain = tryAgain;

                function tryAgain() {
                    $scope.$emit(EVENTS.RETRY_CARD);
                }
            }
        })
        .component('readerSelect', {
            templateUrl: 'views/readmycards/components/reader-list.html',
            controller: function ($scope, $state, $timeout, T1C, CardService, EVENTS, _) {
                var controller = this;
                this.$onInit = function () {
                    controller.readers = [];
                };

                $scope.$on(EVENTS.READERS_WITH_CARDS, function (event, args) {
                    if (args.data.length != controller.readers.length) {
                        controller.readers = args.data;
                        _.forEach(controller.readers, function (reader) {
                            reader.cardType = CardService.detectType(reader.card);
                        });
                    }
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
            controller: function ($scope, EVENTS) {
                var controller = this;
                this.home = home;
                this.toggleCardTypes = toggleCardTypes;

                function home() {
                    $scope.$emit(EVENTS.START_OVER);
                }

                function toggleCardTypes() {
                    $scope.$emit(EVENTS.OPEN_SIDEBAR);
                }

                $scope.$on(EVENTS.OPEN_SIDEBAR, function () {
                    controller.menuOpen = !controller.menuOpen;
                });

                $scope.$on(EVENTS.CLOSE_SIDEBAR, function () {
                    controller.menuOpen = false;
                })
            }
        })
        .component('rmcFaq', {
            templateUrl: 'views/readmycards/components/faq.html'
        })
        .component('rmcFooter', {
            templateUrl: 'views/readmycards/components/footer.html',
            controller: function ($scope, EVENTS) {
                this.toggleFAQ = toggleFAQ;

                function toggleFAQ() {
                    $scope.$emit(EVENTS.OPEN_FAQ);
                }
            }
        })
        .component('rmcKeypad', {
            templateUrl: 'views/readmycards/components/keypad.html',
            bindings: {
                pincode: '=',
                cancelFunc: '&',
                submitFunc: '&'
            },
            controller: function (_) {
                let controller = this;
                controller.keys = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                controller.onKeyPressed = onKeyPressed;
                controller.submitPin = submitPin;


                function onKeyPressed(data) {
                    if (data == '<') {
                        if (_.isEmpty(controller.pincode.value)) controller.cancelFunc(); else controller.pincode.value = controller.pincode.value.slice(0, controller.pincode.value.length - 1);
                    } else if (data == '>') {
                        submitPin();
                    } else {
                        controller.pincode.value += data;
                    }
                }

                function submitPin() {
                    controller.submitFunc()(controller.pincode.value);
                }
            }
        })
})();
