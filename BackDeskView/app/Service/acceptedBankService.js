﻿'use strict';
app.factory('acceptedBankService', ['$q', 'RepositoryHelper', function ($q, Repository) {
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

        ajaxData["ApiPath"] = '/api/AcceptedBank/AddAcceptedBank';
        ajaxData["BankCode"] = dataObj.BankCode;
        ajaxData["BankName"] = dataObj.BankName;
        ajaxData["PMTID"] = dataObj.PMTID;

        return _callRepository(deferred, ajaxData);
    };

    var _find = function (dataObj) {
        var deferred = $q.defer();
        var ajaxData = {};

        ajaxData["ApiPath"] = '/api/AcceptedBank/FindAcceptedBank';
        ajaxData["CurrentPage"] = dataObj.CurrentPage;
        ajaxData["PageSize"] = dataObj.PageSize;
        ajaxData["DateS"] = getDateS(dataObj.DateS);
        ajaxData["DateE"] = getDateE(dataObj.DateE);
        ajaxData["PMTID"] = dataObj.PMTID;

        return _callRepository(deferred, ajaxData);
    };

    var _delete = function (dataObj) {
        var deferred = $q.defer();
        var ajaxData = {};

        ajaxData["ApiPath"] = '/api/AcceptedBank/DelAcceptedBank';
        ajaxData["ID"] = dataObj.ID;

        return _callRepository(deferred, ajaxData);
    };

    var _update = function (dataObj) {
        var deferred = $q.defer();
        var ajaxData = {};
        
        ajaxData["ApiPath"] = '/api/AcceptedBank/UpdateAcceptedBank';
        ajaxData["ID"] = dataObj.AcceptableID;
        ajaxData["BankCode"] = dataObj.BankCode;
        ajaxData["BankName"] = dataObj.BankName;
        ajaxData["PMTID"] = dataObj.PMTID;

        return _callRepository(deferred, ajaxData);
    };

    factory.add = _add;
    factory.find = _find;
    factory.update = _update;
    factory.delete = _delete;
    return factory;
}]);