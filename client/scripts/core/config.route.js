(function () {
    'use strict';

    angular.module('app')
    // UI-Router states
        .config(function ($stateProvider, $urlRouterProvider) {
                $urlRouterProvider.otherwise('/');

                $stateProvider
                // ROOT PAGE


            }
        );

})();


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
                               connector: function(Connector) {
                                   return Connector.init();
                               },
                               gclAvailable: function (connector, T1C) {
                                   return T1C.isGCLAvailable();
                               },
                               readers: function ($q, gclAvailable, Connector) {
                                   if (gclAvailable) {
                                       return Connector.core('readers').then(response => {
                                           return response;
                                       }, function () {
                                           // Should an error occur, we don't want it to block the app
                                           return $q.when([]);
                                       });
                                   } else {
                                       return $q.when([]);
                                   }
                               },
                               cardPresent: function ($q, gclAvailable, readers, _) {
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
                       .state('consent-required', {
                           templateUrl: '/views/root.html',
                           controller: 'NoConsentCtrl as root'
                       })
                       .state('root.reader', {
                           url: ':readerId',
                           templateUrl: '/views/reader.html',
                           controller: 'ReaderCtrl as ctrl'
                       })
               }
           )
           .run( function ($rootScope, ConsentService) {
               $rootScope.$on('consent-required', () => {
                   ConsentService.showConsentModal().then(res => {
                       $rootScope.$broadcast('consent-result', res);
                   });
               });
           });

})();