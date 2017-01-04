(function () {
    'use strict';

    angular.module('app')
    // UI-Router states
        .config(function ($stateProvider, $urlRouterProvider) {
                $urlRouterProvider.otherwise('/');

                $stateProvider
                // ROOT PAGE
                    .state('root', {
                        url: '/',
                        templateUrl: '/views/root.html',
                        resolve: {
                            T1C: 'T1C',
                            gclAvailable: function (T1C) {
                                return T1C.isGCLAvailable();
                            },
                            readers: function ($q, gclAvailable, T1C) {
                                if (gclAvailable) {
                                    return T1C.getReaders();
                                } else {
                                    return $q.when([]);
                                }
                            },
                            cardPresent: function ($q, gclAvailable, readers, T1C, _) {
                                if (gclAvailable) {
                                    return $q.when(!!_.find(readers.data, function (o) {
                                        return _.has(o, 'card');
                                    }));
                                } else {
                                    return $q.when(false);
                                }
                            }
                        },
                        controller: 'RootCtrl as root'
                    })
                    .state('root.reader', {
                        url: ':readerId',
                        templateUrl: '/views/reader.html',
                        controller: 'ReaderCtrl as ctrl'
                    })
            }
        );

})();