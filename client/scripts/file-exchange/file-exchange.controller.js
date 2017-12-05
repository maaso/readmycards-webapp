(function () {
    'use strict';

    angular.module('app.file-exchange')
           .controller('FileSignController', fileSignCtrl);


    function fileSignCtrl($scope, $uibModalInstance, $timeout, file, FileService, FileSaver, Blob, EVENTS, Analytics, _, Connector) {
        $scope.doDownload = doDownload;
        $scope.onKeyPressed = onKeyPressed;
        $scope.startProcess = startProcess;
        $scope.submitPin = submitPin;
        $scope.pincode = {
            value: ''
        };

        // 6. Sign with pincode
        // 7. WorkflowSign
        // 8. Download signed file

        let generatedFile, reader;

        init();

        function init() {
            $scope.generateText = "Upload File";
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
            FileService.downloadFromSignbox(generatedFile.origFilename).then(function (signedPdf) {
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
            $scope.pinText = "Signing...";
            Analytics.trackEvent('print', 'pin', 'PIN entered');
            FileService.signDocument(generatedFile.id, reader.id, reader.pinpad, $scope.pincode.value).then(() => {
                $scope.currentStep = 3;
                $scope.pinText = 'Signed';
                $scope.downloadText = 'Download Ready!'
            });
        }

        function startProcess() {
            $scope.currentStep = 1;
            $scope.generateText = 'Uploading...';

            // 1. Request file from T1C
            // 2. Upload to signbox && assign wf
            FileService.uploadFile(file.path, file.name).then(res => {
                // TODO show file in UI first?
                generatedFile = res.data;
                $scope.currentStep = 2;
                $scope.generateText = 'Uploaded';

                // 3. Select reader to use
                Connector.generic('readersCanSign', []).then(res => {
                    if (res.data && res.data.length) {
                        // select first available reader
                        reader = res.data[0];
                        // // 4. Start signing process (pinpad / non-pinpad)
                        $timeout(() => {
                            $scope.pinpad = reader.pinpad;
                            if (reader.pinpad) {
                                // start signing process
                                $scope.pinText = 'Enter PIN on reader...';
                                FileService.signDocument(generatedFile.id, reader.id, reader.pinpad, undefined).then((res) => {
                                    console.log(res);
                                    $scope.currentStep = 3;
                                    $scope.pinText = 'Signed';
                                    $scope.downloadText = 'Download Ready!'
                                });
                            } else {
                                // prompt user to enter pin
                                $scope.enterPin = true;
                            }
                        });
                    } else {
                        console.log("no readers to sign");
                        // TODO handle no reader available
                    }
                })

            })
        }

        $scope.$on(EVENTS.START_OVER, () => {
            cancel();
        });
    }

})();
