﻿'use strict';
app.controller('cashRebateController', [
    '$scope',
    '$rootScope',
    '$location',
    '$timeout',
    'localStorageService',
    'blockUI',
    'ngAuthSettings',
    'authService',
    'cbrsService',
    'systemConfigService',
    'userLevelService',
    'lotteryService',
    'gameRoomService',
    function ($scope, $rootScope, $location, $timeout, localStorageService, blockUI, ngAuthSettings, authService,
        cbrsService, systemConfigService, userLevelService, lotteryService, gameRoomService) {

        $scope.dataSource = {
            pageStatus: 'searchView',
            searchCondition: { CurrentPage: 1, PageSize: 10, dateData: null },
            gameRoomTypeList: [],
            lotteryClassList: [],
            lotteryOrGame: '',
            gamePayType: 'Daily',
            cashBackRs: [],
            dateOptions: [],
            listData: [],
            detailListData: [],
            payTypeDropDown: [],
            userLevels: [],
            cashRebate: {},
            status: false,
            modalMsg: {},
            PagerObj: {
                CurrentPage: 1,
                PageSize: 10,
                TotalItems: 0,
                PageArray: [],
                PageRangeMax: 10,
                PageRangeMin: 1,
                thisPage: 1
            }
        };

        $scope.init = function () {
            $scope.dataSource.memberInfo = localStorageService.get('UserInfo');
            let dropdown1 = $scope.getSystemConfig();
            let dropdown2 = $scope.getUserLevels();
            let dropdown3 = $scope.getCBRS();

            Promise.all([dropdown1, dropdown2, dropdown3])
                .then(() => {
                    // $scope.search();
                    blockUI.stop();
                });
        };

        $timeout($scope.init, 100);

        $scope.search = function () {

            if (!$scope.dataSource.searchCondition.dateData) {
                return;
            }

            blockUI.start();
            $scope.dataSource.listData = [];

            let ajaxData = {
                CurrentPage: $scope.dataSource.PagerObj.CurrentPage,
                PageSize: $scope.dataSource.PagerObj.PageSize,
                CashRebatePending: true,
                ReportType: 'CashRebate',
                DateS: new Date($scope.dataSource.searchCondition.dateData.DateS),
                DateE: new Date($scope.dataSource.searchCondition.dateData.DateE),
                LotteryClassID: $scope.dataSource.searchCondition.lotteryClass.LotteryClassID
            };

            cbrsService.findCBRReport(ajaxData)
                .then(
                    function success(response) {
                        //alert(JSON.stringify(response.data.Rows.ListData));
                        if (response.data.APIRes.ResCode === '000') {
                            $scope.dataSource.listData = response.data.Rows;
                            console.log($scope.dataSource.listData);
                            //頁籤
                            //$scope.dataSource.PagerObj = response.data.Rows.PagerObj;
                            //$scope.dataSource.PagerObj["thisPage"] = $scope.dataSource.PagerObj.CurrentPage;
                            //$scope.dataSource.PagerObj["thisPageSize"] = $scope.dataSource.PagerObj.PageSize;
                            //$scope.dataSource.PagerObj["PageArray"] = [];
                            $scope.dataSource.listData.forEach(p => {
                                p.CashRebatePayType = $scope.dataSource.payTypeDropDown.filter(q => q.ID === p.CashRebatePayType)[0].ConfigName;

                                let levelSplit = p.ReferralLevel.split(',');
                                if (levelSplit && levelSplit.length > 1) {
                                    p.UserLevel = $scope.dataSource.userLevels.find(p => p.LevelID.toString() === levelSplit[0]).LevelName;
                                    p.Percentage = parseFloat(levelSplit[1]) * 100 + '%';
                                }
                            });
                        } else {
                            ngAuthSettings.modalMsg.title = "Message";
                            ngAuthSettings.modalMsg.msg = response.data.APIRes.ResMessage;
                            ngAuthSettings.modalMsg.type = response.data.APIRes.ResCode;

                            $rootScope.$broadcast('changeModalMsg');
                        }
                        blockUI.stop();
                    },
                    function error(response) {
                        blockUI.stop();
                    });
        };

        $scope.findGameRoomType = function () {
            gameRoomService.find($scope.dataSource.searchCondition)
                .then(
                    function success(response, status, headers, config) {
                        if (response.data.APIRes.ResCode === '000') {
                            $scope.dataSource.gameRoomTypeList = response.data.Rows.ListData;
                        } else {
                            ngAuthSettings.modalMsg.title = "Message";
                            ngAuthSettings.modalMsg.msg = response.data.APIRes.ResMessage;
                            ngAuthSettings.modalMsg.type = response.data.APIRes.ResCode;

                            $rootScope.$broadcast('changeModalMsg');
                        }
                    },
                    function error(response) {
                        console.log(response);
                    });
        };

        $scope.findLotteryClass = function () {
            lotteryService.findLotteryClass({})
                .then(
                    function success(response) {
                        if (response.data.APIRes.ResCode === '000') {
                            $scope.dataSource.lotteryClassList = response.data.Rows.ListData;
                        } else {
                            ngAuthSettings.modalMsg.title = "Message";
                            ngAuthSettings.modalMsg.msg = response.data.APIRes.ResMessage;
                            ngAuthSettings.modalMsg.type = response.data.APIRes.ResCode;

                            $rootScope.$broadcast('changeModalMsg');
                        }
                    },
                    function error(response) {
                    });
        };

        $scope.getCBRS = function () {
            return cbrsService.find({ RebateType: 2 })
                .then(
                    function success(response) {
                        if (response.data.APIRes.ResCode === '000') {
                            let ListData = response.data.Rows.ListData;
                            //if (ListData && ListData[0] && ListData[0].CashRs) {
                            //    $scope.dataSource.cashBackRs = ListData[0].CashRs;
                            //}
                            if (ListData && ListData.length > 0) {
                                var nowDate = new Date();
                                var yesterday = nowDate.setDate(nowDate.getDate() - 1);
                                yesterday = getDateE(new Date(yesterday));

                                var activeCashBack = ListData.find(p => yesterday <= p.DateE);
                                if (!activeCashBack) {
                                    alert('No active CashRebate setting in seleted period.');
                                    return;
                                }
                                $scope.dataSource.cashBackRs = activeCashBack.CashRs;
                                //$scope.dataSource.cashBackRs = ListData[0].CashBackRs;

                                if ($scope.dataSource.cashBackRs.filter(p => p.LotteryClassID > 0).length > 0) {
                                    $scope.dataSource.lotteryOrGame = 'lottery';
                                    $scope.findLotteryClass();
                                } else {
                                    $scope.dataSource.lotteryOrGame = 'game';
                                    $scope.findGameRoomType();
                                }
                            } else {
                                alert('No active CashRebate setting');
                            }

                        } else {
                            ngAuthSettings.modalMsg.title = "Message";
                            ngAuthSettings.modalMsg.msg = response.data.APIRes.ResMessage;
                            ngAuthSettings.modalMsg.type = response.data.APIRes.ResCode;
                            $rootScope.$broadcast('changeModalMsg', false);
                        }
                    },
                    function error(data, status, headers) {
                        console.log(response);
                    });
        };

        $scope.getSystemConfig = function () {
            //AgentLevel DropDown
            return systemConfigService.findSystemConfigChildren({ ListConfigName: ['PayType'] })
                .then(
                    function success(response, status, headers) {
                        if (response.data.APIRes.ResCode === '000') {
                            $scope.dataSource.payTypeDropDown = response.data.Rows.ListData;
                        } else {
                            ngAuthSettings.modalMsg.title = "Message";
                            ngAuthSettings.modalMsg.msg = response.data.APIRes.ResMessage;
                            ngAuthSettings.modalMsg.type = response.data.APIRes.ResCode;
                            $rootScope.$broadcast('changeModalMsg', false);
                        }
                    },
                    function error(data, status, headers) {
                        console.log(response);
                    });
        };

        $scope.getUserLevels = function () {
            $scope.dataSource.searchCondition.CurrentPage = $scope.dataSource.PagerObj.CurrentPage;
            $scope.dataSource.searchCondition.PageSize = $scope.dataSource.PagerObj.PageSize;

            return userLevelService.findUserLevel($scope.dataSource.searchCondition)
                .then(
                    function success(response) {
                        //alert(JSON.stringify(response.data.Rows.ListData));
                        if (response.data.APIRes.ResCode === '000') {
                            $scope.dataSource.userLevels = response.data.Rows.ListData;
                        } else {
                            ngAuthSettings.modalMsg.title = "Message";
                            ngAuthSettings.modalMsg.msg = response.data.APIRes.ResMessage;
                            ngAuthSettings.modalMsg.type = response.data.APIRes.ResCode;
                            $rootScope.$broadcast('changeModalMsg', false);
                        }
                    },
                    function error(response) {
                        console.log(response);
                    });
        };

        $scope.update = function (cashRebate, confirm) {
            $scope.dataSource.cashRebate = cashRebate;
            $scope.dataSource.status = confirm;
            $scope.dataSource.modalMsg.title = confirm ? 'Confirm' : 'Reject';
        };

        $scope.confirm = function () {
            blockUI.start();

            var sendObj = {};
            sendObj.MemberID = $scope.dataSource.cashRebate.MemberID;
            sendObj.CashMoney = $scope.dataSource.cashRebate.CashRebate;
            sendObj.Type = 'CashRebate';
            sendObj.Status = $scope.dataSource.status;

            //alert(JSON.stringify(sendObj));

            cbrsService.updateCBRReport(sendObj, $scope.dataSource.cashRebate.DetailReportList.map(p => { return p.ID; }))
                .then(
                    function success(response, status, headers, config) {
                        //alert(JSON.stringify(response.data.Rows.ListData));
                        if (response.data.APIRes.ResCode === '000') {
                            ngAuthSettings.modalMsg.title = "Message";
                            ngAuthSettings.modalMsg.msg = "Success";
                        } else {
                            ngAuthSettings.modalMsg.title = "Message";
                            ngAuthSettings.modalMsg.msg = response.data.APIRes.ResMessage;
                            ngAuthSettings.modalMsg.type = response.data.APIRes.ResCode;
                        }
                        $rootScope.$broadcast('changeModalMsg');

                        $scope.search();
                        blockUI.stop();
                    },
                    function error(response) {
                        blockUI.stop();
                    });
        };

        $scope.updateAll = function (status) {
            $scope.dataSource.updateAllStatus = status;
            ngAuthSettings.modalMsg.title = 'Confirm';
            ngAuthSettings.modalMsg.msg = 'Confirm selected CashRebate';
            ngAuthSettings.modalMsg.callBack = 'confirmAll';
            $rootScope.$broadcast('changeModalMsg', true);
        };

        $scope.$on('confirmAll', function () {
            if ($scope.dataSource.listData.filter(p => p.IsChecked).length === 0) {
                alert('Please check item.');
                return;
            }

            var sendObj = {};
            sendObj.Type = 'CashRebate';
            sendObj.Status = $scope.dataSource.updateAllStatus;

            var mplayerReportIDs = [];
            $scope.dataSource.listData.forEach(p => {
                if (p.IsChecked) {
                    p.DetailReportList.forEach(q => {
                        mplayerReportIDs.push(q.ID);
                    });
                }
            });

            blockUI.start();
            cbrsService.updateCBRReportAll(sendObj, mplayerReportIDs).then(
                function success(response) {
                    if (response.data.APIRes.ResCode === '000') {
                        ngAuthSettings.modalMsg.title = "Message";
                        ngAuthSettings.modalMsg.msg = response.data.APIRes.ResMessage;
                        ngAuthSettings.modalMsg.type = response.data.APIRes.ResCode;
                        ngAuthSettings.modalMsg.callBack = 'showSearch';

                        $scope.search();
                    }
                    else {
                        ngAuthSettings.modalMsg.title = "Message";
                        ngAuthSettings.modalMsg.msg = response.data.APIRes.ResMessage;
                        ngAuthSettings.modalMsg.type = response.data.APIRes.ResCode;
                        ngAuthSettings.modalMsg.callBack = "";
                    }
                    $rootScope.$broadcast('changeModalMsg');
                    blockUI.stop();
                },
                function error(response) {
                    blockUI.stop();
                });
        });

        $scope.updateDateOptions = function () {
            let { LotteryClassID, GameRoomID } = $scope.dataSource.searchCondition.lotteryClass;
            let cashBackData = $scope.dataSource.cashBackRs.find(item => item.LotteryClassID !== 0 && item.LotteryClassID === LotteryClassID);
            // LotteryClassID沒對應的 則用GameRoomID來找
            if (!cashBackData) {
                cashBackData = $scope.dataSource.cashBackRs.find(item => item.GameRoomID === GameRoomID);
            }
            $scope.dataSource.dateOptions = [];
            if (cashBackData.PayType) {
                // Daily
                if (cashBackData.PayType === 34) {
                    $scope.dataSource.gamePayType = 'Daily';
                    let date = new Date();
                    for (let i = 0; i < 6; i++) {
                        date.setDate(date.getDate() - 1);
                        let DateS = date.getFullYear() + "/" + `${date.getMonth() + 1}`.padStart(2, 0) + "/" + `${date.getDate()}`.padStart(2, 0) + ' 00:00:00';
                        let DateE = date.getFullYear() + "/" + `${date.getMonth() + 1}`.padStart(2, 0) + "/" + `${date.getDate()}`.padStart(2, 0) + ' 23:59:59';
                        $scope.dataSource.dateOptions.push({
                            DateS,
                            DateE,
                            Label: DateS + ' - ' + DateE
                        });
                    }
                }
                // Weekly
                if (cashBackData.PayType === 35) {
                    $scope.dataSource.gamePayType = 'Weekly';
                    let { DateS, DateE } = getLastWeek();
                    $scope.dataSource.dateOptions.push({
                        DateS,
                        DateE,
                        Label: DateS + ' - ' + DateE
                    });
                }
                // Mothly
                if (cashBackData.PayType === 36) {
                    $scope.dataSource.gamePayType = 'Mothly';
                    let { DateS, DateE } = getLastMonth();
                    $scope.dataSource.dateOptions.push({
                        DateS,
                        DateE,
                        Label: DateS + ' - ' + DateE
                    });
                }

                $scope.dataSource.searchCondition.dateData = $scope.dataSource.dateOptions[0];
            }
        };

        $scope.showDetail = function (member) {
            $scope.dataSource.detailListData = member.DetailReportList;
            $scope.dataSource.modalMsg.title = 'Detail';
            $('#ShowDetailDialog').click();
        };

        $scope.checkAll = function () {
            $scope.dataSource.listData.forEach(p => {
                p.IsChecked = $scope.dataSource.checkAll;
            });
        };

        // $scope.dateSearch = function (dayS, dayE) {
        //     var nowDate = new Date();
        //     var dateS = new Date(Number(nowDate));
        //     dateS.setDate(nowDate.getDate() + dayS);
        //     var dateE = new Date(Number(nowDate));
        //     dateE.setDate(nowDate.getDate() + dayE);

        //     $scope.dataSource.searchCondition.DateS = dateS;
        //     $scope.dataSource.searchCondition.DateE = dateE;
        //     $scope.search();
        // };

        //換頁
        $scope.PageChanged = function (page) {
            $scope.dataSource.PagerObj.CurrentPage = page;
            $scope.search();
        };

        $scope.quickSearch = function () {
            if (!$scope.dataSource.quickSearchString) {
                $scope.dataSource.showListData = $scope.dataSource.listData;
                return;
            }

            var keys = Object.keys($scope.dataSource.listData[0]);
            $scope.dataSource.showListData = [];

            $scope.dataSource.listData.forEach(data => {
                keys.forEach(key => {
                    if (data[key] && data[key].toString().includes($scope.dataSource.quickSearchString)) {
                        $scope.dataSource.showListData.push(data);
                    }
                });
            });

            if ($scope.dataSource.showListData.length > 0) {
                $scope.dataSource.totalData = {
                    'DebitAmount': $scope.dataSource.showListData.reduce(sumFunction('DebitAmount'), 0),
                    'CreditAmount': $scope.dataSource.showListData.reduce(sumFunction('CreditAmount'), 0)
                };
            }
        };

    }]);