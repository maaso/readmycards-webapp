;(function() {
    "use strict";

    var module = angular.module("app", [
        /* Angular modules */
        "ngAnimate",
        "ngSanitize",

        /* 3rd party modules */
        "ui.bootstrap",
        "ui.router",
        'ngKeypad',

        /* custom modules */
        'app.demo',
        'app.plugin.lodash',
        'app.readmycards'

    ]);


    module.factory('errorInterceptor', function($q) {
        return {
            'responseError': function(response) {
                // do something on error
                if (response.status == 401) {
                    console.log('UNAUTHORIZED');
                    console.log('session timeout?');
                    logout();
                } else if (response.status == 403) {
                    //alert("Forbidden");
                } else if (response.status == 404) {
                    //alert("Not found");
                } else if (response.status) {

                    // TODO handle error?
                    if (response.data && response.data.errorMessage) {
                        // alert(response.data.errorMessage);
                    } else {
                        // alert("An unexpected server error has occurred");
                    }
                }
                return $q.reject(response);
            }
        };
    });

    module.config(function($httpProvider) {
        $httpProvider.interceptors.push('errorInterceptor');
    });

}());


