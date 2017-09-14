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
                               username: function(Citrix) {
                                   return Citrix.checkUserName();
                               },
                               connector: function(Connector) {
                                   return Connector.init();
                               },
                               gclAvailable: function (connector, username, T1C) {
                                   return T1C.isGCLAvailable();
                               },
                               readers: function ($q, gclAvailable, Connector) {
                                   if (gclAvailable) {
                                       return Connector.get().core().readers().then(function (response) {
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
               }
           )
           .run( function ($rootScope, $location, _) {
               let locationSearch;

               $rootScope.$on('$stateChangeStart',
                   function (event, toState, toParams, fromState, fromParams) {
                       //save location.search so we can add it back after transition is done
                       locationSearch = $location.search();
                       console.log(locationSearch);
                   });

               $rootScope.$on('$stateChangeSuccess',
                   function () {
                       //restore all query string parameters back to $location.search
                       $location.search(locationSearch);
                   });
           });

})();
