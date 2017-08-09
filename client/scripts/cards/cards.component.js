(function () {
    'use strict';


    const printSummary = {
        template: '<span class="btn btn-lg btn-primary btn-summary-download" ng-click="$ctrl.printFunction()()">Print legal copy of my card</span>',
        bindings: {
            printFunction: '&'
        }
    };

    const activationStatus = {
        templateUrl: 'views/cards/activation-status.html',
        bindings: {
            status: '<'
        },
        controller: function () {
            let controller = this;
            controller.$onChanges = () => {
                if (controller.status) { controller.infoText = 'Card is activated.'; }
                else { controller.infoText = 'Card is not activated.'; }
            };
        }
    };

    const pinCheckStatus = {
        templateUrl: 'views/cards/pin-check-status.html',
        bindings: {
            status: '<',
            maxTries: '<',
            okText: '<',
            pinCheckFunc: '&'
        },
        controller: function (_) {
            let controller = this;
            controller.$onChanges = () => {
                if (controller.status === 'idle') controller.infoText = 'Click to check PIN code';
                if (controller.status === 'valid') controller.infoText = controller.okText;
                if (controller.status === '4remain') controller.infoText = 'Wrong PIN entered; 4 tries remaining.';
                if (controller.status === '3remain') controller.infoText = 'Wrong PIN entered; 3 tries remaining.';
                if (controller.status === '2remain') controller.infoText = 'Wrong PIN entered; 2 tries remaining.';
                if (controller.status === '1remain') controller.infoText = 'Wrong PIN entered; 1 try remaining!';
                if (controller.status === 'blocked') controller.infoText = '' + controller.maxTries + ' invalid PINs entered. Card blocked.';
                if (controller.status === 'error') controller.infoText = 'An error occurred during the validation process. Please try again later.';
                if (controller.status === 'cancelled') controller.infoText = 'Cancelled on reader, click to try again.';
            };

            controller.checkPin = () => {
                if (!_.includes(['valid', 'blocked'], controller.status)) controller.pinCheckFunc()();
            }
        }
    };

    const certificateStatus = {
        templateUrl: 'views/cards/cert-status.html',
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

    angular.module('app.cards')
           .component('activationStatus', activationStatus)
           .component('certificateStatus', certificateStatus)
           .component('pinCheckStatus', pinCheckStatus)
           .component('printSummary', printSummary);
})();
