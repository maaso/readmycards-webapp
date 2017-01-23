(function () {
    'use strict';

    angular.module('app.plugin.lodash', [])
        .factory('_', lodash)
        .run(function (_) {
            // Make sure _ is invoked at runtime. This does nothing but force the "_" to
            // be loaded after bootstrap. This is done so the "_" factory has a chance to
            // "erase" the global reference to the lodash library.
        });


    let _;
    function lodash( $window ) {
        // Get a local handle on the global lodash reference.
        if (!_) _ = $window._;
        // OPTIONAL: Sometimes I like to delete the global reference to make sure
        // that no one on the team gets lazy and tried to reference the library
        // without injecting it. It's an easy mistake to make, and one that won't
        // throw an error (since the core library is globally accessible).
        // ALSO: See .run() block above.
        delete( $window._ );
        // ---
        // CUSTOM LODASH METHODS.
        // ---
        // I return the given collection as a natural language list.
        _.naturalList = function( collection ) {
            if ( collection.length > 2 ) {
                let head = collection.slice( 0, -1 );
                let tail = collection[ collection.length - 1 ];
                return( head.join( ", " ) + ", and " + tail );
            }
            if ( collection.length === 2 ) {
                return( collection.join( " and " ) );
            }
            if ( collection.length ) {
                return( collection[ 0 ] );
            }
            return( "" );
        };
        // Return the [formerly global] reference so that it can be injected
        // into other aspects of the AngularJS application.
        return( _ );
    }

})();
