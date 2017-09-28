/**
 * Asset Factory
 *
 * @description description
 */
(function() {
  'use strict';

  angular
    .module('starter.services')
    .factory('AssetService', AssetService);

  AssetService.$inject = ['devUtils', 'logger',  '$timeout'];

  function AssetService(devUtils, logger, $timeout) {

    var logModule = "app.AssetService";
    var ASSET_TABLE = "Poc_Asset__ap";

    return {
      getForAccount: getForAccount,
      get: get
    };


    /**
     * @function getForAccount
     * @description Gets assets for an Account by the account ID
     * @param {string} accountID The SF Id of a asset object
     * @return {promise} resolves to a list of assets
     */
    function getForAccount(accountId){
      return new Promise(function(resolve, reject) {
        var smartSql = "SELECT * from {" + ASSET_TABLE + "} WHERE {" + ASSET_TABLE + ":Account__c} = '" + accountId + "'";
        devUtils.smartSql(smartSql).then( function(resObject) {
          if (resObject.records) {
            var records = _.chain(resObject.records)
              .sortBy('Name')
              .value();
            resolve(records);
          } else {
            resolve([]);
          }
        }).catch(function(e){
          logger.error(logModule, 'getForAccount', accountId, e);
          reject(e);
        });
      });

    }


    function get(assetId){
      return new Promise(function(resolve, reject)  {
        var smartSql = "SELECT * from {" + ASSET_TABLE + "} WHERE {" + ASSET_TABLE + ":Id} = '" + assetId + "'";
        devUtils.smartSql(smartSql).then( function(resObject) {
          if (resObject.records[0]) {
            resolve(resObject.records[0]);
          } else {
            resolve([]);
          }
        }).catch(function(e){
          logger.error(logModule, 'get', assetId, e);
          reject(e);
        });
      });
    }


  }
})();
