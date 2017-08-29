(function () {
    'use strict';

    angular.module('app.readmycards')
           .controller('ModalCtrl', modalCtrl)
           .controller('ModalSessionOpenCtrl', modalSessionOpenCtrl)
           .controller('ModalUserNameCtrl', modalUserNameCtrl)
           .controller('ModalSendCommandCtrl', modalSendCommandCtrl)
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

    function modalSessionOpenCtrl($scope, $uibModalInstance, belfius, readerId, Core, RMC) {
        $scope.ok = ok;
        $scope.cancel = cancel;
        $scope.open = open;

        let connector = Core.getConnector();

        function open(timeout) {
            console.log(timeout);
            if (belfius) {
                connector.belfius(readerId).openSession(timeout).then((res) => {
                    RMC.sessionStatus(true);
                    $scope.sessionId = res.data;
                });
            } else {
                connector.readerapi(readerId).openSession(timeout).then(res => {
                    RMC.sessionStatus(true);
                    $scope.sessionId = res.data;
                })
            }

        }

        function ok() {
            $uibModalInstance.close("ok");
        }

        function cancel() {
            $uibModalInstance.dismiss("cancel");
        }
    }

    function modalUserNameCtrl($scope, $uibModalInstance, retry) {
        $scope.ok = ok;
        $scope.cancel = cancel;
        $scope.retry = retry;

        function ok(username) {
            $uibModalInstance.close(username);
        }

        function cancel() {
            $uibModalInstance.dismiss("cancel");
        }
    }

    function modalSendCommandCtrl($scope, $uibModalInstance, readerId, type, Core) {
        $scope.ok = ok;
        $scope.cancel = cancel;
        $scope.submit = submit;

        let connector = Core.getConnector();

        function ok() {
            $uibModalInstance.close("ok");
        }

        function cancel() {
            $uibModalInstance.dismiss("cancel");
        }

        function submit(sessionId, payload, secondaryPayload) {
            clearVars();
            switch (type) {
                case 'apdu':
                    connector.readerapi(readerId).apdu(angular.fromJson(payload), sessionId).then(handleSuccess, handleError);
                    break;
                case 'atr':
                    connector.readerapi(readerId).atr(sessionId).then(handleSuccess, handleError);
                    break;
                case 'ccid-features':
                    connector.readerapi(readerId).ccidFeatures(sessionId).then(handleSuccess, handleError);
                    break;
                case 'ccid':
                    connector.readerapi(readerId).ccid(payload, secondaryPayload, sessionId).then(handleSuccess, handleError);
                    break;
                case 'command':
                    connector.readerapi(readerId).command(angular.fromJson(payload), sessionId).then(handleSuccess, handleError);
                    break;
                case 'is-present':
                    connector.readerapi(readerId).isPresent(sessionId).then(handleSuccess, handleError);
                    break;
                case 'nonce':
                    connector.belfius(readerId).nonce(sessionId).then(handleSuccess, handleError);
                    break;
                case 'stx':
                    connector.belfius(readerId).stx(payload, sessionId).then(handleSuccess, handleError);
                    break;
            }

            function handleSuccess(res) {
                console.log(res);
                $scope.result = angular.toJson(res.data);
            }

            function handleError(err) {
                console.log(err);
                $scope.error = angular.toJson(err);
            }
        }

        function clearVars() {
            $scope.result = undefined;
            $scope.error = undefined;
        }
    }

    function modalPinCheckCtrl($scope, readerId, pinpad, $uibModalInstance, EVENTS, Connector, _) {
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
                Connector.get().beid(readerId).verifyPin({}).then(handleVerificationSuccess, handleVerificationError);
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
            if (data === '<') {
                if (_.isEmpty($scope.pincode.value)) $uibModalInstance.dismiss('cancel');else $scope.pincode.value = $scope.pincode.value.slice(0, $scope.pincode.value.length - 1);
            } else if (data === '>') {
                submitPin();
            } else {
                $scope.pincode.value += data;
            }
        }

        function submitPin() {
            Connector.get().beid(readerId).verifyPin({ pin: $scope.pincode.value }).then(handleVerificationSuccess, handleVerificationError);
        }

        $scope.$on(EVENTS.START_OVER, function () {
            $scope.cancel();
        });
    }

    function rootCtrl($scope, $state, $uibModal, gclAvailable, readers, cardPresent,
                      RMC, T1C, EVENTS, _, Analytics, Citrix, Core) {
        let controller = this;
        let connector = Core.getConnector();
        controller.gclAvailable = gclAvailable;
        controller.readers = readers.data;
        controller.cardPresent = cardPresent;
        controller.dismissPanels = dismissPanels;
        controller.openSession = openSession;
        controller.openBelfiusSession = openBelfiusSession;
        controller.getAtr = getAtr;
        controller.getCcidFeatures = getCcidFeatures;
        controller.getNonce = getNonce;
        controller.isPresent = isPresent;
        controller.sendApdu = sendApdu;
        controller.sendCommand = sendCommand;
        controller.sendSTX = sendSTX;
        controller.closeSession = closeSession;
        controller.closeBelfiusSession = closeBelfiusSession;
        controller.verifyCcidFeature = verifyCcidFeature;

        let pollIterations = 0;

        init();

        function dismissPanels() {
            $scope.$broadcast(EVENTS.CLOSE_SIDEBAR);
            controller.cardTypesOpen = false;
            controller.faqOpen = false;
        }

        function openBelfiusSession() {
            console.log("open session");
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/open-session.html",
                resolve: {
                    readerId: () => {
                        return $state.params.readerId;
                    },
                    belfius: () => {
                        return true;
                    }
                },
                backdrop: 'static',
                controller: 'ModalSessionOpenCtrl'
            });
        }

        function openSession() {
            console.log("open session");
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/open-session.html",
                resolve: {
                    readerId: () => {
                        return $state.params.readerId;
                    },
                    belfius: () => {
                        return false;
                    }
                },
                backdrop: 'static',
                controller: 'ModalSessionOpenCtrl'
            });
        }

        function getAtr() {
            console.log("get ATR");
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/get-atr.html",
                resolve: {
                    readerId: () => {
                        return $state.params.readerId;
                    },
                    type: () => {
                        return 'atr';
                    }
                },
                backdrop: 'static',
                controller: 'ModalSendCommandCtrl'
            });
        }

        function getCcidFeatures() {
            console.log("get CCID features");
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/get-ccid-features.html",
                resolve: {
                    readerId: () => {
                        return $state.params.readerId;
                    },
                    type: () => {
                        return 'ccid-features';
                    }
                },
                backdrop: 'static',
                controller: 'ModalSendCommandCtrl'
            });
        }

        function getNonce() {
            console.log("get nonce");
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/get-nonce.html",
                resolve: {
                    readerId: () => {
                        return $state.params.readerId;
                    },
                    type: () => {
                        return 'nonce';
                    }
                },
                backdrop: 'static',
                controller: 'ModalSendCommandCtrl'
            });
        }

        function isPresent() {
            console.log("isPresent");
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/is-present.html",
                resolve: {
                    readerId: () => {
                        return $state.params.readerId;
                    },
                    type: () => {
                        return 'is-present';
                    }
                },
                backdrop: 'static',
                controller: 'ModalSendCommandCtrl'
            });
        }

        function sendApdu() {
            console.log("send APDU");
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/send-apdu.html",
                resolve: {
                    readerId: () => {
                        return $state.params.readerId;
                    },
                    type: () => {
                        return 'apdu';
                    }
                },
                backdrop: 'static',
                controller: 'ModalSendCommandCtrl'
            });
        }

        function sendCommand() {
            console.log("send command");
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/send-command.html",
                resolve: {
                    readerId: () => {
                        return $state.params.readerId;
                    },
                    type: () => {
                        return 'command';
                    }
                },
                backdrop: 'static',
                controller: 'ModalSendCommandCtrl'
            });
        }

        function sendSTX() {
            console.log("send STX");
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/send-stx.html",
                resolve: {
                    readerId: () => {
                        return $state.params.readerId;
                    },
                    type: () => {
                        return 'stx';
                    }
                },
                backdrop: 'static',
                controller: 'ModalSendCommandCtrl'
            });
        }

        function closeSession() {
            console.log("close session");
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/close-session.html",
                resolve: {
                    close: () => {
                        return connector.readerapi($state.params.readerId).closeSession().then(res => {
                            RMC.sessionStatus(false);
                        });
                    }
                },
                backdrop: 'static',
                controller: 'ModalCtrl'
            });
        }

        function closeBelfiusSession() {
            console.log("close session");
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/close-session.html",
                resolve: {
                    close: () => {
                        return connector.belfius($state.params.readerId).closeSession().then(res => {
                            RMC.sessionStatus(false);
                        });
                    }
                },
                backdrop: 'static',
                controller: 'ModalCtrl'
            });
        }

        function verifyCcidFeature() {
            console.log("verify CCID feature");
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/verify-ccid-feature.html",
                resolve: {
                    readerId: () => {
                        return $state.params.readerId;
                    },
                    type: () => {
                        return 'ccid';
                    }
                },
                backdrop: 'static',
                controller: 'ModalCtrl'
            });
        }

        function init() {
            console.log('Using T1C-js ' + Core.version());

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
                Analytics.trackEvent('T1C', 'install', 'Trust1Connector installed');
                controller.gclAvailable = true;
                Core.initializeAfterInstall().then(function (res) {
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
                Core.getReaders().then(function (result) {
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
            Core.getConnector().core().pollReaders(30, function (err, result) {
                // Success callback
                // Found at least one reader, poll for cards
                if (err) {
                    controller.error = true;
                    $scope.$apply();
                }
                else {
                    controller.readers = result.data;
                    controller.pollingReaders = false;
                    Analytics.trackEvent('reader', 'connect', 'Reader connected: ' + _.join(_.map(controller.readers, 'name'), ','));
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
            }, Citrix.port());
        }

        function pollForCard() {
            if (!controller.pollingCard) controller.pollingCard = true;
            controller.error = false;
            Core.getConnector().core().pollCardInserted(3, function (err, result) {
                // Success callback
                // controller.readers = result.data;
                if (err) {
                    controller.error = true;
                    $scope.$apply();
                }
                else {
                    controller.pollingCard = false;
                    controller.pollTimeout = false;
                    Analytics.trackEvent('card', 'insert', 'Card inserted: ' + result.card.atr);
                    pollIterations = 0;
                    $scope.$apply();
                    // if ($scope.readers.length > 1) toastr.success('Readers found!');
                    // else toastr.success('Reader found!');
                    // Found a card, attempt to read it
                    // Refresh reader list first
                    Core.getReaders().then(function (result) {
                        controller.readers = result.data;
                        readCard();
                    }, function () {
                        pollForCard();
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
                pollIterations++;
                // if enough time has passed, show the card not recognized message
                if (pollIterations >= 5) controller.pollTimeout = true;
                RMC.checkReaderRemoval().then(function (removed) {
                    if (removed) controller.pollingCard = false;
                    else pollForCard();
                });
            }, Citrix.port());
        }

        function promptDownload() {
            // Prompt for dl
            T1C.ds.getDownloadLink().then(function (res) {
                controller.dlLink = res.url;
            })
        }

        function readCard() {
            controller.readerWithCard = _.find(controller.readers, function (o) {
                return _.has(o, 'card');
            });
            $state.go('root.reader', { readerId: controller.readerWithCard.id });
        }
    }

    function readerCtrl($scope, $stateParams) {
        $scope.readerId = $stateParams.readerId;
    }

})();
