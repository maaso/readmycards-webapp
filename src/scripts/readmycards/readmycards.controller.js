(function () {
    'use strict';

    angular.module('app.readmycards')
        .controller('RootCtrl', rootCtrl);


    function rootCtrl($scope, gclAvailable, readers, cardPresent, T1C, _) {
        var controller = this;
        console.log(gclAvailable);
        console.log(readers);
        console.log(cardPresent);
        controller.gclAvailable = gclAvailable;
        controller.readers = readers.data;
        controller.cardPresent = cardPresent;

        init();

        function init() {
            // Determine initial action we need to take
            if (!controller.cardPresent) {
                // No card is present, check if we have readers

                if (_.isEmpty(controller.readers)) {
                    // No readers present, do we have GCL?
                    if (!gclAvailable) {
                        // No GCL is available, prompt user to download
                        promptDownload();
                    } else {
                        // GCL is present, poll for readers being connected
                        pollForReaders();
                    }
                } else {
                    // Reader(s) are present, poll for card
                    pollForCard();
                }
            } else {
                // A card is present, determine type and read its data
                readCard();
            }

            $scope.$on('gcl', function () {
                console.log('GCL is installed!');
                controller.gclAvailable = true;
                T1C.initializeAfterInstall().then(function (res) {
                    pollForReaders();
                });
            })
        }


        function pollForReaders() {
            controller.pollingReaders = true;
            T1C.getConnector().core().pollReaders(30, function (err, result) {
                // Success callback
                // Found at least one reader, poll for cards
                controller.readers = result.data;
                controller.pollingReaders = false;
                $scope.$apply();
                // if (controller.readers.length > 1) toastr.success('Readers found!');
                // else toastr.success('Reader found!');
                pollForCard();
            }, function () {
                // Not used
                controller.pollSecondsRemaining = controller.pollSecondsRemaining - 1;
                $scope.$apply();
            }, function () {
                // timeout
                controller.pollingReaders = false;
                controller.pollTimeout = true;
                // toastr.warning('30 seconds have passed without a reader being connected. Please try again.', 'Timeout');
                $scope.$apply();
            });
        }

        function pollForCard() {
            controller.pollingCard = true;
            T1C.getConnector().core().pollCardInserted(30, function (err, result) {
                // Success callback
                // controller.readers = result.data;
                controller.pollingCard = false;
                $scope.$apply();
                // if ($scope.readers.length > 1) toastr.success('Readers found!');
                // else toastr.success('Reader found!');
                // Found a card, attempt to read it
                // Refresh reader list first
                T1C.getReaders().then(function (result) {
                    controller.readers = result.data;
                    readCard();
                });
            }, function () {
                // "Waiting for reader connection" callback
                controller.pollSecondsRemaining = controller.pollSecondsRemaining - 1;
                $scope.$apply();
            }, function () {
                // "Waiting for card" callback
            }, function () {
                // timeout
                controller.pollingCard = false;
                controller.pollTimeout = true;
                // toastr.warning('30 seconds have passed without a reader being connected. Please try again.', 'Timeout');
                $scope.$apply();
            });
        }

        function promptDownload() {
            // Prompt for dl
            T1C.getDownloadLink().then(function (res) {
                controller.dlLink = res.url;
            })
        }

        function readCard() {
            // TODO support multiple cards
            // Get first card found
            console.log(controller.readers);

            controller.readerWithCard = _.find(controller.readers, function (o) {
                return _.has(o, 'card');
            });
            console.log(controller.readerWithCard);

            // // Detect Type and read data
            // T1C.readAllData(readerWithCard.id, readerWithCard.card).then(function (res) {
            //     controller.card = readerWithCard.card;
            //     controller.cardData = res.data;
            //     console.log(controller.cardData);
            //     console.log(res);
            // });


            // Init vizualizer for type

        }
    }

})();
