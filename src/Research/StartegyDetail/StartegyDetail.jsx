import React, { Component } from 'react';
import _ from 'lodash';
import Utils from './../../Utils';
import axios from 'axios';
import {
    Select, DatePicker, Row, Col, Icon, Input, Modal, Spin, Tabs,
    Radio, message
} from 'antd';
import { withRouter, Link } from 'react-router-dom';
import NewStartegy from './../NewStrategy/NewStrategy.jsx';
import AceEditor from 'react-ace';
import 'brace/theme/tomorrow_night_bright';
import 'brace/mode/julia';
import moment from 'moment';
import RunningBackTest from './RunningBackTest/RunningBackTest.jsx';
import Loading from 'react-loading-bar'
import 'react-loading-bar/dist/index.css';

const dateFormat = 'YYYY-MM-DD H:mm:ss';
const DateHelper = require('../../utils/date');
const endDate = moment(DateHelper.getPreviousNonHolidayWeekday(moment().add(1, 'days')));

class StartegyDetail extends Component {

    _mounted = false;
    cancelGetStrategy = undefined;
    cancelGetBenchmark = undefined;
    gotLogs = false;
    gotTransactionHistory = false;
    gotPortfolioHistory = false;
    graphData = [];
    logsData = [];
    gotBacktestCompleteLog = false;
    runningBackTestChart = undefined;
    maxWaitTimeForMessages = 15000; // 15 Sec
    atleastOneMessageReceived = false;
    graphsDataUpdatedTillNow = 0;
    totalDataLength = 1;
    highStockSeriesPosition = {};
    timeOutcheck = undefined;
    errorOccured = false;
    backtestId = '';
    autoSaveTimer = undefined;
    autoSaveTime = 5 * 60 * 1000;

    gotLabelDataFromSocket = false;
    socketOpenConnectionTimeout = 1000;
    numberOfTimeSocketConnectionCalled = 1;
    stratergySaveInterval = null;

