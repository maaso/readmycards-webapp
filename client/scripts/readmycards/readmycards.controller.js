(function () {
    'use strict';

    angular.module('app.readmycards')
        .controller('ModalCtrl', modalCtrl)
        .controller('RootCtrl', rootCtrl)
        .controller('ReaderCtrl', readerCtrl);


    function modalCtrl($scope, $uibModalInstance) {
        $scope.ok = ok;
        $scope.cancel = cancel;

        function ok() {
            $uibModalInstance.close("ok");
        }

        function cancel() {
            $uibModalInstance.dismiss("cancel");
        }
    }

    function rootCtrl($scope, $state, gclAvailable, readers, cardPresent, T1C, _) {
        var controller = this;
        controller.gclAvailable = gclAvailable;
        controller.readers = readers.data;
        controller.cardPresent = cardPresent;
        controller.dismissPanels = dismissPanels;

        init();

        function dismissPanels() {
            $scope.$broadcast('close-sidebar');
            controller.cardTypesOpen = false;
            controller.faqOpen = false;
        }

        function init() {
            // console.log('Using T1C-js ' + T1C.version());

            controller.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

            // Determine initial action we need to take
            if (!controller.cardPresent) {
                // No card is present, check if we have readers

                if (_.isEmpty(controller.readers)) {
                    // No readers present, do we have GCL?
                    if (!gclAvailable) {
                        // No GCL is available, prompt user to download
                        promptDownload();
                    } else {
                        // GCL is present, poll for readers being connected
                        pollForReaders();
                    }
                } else {
                    // Reader(s) are present, poll for card
                    pollForCard();
                }
            } else {
                // A card is present, determine type and read its data
                readCard();
            }

            $scope.$on('gcl', function () {
                controller.gclAvailable = true;
                T1C.initializeAfterInstall().then(function (res) {
                    pollForReaders();
                });
            });

            $scope.$on('card-type-toggle', function () {
                // Make sure the FAQ panel is closed when opening sidebar
                if (!controller.cardTypesOpen) {
                    controller.faqOpen = false;
                }
                controller.cardTypesOpen = !controller.cardTypesOpen;
            });

            $scope.$on('faq-toggle', function () {
                // Make sure the side panel is closed when opening FAQ
                if (!controller.faqOpen) {
                    $scope.$broadcast('close-sidebar');
                    controller.cardTypesOpen = false;
                }
                controller.faqOpen = !controller.faqOpen;
            });

            $scope.$on('read-another-card', function (event, currentReaderId) {
                T1C.getReaders().then(function (result) {
                    if (_.find(result.data, function (reader) {
                       return _.has(reader, 'card');
                    })) {
                        // check if current reader has card
                        if (_.find(result.data, function (reader) {
                                return _.has(reader, 'card') && reader.id === currentReaderId;
                            })) {
                            controller.readers = result.data;
                            controller.readerWithCard = _.find(result.data, function (reader) {
                                return reader.id === currentReaderId;
                            });
                            controller.cardPresent = true;
                            $scope.$broadcast('reinit-viz');
                        } else {
                            $state.go('root.reader', { readerId: _.find(result.data, function (reader) {
                                return _.has(reader, 'card');
                            }).id});
                        }
                    } else {
                        controller.readers = result.data;
                        controller.readerWithCard = undefined;
                        controller.cardPresent = false;
                        if (_.isEmpty(controller.readers)) {
                            pollForReaders();
                        } else {
                            pollForCard();
                        }
                    }
                }, function () {
                    controller.readers = [];
                    controller.readerWithCard = undefined;
                    controller.cardPresent = false;
                    pollForReaders();
                });
            });

            $scope.$on('retry-reader', function () {
                controller.readerWithCard = undefined;
                controller.cardPresent = false;
                pollForReaders();
            });

            $scope.$on('retry-card', function () {
                controller.readers = [];
                controller.readerWithCard = undefined;
                controller.cardPresent = false;
                pollForCard();
            });
        }


        function pollForReaders() {
            controller.pollingReaders = true;
            controller.error = false;
            T1C.getConnector().core().pollReaders(30, function (err, result) {
                // Success callback
                // Found at least one reader, poll for cards
                if (err) {
                    controller.error = true;
                    $scope.$apply();
                }
                else {
                    controller.readers = result.data;
                    controller.pollingReaders = false;
                    $scope.$apply();
                    // if (controller.readers.length > 1) toastr.success('Readers found!');
                    // else toastr.success('Reader found!');
                    pollForCard();
                }
            }, function () {
                // Not used
                controller.pollSecondsRemaining = controller.pollSecondsRemaining - 1;
                $scope.$apply();
            }, function () {
                // timeout
                // controller.pollingReaders = false;
                // controller.pollTimeout = true;
                // toastr.warning('30 seconds have passed without a reader being connected. Please try again.', 'Timeout');
                // $scope.$apply();
                pollForReaders();
            });
        }

        function pollForCard() {
            controller.pollingCard = true;
            controller.error = false;
            T1C.getConnector().core().pollCardInserted(30, function (err, result) {
                // Success callback
                // controller.readers = result.data;
                if (err) {
                    controller.error = true;
                    $scope.$apply();
                }
                else {
                    controller.pollingCard = false;
                    $scope.$apply();
                    // if ($scope.readers.length > 1) toastr.success('Readers found!');
                    // else toastr.success('Reader found!');
                    // Found a card, attempt to read it
                    // Refresh reader list first
                    T1C.getReaders().then(function (result) {
                        controller.readers = result.data;
                        readCard();
                    }, function () {
                        controller.error = true;
                    });
                }
            }, function () {
                // "Waiting for reader connection" callback
                controller.pollSecondsRemaining = controller.pollSecondsRemaining - 1;
                $scope.$apply();
            }, function () {
                // "Waiting for card" callback
            }, function () {
                // timeout
                // controller.pollingCard = false;
                // controller.pollTimeout = true;
                // toastr.warning('30 seconds have passed without a reader being connected. Please try again.', 'Timeout');
                // $scope.$apply();
                pollForCard();
            });
        }

        function promptDownload() {
            // Prompt for dl
            T1C.getDownloadLink().then(function (res) {
                controller.dlLink = res.url;
            })
        }

        function readCard() {
            controller.readerWithCard = _.find(controller.readers, function (o) {
                return _.has(o, 'card');
            });
            $state.go('root.reader', { readerId: controller.readerWithCard.id});
        }
    }

    function readerCtrl($scope, $stateParams) {
        $scope.readerId = $stateParams.readerId;
    }

})();