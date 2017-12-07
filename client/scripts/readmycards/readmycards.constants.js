(function () {
    'use strict';

    angular.module('app.readmycards')
        .constant('EVENTS', {
            'GCL_INSTALLED': 'gcl-installed',
            'CLOSE_FILE_EXCHANGE': 'close-file-exchange',
            'OPEN_FILE_EXCHANGE': 'open-file-exchange',
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

           .constant('DOC_VIEWER', {
               'OFFICE_VIEWER_BASE_URL': 'https://view.officeapps.live.com/op/view.aspx?src=',
               'PDFJS_VIEWER_BASE_URL': '/pdfjs/web/viewer.html?file='
           });

})();
