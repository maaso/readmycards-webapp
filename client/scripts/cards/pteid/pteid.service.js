(function () {
    'use strict';

    angular.module('app.cards.pteid')
           .service('PtUtils', PtUtils);

    function PtUtils($q, $http, API, Core) {
        this.generateSummaryToSign = generateSummaryToSign;
        this.signDocument = signDocument;
        this.verifyPin = verifyPin;

        function generateSummaryToSign(readerId) {
            let pt = Core.getConnector().pteid(readerId);

            return pt.idData().then(idData => {
                console.log(idData);
                return API.convertJPEG2000toJPEG(idData.data.photo).then(photo => {
                    console.log(photo);
                    return $http.post('api/cards/pt/summarytosign', { idData: idData.data, photo: photo.base64Pic }).then(function (res) {
                        return res.data;
                    });
                });
            });
        }

        function verifyPin(readerId, pin) {
            return Core.getConnector().verifyPin(readerId, { pin });
        }


        function signDocument(documentId, readerId, hasPinPad, pin) {
            let signing = $q.defer();
            let progress = 0;
            let numberComplete = 0;
            let numberFailed = 0;
            let thrownFailure;
            let preparationSteps;

            // Check if one of the tasks requires an eID signature
            if (_.find(documents, function (file) {
                    return file.workflowBean.stepConfig[file.actualStep - 1].taskType === 'TASK_EID_SIGN';
                })) {
                // We need to do an eID signing, get signing data ready
                preparationSteps = CardService.determineType(readerId, pin).then(CardService.getSignDataForType);
            } else {
                // only validation steps selected, no need to get signing data
                preparationSteps = $q.when('ready');
            }

            preparationSteps.then(prepData => {
                let documentPromiseChain = $q.when();
                _.forEach(documents, function (file) {
                    let taskType = file.workflowBean.stepConfig[file.actualStep - 1].taskType;
                    let docData = angular.copy(prepData);

                    if (taskType === 'TASK_VALIDATE') {
                        documentPromiseChain = documentPromiseChain.then(function() {
                            return WorkflowValidate.save(
                                { divId: file.workflowBean.division.id },
                                { docId: file.id }).$promise
                        })
                                                                   .then(notify)
                                                                   .catch(notifyFailure);
                    }
                    else if (taskType === 'TASK_EID_SIGN') {
                        documentPromiseChain = documentPromiseChain
                            .then(function () {
                                docData.docId = file.id;
                                docData.additionalInformation.role = signingRoles[file.id].name;
                                return $q.when({ queryParams: { divId: file.workflowBean.division.id }, postData: docData });
                            })
                            .then(dataToSign)
                            .then(function (dataToSign) {
                                return $q.when({ readerId: readerId, pin: pin, dataToSign: dataToSign });
                            })
                            .then(signWithConnector)
                            .then(function (signedData) {
                                docData.signedData = signedData;
                                return $q.when({ queryParams: { divId: file.workflowBean.division.id }, postData: docData });
                            })
                            .then(workflowSign)
                            .then(notify)
                            .catch(notifyFailure);
                    }

                    function notify() {
                        progress++;
                        numberComplete++;
                        signing.notify({ progress: progress, total: documents.length });
                    }

                    function notifyFailure(failure) {
                        if (failure.responseJSON && ( failure.responseJSON.code === 103 || failure.responseJSON.code === 104 )) {
                            // pin code incorrect, ask user to retry
                            signing.reject(failure);
                        } else {
                            progress++;
                            numberFailed++;
                            signing.notify({ progress: progress, total: documents.length });
                            thrownFailure = failure;
                        }
                    }
                });

                documentPromiseChain.then(function () {
                    signing.resolve({ success: numberComplete, fail: numberFailed, error: thrownFailure, total: documents.length });
                });
            }, function (err) {
                signing.reject(err);
            });

            return signing.promise;
        }

        function dataToSign(args) {
            return WorkflowGetDataToSign.save(args.queryParams, args.postData).$promise;
        }

        function signWithConnector (inputObj) {
            return T1C.getConnector().then(connector => {
                return connector.sign(inputObj.readerId,
                    { pin: inputObj.pin, data: inputObj.dataToSign.bytes, algorithm_reference: inputObj.dataToSign.digestAlgorithm }).then(res => {
                    return res.data;
                });
            });
        }

        function workflowSign(args) {
            return WorkflowSign.save(args.queryParams, args.postData).$promise;
        }
    }


})();