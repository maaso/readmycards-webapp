(function () {
    'use strict';

    angular.module('app.readmycards')
           .component('cardVisualizer', {
               templateUrl: 'views/readmycards/components/card-viz.html',
               bindings: {
                   readerId: '<'
               },
               controller: function ($scope, $timeout, $rootScope, CardService, API, RMC, EVENTS, Connector) {
                   let controller = this;
                   controller.readAnother = readAnother;
                   this.registerUnknownType = registerUnknownType;
                   this.showSupportedCardTypes = toggleCardTypes;

                   let currentReaderId = controller.readerId;

                   this.$onInit = function () {
                       controller.loading = true;
                       controller.errorReadingCard = false;
                       controller.unknownCard = false;
                       // Detect Type and read data
                       Connector.core('reader', [controller.readerId]).then(readerInfo => {
                           controller.cardType = CardService.detectType(readerInfo.data.card);
                           controller.card = readerInfo.data.card;

                           if (controller.cardType === 'Unknown') {
                               // TODO Now manually triggered, should this not be automatic?
                               // registerUnknownType();
                               controller.unknownCard = true;
                               controller.loading = false;
                               RMC.monitorCardRemoval(controller.readerId, controller.card);
                           } else {
                               Connector.generic('dumpData', [readerInfo.data.id]).then(res => {
                                   controller.cardData = res.data;
                                   controller.loading = false;
                                   RMC.monitorCardRemoval(controller.readerId, controller.card)
                               }, function (error) {
                                   if (error.status === 412 && (error.data.code === 900 || error.data.code === 0)) {
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
                           } else {
                               $scope.$emit(EVENTS.START_OVER);
                           }
                       });

                   };

                   this.$onChanges = (changed) => {
                       if (changed.readerId && changed.readerId.currentValue !== currentReaderId) {
                           currentReaderId = changed.readerId.currentValue;
                           controller.$onInit();
                       }
                   };

                   $scope.$on(EVENTS.REINITIALIZE, function () {
                       console.log("reinit");
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
           .component('downloadGcl', {
               templateUrl: 'views/readmycards/components/download.html',
               bindings: {
                   dlUrl: '<',
                   isFirefox: '<'
               },
               controller: function ($scope, $uibModal, Connector, $timeout, API, EVENTS) {
                   let controller = this;
                   controller.firefoxModal = firefoxModal;
                   controller.registerDownload = registerDownload;

                   controller.$onInit = () => {
                       controller.sendUpdates = {
                           value: false
                       }
                   };

                   function pollForGcl() {
                       $timeout(function () {
                           Connector.core('info').then(() => {
                               // Info retrieved, GCL is installed
                               $scope.$emit(EVENTS.GCL_INSTALLED);
                           }, () => {
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
                       API.storeDownloadInfo(mail, controller.sendUpdates.value, controller.dlUrl);
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
                   error: '<',
                   pollTimeout: '<'
               },
               controller: function ($scope, $rootScope, EVENTS) {
                   this.openSidebar = openSidebar;
                   this.tryAgain = tryAgain;

                   function openSidebar() {
                       $rootScope.$broadcast(EVENTS.OPEN_SIDEBAR);
                   }

                   function tryAgain() {
                       $scope.$emit(EVENTS.RETRY_CARD);
                   }
               }
           })
           .component('readerSelect', {
               templateUrl: 'views/readmycards/components/reader-list.html',
               bindings: {
                   currentReaderId: '<'
               },
               controller: function ($scope, $state, $timeout, CardService, EVENTS, _) {
                   let controller = this;
                   this.$onInit = function () {
                       controller.readers = [];
                   };

                   $scope.$on(EVENTS.READERS_WITH_CARDS, function (event, args) {
                       if (args.data.length !== controller.readers.length) {
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
                   reader: '<',
                   currentReaderId: '<'
               },
               controller: function($scope, EVENTS) {
                   let controller = this;
                   controller.selectReader = selectReader;

                   function selectReader() {
                       $scope.$emit(EVENTS.SELECT_READER, controller.reader);
                   }
               }
           })
           .component('rmcHeader', {
               templateUrl: 'views/readmycards/components/header.html',
               controller: function ($scope, EVENTS) {
                   let controller = this;
                   this.home = home;
                   this.toggleCardTypes = toggleCardTypes;
                   this.toggleFileExchange = toggleFileExchange;

                   function home() {
                       $scope.$emit(EVENTS.START_OVER);
                   }

                   function toggleCardTypes() {
                       $scope.$emit(EVENTS.OPEN_SIDEBAR);
                   }

                   function toggleFileExchange() {
                       $scope.$emit(EVENTS.OPEN_FILE_EXCHANGE)
                   }

                   $scope.$on(EVENTS.OPEN_SIDEBAR, function () {
                       controller.menuOpen = !controller.menuOpen;
                   });

                   $scope.$on(EVENTS.OPEN_FILE_EXCHANGE, function () {
                       controller.fileExchOpen = !controller.fileExchOpen;
                   });

                   $scope.$on(EVENTS.CLOSE_SIDEBAR, function () {
                       controller.menuOpen = false;
                   });

                   $scope.$on(EVENTS.CLOSE_FILE_EXCHANGE, function () {
                       controller.fileExchOpen = false;
                   });
               }
           })
           .component('rmcFaq', {
               templateUrl: 'views/readmycards/components/faq.html'
           })
           .component('rmcConsent', {
               templateUrl: 'views/readmycards/components/no-consent.html',
               controller: function($window) {
                   this.reload = reload;

                   function reload() {
                       console.log("reloading");
                       $window.location.reload();
                   }
               }
           })
           .component('rmcFooter', {
               templateUrl: 'views/readmycards/components/footer.html',
               controller: function ($scope, EVENTS) {
                   this.toggleFAQ = toggleFAQ;
                   this.$onInit = () => {
                       this.currentYear = moment().format('YYYY');
                   };

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
                       if (data === '<') {
                           if (_.isEmpty(controller.pincode.value)) controller.cancelFunc(); else controller.pincode.value = controller.pincode.value.slice(0, controller.pincode.value.length - 1);
                       } else if (data === '>') {
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