    constructor(props) {
        super(props);
        this.logElement = null;
        this.stratergySaveInterval = setInterval(() => {
            this.saveStartegy();
        }, 5000);

        let savedSettings = Utils.getFromLocalStorage('StrategyDetailSettings');
        if (!savedSettings) {
            savedSettings = '{}';
        }
        savedSettings = JSON.parse(savedSettings);
        this.state = {
            'loading': true,
            'strategyId': props.match.params.strategyId,
            'strategy': {},
            'showNewStartegyDiv': false,
            'showCloneStartegyDiv': false,
            'rightDivOpen': (window.innerWidth < 800) ? false : true,
            'extraTabsContent': 'settings',
            'benchmark': [],
            'universe': [],
            'selectedBenchmark': (savedSettings.selectedBenchmark) ? savedSettings.selectedBenchmark : '',
            'selectedUniverse': (savedSettings.selectedUniverse) ? savedSettings.selectedBenchmark : '',
            'selectedRebalance': (savedSettings.selectedRebalance) ? savedSettings.selectedRebalance : 'Daily',
            'selectedCancelPolicy': (savedSettings.selectedCancelPolicy) ? (savedSettings.selectedCancelPolicy) : 'EOD',
            'selectedCommissionType': (savedSettings.selectedCommissionType) ? (savedSettings.selectedCommissionType) : 'PerTrade',
            'selectedCommission': (savedSettings.selectedCommission || savedSettings.selectedCommission === 0) ? Number(savedSettings.selectedCommission) : 0.1,
            'selectedSlipPage': (savedSettings.selectedSlipPage || savedSettings.selectedSlipPage === 0) ? Number(savedSettings.selectedSlipPage) : 0.05,
            'selectedSlipPageType': (savedSettings.selectedSlipPageType) ? savedSettings.selectedSlipPageType : 'Variable',
            'selectedInvestmentPlan': (savedSettings.selectedInvestmentPlan) ? savedSettings.selectedInvestmentPlan : 'AllIn',
            'selectedExecutionPolicy': (savedSettings.selectedExecutionPolicy) ? savedSettings.selectedExecutionPolicy : 'Close',
            'initialCapital': (savedSettings.initialCapital || savedSettings.initialCapital === 0) ? Number(savedSettings.initialCapital) : 1000000,
            'endDate': (savedSettings.endDate) ? moment(savedSettings.endDate, 'YYYY-MM-DD') : endDate,
            'startDate': (savedSettings.startDate) ? moment(savedSettings.startDate, 'YYYY-MM-DD') : endDate.add(-1, 'years'),
            'isBacktestRunning': false,
            'isBackTestRunComplete': false,
            'newBacktestRunData': {},
            'backtestProgress': 0,
            'showBacktestRedirectModal': false,
            logsData: []
        };
        this.updateState = (data) => {
            if (this._mounted) {
                if (data.isBacktestRunning === false) {
                    this.unsubscribeFromBacktest();
                }
                this.setState(data);
            }
        }

        this.loadStrategyinfo = () => {
            axios(Utils.getBaseUrl() + '/strategy/' + this.state.strategyId, {
                cancelToken: new axios.CancelToken((c) => {
                    // An executor function receives a cancel function as a parameter
                    this.cancelGetStrategy = c;
                }),
                'headers': Utils.getAuthTokenHeader()
            })
                .then((response) => {
                    this.cancelGetStrategy = undefined;
                    this.updateState({ 'strategy': response.data, 'loading': false });
                })
                .catch((error) => {
                    Utils.checkForInternet(error, this.props.history);
                    if (error.response) {
                        if (error.response.status === 400 || error.response.status === 403) {
                            this.props.history.push('/forbiddenAccess');
                        }
                        Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                    }
                    this.updateState({
                        'loading': false
                    });
                    this.cancelGetStrategy = undefined;
                });
        }

        this.loadBenchMarkDropdownData = () => {
            axios(Utils.getBenchMarkUrl(), {
                cancelToken: new axios.CancelToken((c) => {
                    // An executor function receives a cancel function as a parameter
                    this.cancelGetBenchmark = c;
                })
            })
                .then((response) => {
                    const benchmarks = _.get(response, 'data.benchmark', []);
                    const universe = _.get(response, 'data.universe', 'Nifty 50');
                    let selectedBenchmark = "";
                    let selectedUniverse = "";
                    if (benchmarks.length > 0) {
                        selectedBenchmark = benchmarks[0];
                    }
                    if (universe.length > 0) {
                        selectedUniverse = universe[0];
                    }
                    this.updateState({
                        'benchmark': benchmarks,
                        'universe': universe,
                        'selectedBenchmark': selectedBenchmark,
                        'selectedUniverse': selectedUniverse
                    });
                    this.cancelGetBenchmark = undefined;
                })
                .catch((error) => {
                    Utils.checkForInternet(error, this.props.history);
                    if (error.response) {
                        if (error.response.status === 400 || error.response.status === 403) {
                            this.props.history.push('/forbiddenAccess');
                        }
                        Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                    }
                    this.cancelGetBenchmark = undefined;
                });
        }

        this.startegyNameChange = (e) => {
            this.updateState({
                'strategy': {
                    ...this.state.strategy,
                    'name': e.target.value
                }
            });
        }

        this.onStartDateChange = (date, dateString) => {
            this.updateState({ 'startDate': date });
        }

        this.onEndDateChange = (date, dateString) => {
            this.updateState({ 'endDate': date });
        }

        this.onBenchmarkChange = (value) => {
            this.updateState({ 'selectedBenchmark': value });
        }

        this.onUniverseChange = (value) => {
            this.updateState({ 'selectedUniverse': value });
        }

        this.onRebalanceChange = (e) => {
            this.updateState({ 'selectedRebalance': e.target.value });
        }

        this.clickedOnAddNewStrategy = () => {
            this.updateState({ 'showNewStartegyDiv': true });
        }

        this.clickedOnCloneStrategy = () => {
            this.updateState({ 'showCloneStartegyDiv': true });
        }

        this.clickedOnSave = () => {
            this.saveStartegy(true);
        }

        this.saveStartegy = (showResultInfo) => new Promise((resolve, reject) => {
            let settingsData = {
                'selectedBenchmark': this.state.selectedBenchmark,
                'selectedUniverse': this.state.selectedUniverse,
                'selectedRebalance': this.state.selectedRebalance,
                'selectedCancelPolicy': this.state.selectedCancelPolicy,
                'selectedCommissionType': this.state.selectedCommissionType,
                'selectedCommission': this.state.selectedCommission,
                'selectedSlipPage': this.state.selectedSlipPage,
                'selectedSlipPageType': this.state.selectedSlipPageType,
                'selectedInvestmentPlan': this.state.selectedInvestmentPlan,
                'selectedExecutionPolicy': this.state.selectedExecutionPolicy,
                'initialCapital': this.state.initialCapital,
                'endDate': this.state.endDate.format('YYYY-MM-DD'),
                'startDate': this.state.startDate.format('YYYY-MM-DD')
            }
            Utils.localStorageSaveObject('StrategyDetailSettings', settingsData);
            axios({
                method: 'PUT',
                url: Utils.getBaseUrl() + '/strategy/' + this.state.strategyId,
                data: {
                    'name': _.get(this.state, 'strategy.name', null),
                    'language': _.get(this, 'state.strategy.language', 'julia'),
                    'description': _.get(this.state, 'strategy.description', null),
                    'code': _.get(this, 'state.strategy.code', null),
                    'type': _.get(this, 'state.strategy.type', null)
                },
                'headers': Utils.getAuthTokenHeader()
            })
                .then((response) => {
                    if (showResultInfo) {
                        message.success('Strategy saved successfully');
                    }
                    resolve(true);
                })
                .catch((error) => {
                    reject(error);
                    Utils.checkForInternet(error, this.props.history);
                    if (error.response) {
                        if (error.response.status === 400 || error.response.status === 403) {
                            this.props.history.push('/forbiddenAccess');
                        }
                        Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                    }
                    if (showResultInfo) {
                        message.error('Unable to save strategy');
                    }
                });
        })

        this.onCodeChange = (newCode) => {
            this.updateState({
                'strategy': {
                    ...this.state.strategy,
                    'code': newCode
                }
            })
        }

        this.clickedOnRunBacktest = () => {
            // console.log('Running Backtest');
            try {
                const logsDivRef = document.getElementById('logsDiv');
                const logElement = this.logElement;
                while (logElement.hasChildNodes()) {
                    logElement.removeChild(logElement.lastChild);
                }
            } catch (error) {
            }
            this.saveStartegy(true)
                .then(data => {
                    this.updateState({
                        'isBacktestRunning': true,
                        'extraTabsContent': 'logs',
                        'rightDivOpen': true
                    });

                    return axios({
                        'method': 'post',
                        'url': Utils.getBaseUrl() + '/strategy/' + this.state.strategyId + '/exec',
                        'data': {
                            "advanced": this.getExecPostAdvancedString(),
                            "benchmark": this.state.selectedBenchmark,
                            "endDate": this.state.endDate.format('YYYY-MM-DD'),
                            "initialCash": this.state.initialCapital,
                            "startDate": this.state.startDate.format('YYYY-MM-DD'),
                            "universe": '',
                            "universeIndex": this.state.selectedUniverse
                        },
                        'headers': Utils.getAuthTokenHeader()
                    })
                })
                .then((response) => {
                    setTimeout(() => {
                        this.recursiveUpdateGraphData();
                        this.recursiveUpdateLogData();
                    }, 100);
                    this.setupWebSocketConnections(response.data._id);
                    this.getBackTest(response.data._id);
                })
                .catch((error) => {
                    Utils.checkForInternet(error, this.props.history);
                    if (error.response) {
                        if (error.response.status === 400 || error.response.status === 403) {
                            this.props.history.push('/forbiddenAccess');
                        }
                        Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                    }
                    this.updateState({
                        'isBacktestRunning': false
                    });
                });
        }

        this.getBackTest = (backtestId) => {
            axios(Utils.getBaseUrl() + '/backtest/' + backtestId, {
                'headers': Utils.getAuthTokenHeader()
            })
                .then((response) => {
                    this.updateState({ 'newBacktestRunData': response.data });
                    this.getLogs(response.data._id);
                    this.getTransactionHistory(response.data._id);
                    this.getPortfolioHistory(response.data._id);
                })
                .catch((error) => {
                    Utils.checkForInternet(error, this.props.history);
                    if (error.response) {
                        if (error.response.status === 400 || error.response.status === 403) {
                            this.props.history.push('/forbiddenAccess');
                        }
                        Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                    }
                });
        }

        this.getLogs = (backtestId) => {
            axios(Utils.getBaseUrl() + '/backtest/' + backtestId + '?select=logs', {
                'headers': Utils.getAuthTokenHeader()
            })
                .then((response) => {
                    this.gotLogs = true;
                    this.handleSocketToGetLiveData(backtestId);
                })
                .catch((error) => {
                    Utils.checkForInternet(error, this.props.history);
                    if (error.response) {
                        if (error.response.status === 400 || error.response.status === 403) {
                            this.props.history.push('/forbiddenAccess');
                        }
                        Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                    }
                });
        }

        this.getTransactionHistory = (backtestId) => {
            axios(Utils.getBaseUrl() + '/backtest/' + backtestId + '?select=transactionHistory', {
                'headers': Utils.getAuthTokenHeader()
            })
                .then((response) => {
                    this.gotTransactionHistory = true;
                    this.handleSocketToGetLiveData(backtestId);
                })
                .catch((error) => {
                    Utils.checkForInternet(error, this.props.history);
                    if (error.response) {
                        if (error.response.status === 400 || error.response.status === 403) {
                            this.props.history.push('/forbiddenAccess');
                        }
                        Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                    }
                });
        }

        this.getPortfolioHistory = (backtestId) => {
            axios(Utils.getBaseUrl() + '/backtest/' + backtestId + '?select=portfolioHistory', {
                'headers': Utils.getAuthTokenHeader()
            })
                .then((response) => {
                    this.gotPortfolioHistory = true;
                    this.handleSocketToGetLiveData(backtestId);
                })
                .catch((error) => {
                    Utils.checkForInternet(error, this.props.history);
                    if (error.response) {
                        if (error.response.status === 400 || error.response.status === 403) {
                            this.props.history.push('/forbiddenAccess');
                        }
                        Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                    }
                });
        }

        this.onStockChartCreated = (chart) => {
            this.runningBackTestChart = chart;
        }

        this.runningBackTestDivUnmount = () => {
            if (this.timeOutcheck) {
                clearTimeout(this.timeOutcheck);
            }
            this.highStockSeriesPosition = {};
            this.totalDataLength = 1;
            this.graphsDataUpdatedTillNow = 0;
            this.atleastOneMessageReceived = false;
            this.gotBacktestCompleteLog = false;
            this.runningBackTestChart = undefined;
            this.gotLogs = false;
            this.gotTransactionHistory = false;
            this.gotPortfolioHistory = false;
            this.graphData.length = 0;
            this.logsData.length = 0;
            try {
                const logsDivRef = document.getElementById('logsDiv');
                logsDivRef.innerHtml = "";
            } catch (error) { }
            if (Utils.webSocket) {
                Utils.webSocket.close();
                Utils.webSocket = undefined;
            }
            this.updateState({
                'isBackTestRunComplete': false,
                'isBacktestRunning': false,
                'newBacktestRunData': {},
                'backtestProgress': 0,
                'extraTabsContent': 'settings'
            });
        }

        this.updateDimensions = () => {
            if (window.innerWidth < 800 && this.state.rightDivOpen) {
                this.updateState({ 'rightDivOpen': false });
            }
        }

    }

