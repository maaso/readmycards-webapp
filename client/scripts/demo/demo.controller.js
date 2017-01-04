(function () {
    'use strict';

    angular.module('app.demo')
        .controller('DemoLandingCtrl', DemoLandingCtrl)
        .controller('DemoReaderCtrl', DemoReaderCtrl)
        .controller('ModalPinValidationCtrl', ModalPinValidationCtrl)
        .controller('ModalSignDataCtrl', ModalSignDataCtrl)
        .controller('ModalAuthenticateCtrl', ModalAuthenticateCtrl);


    function DemoLandingCtrl($scope, T1C) {
        $scope.installed = false;
        $scope.refreshReaders = refreshReaders;
        $scope.getApiKey = getApiKey;
        $scope.getDSUrl = getDSUrl;
        $scope.getJwt = getJwt;
        $scope.getPlugins = getPlugins;
        $scope.getPubKey = getPubKey;
        $scope.info = info;
        $scope.infoBrowser = infoBrowser;
        $scope.refreshJwt = refreshJwt;
        $scope.sendJwtToGcl = sendJwtToGcl;

        init();

        function init() {
            refreshReaders();

            T1C.getInfo().then(function (result) {
                // console.log(result);
            });

            T1C.getReadersWithCards().then(function (readers) {
                $scope.readersWithCards = readers.data;
            });

            T1C.listPlugins().then(function (plugins) {
                $scope.plugins = plugins.data;
            });
        }

        function refreshReaders() {
            T1C.getReaders().then(function (readers) {
                $scope.readers = readers.data;
            });
        }

        function getApiKey() {
            T1C.getApiKey().then(function (result) {
                $scope.result = result;
            })
        }

        function getDSUrl() {
            console.log('ds url');
            T1C.getDSUrl().then(function (result) {
                $scope.result = result;
            })
        }

        function getJwt() {
            T1C.getJwt().then(function (result) {
                $scope.result = result;
            })
        }

        function getPlugins() {
            T1C.listPlugins().then(function (result) {
                console.log(result);
                $scope.result = result.data;
            })
        }

        function getPubKey() {
            T1C.getPubKey().then(function (result) {
                $scope.result = result.data;
            })
        }

        function info() {
            T1C.getInfo().then(function (result) {
                $scope.result = result;
            })
        }

        function infoBrowser() {
            T1C.browserInfo().then(function (result) {
                $scope.result = result;
            })
        }

        function refreshJwt() {
            T1C.refreshJwt().then(function (result) {
                $scope.result = result;
            })
        }

        function sendJwtToGcl() {
            T1C.sendJwtToGcl().then(function (result) {
                $scope.result = result;
            })
        }
    }

    function DemoReaderCtrl($q, $scope, $state, $stateParams, $uibModal, T1C, _) {
        // Utility
        $scope.toLanding = toLanding;
        $scope.toReader = toReader;
        // BeID
        $scope.readRnData = readRnData;
        $scope.readAddress = readAddress;
        $scope.readPicture = readPicture;
        $scope.getAllCerts = getAllCerts;
        $scope.getRootCert = getRootCert;
        $scope.getCitizenCert = getCitizenCert;
        $scope.getAuthCert = getAuthCert;
        $scope.getNonRepCert = getNonRepCert;
        $scope.getRRNCert = getRRNCert;
        $scope.verifyPin = verifyPin;
        $scope.signData = signData;
        $scope.authenticate = authenticate;
        // EMV
        $scope.getPan = getPan;
        init();

        function init() {
            $scope.certData = {};
            T1C.getReaders().then(function (result) {
                $scope.readers = result.data;
                $scope.reader = _.find(result.data, function (reader) {
                    return reader.id === $stateParams.readerId;
                });

                if ($scope.reader.card) {
                    T1C.isCardTypeBeId($scope.reader.id).then(function (beId) {
                        $scope.beId = beId;
                    });
                }
            })
        }

        // Utility function
        function toLanding() {
            $state.go('root.landing');
        }

        function toReader(reader) {
            $state.go('root.reader', { readerId: reader.id });
        }

        function loadingWrapper(promiseToWrap) {
            $scope.loading = true;
            return $q.when(promiseToWrap).then(function () {
                $scope.loading = false;
            }, function () {
                $scope.loading = false;
            })
        }

        // BeID functions
        function readRnData() {
            loadingWrapper(T1C.getRnData($stateParams.readerId).then(function (result) {
                $scope.rnData = result.data;
            }));
        }

        function readAddress() {
            loadingWrapper(T1C.getAddress($stateParams.readerId).then(function (result) {
                $scope.addressData = result.data;
            }));
        }

        function readPicture() {
            loadingWrapper(T1C.getPic($stateParams.readerId).then(function (result) {
                $scope.picData = "data:image/jpeg;base64," + result.data;
            }));
        }

        function getAllCerts() {
            loadingWrapper(T1C.filterBeIdCerts($stateParams.readerId, []).then(function (result) {
                $scope.certData = result.data;
            }));
        }

        function getRootCert() {
            loadingWrapper(T1C.getRootCert($stateParams.readerId).then(function (result) {
                $scope.certData.root_certificate = result.data;
            }));
        }

        function getCitizenCert() {
            loadingWrapper(T1C.getCitizenCert($stateParams.readerId).then(function (result) {
                $scope.certData.citizen_certificate = result.data;
            }));
        }

        function getAuthCert() {
            loadingWrapper(T1C.getAuthCert($stateParams.readerId).then(function (result) {
                $scope.certData.authentication_certificate = result.data;
            }));
        }

        function getNonRepCert() {
            loadingWrapper(T1C.getNonRepCert($stateParams.readerId).then(function (result) {
                $scope.result = result;
                $scope.certData.non_repudiation_certificate = result.data;
            }));
        }

        function getRRNCert() {
            loadingWrapper(T1C.getRrnCert($stateParams.readerId).then(function (result) {
                $scope.certData.rrn_certificate = result.data;
            }));
        }

        /// Opens a modal for the user to enter pincode
        function verifyPin() {
            $uibModal.open({
                templateUrl: "views/ui/modalPinValidation.html",
                size: "md",
                resolve: {
                    pinpad: $scope.reader.pinpad
                },
                controller: "ModalPinValidationCtrl",
                windowClass: "modal3DFlipVertical"	// Animation Class put here.
            });
        }

        function signData() {
            $uibModal.open({
                templateUrl: "views/ui/modalSignData.html",
                size: "md",
                resolve: {
                    pinpad: $scope.reader.pinpad
                },
                controller: "ModalSignDataCtrl",
                windowClass: "modal3DFlipVertical"	// Animation Class put here.
            });
        }

        function authenticate() {
            $uibModal.open({
                templateUrl: "views/ui/modalAuthenticate.html",
                size: "md",
                resolve: {
                    pinpad: $scope.reader.pinpad
                },
                controller: "ModalAuthenticateCtrl",
                windowClass: "modal3DFlipVertical"	// Animation Class put here.
            });
        }


        // EMV functions
        function getPan() {
            loadingWrapper(T1C.getPAN($stateParams.readerId).then(function (result) {
                $scope.panData = result.data;
            }));
        }
    }

    function ModalPinValidationCtrl($scope, $stateParams, pinpad, T1C) {
        $scope.pinresult = {};
        $scope.pinpad = pinpad;

        function verifyWithPinpad() {
            T1C.verifyBeIDPin($stateParams.readerId).then(function (verify) {
                if (verify.success) {
                    $scope.pinresult = { caption: 'PIN Correct' };
                }
            }, function (fail) {
                var response = angular.fromJson(fail.responseText);
                $scope.pinresult = { error: response.description };
            });
        }

        function verifyWithoutPinpad() {
            console.log('without pinpad');
            console.log($scope.pwd);
            T1C.verifyBeIDPin($stateParams.readerId, $scope.pwd).then(function (verify) {
                if (verify.success) {
                    $scope.pinresult = { caption: 'PIN Correct' };
                }
            }, function (fail) {
                var response = angular.fromJson(fail.responseText);
                console.log(fail);
                $scope.pinresult = { error: response.description };
            });
        }

        $scope.validatePIN = function (){
            $scope.pinresult = {};
            console.log("Validate PIN");
            if ($scope.pinpad) verifyWithPinpad();
            else verifyWithoutPinpad();
        };

        $scope.modalClose = function() {
            $scope.$close();	// this method is associated with $modal scope which is this.
        }

    }

    function ModalSignDataCtrl($scope, $stateParams, pinpad, T1C) {
        $scope.dataToSign = "E1uHACbPvhLew0gGmBH83lvtKIAKxU2/RezfBOsT6Vs=";
        $scope.pinpad = pinpad;

        function signWithPinpad() {
            T1C.signData($stateParams.readerId, undefined, 'sha256', $scope.dataToSign).then(function (sign) {
                console.log(sign);
                if (sign.success) {
                    $scope.pinresult = {
                        caption: 'Data signed successfully!',
                        signedData: sign.data
                    };
                }
            }, function (fail) {
                var response = angular.fromJson(fail.responseText);
                console.log(fail);
                $scope.pinresult = { error: response.description };
            });
        }

        function signWithoutPinpad() {
            T1C.signData($stateParams.readerId, $scope.pwd, 'sha256', $scope.dataToSign).then(function (sign) {
                console.log(sign);
                if (sign.success) {
                    $scope.pinresult = {
                        caption: 'Data signed successfully!',
                        signedData: sign.data
                    };
                }
            }, function (fail) {
                var response = angular.fromJson(fail.responseText);
                console.log(fail);
                $scope.pinresult = { error: response.description };
            });
        }

        $scope.signData = function () {
            $scope.pinresult = {};
            if ($scope.pinpad) signWithPinpad();
            else signWithoutPinpad();
        };

        $scope.modalClose = function() {
            $scope.$close();	// this method is associated with $modal scope which is this.
        }

    }

    function ModalAuthenticateCtrl($scope, $stateParams, pinpad, T1C) {
        $scope.challenge = "I2e+u/sgy7fYgh+DWA0p2jzXQ7E=";
        $scope.pinpad = pinpad;


        function authWithPinpad() {
            T1C.authenticate($stateParams.readerId, undefined, 'sha1', $scope.challenge).then(function (auth) {
                if (auth.success) {
                    $scope.pinresult = {
                        caption: 'Authenticated successfully!',
                        authData : auth.data
                    };
                }
            }, function (fail) {
                var response = angular.fromJson(fail.responseText);
                console.log(fail);
                $scope.pinresult = { error: response.description };
            });
        }

        function authWithoutPinpad() {
            T1C.authenticate($stateParams.readerId, $scope.pwd, 'sha1', $scope.challenge).then(function (auth) {
                if (auth.success) {
                    $scope.pinresult = {
                        caption: 'Authenticated successfully!',
                        authData : auth.data
                    };
                }
            }, function (fail) {
                var response = angular.fromJson(fail.responseText);
                console.log(fail);
                $scope.pinresult = { error: response.description };
            });
        }

        $scope.authenticate = function() {
            $scope.pinresult = {};
            if ($scope.pinpad) authWithPinpad();
            else authWithoutPinpad();
        };

        $scope.modalClose = function() {
            $scope.$close();	// this method is associated with $modal scope which is this.
        }

    }

})();
