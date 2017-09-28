/**
 * Menu Controller
 *
 * @description controller for the menu
 */
(function() {
    'use strict';

    angular
        .module('starter.controllers')
        .controller('MenuCtrl', MenuCtrl);

    MenuCtrl.$inject = ['$rootScope', '$scope', '$timeout', '$ionicLoading', 'logger', 'OutboxService', 'SyncService', '$ionicSideMenuDelegate', 'NetworkService', 'AppRunStatusService'];

    function MenuCtrl($rootScope, $scope, $timeout, $ionicLoading, logger, OutboxService, SyncService,$ionicSideMenuDelegate, NetworkService, AppRunStatusService) {
        var logModule = "app.menu.controller -> ";
        // console.log(logModule);

        var vm = this;
        var syncTimeout;

        vm.syncNow = syncNow;

        function syncNow() {
            if (NetworkService.getNetworkStatus() === "online") {
                syncTimeout = $timeout(function() {
                    SyncService.syncAllTablesNow();
                }, 0);
            } else {
                $ionicLoading.show({
                    template: 'Please go on-line before attempting to sync',
                    animation: 'fade-in',
                    showBackdrop: true,
                    duration: 2500
                });
          }
        }

        vm.isSyncing = false;

        vm.sync = function() {
            SyncService.syncAllTables();
        };


        // Watcher that will allow us us to update Outbox Count when we open the menu
        // Note, if our menu is always shown, then the count is only updated upon the calls
        // from the SyncService
        $scope.$watch(function () {
                return $ionicSideMenuDelegate.isOpenLeft();
            },
            function (isOpen) {
                if (isOpen) updateOutboxCount();
            }
        );


        // Handle events fired from the SyncService.
        // Used to update the feedback message at bottom of page
        var deregisterHandleSyncTables = $rootScope.$on('syncTables', function(event, args) {
            logger.log(logModule +"syncTables " + JSON.stringify(args));
            switch (args.result.toString()) {
                case "StartSync" :
                    break;
                case "Complete" :
                    updateOutboxCount();
                    // Check for version upgrade
                    AppRunStatusService.statusEvent('resume');
                    break;
                case "InitialLoadComplete" :
                    break;
                case "100497" :
                    break;
                case "100498" :
                    break;
                case "100402" :
                    break;
                default :
                    if (args.result.toString().indexOf("Error") >= 0) {
                        //displayFeedbackMsg(args.result.toString());
                        //delayHidingOfFeedbackMsg(3000);
                    } else {
                        if (args.result.toString().indexOf("TableComplete") >= 0) {
                            updateOutboxCount();
                        }
                    }
            }
        });


        function updateOutboxCount() {
            OutboxService.getDirtyRecordsCount().then(function(result) {
                if (result > 0) {
                    vm.outboxCount = " (" + result + ")";
                } else {
                    vm.outboxCount = "";
                }
                $scope.$apply();
            });
        }


        $scope.$on('$destroy', function() {
            // logger.log(logModule + "destroy");
            $timeout.cancel(syncTimeout);
            deregisterHandleSyncTables();
        });


    }

})();
