(function () {
    'use strict';

    angular.module('app.cards.beid')
        .controller('BeIDSummaryDownloadCtrl', summaryDlCtrl);


    function summaryDlCtrl($scope, $uibModalInstance, readerId, pinpad, BeUtils, FileSaver, Blob, EVENTS, Analytics, _) {
        $scope.doDownload = doDownload;
        $scope.onKeyPressed = onKeyPressed;
        $scope.startProcess = startProcess;
        $scope.submitPin = submitPin;
        $scope.keys = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        $scope.pincode = {
            value: ''
        };
        $scope.pinpad = pinpad;

        let generatedFile;

        init();

        function init() {
            $scope.generateText = "Generate PDF";
            $scope.pinText = "Enter PIN Code";
            $scope.downloadText = "Download PDF";
            $scope.currentStep = 0;
        }

        function ok() {
            $uibModalInstance.close("ok");
        }

        function cancel() {
            $uibModalInstance.dismiss("cancel");
        }

        function doDownload() {
            Analytics.trackEvent('print', 'download', 'Document downloaded');
            BeUtils.downloadDocument(generatedFile.origFilename).then(function (signedPdf) {
                handleDownload(signedPdf.data, generatedFile.origFilename);
                ok();
            });
        }

        function handleDownload(data, fileName) {
            let blob = new Blob([data], { type: 'application/pdf' });
            FileSaver.saveAs(blob, fileName);
        }


        function onKeyPressed(data) {
            if (data == '<') {
                if (_.isEmpty($scope.pincode.value)) $uibModalInstance.dismiss('cancel');
                else $scope.pincode.value = $scope.pincode.value.slice(0, $scope.pincode.value.length - 1);
            } else if (data == '>') {
                submitPin();
            } else {
                $scope.pincode.value += data;
            }
        }

        function submitPin() {
            $scope.enterPin = false;
            $scope.pinText = "Signing...";
            Analytics.trackEvent('print', 'pin', 'PIN entered');
            BeUtils.signDocument(generatedFile.id, readerId, pinpad, $scope.pincode.value).then(() => {
                $scope.currentStep = 3;
                $scope.pinText = 'Signed';
                $scope.downloadText = 'Download Ready!'
            });
        }

        function startProcess() {
            Analytics.trackEvent('print', 'start', 'Printing process started');
            $scope.currentStep = 1;
            $scope.generateText = 'Generating...';

            BeUtils.generateSummaryToSign(readerId).then(function (res) {
                generatedFile = res;
                $scope.currentStep = 2;
                $scope.generateText = 'Generated';

                if (pinpad) {
                    // start signing process
                    $scope.pinText = 'Enter PIN on reader...';
                    BeUtils.signDocument(generatedFile.id, readerId, pinpad, null).then(() => {
                        Analytics.trackEvent('print', 'pin', 'PIN entered');
                        $scope.currentStep = 3;
                        $scope.pinText = 'Signed';
                        $scope.downloadText = 'Download Ready!'
                    });
                } else {
                    // prompt user to enter pin
                    $scope.enterPin = true;
                }
            })
        }

        $scope.$on(EVENTS.START_OVER, () => {
            cancel();
        });
    }

})();
