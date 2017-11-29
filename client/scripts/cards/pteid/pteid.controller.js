(function () {
    'use strict';

    angular.module('app.cards.pteid')
           .controller('ModalPtAddressPinCheckCtrl', modalPinCheckCtrl);


    function modalPinCheckCtrl($scope, readerId, pinpad, $uibModalInstance, EVENTS, Connector, _) {
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
                Connector.plugin('pteid', 'address', [readerId], [{ }]).then(handleVerificationSuccess, handleVerificationError);
            }
            // else, wait until user enters pin
        }

        function handleVerificationSuccess(res) {
            $uibModalInstance.close(res);
        }

        function handleVerificationError(err) {
            $uibModalInstance.dismiss(err);
        }

        function ok() {
            $uibModalInstance.close('ok');
        }

        function cancel() {
            $uibModalInstance.dismiss('cancel');
        }

        function onKeyPressed(data) {
            if (data === '<') {
                if (_.isEmpty($scope.pincode.value)) {
                    $uibModalInstance.dismiss('cancel');
                } else {
                    $scope.pincode.value = $scope.pincode.value.slice(0, $scope.pincode.value.length - 1);
                }
            } else if (data === '>') {
                submitPin();
            } else {
                $scope.pincode.value += data;
            }
        }

        function submitPin() {
            Connector.plugin('pteid', 'address', [readerId], [{ pin: $scope.pincode.value }]).then(handleVerificationSuccess, handleVerificationError);
        }

        $scope.$on(EVENTS.START_OVER, function () {
            $scope.cancel();
        });
    }

})();
