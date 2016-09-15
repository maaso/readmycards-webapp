(function () {
    'use strict';

    angular.module('app.readmycards')
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
                dlUrl: '<'
            },
            controller: function ($scope, T1C, $timeout) {
                this.$onInit = function () {
                    pollForGcl();
                };

                function pollForGcl() {
                    $timeout(function () {
                        T1C.getInfo().then(function (res) {
                            // Info retrieved, GCL is installed
                            console.log(res);
                            $scope.$emit('gcl');
                        }, function (err) {
                            pollForGcl();
                        });
                    }, 2500)
                }
            }
        })
        .component('readerPolling', {
            templateUrl: 'views/readmycards/components/reader-polling.html'
        })
        .component('cardPolling', {
            templateUrl: 'views/readmycards/components/card-polling.html'
        })
        .component('rmcHeader', {
            templateUrl: 'views/readmycards/components/header.html'
        })
        .component('rmcFooter', {
            templateUrl: 'views/readmycards/components/footer.html'
        })
})();
