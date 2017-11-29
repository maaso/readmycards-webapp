(function () {
    'use strict';

    angular.module('app.readmycards')
        .constant('EVENTS', {
            'GCL_INSTALLED': 'gcl-installed',
            'CLOSE_SIDEBAR': 'close-sidebar',
            'OPEN_SIDEBAR': 'open-sidebar',
            'OPEN_FAQ': 'open-faq',
            'START_OVER': 'again!',
            'REINITIALIZE': 'reinit-viz',
            'RETRY_READER': 'retry-reader',
            'RETRY_CARD': 'retry-card',
            'NETWORK_ERROR': 'Network Error',
            'READERS_WITH_CARDS': 'readers-with-cards',
            'SELECT_READER': 'select-reader'
        })

})();
