(function () {
    'use strict';

    angular.module('app.readmycards')
        .controller('ModalCtrl', modalCtrl)
        .controller('ModalPinCheckCtrl', modalPinCheckCtrl)
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

    function modalPinCheckCtrl($scope, readerId, pinpad, $uibModalInstance, EVENTS, T1C, _) {
        $scope.keys = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        $scope.pincode = {
            value: ''
        };
        $scope.pinpad = pinpad;
        $scope.ok = ok;
        $scope.cancel = cancel;
        $scope.onKeyPressed = onKeyPressed;
        $scope.submitPin = submitPin;

        init();

        function init() {
            // If pinpad reader, send verification request directly to reader
            if (pinpad) {
                T1C.verifyBeIDPin(readerId).then(handleVerificationSuccess, handleVerificationError);
            }
            // else, wait until user enters pin
        }

        function handleVerificationSuccess(res) {
            $uibModalInstance.close('verified');
        }

        function handleVerificationError(err) {
            $uibModalInstance.dismiss(err.data);
        }

        function ok() {
            $uibModalInstance.close('ok');
        }

        function cancel() {
            $uibModalInstance.dismiss('cancel');
        }

        function onKeyPressed(data) {
            if (data == '<') {
                if (_.isEmpty($scope.pincode.value)) $uibModalInstance.dismiss('cancel');else $scope.pincode.value = $scope.pincode.value.slice(0, $scope.pincode.value.length - 1);
            } else if (data == '>') {
                submitPin();
            } else {
                $scope.pincode.value += data;
            }
        }

        function submitPin() {
            T1C.verifyBeIDPin(readerId, $scope.pincode.value).then(handleVerificationSuccess, handleVerificationError);
        }

        $scope.$on(EVENTS.START_OVER, function () {
            $scope.cancel();
        });
    }

    function rootCtrl($scope, $state, gclAvailable, readers, cardPresent, RMC, T1C, EVENTS, _) {
        let controller = this;
        controller.gclAvailable = gclAvailable;
        controller.readers = readers.data;
        controller.cardPresent = cardPresent;
        controller.dismissPanels = dismissPanels;

        init();

        function dismissPanels() {
            $scope.$broadcast(EVENTS.CLOSE_SIDEBAR);
            controller.cardTypesOpen = false;
            controller.faqOpen = false;
        }

        function init() {
            console.log('Using T1C-js ' + T1C.version());

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

            $scope.$on(EVENTS.GCL_INSTALLED, function () {
                controller.gclAvailable = true;
                T1C.initializeAfterInstall().then(function (res) {
                    pollForReaders();
                });
            });

            $scope.$on(EVENTS.OPEN_SIDEBAR, function () {
                // Make sure the FAQ panel is closed when opening sidebar
                if (!controller.cardTypesOpen) {
                    controller.faqOpen = false;
                }
                controller.cardTypesOpen = !controller.cardTypesOpen;
            });

            $scope.$on(EVENTS.OPEN_FAQ, function () {
                // Make sure the side panel is closed when opening FAQ
                if (!controller.faqOpen) {
                    $scope.$broadcast(EVENTS.CLOSE_SIDEBAR);
                    controller.cardTypesOpen = false;
                }
                controller.faqOpen = !controller.faqOpen;
            });

            $scope.$on(EVENTS.START_OVER, function (event, currentReaderId) {
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
                            $scope.$broadcast(EVENTS.REINITIALIZE);
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

            $scope.$on(EVENTS.RETRY_READER, function () {
                controller.readerWithCard = undefined;
                controller.cardPresent = false;
                pollForReaders();
            });

            $scope.$on(EVENTS.RETRY_CARD, function () {
                controller.readers = [];
                controller.readerWithCard = undefined;
                controller.cardPresent = false;
                pollForCard();
            });
        }


        function pollForReaders() {
            if (!controller.pollingReaders) controller.pollingReaders = true;
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
            if (!controller.pollingCard) controller.pollingCard = true;
            controller.error = false;
            T1C.getConnector().core().pollCardInserted(3, function (err, result) {
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
                RMC.checkReaderRemoval().then(function (removed) {
                    if (removed) controller.pollingCard = false;
                    else pollForCard();
                });
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
