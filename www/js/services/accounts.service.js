/**
 * Accounts Factory
 *
 * @description description
 */
(function() {
  'use strict';

  angular
    .module('starter.services')
    .factory('AccountsService', AccountsService);

  AccountsService.$inject = ['devUtils', 'logger', 'UserService'];

  function AccountsService(devUtils, logger, UserService) {
    var logModule = "app.AccountsService";
    var ACCOUNT_TABLE = "AccountTable__ap";
    var currentAccount = null;

    return {
      all: all,

      get: get,

      setCurrentAccount: setCurrentAccount
    };


    /**
     * @function all
     * @description Returns all Account__ap records, ordered by Name (TODO IS THIS RIGHT)
     * @return {promise} resolves to a list of account objects
     */
    function all(){
      return new Promise(function(resolve, reject) {
        devUtils.readRecords(ACCOUNT_TABLE, []).then(function (resObject) {
          var sortedRecs = _.sortBy(resObject.records, 'Name');
          resolve(sortedRecs);
        }).catch(function (e) {
          logger.error(logModule, 'all', e);
          reject(e);
        });
      });
    }


    /**
     * @function get
     * @description Gets a single account by it's ID - if we gave this in
     *              currentAccount, then return this instead of reading from DB
     * @param {string} accountId The SF Id of a account object
     * @return {promise} resolves to a account | undefined if not found or rejects
     */
    function get(accountId){
      return new Promise(function(resolve, reject) {
        if (currentAccount && currentAccount.Id == accountId) {
          resolve(currentAccount);
        } else {
          currentAccount = null;
          var smartSql = "SELECT * from {" + ACCOUNT_TABLE + "} WHERE {" + ACCOUNT_TABLE + ":Id} = '" + accountId + "'";
          devUtils.smartSql(smartSql).then( function(resObject) {
            if (resObject.records[0]) {
              currentAccount = resObject.records[0];
              resolve(resObject.records[0]);
            } else {
              resolve(undefined);
            }
          }).catch(function(e){
            logger.error('get', accountId, e);
            reject(e);
          });
        }
      });
    }


    function setCurrentAccount(account){
      currentAccount = account;
    }

  }

})();