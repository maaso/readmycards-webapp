(function () {
    'use strict';

    angular.module('app.readmycards')
           .controller('ModalCtrl', modalCtrl)
           .controller('ModalSessionOpenCtrl', modalSessionOpenCtrl)
           .controller('ModalStaticDataCtrl', modalStaticDataCtrl)
           .controller('ModalUserNameCtrl', modalUserNameCtrl)
           .controller('ModalSendCommandCtrl', modalSendCommandCtrl)
           .controller('ModalPinCheckCtrl', modalPinCheckCtrl)
           .controller('ModalEmvPinCheckCtrl', modalEmvPinCheckCtrl)
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

    function modalSessionOpenCtrl($scope, $uibModalInstance, belfius, readerId, Connector, RMC) {
        $scope.ok = ok;
        $scope.cancel = cancel;
        $scope.open = open;

        function open(timeout) {
            if (belfius) {
                Connector.plugin('belfius', 'openSession', [ readerId ], [timeout]).then(res => {
                    RMC.sessionStatus(true);
                    $scope.sessionId = res.data;
                }, handleError);
            } else {
                Connector.plugin('readerapi', 'openSession', [ readerId ], [timeout]).then(res => {
                    RMC.sessionStatus(true);
                    $scope.sessionId = res.data;
                }, handleError)
            }

            function handleError(err) {
                $scope.error = angular.toJson(err);
            }
        }

        function ok() {
            $uibModalInstance.close("ok");
        }

        function cancel() {
            $uibModalInstance.dismiss("cancel");
        }
    }

    function modalStaticDataCtrl($scope, $uibModalInstance, data, error) {
        $scope.ok = ok;
        $scope.cancel = cancel;
        $scope.open = open;
        $scope.data = data;
        $scope.error = error;

        function ok() {
            $uibModalInstance.close("ok");
        }

        function cancel() {
            $uibModalInstance.dismiss("cancel");
        }
    }

    function modalUserNameCtrl($scope, $uibModalInstance, $location, retry, _) {
        $scope.ok = ok;
        $scope.cancel = cancel;
        $scope.retry = retry;
        $scope.params = useCurrentParams() || [ { key: "username", value: "" }];
        $scope.addParam = addParam;
        $scope.insufficientParameters = insufficientParameters;
        $scope.removeParam = removeParam;

        function ok() {
            let paramObject = {};
            _.forEach($scope.params, p => {
                paramObject[p.key] = p.value;
            });
            $uibModalInstance.close(paramObject);
        }

        function cancel() {
            $uibModalInstance.dismiss("cancel");
        }

        function addParam() {
            $scope.params.push({ key: "", value: ""});
        }

        function insufficientParameters() {
            if ($scope.params.length) {
                let result = false;
                _.forEach($scope.params, p => {
                    if (!p.key.length || !p.value.length) { result = true; }
                });
                return result;
            } else { return true; }
        }

        function removeParam(param) {
            _.remove($scope.params, param);
        }

        function useCurrentParams() {
            let params = $location.search();
            if (params && !_.isEmpty(params)) {
                let deconstructed = [];
                _.forEach(params, (value, key) => {
                    deconstructed.push({ key, value });
                });
                return deconstructed;
            } else { return undefined }
        }
    }

    function modalSendCommandCtrl($scope, $uibModalInstance, readerId, type, Connector, RMC) {
        $scope.ok = ok;
        $scope.cancel = cancel;
        $scope.submit = submit;

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
                    Connector.plugin('readerapi', 'apdu', [readerId], [angular.fromJson(payload), sessionId]).then(handleSuccess, handleError);
                    break;
                case 'atr':
                    Connector.plugin('readerapi', 'atr', [readerId], [sessionId]).then(handleSuccess, handleError);
                    break;
                case 'ccid-features':
                    Connector.plugin('readerapi', 'ccidFeatures', [readerId], [sessionId]).then(handleSuccess, handleError);
                    break;
                case 'ccid':
                    Connector.plugin('readerapi', 'ccid', [readerId], [payload, secondaryPayload, sessionId]).then(handleSuccess, handleError);
                    break;
                case 'close-session':
                    Connector.plugin('readerapi', 'closeSession', [readerId], [sessionId]).then(() => {
                        $scope.result = { sessionId };
                        RMC.sessionStatus(false);
                    }, handleError);
                    break;
                case 'command':
                    Connector.plugin('readerapi', 'command', [readerId], [angular.fromJson(payload, sessionId)]).then(handleSuccess, handleError);
                    break;
                case 'is-belfius-reader':
                    Connector.plugin('belfius', 'isBelfiusReader', [readerId], [sessionId]).then(handleSuccess, handleError);
                    break;
                case 'is-present':
                    Connector.plugin('readerapi', 'isPresent', [readerId], [sessionId]).then(handleSuccess, handleError);
                    break;
                case 'nonce':
                    Connector.plugin('belfius', 'nonce', [readerId], [sessionId]).then(handleSuccess, handleError);
                    break;
                case 'stx':
                    Connector.plugin('belfius', 'stx', [readerId], [payload, sessionId]).then(handleSuccess, handleError);
                    break;
                case 'emv-issuer':
                    Connector.plugin('emv', 'issuerPublicKeyCertificate', [readerId], [payload]).then(handleSuccess, handleSuccess);
                    break;
                case 'emv-icc':
                    Connector.plugin('emv', 'iccPublicKeyCertificate', [readerId], [payload]).then(handleSuccess, handleError);
                    break;
            }

            function handleSuccess(res) {
                $scope.result = angular.toJson(res.data);
            }

            function handleError(err) {
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
                Connector.plugin('beid', 'verifyPin', [readerId], [{}]).then(handleVerificationSuccess, handleVerificationError);
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
            Connector.plugin('beid', 'verifyPin', [readerId], [{ pin: $scope.pincode.value }]).then(handleVerificationSuccess, handleVerificationError);
        }

        $scope.$on(EVENTS.START_OVER, function () {
            $scope.cancel();
        });
    }

    function modalEmvPinCheckCtrl($scope, readerId, pinpad, $uibModalInstance, EVENTS, Connector, _) {
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
                Connector.plugin('emv', 'verifyPin', [readerId], [{}]).then(handleVerificationSuccess, handleVerificationError);
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
            Connector.plugin('emv', 'verifyPin', [readerId], [{ pin: $scope.pincode.value }]).then(handleVerificationSuccess, handleVerificationError);
        }

        $scope.$on(EVENTS.START_OVER, function () {
            $scope.cancel();
        });
    }

    function rootCtrl($scope, $rootScope, $location, $timeout, $uibModal, gclAvailable, readers, cardPresent,
                      RMC, EVENTS, _, Analytics, Connector) {
        let controller = this;
        controller.gclAvailable = gclAvailable;
        controller.readers = readers.data;
        controller.cardPresent = cardPresent;
        controller.dismissPanels = dismissPanels;
        controller.openSession = openSession;
        controller.getAtr = getAtr;
        controller.getCcidFeatures = getCcidFeatures;
        controller.getNonce = getNonce;
        controller.isBelfiusReader = isBelfiusReader;
        controller.isPresent = isPresent;
        controller.sendApdu = sendApdu;
        controller.sendCommand = sendCommand;
        controller.sendSTX = sendSTX;
        controller.closeSession = closeSession;
        controller.sendCcidCommand = sendCcidCommand;
        controller.emvApplications = emvApplications;
        controller.emvApplicationData = emvApplicationData;
        controller.emvIssuerCert = emvIssuerCert;
        controller.emvIccCert = emvIccCert;

        let pollIterations = 0;

        $rootScope.$on('$locationChangeSuccess', () => {
            if ($location.search() !== controller.currentAgentParams) {
                location.reload();
            }
        });

        init();

        function dismissPanels() {
            $scope.$broadcast(EVENTS.CLOSE_SIDEBAR);
            controller.cardTypesOpen = false;
            controller.faqOpen = false;
        }

        function openSession() {
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/open-session.html",
                resolve: {
                    readerId: () => {
                        return controller.readerWithCard.id;
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
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/get-atr.html",
                resolve: {
                    readerId: () => {
                        return controller.readerWithCard.id;
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
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/get-ccid-features.html",
                resolve: {
                    readerId: () => {
                        return controller.readerWithCard.id;
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
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/get-nonce.html",
                resolve: {
                    readerId: () => {
                        return controller.readerWithCard.id;
                    },
                    type: () => {
                        return 'nonce';
                    }
                },
                backdrop: 'static',
                controller: 'ModalSendCommandCtrl'
            });
        }

        function isBelfiusReader() {
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/is-belfius-reader.html",
                resolve: {
                    readerId: () => {
                        return controller.readerWithCard.id;
                    },
                    type: () => {
                        return 'is-belfius-reader';
                    }
                },
                backdrop: 'static',
                controller: 'ModalSendCommandCtrl'
            });
        }

        function isPresent() {
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/is-present.html",
                resolve: {
                    readerId: () => {
                        return controller.readerWithCard.id;
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
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/send-apdu.html",
                resolve: {
                    readerId: () => {
                        return controller.readerWithCard.id;
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
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/send-command.html",
                resolve: {
                    readerId: () => {
                        return controller.readerWithCard.id;
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
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/send-stx.html",
                resolve: {
                    readerId: () => {
                        return controller.readerWithCard.id;
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
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/close-session.html",
                resolve: {
                    readerId: () => {
                        return controller.readerWithCard.id;
                    },
                    type: () => {
                        return 'close-session';
                    }
                },
                backdrop: 'static',
                controller: 'ModalSendCommandCtrl'
            });
        }

        function sendCcidCommand() {
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/verify-ccid-feature.html",
                resolve: {
                    readerId: () => {
                        return controller.readerWithCard.id;
                    },
                    type: () => {
                        return 'ccid';
                    }
                },
                backdrop: 'static',
                controller: 'ModalSendCommandCtrl'
            });
        }

        function init() {
            if (gclAvailable) {
                Connector.core('version').then(version => {
                    console.log('Using T1C-JS ' + version);
                });
            } else { console.log("No GCL installation found"); }

            controller.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

            controller.currentAgentParams = $location.search();

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

            $scope.$on(EVENTS.SELECT_READER, (event, reader) => {
                controller.readerWithCard = reader;
            });

            $scope.$on(EVENTS.GCL_INSTALLED, function () {
                Analytics.trackEvent('T1C', 'install', 'Trust1Connector installed');
                controller.gclAvailable = true;
                Connector.init().then(() => {
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

            $scope.$on(EVENTS.START_OVER, function () {
                Connector.core('readers').then(result => {
                    controller.readers = result.data;
                    if (_.find(result.data, function (reader) {
                            return _.has(reader, 'card');
                        })) {
                        $timeout(() => { readCard(); });
                    } else {
                        $timeout(() => {
                            controller.readers = result.data;
                            controller.readerWithCard = undefined;
                            controller.cardPresent = false;
                            if (_.isEmpty(controller.readers)) {
                                pollForReaders();
                            } else {
                                pollForCard();
                            }
                        });
                    }
                }, function () {
                    $timeout(() => {
                        controller.readers = [];
                        controller.readerWithCard = undefined;
                        controller.cardPresent = false;
                        pollForReaders();
                    })
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
            Connector.core('pollReaders', [ 30, function (err, result) {
                // Success callback
                // Found at least one reader, poll for cards
                if (err) {
                    $timeout(() => {
                        controller.error = true;
                    });
                }
                else {
                    $timeout(() => {
                        controller.readers = result.data;
                        controller.pollingReaders = false;
                        Analytics.trackEvent('reader', 'connect', 'Reader connected: ' + _.join(_.map(controller.readers, 'name'), ','));
                        // if (controller.readers.length > 1) toastr.success('Readers found!');
                        // else toastr.success('Reader found!');
                        pollForCard();
                    })
                }
            }, function () {
                // Not used
                $timeout(() => {
                    controller.pollSecondsRemaining = controller.pollSecondsRemaining - 1;
                });
            }, function () {
                // timeout
                // controller.pollingReaders = false;
                // controller.pollTimeout = true;
                // toastr.warning('30 seconds have passed without a reader being connected. Please try again.', 'Timeout');
                pollForReaders();
            }]);
        }

        function pollForCard() {
            if (!controller.pollingCard) controller.pollingCard = true;
            controller.error = false;
            Connector.core('pollCardInserted', [3, function (err, result) {
                // Success callback
                // controller.readers = result.data;
                if (err) {
                    $timeout(() => {
                        controller.error = true;
                    })
                } else {
                    $timeout(() => {
                        controller.pollingCard = false;
                        controller.pollTimeout = false;
                        Analytics.trackEvent('card', 'insert', 'Card inserted: ' + result.card.atr);
                        pollIterations = 0;
                        // if ($scope.readers.length > 1) toastr.success('Readers found!');
                        // else toastr.success('Reader found!');
                        // Found a card, attempt to read it
                        // Refresh reader list first
                        Connector.core('readers').then(result => {
                            controller.readers = result.data;
                            readCard();
                        }, function () {
                            pollForCard();
                        });
                    });
                }
            }, function () {
                // "Waiting for reader connection" callback
                $timeout(() => {
                    controller.pollSecondsRemaining = controller.pollSecondsRemaining - 1;
                });
            }, function () {
                // "Waiting for card" callback
            }, function () {
                // timeout
                pollIterations++;
                // if enough time has passed, show the card not recognized message
                if (pollIterations >= 5) controller.pollTimeout = true;
                RMC.checkReaderRemoval().then(function (removed) {
                    if (removed) { controller.pollingCard = false; }
                    else { pollForCard(); }
                });
            }]);
        }

        function promptDownload() {
            // Prompt for dl
            Connector.plugin('download').then(res => {
                controller.dlLink = res.url;
            });
        }

        function readCard() {
            $timeout(() => {
                controller.readerWithCard = _.find(controller.readers, function (o) {
                    return _.has(o, 'card');
                });
            });
        }

        function emvApplications() {
            Connector.plugin('emv', 'applications', [controller.readerWithCard.id]).then(res => {
                $uibModal.open({
                    templateUrl: "views/cards/emv/belfius/emv-applications.html",
                    resolve: {
                        data: () => { return JSON.stringify(res); },
                        error: () => { return false; }
                    },
                    backdrop: 'static',
                    controller: 'ModalStaticDataCtrl'
                });
            }, err => {
                $uibModal.open({
                    templateUrl: "views/cards/emv/belfius/emv-applications.html",
                    resolve: {
                        data: () => { return JSON.stringify(err); },
                        error: () => { return true; }
                    },
                    backdrop: 'static',
                    controller: 'ModalStaticDataCtrl'
                });
            });
        }

        function emvApplicationData() {
            Connector.plugin('emv', 'applicationData', [ controller.readerWithCard.id ]).then(res => {
                $uibModal.open({
                    templateUrl: "views/cards/emv/belfius/emv-application-data.html",
                    resolve: {
                        data: () => { return JSON.stringify(res); },
                        error: () => { return false; }
                    },
                    backdrop: 'static',
                    controller: 'ModalStaticDataCtrl'
                });
            }, err => {
                $uibModal.open({
                    templateUrl: "views/cards/emv/belfius/emv-application-data.html",
                    resolve: {
                        data: () => { return JSON.stringify(err); },
                        error: () => { return true; }
                    },
                    backdrop: 'static',
                    controller: 'ModalStaticDataCtrl'
                });
            });
        }

        function emvIssuerCert() {
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/emv-issuer-cert.html",
                resolve: {
                    readerId: () => {
                        return controller.readerWithCard.id;
                    },
                    type: () => {
                        return 'emv-issuer';
                    }
                },
                backdrop: 'static',
                controller: 'ModalSendCommandCtrl'
            });
        }

        function emvIccCert() {
            $uibModal.open({
                templateUrl: "views/cards/emv/belfius/emv-icc-cert.html",
                resolve: {
                    readerId: () => {
                        return controller.readerWithCard.id;
                    },
                    type: () => {
                        return 'emv-icc';
                    }
                },
                backdrop: 'static',
                controller: 'ModalSendCommandCtrl'
            });
        }
    }

    function readerCtrl($scope, $stateParams) {
        $scope.readerId = $stateParams.readerId;
    }

})();
