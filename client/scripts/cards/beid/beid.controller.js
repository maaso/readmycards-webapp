(function () {
    'use strict';

    angular.module('app.cards.beid')
        .controller('BeIDSummaryDownloadCtrl', summaryDlCtrl);


    function summaryDlCtrl($scope, $uibModalInstance, readerId, pinpad, data, BeID, FileSaver, Blob, EVENTS, _) {
        $scope.ok = ok;
        $scope.cancel = cancel;
        $scope.doDownload = doDownload;
        $scope.onKeyPressed = onKeyPressed;
        $scope.startProcess = startProcess;
        $scope.keys = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        $scope.pincode = '';
        $scope.pinpad = pinpad;

        let generatedFile;

        init();

        function init() {
            $scope.generateText = "Generate PDF";
            $scope.pinText = "PIN Code";
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
            BeID.downloadDocument(generatedFile.origFilename).then(function (signedPdf) {
                handleDownload(signedPdf.data, data.rnData.name + '_' + _.join(_.split(data.rnData.first_names, ' '), '_') + '_'
                    + data.rnData.third_name + '_summary.pdf');
                ok();
            });
        }

        function handleDownload(data, fileName) {
            let blob = new Blob([data], { type: 'application/pdf' });
            FileSaver.saveAs(blob, fileName);
        }


        function onKeyPressed(data) {
            if (data == '<') {
                if (_.isEmpty($scope.pincode)) $uibModalInstance.dismiss('cancel');
                else $scope.pincode = $scope.pincode.slice(0, $scope.pincode.length - 1);
            } else if (data == '>') {
                $scope.enterPin = false;
                $scope.pinText = "Signing...";
                BeID.signDocument(generatedFile.id, readerId, pinpad, $scope.pincode).then(() => {
                    $scope.currentStep = 3;
                    $scope.pinText = 'Signed';
                    $scope.downloadText = 'Download Ready!'
                });
            } else {
                $scope.pincode += data;
            }
        }

        function startProcess() {
            $scope.currentStep = 1;
            $scope.generateText = 'Generating...';

            // TODO read data from card!
            BeID.generateSummaryToSign(data).then(function (res) {
                generatedFile = res;
                $scope.currentStep = 2;
                $scope.generateText = 'Generated';

                if (pinpad) {
                    // start signing process
                    $scope.pinText = 'Enter PIN on reader...';
                    BeID.signDocument(generatedFile.id, readerId, pinpad, null).then(() => {
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
            $scope.cancel();
        });
    }

})();
