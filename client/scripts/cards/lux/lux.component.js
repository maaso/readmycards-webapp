(function () {
    'use strict';

    const luxVisualizer = {
        templateUrl: 'views/cards/lux/lux-viz.html',
        bindings: {
            rnData: '<'
        },
        controller: function ($rootScope, $uibModal, $compile, $http, $stateParams, $timeout, BeID, T1C) {
            let controller = this;

            controller.$onInit = () => {

                console.log(controller.rnData);

                controller.certStatus = 'checking';
                controller.pinStatus = 'idle';
                const filter = ['authentication-certificate', 'citizen-certificate', 'root-certificate'];
                T1C.getAllCerts($stateParams.readerId, filter).then(res => {
                    let validationReq = {
                        certificateChain: [
                            { order: 0, certificate: res.data.authentication_certificate },
                            { order: 1, certificate: res.data.citizen_certificate },
                            { order: 2, certificate: res.data.root_certificate },
                        ]
                    };
                    T1C.validateCertificateChain(validationReq).then(res => {
                        if (res.crlResponse.status && res.ocspResponse.status) controller.certStatus = 'valid';
                        else controller.certStatus = 'invalid';
                    }, () => {
                        controller.certStatus = 'error';
                    });
                })
            };

            controller.checkPin = () => {
                let modal = $uibModal.open({
                    templateUrl: "views/readmycards/modals/check-pin.html",
                    resolve: {
                        readerId: () => {
                            return $stateParams.readerId
                        },
                        pinpad: () => {
                            return T1C.getReader($stateParams.readerId).then(function (res) {
                                return res.data.pinpad;
                            })
                        }
                    },
                    backdrop: 'static',
                    controller: 'ModalPinCheckCtrl'
                });

                modal.result.then(function () {
                    controller.pinStatus = 'valid';
                }, function (err) {
                    switch (err.code) {
                        case 103:
                            controller.pinStatus = '2remain';
                            break;
                        case 104:
                            controller.pinStatus = '1remain';
                            break;
                        case 105:
                            controller.pinStatus = 'blocked';
                            break;
                    }
                });
            };

            controller.toggleCerts = () => {
                if (controller.certData) {
                    controller.certData = undefined;
                } else {
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
                        printedBy: '@@name v@@version'
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
        }};

    const beidCertificateStatus = {
        templateUrl: 'views/cards/beid/cert-status.html',
        bindings: {
            status: '<'
        },
        controller: function () {
            let controller = this;
            controller.$onChanges = () => {
                if (controller.status === 'checking') controller.infoText = 'Validating card certificates...';
                if (controller.status === 'valid') controller.infoText = 'All certificates OK. Card is valid.';
                if (controller.status === 'invalid') controller.infoText = 'Certificate check failed. Card invalid.';
                if (controller.status === 'error') controller.infoText = 'An error occurred during the validation process. Please try again later.';
            };
        }
    };

    const beidPinCheckStatus = {
        templateUrl: 'views/cards/beid/pin-check-status.html',
        bindings: {
            status: '<'
        },
        require: {
            parent: '^beidVisualizer'
        },
        controller: function (_) {
            let controller = this;
            controller.$onChanges = () => {
                if (controller.status === 'idle') controller.infoText = 'Click to check PIN code';
                if (controller.status === 'valid') controller.infoText = 'PIN check OK.';
                if (controller.status === '2remain') controller.infoText = 'Wrong PIN entered; 2 tries remaining.';
                if (controller.status === '1remain') controller.infoText = 'Wrong PIN entered; 1 try remaining!';
                if (controller.status === 'blocked') controller.infoText = '3 invalid PINs entered. Card blocked.';
                if (controller.status === 'error') controller.infoText = 'An error occurred during the validation process. Please try again later.';
            };

            controller.checkPin = () => {
                if (!_.includes(['valid', 'blocked'], controller.status)) controller.parent.checkPin();
            }
        }
    };

    const luxCard = {
        templateUrl: 'views/cards/lux/eid/lux-eid-card.html',
        bindings: {
            rnData: '<',
            picData: '<',
        },
        controller: function (_, BeID, CheckDigit) {
            let controller = this;

            controller.$onInit = () => {
                // controller.formattedCardNumber = BeID.formatCardNumber(controller.rnData.card_number);
                // controller.formattedRRNR = BeID.formatRRNR(controller.rnData.national_number);

                // let mrs = constructMachineReadableStrings(controller.rnData);

                // controller.machineReadable1 = mrs[0];
                // controller.machineReadable2 = mrs[1];
                // controller.machineReadable3 = mrs[2];

                controller.machineReadable1 = pad("IDLUXVMQ17WQEY4");
                controller.machineReadable2 = pad("8308193F2406100LUX<<<<<<<<LU<2");
                controller.machineReadable3 = pad("SPECIMEN<<JEANNE");
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
                second += validity + CheckDigit.calc(validity);
                second += rnData.nationality.substr(0,3);
                second += rnData.national_number;
                let finalCheck = rnData.card_number.substr(0,10) + rnData.national_number.substr(0,6) + validity + rnData.national_number;
                second += CheckDigit.calc(finalCheck);
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

    const luxTrustCard = {
        templateUrl: 'views/cards/lux/luxtrust/luxtrust-card.html',
        bindings: {
            rnData: '<'
        },
        controller: function () {

        }
    };

    angular.module('app.cards.lux')
        .component('luxVisualizer', luxVisualizer)
        .component('luxCertificateStatus', beidCertificateStatus)
        .component('luxPinCheckStatus', beidPinCheckStatus)
        .component('luxCard', luxCard)
        .component('luxTrustCard', luxTrustCard);
})();
