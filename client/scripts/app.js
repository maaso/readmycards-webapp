;(function() {
    "use strict";

    let module = angular.module("app", [
        /* Angular modules */
        "ngAnimate",
        "ngSanitize",

        /* 3rd party modules */
        "ui.bootstrap",
        "ui.router",
        'ngKeypad',
        'angular-google-analytics',
        'ngFileSaver',
        'ngclipboard',
        'ngFitText',

        /* custom modules */
        'app.plugin.lodash',
        'app.connector',
        'app.readmycards',
        'app.cards',
        'app.summary'

    ]);


    module.config(function (AnalyticsProvider) {
        // Automatically replaced with correct tracking ID during build
        AnalyticsProvider.setAccount({
            tracker: '@@ga-tracking-id',
            trackEvent: true
        });
    }).run(['Analytics', function(Analytics) { }]);

    module.factory('errorInterceptor', function($q) {
        return {
            'responseError': function(response) {
                // do something on error
                if (response.status === 401) {
                    console.log('UNAUTHORIZED');
                    console.log('session timeout?');
                    logout();
                } else if (response.status === 403) {
                    //alert("Forbidden");
                } else if (response.status === 404) {
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