    checkAndGoToBacktestPageIfNoData(backtestId) {
        if (!this.atleastOneMessageReceived && this._mounted) {
            // this.props.history.push('/research/backtests/'+this.state.strategyId+
            //   '/'+backtestId+'?type=backtest&strategyName='+this.state.strategy.name+'&backtestName=New Backtest');
            this.backtestId = backtestId;
            this.updateState({
                showBacktestRedirectModal: true
            });
        }
    }

    renderBacktestRedirectModal = () => {
        const backtestRedirectUrl = '/research/backtests/' + this.state.strategyId + '?type=backtest&strategyName=' + this.state.strategy.name + '&backtestName=New Backtest';
        return (
            <Modal
                title="Redirect to Backtest"
                onOk={
                    () => this.props.history.push(backtestRedirectUrl)
                }
                onCancel={() => {
                    this.updateState({ showBacktestRedirectModal: false })
                }}
                visible={this.state.showBacktestRedirectModal}
            >
                <h3>Backtest is taking too long to complete. Redirect to Backtest Detail</h3>
            </Modal>
        );
    }

    handleSocketToGetLiveData(backtestId) {
        if (this.gotLogs && this.gotTransactionHistory && this.gotPortfolioHistory
            && backtestId) {
            this.subscribeToBacktestUpdates(backtestId);
            if (this.timeOutcheck) {
                clearTimeout(this.timeOutcheck);
            }
            this.timeOutcheck = setTimeout(() => {
                this.checkAndGoToBacktestPageIfNoData(backtestId);
            }, this.maxWaitTimeForMessages);
        }
    }

    updateBackTestComplete(hardUpdate) {
        if (hardUpdate ||
            (this.gotBacktestCompleteLog && this.graphData.length === 0)) {
            if (Utils.webSocket) {
                Utils.webSocket.close();
                Utils.webSocket = undefined;
            }
            const backtestData = JSON.parse(JSON.stringify(this.state.newBacktestRunData));
            backtestData['status'] = 'Complete';
            this.updateState({
                'isBackTestRunComplete': true,
                'newBacktestRunData': backtestData
            });
        }
    }

    updateBacktestError() {
        if (Utils.webSocket) {
            Utils.webSocket.close();
            Utils.webSocket = undefined;
        }
        const backtestData = JSON.parse(JSON.stringify(this.state.newBacktestRunData));
        backtestData['status'] = 'Error';
        this.updateState({
            'isBackTestRunComplete': true,
            'newBacktestRunData': backtestData
        });
    }


