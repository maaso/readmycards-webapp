(function () {
    'use strict';

    angular.module('app.summary')
        .controller('SummaryDownloadCtrl', summaryDlCtrl)
        .controller('XMLDownloadCtrl', xmlDlCtrl);


    function summaryDlCtrl($scope, $uibModalInstance, readerId, pinpad, needPinToGenerate, util, CardService, SummaryUtils, FileSaver, Blob, EVENTS, _) {
        $scope.doDownload = doDownload;
        $scope.onKeyPressed = onKeyPressed;
        $scope.startProcess = startProcess;
        $scope.submitPin = submitPin;
        $scope.pincode = {
            value: ''
        };
        $scope.pinpad = pinpad;

        let generatedFile;

        init();

        function init() {
            $scope.generateText = "Generate PDF";
            $scope.pinText = "Sign";
            $scope.downloadText = "Download";
            $scope.currentStep = 0;
        }

        function ok() {
            $uibModalInstance.close("ok");
        }

        function cancel() {
            $uibModalInstance.dismiss("cancel");
        }

        function doDownload() {
            SummaryUtils.downloadDocument(generatedFile.origFilename).then(function (signedPdf) {
                handleDownload(signedPdf.data, generatedFile.origFilename);
                ok();
            });
        }

        function handleDownload(data, fileName) {
            let blob = new Blob([data], { type: 'application/pdf' });
            FileSaver.saveAs(blob, fileName);
        }


        function onKeyPressed(data) {
            if (data === '<') {
                if (_.isEmpty($scope.pincode.value)) $uibModalInstance.dismiss('cancel');
                else $scope.pincode.value = $scope.pincode.value.slice(0, $scope.pincode.value.length - 1);
            } else if (data === '>') {
                submitPin();
            } else {
                $scope.pincode.value += data;
            }
        }

        function submitPin() {
            $scope.enterPin = false;
            if (needPinToGenerate) {
                // still need to generate the summary
                $scope.generateText = 'Generating...';
                util.generateSummaryToSign(readerId, $scope.pincode.value).then(res => {
                    console.log('generate ok');
                    console.log(res);
                    generatedFile = res;
                    $scope.currentStep = 2;
                    $scope.generateText = 'Generated';
                    $scope.pinText = 'Signing...';
                    CardService.signDocument(generatedFile.id, readerId, $scope.pincode.value).then(() => {
                        $scope.currentStep = 3;
                        $scope.pinText = 'Signed';
                        $scope.downloadText = 'Download Ready!';
                    }, err => {
                        console.log('sign error');
                        console.log(err);
                    })
                })
            } else {
                // summary has been generated, do sign
                $scope.pinText = "Signing...";
                CardService.signDocument(generatedFile.id, readerId, $scope.pincode.value).then(() => {
                    $scope.currentStep = 3;
                    $scope.pinText = 'Signed';
                    $scope.downloadText = 'Download Ready!';
                });
            }

        }

        function startProcess() {
            $scope.currentStep = 1;

            if (needPinToGenerate) {
                $scope.enterPin = true;
            } else {
                $scope.generateText = 'Generating...';
                util.generateSummaryToSign(readerId).then(function (res) {
                    generatedFile = res;
                    $scope.currentStep = 2;
                    $scope.generateText = 'Generated';

                    if (pinpad) {
                        // start signing process
                        $scope.pinText = 'Enter PIN on reader...';
                        CardService.signDocument(generatedFile.id, readerId, null).then(() => {
                            $scope.currentStep = 3;
                            $scope.pinText = 'Signed';
                            $scope.downloadText = 'Download Ready!'
                        });
                    } else {
                        // prompt user to enter pin
                        $scope.enterPin = true;
                    }
                });
            }
        }

        $scope.$on(EVENTS.START_OVER, () => {
            cancel();
        });
    }

    function xmlDlCtrl($scope, $uibModalInstance, readerId, pinpad, needPinToGenerate, util, CardService, SummaryUtils, FileSaver, Blob, EVENTS, _) {
        $scope.doDownload = doDownload;
        $scope.onKeyPressed = onKeyPressed;
        $scope.startProcess = startProcess;
        $scope.submitPin = submitPin;
        $scope.pincode = {
            value: ''
        };
        $scope.pinpad = pinpad;

        let generatedFile;

        init();

        function init() {
            $scope.generateText = "Generate Document";
            $scope.pinText = "Sign";
            $scope.downloadText = "Download";
            $scope.currentStep = 0;
        }

        function ok() {
            $uibModalInstance.close("ok");
        }

        function cancel() {
            $uibModalInstance.dismiss("cancel");
        }

        function doDownload() {
            SummaryUtils.downloadRaw(generatedFile.viewLink).then(function (xml) {
                handleDownload(xml.data, generatedFile.origFilename);
                ok();
            });
        }

        function handleDownload(data, fileName) {
            let blob = new Blob([data], { type: 'text/xml' });
            FileSaver.saveAs(blob, fileName);
        }


        function onKeyPressed(data) {
            if (data === '<') {
                if (_.isEmpty($scope.pincode.value)) $uibModalInstance.dismiss('cancel');
                else $scope.pincode.value = $scope.pincode.value.slice(0, $scope.pincode.value.length - 1);
            } else if (data === '>') {
                submitPin();
            } else {
                $scope.pincode.value += data;
            }
        }

        function submitPin() {
            $scope.enterPin = false;
            if (needPinToGenerate) {
                // still need to generate the summary
                $scope.generateText = 'Generating...';
                util.generateXMLToSign(readerId).then(res => {
                    console.log('generate ok');
                    console.log(res);
                    generatedFile = res;
                    $scope.currentStep = 2;
                    $scope.generateText = 'Generated';
                    $scope.pinText = 'Signing...';
                    CardService.signDocument(generatedFile.id, readerId, $scope.pincode.value).then(() => {
                        $scope.currentStep = 3;
                        $scope.pinText = 'Signed';
                        $scope.downloadText = 'Download Ready!';
                    }, err => {
                        console.log('sign error');
                        console.log(err);
                    })
                })
            } else {
                // summary has been generated, do sign
                $scope.pinText = "Signing...";
                CardService.signDocument(generatedFile.id, readerId, $scope.pincode.value).then(() => {
                    $scope.currentStep = 3;
                    $scope.pinText = 'Signed';
                    $scope.downloadText = 'Download Ready!';
                });
            }

        }

        function startProcess() {
            $scope.currentStep = 1;

            if (needPinToGenerate) {
                $scope.enterPin = true;
            } else {
                $scope.generateText = 'Generating...';
                util.generateXMLToSign(readerId).then(function (res) {
                    generatedFile = res;
                    $scope.currentStep = 2;
                    $scope.generateText = 'Generated';

                    if (pinpad) {
                        // start signing process
                        $scope.pinText = 'Enter PIN on reader...';
                        CardService.signDocument(generatedFile.id, readerId, null).then(() => {
                            $scope.currentStep = 3;
                            $scope.pinText = 'Signed';
                            $scope.downloadText = 'Download Ready!'
                        });
                    } else {
                        // prompt user to enter pin
                        $scope.enterPin = true;
                    }
                });
            }
        }

        $scope.$on(EVENTS.START_OVER, () => {
            cancel();
        });
    }

})();
