
angular.module('starter', ['ionic', 'ngIOS9UIWebViewPatch', 'starter.services', 'starter.controllers', 'ngCordova'])

.run(['$ionicPlatform', 'NetworkService', 'AppRunStatusService', 'UserService', 'SyncService' , function($ionicPlatform, NetworkService, AppRunStatusService, UserService, SyncService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }

    document.addEventListener("resume", function() {
      AppRunStatusService.statusEvent('resum§e');
    }, false);
    // document.addEventListener("pause", function() {
    //   AppRunStatusService.statusEvent('pause');
    // }, false);
    document.addEventListener("online", function() {
      NetworkService.networkEvent('online');
    }, false);
    document.addEventListener("offline", function() {
      NetworkService.networkEvent('offline');
    }, false);


    // Local notifications plugin event handlers -  uncomment if you want them
    // and make sure you inject the service
    //
    // if (cordova && cordova.plugins && cordova.plugins.notification) {
    //   // Notification has reached its trigger time
    //   cordova.plugins.notification.local.on("trigger", function (notification, state) {
    //     LocalNotificationService.handleLocalNotification(notification.id, state);
    //   });
    //   // Event fired when user taps on notification
    //   cordova.plugins.notification.local.on("click", function (notification, state) {
    //     LocalNotificationService.handleLocalNotificationClick(notification.id, state);
    //   });
    // }


    // Example of unlocking the screen orientation - by default its locked to potrait
    if (screen && screen.orientation) {
      screen.orientation.unlock();
    }

  });

  // If running in Electron then add window.onX event listeners
  if (navigator.appVersion.includes("Electron")) {
    window.addEventListener("online", function() {
      NetworkService.networkEvent('online');
    }, false);
    window.addEventListener("offline", function() {
      NetworkService.networkEvent('offline');
    }, false);
  }

  // Check if the intialSync process has been run. This is the process that pulls
  // down the data on the first run up to ensure offline first capability
  //
  // In the below case we also do a coldStartSync if we are starting but not for
  // the first time
  UserService.hasDoneProcess("initialDataLoaded").then(function (result) {
    if (result) {
      // Ensure that the syncTables will run
      SyncService.setSyncLock("false");
      SyncService.setSyncState("Complete");
      SyncService.coldStartSync();
    } else {
      NetworkService.setNetworkStatus("online");
      // Initial install and load of data => initialSync lighter-weight sync call.
      SyncService.initialSync();
    }
  });

}])

.config(['$stateProvider', '$urlRouterProvider', '$compileProvider', function($stateProvider, $urlRouterProvider, $compileProvider) {

  // Un comment this line when pushing for prod.
  // $compileProvider.debugInfoEnabled(false);

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the app
    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: RESOURCE_ROOT +  'templates/menu.html',
      controller: 'MenuCtrl',
      controllerAs: 'vm'
    })

    // the app accounts page (accountId is optional)
    .state('app.accounts', {
      url: '/accounts/:accountId',
      params: {
        accountId: {value: null, squash: true}
      },
      views: {
        'menuContent': {
          templateUrl: RESOURCE_ROOT + 'templates/accounts.html',
          controller: 'AccountsCtrl as vm',
        }
      }
    })

    // outbox
    .state('app.outbox', {
      url: '/outbox',
      views: {
        'menuContent': {
          templateUrl: RESOURCE_ROOT + 'templates/outbox.html',
          controller: 'OutboxCtrl',
          controllerAs: 'outboxControllerViewModel'
        }
      }
    })


    /*****************************************************
     * S E T T I N G S    &    D E V    T O O L S
     ****************************************************/

    .state('app.settings', {
      url: '/settings',
      views: {
        'menuContent': {
          templateUrl: RESOURCE_ROOT +  'templates/settings.html',
          controller: 'SettingsCtrl'
        }
      }
    })

    .state('app.settings-devtools', {
      url: '/settings/devtools',
      views: {
        'menuContent': {
          templateUrl: RESOURCE_ROOT +  'templates/settingsDevTools.html',
          controller: 'SettingsCtrl'
        }
      }
    })

    .state('app.settings-diagnostics', {
      url: '/settings/diagnostics',
      views: {
        'menuContent': {
          templateUrl: RESOURCE_ROOT +  'templates/settingsDiagnostics.html',
          controller: 'DiagnosticsCtrl',
          controllerAs: 'vm'
        }
      }
    })

    .state('app.settings-mti-recovery', {
      url: '/settings/mti-recovery',
      views: {
        'menuContent': {
          templateUrl: RESOURCE_ROOT +  'templates/settingsDevMTI.html',
          controller: 'MTICtrl'
        }
      },
      params: { 'recovery': true },
    })

    .state('app.settings-mti', {
      url: '/settings/mti',
      views: {
        'menuContent': {
          templateUrl: RESOURCE_ROOT +  'templates/settingsDevMTI.html',
          controller: 'MTICtrl'
        }
      }
    })

    .state('app.mti-detail', {
      url: '/settings/mti/:tableName',
      views: {
        'menuContent': {
          templateUrl: RESOURCE_ROOT +  'templates/settingsDevMTIDetail.html',
          controller: 'MTIDetailCtrl'
        }
      }
    })

    .state('app.data-view', {
      url: '/settings/data/:type',
      views: {
        'menuContent': {
          templateUrl: RESOURCE_ROOT + 'templates/settingsDevRawView.html',
          controller: 'RawViewCtrl'
        }
      }
    })

    .state('app.settings-testing', {
      url: '/settings/testing',
      views: {
        'menuContent': {
          templateUrl: RESOURCE_ROOT +  'templates/settingsTesting.html',
          controller: 'TestingCtrl'
        }
      }
    })

    .state('app.settings-deploy', {
      url: '/settings/deploy',
      views: {
        'menuContent': {
          templateUrl: RESOURCE_ROOT +  'templates/settingsDeploy.html',
          controller: 'DeployCtrl'
        }
      }
    });

  // ! ! ! ! !  ! ! ! ! !  ! ! ! ! !  ! ! ! ! !  ! ! ! ! !  ! ! ! ! !
  //
  //    Change this to call your home/start page.
  //    At the moment it points to a dummy home page.
  //
  // ! ! ! ! !  ! ! ! ! !  ! ! ! ! !  ! ! ! ! !  ! ! ! ! !  ! ! ! ! !
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/accounts');

}]);

// This is the function that get's called once the MobileCaddy libs are done
// checking the app install/health. Basically the point at which our client
// app can kick off. It's here we boot angular into action.
// runUpInfo : see http://developer.mobilecaddy.net/docs/api for details on
// object and codes.
function myapp_callback(runUpInfo) {
  if (typeof(runUpInfo) != "undefined" &&
     (typeof(runUpInfo.newVsn) != "undefined" && runUpInfo.newVsn != runUpInfo.curVsn)) {
    // Going to call a hardReset as an upgrade is available.
    console.debug('runUpInfo', runUpInfo);
    var vsnUtils= mobileCaddy.require('mobileCaddy/vsnUtils');
    vsnUtils.upgradeIfAvailable().then(function(){
      // an upgrade will now begin in the background.
    }).catch(function(e){
      // if e === false then an upgrade is not available
      // or cannot be run at present due to dirty tables
      angular.bootstrap(document, ['starter']);
    });
  } else {
    // carry on, nothing to see here
    angular.bootstrap(document, ['starter']);
  }
}