(function () {
    'use strict';

    angular.module('app.readmycards')
           .component('cardVisualizer', {
               templateUrl: 'views/readmycards/components/card-viz.html',
               bindings: {
                   readerId: '<'
               },
               controller: function ($scope, $timeout, $rootScope, CardService, Connector, API, RMC, EVENTS, _) {
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
                           CardService.detectType(readerInfo.data.id).then(type => {
                               console.log(type);
                               controller.cardType = type;
                               controller.cardTypePretty = CardService.getCardTypeName(type, readerInfo.data.card);
                               controller.card = readerInfo.data.card;

                               if (controller.cardType === 'unknown') {
                                   // TODO Now manually triggered, should this not be automatic?
                                   // registerUnknownType();
                                   controller.unknownCard = true;
                                   controller.loading = false;
                                   RMC.monitorCardRemoval(controller.readerId, controller.card);
                               } else if (_.includes(['luxeid', 'piv'], type)) {
                                   // return $q.when('Not Supported');
                                   $timeout(() => {
                                       controller.loading = false;
                                   });
                                   RMC.monitorCardRemoval(controller.readerId, controller.card);
                               } else {
                                   Connector.generic('dumpData', [readerInfo.data.id]).then(res => {
                                       controller.cardData = res.data;
                                       controller.loading = false;
                                       RMC.monitorCardRemoval(controller.readerId, controller.card);
                                   }, function (error) {
                                       console.log(error);
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
                           }).catch(err => {
                               console.log(err);
                               controller.unknownCard = true;
                               controller.loading = false;
                               RMC.monitorCardRemoval(controller.readerId, readerInfo.data.card);
                           });
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
               controller: function ($scope, $uibModal, Connector, $timeout, API, EVENTS) {
                   var controller = this;
                   this.firefoxModal = firefoxModal;
                   this.registerDownload = registerDownload;

                   controller.$onInit = () => {
                       controller.sendUpdates = {
                           value: false
                       }
                   };

                   function pollForGcl() {
                       $timeout(function () {
                           Connector.core('info', []).then(() => {
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
                               CardService.detectCardTypeName(reader.id, reader.card).then(name => {
                                   reader.cardType = name;
                               });
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