    setupWebSocketConnections(backtestId) {
        Utils.openSocketConnection();
        Utils.webSocket.onopen = () => {
            this.handleSocketToGetLiveData(backtestId);
        }
        Utils.webSocket.onclose = () => {
            // console.log("Close Socket");
            // if (!this.state.isBackTestRunComplete){
            //   this.updateBackTestComplete(true);
            // }
            Utils.webSocket = undefined;

            // if (this.numberOfTimeSocketConnectionCalled < 5){
            setTimeout(() => {
                this.numberOfTimeSocketConnectionCalled++;
                Utils.openSocketConnection();
            }, Math.min(this.socketOpenConnectionTimeout * this.numberOfTimeSocketConnectionCalled, 5000));
            // }
        }
        Utils.webSocket.onerror = (data) => {
            this.updateBacktestError();
        }
        Utils.webSocket.onmessage = (msg) => {
            this.atleastOneMessageReceived = true;
            if (msg.data) {
                const data = JSON.parse(msg.data);

                //Temporary Fix: Route to detail if "Exception" happens before any WS message
                if (data.status == "exception" || data.status == "completion") {
                    const backtestRedirectUrl = `/research/backtests/${this.state.strategyId}/${backtestId}`;
                    this.props.history.push(backtestRedirectUrl)
                }

                if (data.data) {

                    for (let i = 0; i < data.data.length; i++) {
                        let dataLocal = data.data[i];
                        // console.log(dataLocal);

                        try {
                            dataLocal = JSON.parse(data.data[i]);
                        } catch (e) { }
                        // this.recursiveUpdateLogData();
                        if (dataLocal.messagetype === 'ERROR') {
                            this.gotBacktestCompleteLog = true;
                            this.updateBacktestError();
                            this.logsData.push(dataLocal);
                        } else {
                            if (dataLocal.outputtype === 'performance') {
                                if (dataLocal.date && this.runningBackTestChart) {
                                    this.graphData.push(dataLocal);
                                    if (!this.gotLabelDataFromSocket) {
                                        this.totalDataLength++;
                                    }
                                }
                            } else if (dataLocal.outputtype === 'labels') {
                                if (dataLocal.labels) {
                                    let categories = [];
                                    for (let key in dataLocal.labels) {
                                        categories.push(moment(key, 'YYYY-MM-DD').valueOf());
                                    }
                                    categories.sort();
                                    this.gotLabelDataFromSocket = true;
                                    this.totalDataLength = categories.length;
                                    this.updateGraphWithCategories(categories);
                                }
                            } else if (dataLocal.outputtype === 'log') {
                                if (dataLocal.message === 'Ending Backtest') {
                                    this.gotBacktestCompleteLog = true;
                                    this.updateBackTestComplete();
                                }
                                this.logsData.push(dataLocal);
                            }
                        }
                    }
                }
            }
        }
    }

    addNewSeriesToGraph(seriesName, yAxisIndex) {
        const series = {
            'name': seriesName,
            'data': [],
            'yAxis': yAxisIndex
        };
        this.runningBackTestChart.addSeries(series, false, false);
        this.highStockSeriesPosition[seriesName] = Object.keys(this.highStockSeriesPosition).length;
    }


    updateGraphWithCategories(categories) {
        if (this.runningBackTestChart) {
            const series1 = {
                'name': 'dummy_series_1234',
                'data': []
            };
            for (let i = 0; i < categories.length; i++) {
                series1.data.push([(categories[i] + 0), null]);
            }
            this.runningBackTestChart.addSeries(series1, false, false);
            this.runningBackTestChart.xAxis[0].setExtremes(null, null, false, false);
            this.runningBackTestChart.xAxis[1].setExtremes(null, null, false, false);
            this.highStockSeriesPosition['dummy_series_1234'] = 0;
            // console.log(this.runningBackTestChart.xAxis);
            this.runningBackTestChart.redraw(true);
        }
    }

    recursiveUpdateLogData = () => {
        const backtestData = JSON.parse(JSON.stringify(this.state.newBacktestRunData));
        if (this.logsData.length > 0) {
            let toSplice = 60;
            const arry = this.logsData.splice(0, 40);
            const logsDivRef = this.logElement;
            for (let i = 0; i < arry.length; i++) {
                let data = arry[i];
                data.dt = moment.utc(data.dt).local().format(dateFormat);
                const log = '<div style="font-size: 10px;"' +
                    'style="marginTop": "7px">' +
                    '<span class="log-type ' + data.messagetype + '">' +
                    '[' + data.messagetype + ']&nbsp;' +
                    '</span>' +
                    '<span class="log-date-time">' +
                    '[' + data.dt + ']&nbsp;' +
                    '</span>' +
                    '<span class="log-message">' + data.message +
                    '</span>' +
                    '</div>';
                if (logsDivRef) {
                    logsDivRef.insertAdjacentHTML('beforeend', log);
                }
            }
            logsDivRef.scrollTop = logsDivRef.scrollHeight;
        }
        if (!this.gotBacktestCompleteLog || this.logsData.length > 0) {
            setTimeout(() => {
                this.recursiveUpdateLogData();
            }, 1000);
        } else {
            if (backtestData.status !== 'Error') {
                this.updateBackTestComplete();
            }
        }
    }


