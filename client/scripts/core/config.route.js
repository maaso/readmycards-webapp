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
                               username: function(Citrix) {
                                   return Citrix.checkUserName();
                               },
                               gclAvailable: function (username, T1C) {
                                   return T1C.core.isGCLAvailable("root");
                               },
                               readers: function ($q, gclAvailable, T1C) {
                                   if (gclAvailable) {
                                       return T1C.core.getReaders().then(function (response) {
                                           return response;
                                       }, function () {
                                           // Should an error occur, we don't want it to block the app
                                           return $q.when([]);
                                       });
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
                           url: ':readerId?username',
                           templateUrl: '/views/reader.html',
                           controller: 'ReaderCtrl as ctrl'
                       })
               }
           )
           .run( function ($rootScope, $location) {
               let locationSearch;

               $rootScope.$on('$stateChangeStart',
                   function (event, toState, toParams, fromState, fromParams) {
                       //save location.search so we can add it back after transition is done
                       locationSearch = $location.search();
                   });

               $rootScope.$on('$stateChangeSuccess',
                   function () {
                       //restore all query string parameters back to $location.search
                       $location.search(locationSearch);
                   });
           });

})();
