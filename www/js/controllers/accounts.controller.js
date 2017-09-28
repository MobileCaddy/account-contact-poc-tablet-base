/**
 * Accounts Controller
 *
 * @description description
 */
(function() {
  'use strict';

  angular
    .module('starter.controllers')
    .controller('AccountsCtrl', AccountsCtrl);

  AccountsCtrl.$inject = ['$scope', '$rootScope', '$timeout', '$stateParams', 'AccountsService', 'ContactService', 'AssetService', 'SyncService', 'UserService', '$ionicLoading', '$ionicModal', '$ionicPopup', '$location', 'logger', '$ionicScrollDelegate', 'AppRunStatusService'];

  function AccountsCtrl($scope, $rootScope, $timeout, $stateParams, AccountsService, ContactService, AssetService, SyncService, UserService, $ionicLoading, $ionicModal, $ionicPopup, $location, logger, $ionicScrollDelegate, AppRunStatusService) {

    var logModule = 'app.AccountsCtrl';
    var vm = this;
    var refreshTimeout;

    vm.resourcePath = window.RESOURCE_ROOT;

    // Parameters (optional)
    vm.accountId = $stateParams.accountId;

    vm.search = {query : ""};
    vm.account = null;
    vm.contacts = null;
    vm.assets = null;

    vm.accountLoaded = false;
    vm.contactsLoaded = true;
    vm.assetsLoaded = true;

    var CONTACTS_SECTION = "contacts";
    var ASSET_SECTION = "assets";

    vm.section = CONTACTS_SECTION;

    // exposed functions
    vm.selectAccount  = selectAccount;
    vm.clearSearch    = clearSearch;
    vm.displaySection = displaySection;
    vm.addContactWindow = addContactWindow;
    vm.addContact = addContact;
    vm.addAccountWindow = addAccountWindow;
    vm.addAccount = addAccount;

    // Show the nav bar
    var e = document.getElementById('my-nav-bar');
    angular.element(e).removeClass( "mc-hide" );

    // We want to resize our accounts scroll size when widow is resized.
    window.onresize = function(event) {
      setScrollHeights();
    };

    activate();

    function activate(){
      setScrollHeights();
      $ionicLoading.show({
        duration: 120000,
        template: 'Loading...',
        animation: 'fade-in',
        showBackdrop: true,
        delay: 300
      });
      UserService.hasDoneProcess("initialDataLoaded").then(function(result) {
        if (result) {
          getAccounts(true);
          vm.accountLoaded = (vm.account) ? true : false;
        }
      }).catch(function(e){
        logger.error(logModule, "UserService.hasDoneProcess", e);
      });
    }

    function getAccounts(loadFirstAccount) {
      AccountsService.all().then(function(accounts) {
        // console.log(logModule, "getAccounts", accounts.length,vm.account,vm.accountId);
        vm.accounts = accounts;
        if (loadFirstAccount && accounts.length > 0) {
          selectAccount(accounts[0]);
        }
        $ionicLoading.hide();
      }).catch(function(e){
        logger.error(logModule,'getAccounts',e);
      });
    }

    /* E X P O S E D    F U N C T I O N S */


    /**
     * @functionclearSearch
     * @description clears search box
     */
    function clearSearch () {
      vm.search.query = "";
    }

    /**
     * @function displaySection
     * @description Shows the correct dummy tab, and also checks to see if we
     *              have our data yet from the services
     * @param  {string} section
     */
    function displaySection(section) {
      vm.section = section;
    }


    function selectAccount(account) {
      displaySection('contacts');
      vm.contacts = null;
      vm.assets = null;
      vm.contactsLoaded  = false;
      vm.assetsLoaded = false;
      vm.account = account;
      vm.accountLoaded = true;

      AccountsService.setCurrentAccount(account);

      getContacts(account.Id);
      getAssets(account.Id);
    }

    /* I N T E R N A L    F U N C T I O N S */

    function setScrollHeights(){
      // console.log("asp window.innerHeight",window.innerHeight);
      var innerHeight = window.innerHeight;
      var accountsList = document.getElementById('accounts-list');
      if (accountsList) {
        accountsList.setAttribute("style","height:" + (innerHeight - 105) + "px");
      }
      var assetsAndContactsListScroll = document.getElementById('assets-and-contacts-list-scroll');
      var assetsAndContactsList = document.getElementById('assets-and-contacts-list');
      if (assetsAndContactsListScroll && assetsAndContactsList) {
        assetsAndContactsListScroll.setAttribute("style","height:" + (innerHeight-275) + "px");
        assetsAndContactsList.setAttribute("style","height:" + (innerHeight-275) + "px");
      }
    }

    function getAssets(accountId) {
      AssetService.getForAccount(accountId).then(function(assets){
        // console.log("asp assets",assets);
        vm.assetsLoaded = true;
        vm.assets = assets;
        refreshTimeout = $timeout(function() {
          $scope.$apply();
        }, 0);
      }).catch(function(e){
        logger.error(e);
        vm.assetsLoaded = true;
        refreshTimeout = $timeout(function() {
          $scope.$apply();
        }, 0);
      });
    }

    function getContacts(accountId) {
      ContactService.getForAccount(accountId).then(function(contacts){
        vm.contactsLoaded = true;
        vm.contacts = contacts;
        refreshTimeout = $timeout(function() {
          $scope.$apply();
        }, 0);
      }).catch(function(e){
        logger.error(e);
        vm.contactsLoaded = true;
        refreshTimeout = $timeout(function() {
          $scope.$apply();
        }, 0);
      });
    }

      $ionicModal.fromTemplateUrl('my-modal.html', {
          scope: $scope,
          animation: 'slide-in-up'
      }).then(function(modal) {
          $scope.modal = modal;
      });

      $ionicModal.fromTemplateUrl('new-account.html', {
          scope: $scope,
          animation: 'slide-in-up'
      }).then(function(modal) {
          $scope.account_modal = modal;
      });

      function addAccountWindow() {

          $scope.openAccountModal = function() {
              $scope.account_modal.show();
              $scope.c = {};
          };
          $scope.closeAccountModal = function() {
              $scope.account_modal.hide();
          };

          $scope.openAccountModal();

      }

      function addAccount(c) {


      }

    function addContactWindow(accountId) {

        $scope.openModal = function() {
            $scope.c = {};
            $scope.modal.show();
            $scope.c = {};
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
        // Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });
        // Execute action on hide modal
        $scope.$on('modal.hidden', function() {
            // Execute action
        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function() {
            // Execute action
        });

        $scope.openModal();

    }

    function addContact(c) {
        $scope.errors_count = 0;
        $scope.mobilePhone_error = false;
        $scope.Email_error = false;

        var newMobilePhone = c.MobilePhone.toString();

        if(c.MobilePhone == 1234 || newMobilePhone.substring(0, 1) != '0' || newMobilePhone.length != 11) {

            $scope.errors_count = $scope.errors_count + 1;

            if(newMobilePhone.length != 11) {
                $scope.mobilePhone_error = 'Error: Must be 11 characters';
            }

            if(newMobilePhone.substring(0, 1) != '0') {
                $scope.mobilePhone_error = 'Error: Must start with 0';
            }

            if(c.MobilePhone == 1234) {
                $scope.mobilePhone_error = 'Error: Must not be equal to 1234';
            }

            console.log('newMobilePhone.substring(0, 1)', newMobilePhone.substring(0, 1));
            console.log('newMobilePhone.length', newMobilePhone.length);

        }

        var userEmail = c.Email;

        var atpos = userEmail.indexOf("@");
        var dotpos = userEmail.lastIndexOf(".");

        if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= userEmail.length) {

            $scope.errors_count = $scope.errors_count + 1;

            $scope.Email_error = 'Error: Email is not valid';

        }

        if($scope.errors_count == 0) {


            var newContact = {
              Email: c.Email,
              FirstName: c.FirstName,
              LastName: c.LastName,
              MobilePhone: c.MobilePhone,
              Name: c.FirstName + ' ' + c.LastName,
              Title: c.Title,
              AccountId: vm.account.Id
            };

            $ionicLoading.show({
                template: 'Saving...',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 600,
                duration: 30000
            });

            ContactService.add(newContact).then(function (res) {
                $ionicLoading.hide();

                $scope.modal.hide();

                getContacts(vm.account.Id);

            }).catch(function (e) {
                console.error('addContact failed', e);
                $ionicLoading.hide();

                $ionicPopup.alert({
                    title: 'Add Contact Failed!',
                    template: '<p>Sorry, something went wrong.</p><p class="error_details">Error: ' +
                    e.status + ' - ' + e.mc_add_status + '</p>'
                });

            });

        } else {

            $ionicPopup.alert({
                title: 'Add Contact Failed!',
                template: '<p>Please check errors in form</p>'
            });

            $scope.errors_count = 0;
        }



    }

    /*  M E S S A G E S    A N D    E V E N T S  */

    // As this is the initial controller we want to also check to make sure that
    // our UI is locked until the initialSync has been completed - so we listen
    // for this event to unlock the UI
    var deregisterHandleSyncTables = $rootScope.$on('syncTables', function(account, args) {
      // console.log("asp syncTables: " + JSON.stringify(args));
      switch (args.result.toString()) {
        case "InitialLoadComplete" :
          getAccounts(true);
          break;
        case "Complete" :
          // Check for version upgrade
          AppRunStatusService.statusEvent('resume');
          break;
        default :
          if (args.table) {
            var syncedTable = args.table.toString();
            // Refresh accounts, assets and contacts if we've done a sync
            if (syncedTable == "Poc_Asset__ap") {
              getAccounts(false);
              if (vm.account) {
                getContacts(vm.account.Id);
                getAssets(vm.account.Id);
              }
            }
          }
      }
    });


    $scope.$on('$destroy', function() {
      deregisterHandleSyncTables();
      $timeout.cancel(refreshTimeout);
    });

  }

})();
