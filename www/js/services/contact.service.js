/**
 * Contact Factory
 *
 * @description description
 */
(function() {
  'use strict';

  angular
    .module('starter.services')
    .factory('ContactService', ContactService);

  ContactService.$inject = ['devUtils', 'logger',  '$timeout'];

  function ContactService(devUtils, logger, $timeout) {

  	var logModule = "app.ContactService";
    var CONTACT_TABLE = "Contact__ap";

  	return {
      getForAccount: getForAccount,
      get: get,
      add: add
	  };


    /**
     * @function getForAccount
     * @description Gets contacts for an Account by the account ID
     * @param {string} accountID The SF Id of a contact object
     * @return {promise} resolves to a list of contacts
     */
    function getForAccount(accountId){
      return new Promise(function(resolve, reject) {
        var smartSql = "SELECT * from {" + CONTACT_TABLE + "} WHERE {" + CONTACT_TABLE + ":AccountId} = '" + accountId + "'";
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


    function get(conId){
      return new Promise(function(resolve, reject)  {
        var smartSql = "SELECT * from {" + CONTACT_TABLE + "} WHERE {" + CONTACT_TABLE + ":Id} = '" + conId + "'";
        devUtils.smartSql(smartSql).then( function(resObject) {
          if (resObject.records[0]) {
            resolve(resObject.records[0]);
          } else {
            resolve([]);
          }
        }).catch(function(e){
          logger.error(logModule, 'get', conId, e);
          reject(e);
        });
      });
    }

    function add(c) {
        return new Promise(function(resolve, reject) {
            devUtils.insertRecord(CONTACT_TABLE, c).then(function(resObject){
                // perform background sync - we're not worried about Promise resp.
                devUtils.syncMobileTable(CONTACT_TABLE);
                resolve(resObject);
            }).catch(function(e){
                reject(e);
            });
        });
    }


  }
})();