    recursiveUpdateGraphData() {
        const backtestData = JSON.parse(JSON.stringify(this.state.newBacktestRunData));
        if (this.runningBackTestChart && this.graphData.length > 0) {
            const arry = this.graphData.splice(0, 40);
            this.graphsDataUpdatedTillNow = this.graphsDataUpdatedTillNow + arry.length;
            let lastDataPoint = undefined;
            for (let i = 0; i < arry.length; i++) {
                const dt = arry[i];
                const dtValue = moment(dt.date, 'YYYY-MM-DD').valueOf();
                if (this.highStockSeriesPosition['Strategy'] === undefined) {
                    this.addNewSeriesToGraph('Strategy', 0);
                }
                if (this.highStockSeriesPosition['NIFTY_50'] === undefined) {
                    this.addNewSeriesToGraph('NIFTY_50', 0);
                }
                this.runningBackTestChart.series[this.highStockSeriesPosition['NIFTY_50']].addPoint([dtValue, dt.totalreturn_benchmark], false, false);
                this.runningBackTestChart.series[this.highStockSeriesPosition['Strategy']].addPoint([dtValue, dt.totalreturn], false, false);
                if (dt.variables) {
                    for (let key2 in dt.variables) {
                        if (this.highStockSeriesPosition[key2] === undefined) {
                            this.addNewSeriesToGraph(key2, 1);
                        }
                        this.runningBackTestChart.series[this.highStockSeriesPosition[key2]].addPoint([dtValue, dt.variables[key2]], false, false);
                    }
                }
                lastDataPoint = dt;
            }
            if (lastDataPoint) {
                const dataBacktest = JSON.parse(JSON.stringify(this.state.newBacktestRunData));
                if (!dataBacktest.output) {
                    dataBacktest.output = {};
                }
                dataBacktest.output.summary = lastDataPoint;
                this.updateState({ 'newBacktestRunData': dataBacktest });
            }
            this.runningBackTestChart.xAxis[0].setExtremes(null, null, false, false);
            this.runningBackTestChart.xAxis[1].setExtremes(null, null, false, false);
            this.runningBackTestChart.redraw(true);
            let progNum = Math.floor((this.graphsDataUpdatedTillNow / this.totalDataLength) * 100);
            if (progNum > 100) {
                progNum = 100;
            }
            this.updateState({ 'backtestProgress': progNum });
        }
        if (!this.gotBacktestCompleteLog || this.graphData.length > 0) {
            setTimeout(() => {
                this.recursiveUpdateGraphData();
            }, 1000);
        } else {
            if (backtestData.status !== 'Error') {
                this.updateBackTestComplete();
            }
        }
    }

    unsubscribeFromBacktest() {
        const msg = {
            "aimsquant-token": Utils.getAuthToken(),
            "action": "unsubscribe-backtest",
            "backtestId": this.state.newBacktestRunData._id
        };
        if (Utils.webSocket && Utils.webSocket.readyState === 1) {
            Utils.webSocket.send(JSON.stringify(msg));
        }
    }

    subscribeToBacktestUpdates(backtestId) {
        const msg = {
            "aimsquant-token": Utils.getAuthToken(),
            "action": "subscribe-fresh-backtest",
            "backtestId": backtestId
        };
        if (Utils.webSocket && Utils.webSocket.readyState === 1) {
            Utils.webSocket.send(JSON.stringify(msg));
        } else {
            Utils.webSocket = undefined;
            this.setupWebSocketConnections(backtestId);
        }
    }

    getExecPostAdvancedString() {
        let returnString = '{"rebalance":"' + this.state.selectedRebalance + '",' +
            '"cancelPolicy":"' + this.state.selectedCancelPolicy + '",' +
            '"slippage":{"model":"' + this.state.selectedSlipPageType + '","value":' + this.state.selectedSlipPage + '},' +
            '"commission":{"model":"' + this.state.selectedCommissionType + '","value":' + this.state.selectedCommission + '},' +
            '"resolution":"Day","investmentPlan":"' + this.state.selectedInvestmentPlan + '","executionPolicy":"' + this.state.selectedExecutionPolicy + '"';
        returnString = returnString + "}";
        return returnString;
    }

    componentDidMount() {
        this._mounted = true;
        if (!Utils.isLoggedIn()) {
            Utils.goToLoginPage(this.props.history, window.location.href);
        } else {
            this.props.pageChange('research');
            if (this._mounted) {
                this.loadStrategyinfo();
                this.loadBenchMarkDropdownData();
            }
            window.addEventListener("resize", this.updateDimensions);
            this.autoSaveTimer = setInterval(() => {
                this.saveStartegy(true);
            }, this.autoSaveTime);
        }
    }

    componentWillUnmount() {
        this._mounted = false;
        window.removeEventListener("resize", this.updateDimensions);
        this.runningBackTestDivUnmount();
        clearInterval(this.stratergySaveInterval);
        if (this.cancelGetStrategy) {
            this.cancelGetStrategy();
        }
        if (this.cancelGetBenchmark) {
            this.cancelGetBenchmark();
        }
        this.unsubscribeFromBacktest();
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        Utils.closeWebSocket();
    }

    getDisabledStartDate = (currentDate) => {
        console.log(currentDate);
        if (
            currentDate.isAfter('2007-01-01T00:00:00Z') &&
            currentDate.isBefore(this.state.endDate) &&
            DateHelper.isWeekDay(currentDate)
        ) {
            return false;
        } else {
            return true;
        }
    }

    getDisabledEndDate = (currentDate) => {
        if (currentDate.isAfter('2007-01-01T00:00:00Z') &&
            DateHelper.isWeekDay(currentDate) &&
            currentDate.isBefore(moment(DateHelper.getPreviousNonHolidayWeekday(moment())))
        ) {
            return false;
        } else {
            return true;
        }
    }

