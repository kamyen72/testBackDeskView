﻿'use strict';
app.factory('cBankService', ['$q', 'RepositoryHelper', function ($q, Repository) {
    var factory = {};

    var _callRepository = function (deferred, ajaxData) {
        Repository.post(ajaxData).then(
            function success(response, status, headers) {
                deferred.resolve(response);
            }, function error(data, status, headers) {
                deferred.reject(data);
            });
        return deferred.promise;
    };

    var _add = function (dataObj) {
        var deferred = $q.defer();
        var ajaxData = {};

        ajaxData["ApiPath"] = '/api/CBank/AddCBank';
        ajaxData["AcceptableID"] = dataObj.AcceptableID;
        ajaxData["BankAccount"] = dataObj.BankAccount;
        ajaxData["AccountNumber"] = dataObj.AccountNumber;
        ajaxData["BankNotice"] = dataObj.BankNotice;
        ajaxData["BankUrl"] = dataObj.BankUrl;
        ajaxData["MaxAmount"] = dataObj.MaxAmount;
        ajaxData["MinAmount"] = dataObj.MinAmount; 
        ajaxData["UserLevels"] = dataObj.UserLevels;
        ajaxData["PayMainTypes"] = dataObj.PayMainTypes;

        return _callRepository(deferred, ajaxData);
    };

    var _find = function (dataObj) {
        var deferred = $q.defer();
        var ajaxData = {};

        ajaxData["ApiPath"] = '/api/CBank/FindCBank';
        ajaxData["CurrentPage"] = dataObj.CurrentPage;
        ajaxData["PageSize"] = dataObj.PageSize;
        ajaxData["DateS"] = getDateS(dataObj.DateS);
        ajaxData["DateE"] = getDateE(dataObj.DateE);
        ajaxData["BankCode"] = dataObj.BankCode;
        ajaxData["BankName"] = dataObj.BankName;
        ajaxData["IsEnable"] = dataObj.IsEnable;
        ajaxData["PMTID"] = dataObj.PMTID;

        return _callRepository(deferred, ajaxData);
    };

    var _delete = function (dataObj) {
        var deferred = $q.defer();
        var ajaxData = {};

        ajaxData["ApiPath"] = '/api/CBank/DelCBank';
        ajaxData["ID"] = dataObj.ID;

        return _callRepository(deferred, ajaxData);
    };

    var _update = function (dataObj) {
        var deferred = $q.defer();
        var ajaxData = {};

        ajaxData["ApiPath"] = '/api/CBank/UpdateCBank';
        ajaxData["ID"] = dataObj.ID;
        ajaxData["AcceptableID"] = dataObj.AcceptableID;
        ajaxData["BankAccount"] = dataObj.BankAccount;
        ajaxData["AccountNumber"] = dataObj.AccountNumber;
        ajaxData["BankNotice"] = dataObj.BankNotice;
        ajaxData["BankUrl"] = dataObj.BankUrl;
        ajaxData["MaxAmount"] = dataObj.MaxAmount;
        ajaxData["MinAmount"] = dataObj.MinAmount; 
        ajaxData["IsEnable"] = dataObj.IsEnable;
        ajaxData["UserLevels"] = dataObj.UserLevels;
        ajaxData["PayMainTypes"] = dataObj.PayMainTypes;

        return _callRepository(deferred, ajaxData);
    };

    factory.add = _add;
    factory.find = _find;
    factory.update = _update;
    factory.delete = _delete;
    return factory;
}]);