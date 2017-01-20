(function () {
    'use strict';

    const beidCertificateStatus = {
        templateUrl: 'views/demo/components/cert-status.html',
        bindings: {
            status: '<'
        },
        controller: function () {
            let controller = this;
            controller.$onChanges = () => {
                if (controller.status === 'checking') controller.infoText = 'Validating card certificates... please wait.';
                if (controller.status === 'valid') controller.infoText = 'All certificates OK. Card is valid.';
                if (controller.status === 'invalid') controller.infoText = 'Certificate validation failed. Card is invalid.';
                if (controller.status === 'error') controller.infoText = 'An error occurred during the validation process. Please try again later.';
            };
        }
    };

    const beidCard = {
        templateUrl: 'views/demo/components/beid-card.html',
        bindings: {
            rnData: '<',
            picData: '<',
        },
        controller: function (_, BeID, CheckDigit) {
            let controller = this;

            controller.$onInit = () => {
                controller.formattedCardNumber = BeID.formatCardNumber(controller.rnData.card_number);
                controller.formattedRRNR = BeID.formatRRNR(controller.rnData.national_number);

                let mrs = constructMachineReadableStrings(controller.rnData);

                controller.machineReadable1 = mrs[0];
                controller.machineReadable2 = mrs[1];
                controller.machineReadable3 = mrs[2];
            };

            function constructMachineReadableStrings(rnData) {
                let mrs = [];
                // First line
                let prefix = 'ID';
                let first = 'BEL' + rnData.card_number.substr(0, 9) + '<' + rnData.card_number.substr(9);
                first += CheckDigit.calc(first);
                first = pad(prefix + first);
                mrs.push(first.toUpperCase());

                // Second line
                let second = rnData.national_number.substr(0, 6);
                second += CheckDigit.calc(second);
                second += rnData.sex;
                let validity = rnData.card_validity_date_end.substr(8,2) + rnData.card_validity_date_end.substr(3,2) + rnData.card_validity_date_end.substr(0,2);
                validity += CheckDigit.calc(validity);
                second += validity;
                second += rnData.nationality.substr(0,3);
                second += rnData.national_number;
                second += '5'; // TODO figure out this check number!
                second = pad(second);
                mrs.push(second.toUpperCase());

                // Third line
                let third = _.join(_.split(rnData.name,' '),'<') + '<<' + _.join(_.split(rnData.first_names,' '),'<') + '<' + _.join(_.split(rnData.third_name,' '),'<');
                third = pad(third);
                mrs.push(third.toUpperCase());
                return mrs;
            }

            function pad(string) {
                return _.padEnd(_.truncate(string, { length: 30, omission: '' }), 30, '<');
            }
        }
    };

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
        .component('beidVisualizer', {
            templateUrl: 'views/demo/components/beid-viz.html',
            bindings: {
                rnData: '<',
                addressData: '<',
                picData: '<',
            },
            controller: function ($rootScope, $compile, $http, $stateParams, $timeout, BeID, T1C) {
                let controller = this;

                controller.$onInit = () => {
                    controller.status = 'checking';
                    let filter = ['authentication-certificate', 'citizen-certificate', 'root-certificate'];
                    T1C.getAllCerts($stateParams.readerId, filter).then(res => {
                        let validationReq = {
                            certificateChain: [
                                { order: 0, certificate: res.data.authentication_certificate },
                                { order: 1, certificate: res.data.citizen_certificate },
                                { order: 2, certificate: res.data.root_certificate },
                            ]
                        };
                        T1C.validateCertificateChain(validationReq).then(res => {
                            if (res.crlResponse.status && res.ocspResponse.status) controller.status = 'valid';
                            else controller.status = 'invalid';
                        }, () => {
                            controller.status = 'error';
                        });
                    })
                };

                controller.toggleCerts = () => {
                    if (controller.certData) {
                        controller.doCollapse = true;
                        $timeout(() => {
                            controller.certData = undefined;
                        }, 500);
                    }
                    else {
                        if (!controller.loadingCerts) {
                            controller.loadingCerts = true;
                            T1C.getAllCerts($stateParams.readerId).then(res => {
                                controller.loadingCerts = false;
                                controller.certData = res.data;
                            });
                        }

                    }
                };

                function printHtml(html) {
                    let hiddenFrame = $('<iframe style="display: none"></iframe>').appendTo('body')[0];
                    hiddenFrame.contentWindow.printAndRemove = function() {
                        $timeout(() => {
                            hiddenFrame.contentWindow.print();
                            $(hiddenFrame).remove();
                        },500)
                    };
                    let htmlDocument = "<!doctype html>"+
                        "<html>"+
                            '<head><title>Belgium Identity Card</title></head>' +
                        '<body onload="printAndRemove();">' + // Print only after document is loaded
                        html +
                        '</body>'+
                        "</html>";
                    let doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
                    doc.write(htmlDocument);
                    doc.close();
                }

                controller.printSummary = () => {
                    $http.get('views/demo/components/summary.html').success(function(template) {
                        let data = {
                            rnData: controller.rnData,
                            address: controller.addressData,
                            pic: controller.picData,
                            dob: moment(controller.rnData.national_number.substr(0,6), 'YYMMDD').format('MMMM D, YYYY'),
                            formattedCardNumber: BeID.formatCardNumber(controller.rnData.card_number),
                            formattedRRNR: BeID.formatRRNR(controller.rnData.national_number),
                            validFrom: moment(controller.rnData.card_validity_date_begin, 'DD.MM.YYYY').format('MMMM D, YYYY'),
                            validUntil: moment(controller.rnData.card_validity_date_end, 'DD.MM.YYYY').format('MMMM D, YYYY'),
                            printDate: moment().format('MMMM D, YYYY'),
                            printedBy: 'ReadMyCards.eu v1.2.9'
                        };
                        let printScope = angular.extend($rootScope.$new(), data);
                        let element = $compile($('<div>' + template + '</div>'))(printScope);
                        let waitForRenderAndPrint = function() {
                            if(printScope.$$phase || $http.pendingRequests.length) {
                                $timeout(waitForRenderAndPrint);
                            } else {
                                printHtml(element.html());
                                printScope.$destroy(); // To avoid memory leaks from scope create by $rootScope.$new()
                            }
                        };
                        waitForRenderAndPrint();
                    });
                }
            }
        })
        .component('beidCertificateStatus', beidCertificateStatus)
        .component('beidCard', beidCard)
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
})();