    render() {

        const antIconLoading = <Icon type="loading" style={{ fontSize: 34 }} spin />;

        const getNewStartegyModal = () => {
            return (
                <Modal
                    title=""
                    wrapClassName="vertical-center-modal"
                    visible={this.state.showNewStartegyDiv}
                    footer={null}
                    onCancel={() => this.updateState({ 'showNewStartegyDiv': false })}
                >
                    <NewStartegy
                        onCancel={() => this.updateState({ 'showNewStartegyDiv': false })}
                    />
                </Modal>
            );
        }

        const getCloneStrategyModal = () => {
            return (
                <Modal
                    title=""
                    wrapClassName="vertical-center-modal"
                    visible={this.state.showCloneStartegyDiv}
                    footer={null}
                    onCancel={() => this.updateState({ 'showCloneStartegyDiv': false })}
                >
                    <NewStartegy
                        startegyClone={this.state.strategy}
                        onCancel={() => this.updateState({ 'showCloneStartegyDiv': false })}
                    />
                </Modal>
            );
        }

        const getSettingsDivTabsRight = () => {
            const tabs = [];
            const Option = Select.Option;

            const benchmarksOptions = [];
            for (let i = 0; i < this.state.benchmark.length; i++) {
                benchmarksOptions.push(<Option key={i} value={this.state.benchmark[i]}>{this.state.benchmark[i]}</Option>);
            }

            const universeOptions = [];
            for (let i = 0; i < this.state.universe.length; i++) {
                universeOptions.push(<Option key={i} value={this.state.universe[i]}>{this.state.universe[i]}</Option>);
            }

            tabs.push(
                <Tabs.TabPane tab="BASIC" key="basic">
                    <div style={{ 'height': '100%', 'overflowY': 'auto' }}>
                        <div style={{ 'display': 'flex', 'alignItems': 'center', 'padding': '10px' }}>
                            <p style={{
                                'margin': '0px 10px 0px 0px',
                                'color': '#7c7c7c', 'minWidth': '100px'
                            }}>
                                Initial Capital:
              </p>
                            <Input style={{ 'flex': '1' }}
                                placeholder="Initial Capital" type="number"
                                value={this.state.initialCapital}
                                onChange={(e) => { this.updateState({ 'initialCapital': e.target.value }) }}
                                disabled={this.state.isBacktestRunning}
                            />
                        </div>
                        <div style={{ 'display': 'flex', 'alignItems': 'center', 'padding': '10px' }}>
                            <p 
                                    style={{
                                        'margin': '0px 10px 0px 0px',
                                        'color': '#7c7c7c', 'minWidth': '100px'
                                    }}
                            >
                                Start Date:
                            </p>
                            <DatePicker
                                style={{ 'flex': '1' }}
                                placeholder="Start Date"
                                value={this.state.startDate}
                                onChange={this.onStartDateChange}
                                format="MM/DD/YYYY"
                                disabledDate={this.getDisabledStartDate}
                                disabled={this.state.isBacktestRunning} />
                        </div>
                        <div style={{ 'display': 'flex', 'alignItems': 'center', 'padding': '10px' }}>
                            <p 
                                    style={{
                                        'margin': '0px 10px 0px 0px',
                                        'color': '#7c7c7c', 'minWidth': '100px'
                                    }}
                            >
                                End Date:
                            </p>
                            <DatePicker style={{ 'flex': '1' }} placeholder="End Date"
                                value={this.state.endDate} onChange={this.onEndDateChange}
                                format="MM/DD/YYYY"
                                disabledDate={this.getDisabledEndDate}
                                disabled={this.state.isBacktestRunning} />
                        </div>
                        <div style={{ 'display': 'flex', 'alignItems': 'center', 'padding': '10px' }}>
                            <p style={{
                                'margin': '0px 10px 0px 0px',
                                'color': '#7c7c7c', 'minWidth': '100px'
                            }}>
                                Benchmark:
              </p>
                            <Select style={{ 'flex': '1' }} value={this.state.selectedBenchmark}
                                onChange={this.onBenchmarkChange}
                                disabled={this.state.isBacktestRunning}>
                                {benchmarksOptions}
                            </Select>
                        </div>
                        <div style={{ 'display': 'flex', 'alignItems': 'center', 'padding': '10px' }}>
                            <p style={{
                                'margin': '0px 10px 0px 0px',
                                'color': '#7c7c7c', 'minWidth': '100px'
                            }}>
                                Universe:
              </p>
                            <Select style={{ 'flex': '1' }} value={this.state.selectedUniverse}
                                onChange={this.onUniverseChange}
                                disabled={this.state.isBacktestRunning}>
                                {universeOptions}
                            </Select>
                        </div>
                    </div>
                </Tabs.TabPane>
            );
            tabs.push(
                <Tabs.TabPane tab="ADVANCED" key="advanced">
                    <div style={{ 'height': '100%', 'overflowY': 'auto' }}>
                        <div style={{ 'display': 'flex', 'alignItems': 'center', 'padding': '10px' }}>
                            <p style={{
                                'margin': '0px 10px 0px 0px',
                                'color': '#7c7c7c', 'minWidth': '100px'
                            }}>
                                Rebalance:
              </p>
                            <Radio.Group style={{ 'flex': '1' }}
                                onChange={this.onRebalanceChange}
                                value={this.state.selectedRebalance}
                                disabled={this.state.isBacktestRunning}>
                                <Radio.Button value="Daily">Daily</Radio.Button>
                                <Radio.Button value="Weekly">Weekly</Radio.Button>
                                <Radio.Button value="Monthly">Monthly</Radio.Button>
                            </Radio.Group>
                        </div>
                        <div style={{ 'display': 'flex', 'alignItems': 'center', 'padding': '10px' }}>
                            <p style={{
                                'margin': '0px 10px 0px 0px',
                                'color': '#7c7c7c', 'minWidth': '100px'
                            }}>
                                Cancel Policy:
              </p>
                            <Radio.Group style={{ 'flex': '1' }}
                                onChange={(e) => { this.updateState({ 'selectedCancelPolicy': e.target.value }) }}
                                value={this.state.selectedCancelPolicy}
                                disabled={this.state.isBacktestRunning}>
                                <Radio.Button value="EOD">EOD</Radio.Button>
                                <Radio.Button value="GTC">GTC</Radio.Button>
                            </Radio.Group>
                        </div>
                        <div style={{ 'display': 'flex', 'alignItems': 'center', 'padding': '10px' }}>
                            <p style={{
                                'margin': '0px 10px 0px 0px',
                                'color': '#7c7c7c', 'minWidth': '100px'
                            }}>
                                Commission:
              </p>
                            <Input style={{ 'width': '80px', 'marginRight': '6px' }} placeholder="Commission" type="number"
                                value={this.state.selectedCommission}
                                onChange={(e) => { this.updateState({ 'selectedCommission': e.target.value }) }}
                                disabled={this.state.isBacktestRunning} />
                            <Radio.Group style={{ 'flex': '1' }}
                                onChange={(e) => { this.updateState({ 'selectedCommissionType': e.target.value }) }}
                                value={this.state.selectedCommissionType}
                                disabled={this.state.isBacktestRunning}>
                                <Radio.Button value="PerTrade">PerTrade</Radio.Button>
                                <Radio.Button value="PerShare">PerShare</Radio.Button>
                            </Radio.Group>
                        </div>
                        <div style={{ 'display': 'flex', 'alignItems': 'center', 'padding': '10px' }}>
                            <p style={{
                                'margin': '0px 10px 0px 0px',
                                'color': '#7c7c7c', 'minWidth': '100px'
                            }}>
                                Slip page:
              </p>
                            <Input style={{ 'width': '80px', 'marginRight': '6px' }} placeholder="Slip page"
                                type="number"
                                value={this.state.selectedSlipPage}
                                onChange={(e) => { this.updateState({ 'selectedSlipPage': e.target.value }) }}
                                disabled={this.state.isBacktestRunning} />
                            <Radio.Group style={{ 'flex': '1' }}
                                onChange={(e) => { this.updateState({ 'selectedSlipPageType': e.target.value }) }}
                                value={this.state.selectedSlipPageType}
                                disabled={this.state.isBacktestRunning}>
                                <Radio.Button value="Variable">Variable</Radio.Button>
                                <Radio.Button value="Spread">Spread</Radio.Button>
                            </Radio.Group>
                        </div>
                        <div style={{ 'display': 'flex', 'alignItems': 'center', 'padding': '10px' }}>
                            <p style={{
                                'margin': '0px 10px 0px 0px',
                                'color': '#7c7c7c', 'minWidth': '100px'
                            }}>
                                Investment Plan:
              </p>
                            <Select style={{ 'flex': '1' }} value={this.state.selectedInvestmentPlan}
                                onChange={(value) => this.updateState({ 'selectedInvestmentPlan': value })}
                                disabled={this.state.isBacktestRunning}>
                                <Option value="AllIn">AllIn</Option>
                                <Option value="Monthly">Monthly</Option>
                                <Option value="Yearly">Yearly</Option>
                                <Option value="Weekly">Weekly</Option>
                            </Select>
                        </div>
                        <div style={{ 'display': 'flex', 'alignItems': 'center', 'padding': '10px' }}>
                            <p style={{
                                'margin': '0px 10px 0px 0px',
                                'color': '#7c7c7c', 'minWidth': '100px'
                            }}>
                                Execution Policy:
              </p>
                            <Select style={{ 'flex': '1' }} value={this.state.selectedExecutionPolicy}
                                onChange={(value) => this.updateState({ 'selectedExecutionPolicy': value })}
                                disabled={this.state.isBacktestRunning}>
                                <Option value="Close">Close</Option>
                                <Option value="High">High</Option>
                                <Option value="Low">Low</Option>
                                <Option value="Open">Open</Option>
                                <Option value="AverageHighLow">AverageHighLow</Option>
                                <Option value="AverageAll">AverageAll</Option>
                            </Select>
                        </div>
                    </div>
                </Tabs.TabPane>
            );
            return tabs;
        }

        const getExtraSettingTabDiv = () => {
            return (
                <React.Fragment>
                    <Tabs style={{ display: this.state.extraTabsContent === 'settings' ? 'block' : 'none' }} defaultActiveKey="basic" animated={false}
                        className="strategy-right-div-extra-settings-tabdiv">
                        {getSettingsDivTabsRight()}
                    </Tabs>
                    <div id="logsDiv" ref={element => { this.logElement = element }} className="backtest-logs" style={{ display: this.state.extraTabsContent === 'logs' ? 'block' : 'none', 'height': '100%', 'overflowY': 'auto', 'background': '#323232' }}>
                    </div>
                </React.Fragment>
            );
        }

        const getGoToBackTestIcon = () => {
            if (this.state.isBacktestRunning &&
                this.state.isBackTestRunComplete) {
                return (
                    <React.Fragment>
                        <Icon type="codepen" onClick={() => {
                            this.updateState({
                                'isBacktestRunning': false,
                                'isBackTestRunComplete': false
                            });
                        }} />
                        <div style={{
                            'height': '30px',
                            'width': '1px', 'background': 'teal',
                            'margin': '0px 10px'
                        }}>
                        </div>
                    </React.Fragment>
                );
            }
        }

        const getRightTopIcons = () => {
            if (this.state.isBacktestRunning) {
                return (
                    <React.Fragment>
                        {getGoToBackTestIcon()}
                        <Icon type="plus"
                            className="inactive" />
                        <Icon type="copy"
                            className="inactive" />
                        <Icon type="save"
                            className="inactive" />
                        <div style={{
                            'height': '30px',
                            'width': '1px', 'background': 'teal',
                            'margin': '0px 10px'
                        }}>
                        </div>
                        <Link to={"/research/backtests/" + this.state.strategyId}><Icon type="bar-chart" /></Link>
                        <Icon type="caret-right" className="inactive" />
                        <div style={{
                            'height': '30px',
                            'width': '1px', 'background': 'teal',
                            'margin': '0px 10px'
                        }}>
                        </div>
                        <Icon type="menu-unfold" className={this.state.rightDivOpen ? 'active' : ''}
                            onClick={() => { this.updateState({ 'rightDivOpen': !this.state.rightDivOpen }) }} />
                    </React.Fragment>
                );
            } else {
                return (
                    <React.Fragment>
                        <Icon type="plus"
                            onClick={() => { this.updateState({ 'showNewStartegyDiv': true }) }} />
                        {getNewStartegyModal()}
                        <Icon type="copy"
                            onClick={() => { this.updateState({ 'showCloneStartegyDiv': true }) }} />
                        {getCloneStrategyModal()}
                        <Icon type="save"
                            onClick={() => this.clickedOnSave()} />
                        <div style={{
                            'height': '30px',
                            'width': '1px', 'background': 'teal',
                            'margin': '0px 10px'
                        }}>
                        </div>
                        <Link to={"/research/backtests/" + this.state.strategyId}><Icon type="bar-chart" /></Link>
                        <Icon type="caret-right"
                            onClick={this.clickedOnRunBacktest} />
                        <div style={{
                            'height': '30px',
                            'width': '1px', 'background': 'teal',
                            'margin': '0px 10px'
                        }}>
                        </div>
                        <Icon type="menu-unfold" className={this.state.rightDivOpen ? 'active' : ''}
                            onClick={() => { this.updateState({ 'rightDivOpen': !this.state.rightDivOpen }) }} />
                    </React.Fragment>
                );
            }
        }

        const getLeftBodyContent = () => {
            if (this.state.isBacktestRunning) {
                return (
                    <div style={{ 'height': '100%', 'width': '100%', 'background': 'white' }}
                        className="card">
                        <RunningBackTest
                            backTestData={this.state.newBacktestRunData}
                            onGraphCreated={this.onStockChartCreated}
                            RunningBackTestDivUnmount={this.runningBackTestDivUnmount} />
                    </div>
                );
            } else {
                return (
                    <AceEditor
                        mode="julia"
                        theme="tomorrow_night_bright"
                        name="UNIQUE_ID_OF_DIV"
                        value={this.state.strategy.code}
                        onChange={this.onCodeChange}
                        width="100%"
                        height="100%"
                        editorProps={{ $blockScrolling: "Infinity" }}
                    />
                );
            }
        }

        const goBack = () => {
            this.saveStartegy(true)
                .finally(() => {
                    this.props.history.push('/research');
                });
        }

        const getStrategyDiv = () => {
            const backtestData = JSON.parse(JSON.stringify(this.state.newBacktestRunData));
            const statusText = backtestData.status === 'Complete' ? 'Complete' : 'Internal Exception';
            const statusColor = backtestData.status === 'Complete' ? 'teal' : '#cc6666';
            if (this.state.loading) {
                return (
                    <div style={{
                        'display': 'flex',
                        'alignItems': 'center', 'justifyContent': 'center',
                        'minHeight': '400px'
                    }}>
                        <Spin indicator={antIconLoading} />
                    </div>
                );
            } else {

                let rightDivWidth = this.state.rightDivOpen ? '435px' : '0px';
                const topBandColWidthLeftMd = this.state.isBacktestRunning ? 9 : 12;
                const topBandColWidthLeftSm = this.state.isBacktestRunning ? 12 : 24;
                const topBandColWidthRightMd = this.state.isBacktestRunning ? 9 : 12;
                const topBandColWidthRightSm = 24;
                const topBandColWidthMiddleMd = this.state.isBacktestRunning ? 6 : 0;
                const topBandColWidthMiddleSm = this.state.isBacktestRunning ? 12 : 0;

                return (
                    <div style={{ 'height': '100%', 'position': 'relative' }}>
                        <Row type="flex" justify="center" style={{
                            'minHeight': '50px', 'padding': '0px 20px 0px 20px',
                            'boxShadow': '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)', 'zIndex': '10'
                        }}>
                            <Col sm={topBandColWidthLeftSm} md={topBandColWidthLeftMd} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                <Icon onClick={goBack} type="arrow-left" style={{
                                    'fontSize': '20px',
                                    'visibility': (this.state.isBacktestRunning ? 'hidden' : 'visible'),
                                    'paddingRight': '15px', cursor: 'pointer', color: 'teal'
                                }} />
                                <Input placeholder="Strategy Name" onChange={this.startegyNameChange}
                                    value={this.state.strategy.name}
                                    style={{ 'width': 'auto', 'minWidth': '300px' }}
                                    disabled={this.state.isBacktestRunning} />
                            </Col>
                            <Col sm={topBandColWidthMiddleSm} md={topBandColWidthMiddleMd} style={{
                                'display': 'flex', 'alignItems': 'center',
                                'justifyContent': 'center'
                            }}>
                                <div style={{
                                    'justifyContent': 'center',
                                    'alignItems': 'center',
                                    'display': (this.state.isBacktestRunning ? 'flex' : 'none')
                                }}>
                                    <div style={{ 'display': (this.state.isBackTestRunComplete ? 'none' : 'inherit') }}>
                                        <div style={{ 'display': 'block', 'textAlign': 'center' }}>
                                            <p style={{ 'margin': '0px', 'fontSize': '12px', 'fontWeight': '600' }}>
                                                Running Backtest
                                            </p>
                                            <p style={{
                                                'margin': '0px', 'fontSize': '12px', 'fontWeight': '700',
                                                'color': 'teal'
                                            }}>
                                                Progress: {this.state.backtestProgress} %
                                            </p>
                                        </div>
                                        <Spin indicator={antIconLoading} style={{ 'marginLeft': '10px' }} />
                                    </div>
                                    <h2 
                                            style={{
                                                'color': statusColor, 'margin': '0px', 'fontSize': '16px', 'fontWeight': '700',
                                                'display': (this.state.isBackTestRunComplete ? 'inherit' : 'none')
                                            }}
                                        >
                                        {statusText}
                                    </h2>
                                </div>
                            </Col>
                            <Col sm={topBandColWidthRightSm} md={topBandColWidthRightMd} style={{
                                'display': 'flex', 'alignItems': 'center',
                                'justifyContent': 'flex-end'
                            }} className="strategy-top-right-icons">
                                {getRightTopIcons()}
                            </Col>
                        </Row>
                        <div style={{
                            'height': 'calc(100% - 50px)', 'display': 'flex',
                            'padding': '5px'
                        }}>
                            <div style={{ 'height': '100%', 'flex': '1', 'minWidth': '0px' }}>
                                {getLeftBodyContent()}
                            </div>
                            <div style={{ 'display': 'flex', 'background': 'white', 'marginLeft': '5px' }}
                                className="card">
                                <div style={{ 'height': '100%', 'width': rightDivWidth, 'overflowY': 'auto' }}>
                                    {getExtraSettingTabDiv()}
                                </div>
                                <div style={{
                                    'height': 'calc(100% - 25px)', 'width': '60px',
                                    'paddingTop': '25px'
                                }}
                                    className="strategy-right-div-icon-holder">
                                    <div>
                                        <Icon type="setting"
                                            className={this.state.extraTabsContent === 'settings' ? 'active' : ''}
                                            onClick={() => {
                                                this.updateState({ 'extraTabsContent': 'settings', 'rightDivOpen': true });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <Icon type="database"
                                            className={this.state.extraTabsContent === 'logs' ? 'active' : ''}
                                            onClick={
                                                () => {
                                                    this.updateState({ 'extraTabsContent': 'logs', 'rightDivOpen': true });
                                                }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
        }

        const getTotalDiv = () => {
            if (!this.state.loading) {
                return (
                    <div className="strategy-detail-div" style={{ 'width': '100%', 'height': 'calc(100vh - 65px)' }}>
                        {getStrategyDiv()}
                    </div>
                );
            }
        }

        return (
            <React.Fragment>
                {this.renderBacktestRedirectModal()}
                <div className="main-loader">
                    <Loading
                        show={this.state.loading}
                        color="teal"
                        showSpinner={false}
                    />
                </div>
                {getTotalDiv()}
            </React.Fragment>
        );
    }
}

export default withRouter(StartegyDetail);
