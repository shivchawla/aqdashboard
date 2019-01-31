import React, { Component } from 'react';
import _ from 'lodash';
import Utils from './../../Utils';
import { Spin, Icon, Row, Col, Tabs, Button, Radio, Breadcrumb } from 'antd';
import axios from 'axios';
import { withRouter, Link } from 'react-router-dom';
import Moment from 'react-moment';
import moment from 'moment';
import AceEditor from 'react-ace';
import 'brace/mode/julia';
import 'brace/theme/xcode';
import CustomHighCharts from './../../CustomHighCharts/CustomHighCharts.jsx';
import RunningBacktestChart from './../../CustomHighCharts/RunningBacktestChart.jsx';
import ReactTable from "react-table";
import "react-table/react-table.css";
import Loading from 'react-loading-bar';
import { Footer } from '../../Footer/Footer';
import 'react-loading-bar/dist/index.css';


class BacktestDetail extends Component {

    _mounted = false;
    cancelGetStrategy = undefined;
    cancelGetBacktest = undefined;
    cancelGetLogs = undefined;
    cancelGetTransactionHistory = undefined;
    cancelGetPortfolioHistory = undefined;
    queryParams = {};
    transactionColumns = [
        {
            Header: 'Date',
            accessor: 'date',
            sortMethod: (a, b, desc) => {
                return 0; //as they are already sorted no need for this, but if they are not sorted then 
                //you have to do moment(a).isBefore(moment(b)) etc checks
            },
            filterMethod: (filter, row) =>
                row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) > -1
        },
        {
            Header: 'Num. Buy Trades',
            accessor: 'posTrades',
            sortMethod: (a, b, desc) => {
                return a - b;
            }
        },
        {
            Header: 'Num. Sell Trades',
            accessor: 'negTrades',
            // sortMethod: (a, b, desc) => {
            //    return a - b;
            // }
        },
        {
            Header: 'Total Buy Value',
            accessor: 'posDollarValue',
            // sortMethod: (a, b, desc) => {
            //    return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
            // },
            filterMethod: (filter, row) =>
                String(Utils.getNumberFromFormattedMoney(row[filter.id])).startsWith(filter.value)
        },
        {
            Header: 'Total Sell Value',
            accessor: 'negDollarValue',
            // sortMethod: (a, b, desc) => {
            //    return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
            // },
            filterMethod: (filter, row) =>
                String(Utils.getNumberFromFormattedMoney(row[filter.id])).startsWith(filter.value)
        }
    ];
    subTransactionColumns = [
        {
            Header: 'Date',
            accessor: 'date',
            sortMethod: (a, b, desc) => {
                return 0;
            }
        },
        {
            Header: 'Symbol',
            accessor: 'symbol'
        },
        {
            Header: 'Direction',
            accessor: 'direction'
        },
        {
            Header: 'Quantity',
            accessor: 'quantity',
            sortMethod: (a, b, desc) => {
                return a - b;
            }
        },
        {
            Header: 'Price',
            accessor: 'price',
            sortMethod: (a, b, desc) => {
                return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
            }
        },
        {
            Header: 'Order Fee',
            accessor: 'orderfee',
            sortMethod: (a, b, desc) => {
                return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
            }
        }
    ];
    portfolioColumns = [
        {
            Header: 'Date',
            accessor: 'date',
            sortMethod: (a, b, desc) => {
                return 0;
            },
            filterMethod: (filter, row) =>
                row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) > -1
        },
        {
            Header: 'Number of Positions',
            accessor: 'noOfPositions',
            sortMethod: (a, b, desc) => {
                return a - b;
            }
        },
        {
            Header: 'Sum of Market Value',
            accessor: 'totalMarketValue',
            sortMethod: (a, b, desc) => {
                return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
            },
            filterMethod: (filter, row) =>
                String(Utils.getNumberFromFormattedMoney(row[filter.id])).startsWith(filter.value)
        },
        {
            Header: 'Sum of Unrealized PnL',
            accessor: 'totalUnrealisedPnL',
            sortMethod: (a, b, desc) => {
                return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
            },
            filterMethod: (filter, row) =>
                String(Utils.getNumberFromFormattedMoney(row[filter.id])).startsWith(filter.value)
        }
    ];

    subPortfolioColumns = [
        {
            Header: 'Date',
            accessor: 'date',
            sortMethod: (a, b, desc) => {
                return 0;
            }
        },
        {
            Header: 'Symbol',
            accessor: 'symbol'
        },
        {
            Header: 'Average Price',
            accessor: 'avgPrice',
            sortMethod: (a, b, desc) => {
                return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
            }
        },
        {
            Header: 'Quantity',
            accessor: 'quantity',
            sortMethod: (a, b, desc) => {
                return a - b;
            }
        },
        {
            Header: 'Last Price',
            accessor: 'lastPrice',
            sortMethod: (a, b, desc) => {
                return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
            }
        },
        {
            Header: 'Market Value',
            accessor: 'marketValue',
            sortMethod: (a, b, desc) => {
                return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
            }
        },
        {
            Header: 'Unrealized PnL',
            accessor: 'unrealizedPnL',
            sortMethod: (a, b, desc) => {
                return Utils.getNumberFromFormattedMoney(a) - Utils.getNumberFromFormattedMoney(b);
            }
        }
    ];

    runningBackTestChart = undefined;
    graphData = [];
    graphsDataUpdatedTillNow = 0;
    totalDataLength = 1;
    highStockSeriesPosition = {};
    maxWaitTimeForMessages = 15000; // 15 Sec
    atleastOneMessageReceived = false;
    timeOutcheck = undefined;
    gotBacktestCompleteLog = false;
    gotLabelDataFromSocket = false;
    socketOpenConnectionTimeout = 1000;
    numberOfTimeSocketConnectionCalled = 1;

    constructor(props) {
        super();
        let backTestName = "";
        if (props.location.search) {
            this.queryParams = new URLSearchParams(props.location.search);
            backTestName = this.queryParams.get('backtestName');
        }
        this.state = {
            strategy: {},
            backTestName: backTestName,
            backTestData: {},
            logs: undefined,
            transactionHistory: undefined,
            transactionHistoryParentData: undefined,
            portfolioHistory: undefined,
            portfolioParentData: undefined,
            latestPortfolio: undefined,
            loading: true,
            logsLoading: true,
            transactionLoading: true,
            portfolioHistoryLoading: true,
            portfolioMode: 'LatestPortfolio',
            isBacktestRunning: false,
            isBackTestRunComplete: false,
            newBacktestRunData: {},
            backtestProgress: 0
        };
        this.updateState = (data) => {
            if (this._mounted) {
                this.setState(data);
            }
        }
        this.getStrategy = () => {
            axios(Utils.getBaseUrl() + '/strategy/' + _.get(props, 'match.params.strategyId', null), {
                cancelToken: new axios.CancelToken((c) => {
                    // An executor function receives a cancel function as a parameter
                    this.cancelGetStrategy = c;
                }),
                'headers': Utils.getAuthTokenHeader()
            })
            .then((response) => {
                this.updateState({ 'strategy': response.data });
                // console.log(response.data);
                this.getBackTest();
                this.cancelGetStrategy = undefined;
            })
            .catch((error) => {
                Utils.checkForInternet(error, this.props.history);
                if (error.response) {
                    Utils.checkForInternet(error, this.props.history);
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
        this.getBackTest = () => {
            axios(Utils.getBaseUrl() + '/backtest/' + _.get(props, 'match.params.backtestId', null), {
                cancelToken: new axios.CancelToken((c) => {
                    // An executor function receives a cancel function as a parameter
                    this.cancelGetBacktest = c;
                }),
                'headers': Utils.getAuthTokenHeader()
            })
            .then((response) => {
                this.updateBacktestDataFromGetCall(response.data);
                // console.log(response.data);
                this.cancelGetBacktest = undefined;
                this.getLogs();
            })
            .catch((error) => {
                Utils.checkForInternet(error, this.props.history);
                if (error.response) {
                    if (error.response.status === 400 || error.response.status === 403) {
                        this.props.history.push('/forbiddenAccess');
                    }
                    Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                }
                this.cancelGetBacktest = undefined;
            })
            .finally(() => {
                this.updateState({
                    'loading': false
                });
            })
        }
        this.getLogs = () => {
            this.updateState({
                logsLoading: true
            });
            axios(Utils.getBaseUrl() + '/backtest/' + props.match.params.backtestId + '?select=logs', {
                cancelToken: new axios.CancelToken((c) => {
                    // An executor function receives a cancel function as a parameter
                    this.cancelGetLogs = c;
                }),
                'headers': Utils.getAuthTokenHeader()
            })
            .then((response) => {
                if (response.data && response.data.output && response.data.output.logs &&
                    response.data.output.logs != null) {
                    this.updateState({ 'logs': response.data.output.logs });
                }
                // console.log(response.data);
                this.cancelGetLogs = undefined;
                this.getTransactionHistory();
            })
            .catch((error) => {
                Utils.checkForInternet(error, this.props.history);
                if (error.response) {
                    if (error.response.status === 400 || error.response.status === 403) {
                        this.props.history.push('/forbiddenAccess');
                    }
                    Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                }
                this.cancelGetLogs = undefined;
            })
            .finally(() => {
                this.updateState({
                    loading: false,
                    logsLoading: false
                });
            })
        }
        this.getTransactionHistory = () => {
            this.setState({transactionLoading: true});
            axios(Utils.getBaseUrl() + '/backtest/' + props.match.params.backtestId + '?select=transactionHistory', {
                cancelToken: new axios.CancelToken((c) => {
                    // An executor function receives a cancel function as a parameter
                    this.cancelGetTransactionHistory = c;
                }),
                'headers': Utils.getAuthTokenHeader()
            })
            .then((response) => {
                if (response.data && response.data.output && response.data.output.transactionHistory &&
                    response.data.output.transactionHistory != null) {
                    const transactionHistoryData = {};
                    const transactionParentData = {};
                    for (let i = 0; i < response.data.output.transactionHistory.length; i++) {
                        const dtL1 = response.data.output.transactionHistory[i];
                        if (dtL1.values) {
                            for (let j = 0; j < dtL1.values.length; j++) {
                                if (dtL1.values[j].transactions) {
                                    const dtL2 = dtL1.values[j].transactions;
                                    for (let k = 0; k < dtL2.length; k++) {
                                        const dtL3 = dtL2[k];
                                        let finalPushObj = {
                                            'datetime': moment(dtL3.datetime).valueOf(),
                                            'date': '-',
                                            'symbol': '-',
                                            'direction': 'BUY',
                                            'quantity': dtL3.fillquantity,
                                            'price': Utils.formatMoneyValueMaxTwoDecimals(dtL3.fillprice.toFixed(2)),
                                            'orderfee': Utils.formatMoneyValueMaxTwoDecimals(dtL3.orderfee.toFixed(2)),
                                            'key': i + '_' + j + '_' + k
                                        };
                                        try {
                                            if (parseInt(dtL3.fillquantity, 10) < 0) {
                                                finalPushObj['direction'] = 'SELL';
                                            }
                                        } catch (err) { }
                                        try {
                                            if (dtL3.securitysymbol) {
                                                finalPushObj['symbol'] = dtL3.securitysymbol.ticker;
                                            }
                                        } catch (err) { }
                                        try {
                                            if (dtL3.datetime) {
                                                finalPushObj['date'] = moment(dtL3.datetime).format('DD MMM YYYY');
                                            }
                                        } catch (err) { }

                                        if (transactionHistoryData[finalPushObj['date']]) {
                                            transactionHistoryData[finalPushObj['date']].push(finalPushObj);
                                        } else {
                                            transactionHistoryData[finalPushObj['date']] = [finalPushObj];
                                        }

                                        let dataObj = {

                                        };
                                        if (transactionParentData[finalPushObj.date]) {
                                            dataObj = transactionParentData[finalPushObj.date];
                                        } else {
                                            dataObj = {
                                                'datetime': moment(finalPushObj['datetime']).valueOf(),
                                                'date': finalPushObj['date'],
                                                'posTrades': 0,
                                                'negTrades': 0,
                                                'posDollarValue': 0,
                                                'negDollarValue': 0
                                            }
                                        }
                                        if (finalPushObj.quantity < 0) {
                                            dataObj.negTrades = dataObj.negTrades + 1;
                                            dataObj.negDollarValue = dataObj.negDollarValue + (Number(finalPushObj['quantity']) * Number(dtL3.fillprice));
                                        } else {
                                            dataObj.posDollarValue = dataObj.posDollarValue + (Number(finalPushObj['quantity']) * Number(dtL3.fillprice));
                                            dataObj.posTrades = dataObj.posTrades + 1;
                                        }
                                        transactionParentData[finalPushObj.date] = dataObj;
                                    }
                                }
                            }
                        }
                    }
                    const finalTransactionParentData = [];
                    for (let key in transactionParentData) {
                        const abcLocal = transactionParentData[key];
                        abcLocal['negDollarValue'] = Utils.formatMoneyValueMaxTwoDecimals(abcLocal['negDollarValue']);
                        abcLocal['posDollarValue'] = Utils.formatMoneyValueMaxTwoDecimals(abcLocal['posDollarValue']);
                        finalTransactionParentData.push(abcLocal);
                    }
                    finalTransactionParentData.sort((a, b) => {
                        return b.datetime - a.datetime;
                    });
                    this.updateState({
                        'transactionHistory': transactionHistoryData,
                        'transactionHistoryParentData': finalTransactionParentData
                    });
                }
                // console.log(response.data);
                this.cancelGetTransactionHistory = undefined;
                this.getPortfolioHistory();
            })
            .catch((error) => {
                Utils.checkForInternet(error, this.props.history);
                if (error.response) {
                    if (error.response.status === 400 || error.response.status === 403) {
                        this.props.history.push('/forbiddenAccess');
                    }
                    Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                }
                this.cancelGetTransactionHistory = undefined;
            })
            .finally(() => {
                this.updateState({
                    loading: false,
                    transactionLoading: false
                });
            })
        }
        this.getPortfolioHistory = () => {
            this.updateState({portfolioHistoryLoading: true});
            axios(Utils.getBaseUrl() + '/backtest/' + props.match.params.backtestId + '?select=portfolioHistory', {
                cancelToken: new axios.CancelToken((c) => {
                    // An executor function receives a cancel function as a parameter
                    this.cancelGetPortfolioHistory = c;
                }),
                'headers': Utils.getAuthTokenHeader()
            })
            .then((response) => {
                if (response.data && response.data.output && response.data.output.portfolioHistory &&
                    response.data.output.portfolioHistory != null) {
                    let finalPortfolioHistory = {};
                    const portfolioParentData = {};
                    for (let i = 0; i < response.data.output.portfolioHistory.length; i++) {
                        const dtL1 = response.data.output.portfolioHistory[i];
                        if (dtL1.values) {
                            for (let j = 0; j < dtL1.values.length; j++) {
                                const dtL2 = dtL1.values[j].portfolio;
                                if (dtL2 && dtL2.portfolio && dtL2.portfolio.positions) {
                                    for (let key in dtL2.portfolio.positions) {
                                        const dtL3 = dtL2.portfolio.positions[key];
                                        const dtPush = {
                                            'date': '',
                                            'datetime': moment(dtL1.values[j].date).valueOf(),
                                            'symbol': dtL3.securitysymbol.ticker,
                                            'avgPrice': Utils.formatMoneyValueMaxTwoDecimals(dtL3.averageprice.toFixed(2)),
                                            'quantity': dtL3.quantity,
                                            'lastPrice': Utils.formatMoneyValueMaxTwoDecimals(dtL3.lastprice.toFixed(2)),
                                            'marketValue': Utils.formatMoneyValueMaxTwoDecimals((dtL3.quantity * dtL3.lastprice).toFixed(2)),
                                            'unrealizedPnL': Utils.formatMoneyValueMaxTwoDecimals((dtL3.quantity * (dtL3.lastprice - dtL3.averageprice)).toFixed(2)),
                                            'key': i + '_' + j + '_' + dtL3.securitysymbol.ticker
                                        }
                                        try {
                                            dtPush.date = moment(dtL1.values[j].date).format('DD MMM YYYY');
                                        } catch (err) { }
                                        if (!finalPortfolioHistory[dtPush.date]) {
                                            finalPortfolioHistory[dtPush.date] = [dtPush];
                                        } else {
                                            finalPortfolioHistory[dtPush.date].push(dtPush);
                                        }

                                        let dataObj = {

                                        };
                                        if (portfolioParentData[dtPush.date]) {
                                            dataObj = portfolioParentData[dtPush.date];
                                        } else {
                                            dataObj = {
                                                'datetime': moment(dtPush['datetime']).valueOf(),
                                                'date': dtPush['date'],
                                                'noOfPositions': 0,
                                                'totalMarketValue': 0,
                                                'totalUnrealisedPnL': 0
                                            }
                                        }
                                        dataObj.noOfPositions = dataObj.noOfPositions + 1;
                                        dataObj.totalMarketValue = dataObj.totalMarketValue + (dtL3.quantity * dtL3.lastprice);
                                        dataObj.totalUnrealisedPnL = dataObj.totalUnrealisedPnL + (dtL3.quantity * (dtL3.lastprice - dtL3.averageprice));
                                        portfolioParentData[dtPush.date] = dataObj;
                                    }
                                }
                            }
                        }
                    }
                    let latestPortfolioParent = [];
                    const finalPortfolioParentData = [];
                    for (let key in portfolioParentData) {
                        const abcLocal = portfolioParentData[key];
                        abcLocal['totalMarketValue'] = Utils.formatMoneyValueMaxTwoDecimals(abcLocal['totalMarketValue']);
                        abcLocal['totalUnrealisedPnL'] = Utils.formatMoneyValueMaxTwoDecimals(abcLocal['totalUnrealisedPnL']);
                        finalPortfolioParentData.push(abcLocal);
                    }
                    finalPortfolioParentData.sort((a, b) => {
                        return b.datetime - a.datetime;
                    });
                    if (finalPortfolioParentData.length > 0) {
                        latestPortfolioParent.push(finalPortfolioParentData[0]);
                    }
                    this.updateState({
                        'portfolioHistory': finalPortfolioHistory,
                        'latestPortfolio': latestPortfolioParent,
                        'portfolioParentData': finalPortfolioParentData,
                    });
                } else {
                    this.updateState({ 'loading': false });
                }
                // console.log(response.data);
                this.cancelGetPortfolioHistory = undefined;
            })
            .catch((error) => {
                Utils.checkForInternet(error, this.props.history);
                if (error.response) {
                    if (error.response.status === 400 || error.response.status === 403) {
                        this.props.history.push('/forbiddenAccess');
                    }
                    Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                }
                this.cancelGetPortfolioHistory = undefined;
            })
            .finally(() => {
                this.updateState({
                    loading: false,
                    portfolioHistoryLoading: false
                });
            });
        }

        this.onCustomHighChartCreated = (chart) => {
            this.runningBackTestChart = chart;
        }

        this.handleModeChange = (event) => {
            this.updateState({ 'portfolioMode': event.target.value });
        }

        this.updateBacktestDataFromGetCall = (data) => {
            if (data.status && data.status.trim().toLowerCase() === 'active') {
                this.updateState({
                    'backTestData': data,
                    'isBacktestRunning': true
                });
                this.setupWebSocketConnections(data._id);
            } else {
                this.updateState({ 'backTestData': data });
            }
        }

    }

    setupWebSocketConnections(backtestId) {
        Utils.openSocketConnection();
        Utils.webSocket.onopen = () => {
            this.handleSocketToGetLiveData(backtestId);
        }
        Utils.webSocket.onclose = () => {
            Utils.webSocket = undefined;
            // if (this.numberOfTimeSocketConnectionCalled < 5) {
            setTimeout(() => {
                this.numberOfTimeSocketConnectionCalled++;
                Utils.openSocketConnection();
            }, Math.min(this.socketOpenConnectionTimeout * this.numberOfTimeSocketConnectionCalled, 5000));
            // }
        }
        Utils.webSocket.onerror = (data) => {
            this.checkAndGoToBacktestPageIfNoData(backtestId);
        }
        Utils.webSocket.onmessage = (msg) => {
            this.atleastOneMessageReceived = true;
            if (msg.data) {
                const data = JSON.parse(msg.data);

                //Temporary Fix: Route to detail if "Exception" happens before any WS message
                if (data.status == "exception" || data.status == "completion") {
                    const backtestRedirectUrl = `/research/backtests/${this.state.strategy._id}/${backtestId}`;
                    this.props.history.push(backtestRedirectUrl)
                }

                if (data.data) {
                    for (let i = 0; i < data.data.length; i++) {
                        let dataLocal = data.data[i];
                        try {
                            dataLocal = JSON.parse(data.data[i]);
                        } catch (e) { }
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
                                setTimeout(() => {
                                    this.recursiveUpdateGraphData();
                                }, 100);
                            }
                        } else if (dataLocal.outputtype === 'log') {
                            if (dataLocal.message === 'Ending Backtest') {
                                this.gotBacktestCompleteLog = true;
                                this.updateBackTestComplete();
                            }
                        }
                    }
                }
            }
        }
    }

    handleSocketToGetLiveData(backtestId) {
        if (backtestId) {
            this.subscribeToBacktestUpdates(backtestId);
            if (this.timeOutcheck) {
                clearTimeout(this.timeOutcheck);
                this.timeOutcheck = undefined;
            }
            // this.timeOutcheck = setTimeout(() => {
            //   this.checkAndGoToBacktestPageIfNoData(backtestId);
            // }, this.maxWaitTimeForMessages);
        }
    }

    checkAndGoToBacktestPageIfNoData(backtestId) {
        if (!this.atleastOneMessageReceived && this._mounted) {
            this.props.history.push('/research/backtests/' + this.state.strategy._id +
                '/' + backtestId + '?type=backtest&strategyName=' + this.state.strategy.name + '&backtestName=' + this.state.backTestName);
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
            this.runningBackTestChart.redraw(true);
        }
    }

    recursiveUpdateGraphData() {
        if (this.runningBackTestChart) {
            if (this.graphData.length > 0) {
                this.graphsDataUpdatedTillNow = this.graphsDataUpdatedTillNow + 40;
                const arry = this.graphData.splice(0, 40);
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
                    let backTestData = JSON.parse(JSON.stringify(this.state.backTestData));
                    if (!backTestData) {
                        backTestData = {};
                    }
                    if (!backTestData.output) {
                        backTestData.output = {};
                    }
                    backTestData.output.summary = lastDataPoint;
                    this.updateState({ 'backTestData': backTestData });
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
        }
        if (this.graphData.length > 0 || !this.gotBacktestCompleteLog) {
            setTimeout(() => {
                this.recursiveUpdateGraphData();
            }, 100);
        } else {
            this.updateBackTestComplete();
        }
    }

    updateBackTestComplete(hardUpdate) {
        if (hardUpdate ||
            (this.graphData.length === 0 && this.gotBacktestCompleteLog)) {
            if (Utils.webSocket) {
                Utils.webSocket.close();
                Utils.webSocket = undefined;
            }
            this.props.history.push('/research/backtests/' + this.state.strategy._id +
                '/' + this.state.backTestData._id + '?type=backtest&strategyName=' + this.state.strategy.name + '&backtestName=' + this.state.backTestName);
        }
    }

    componentDidMount() {
        this._mounted = true;
        if (!Utils.isLoggedIn()) {
            Utils.goToLoginPage(this.props.history, window.location.href);
        } else {
            if (this.props.pageChange) {
                this.props.pageChange('research');
            }
            if (this._mounted) {
                this.getStrategy();
            }
        }
    }

    componentWillUnmount() {
        this._mounted = false;
        if (this.cancelGetStrategy) {
            this.cancelGetStrategy();
        }
        if (this.cancelGetBacktest) {
            this.cancelGetBacktest();
        }
        if (this.cancelGetLogs) {
            this.cancelGetLogs();
        }
        if (this.cancelGetPortfolioHistory) {
            this.cancelGetPortfolioHistory();
        }
        if (this.cancelGetTransactionHistory) {
            this.cancelGetTransactionHistory();
        }
        if (this.timeOutcheck) {
            clearTimeout(this.timeOutcheck);
            this.timeOutcheck = undefined;
        }
    }

    render() {

        const antIconLoading = <Icon type="loading" style={{ fontSize: 34 }} spin />;
        const TabPane = Tabs.TabPane;


        const getLogsTabPane = () => {
            const logs = [];
            const logsJsonArr = [];
            const values = _.get(this.state, 'logs.values', null);
            if (values !== null) {
                for (let key in values) {
                    const logValue = values[key];
                    for (let key1 in logValue) {
                        const arrOfLOgs = logValue[key1];
                        for (let i = 0; i < arrOfLOgs.length; i++) {
                            try {
                                const logJson = JSON.parse(arrOfLOgs[i]);
                                logsJsonArr.push({
                                    'dt': logJson.dt,
                                    'messagetype': logJson.messagetype,
                                    'message': logJson.message
                                })
                            } catch (err) {

                            }
                        }
                    }
                }
            }
            logsJsonArr.sort((a, b) => {
                return a.dt.localeCompare(b.dt);
            });
            for (let i = 0; i < logsJsonArr.length; i++) {
                logs.push(
                    <div key={'logs_' + i}
                        style={{ 'marginTop': '7px' }}>
                        <span className={"log-type " + logsJsonArr[i].messagetype}>
                            [{logsJsonArr[i].messagetype}]&nbsp;
            </span>
                        <span className="log-date-time">
                            [{logsJsonArr[i].dt}]&nbsp;
            </span>
                        <span className="log-message">
                            {logsJsonArr[i].message}
                        </span>
                    </div>
                );
            }
            return (
                <TabPane tab="Logs" key="logs" className="backtest-logs" style={{
                    'maxHeight': '550px',
                    'overflowY': 'auto', 'background': '#323232', 'padding': '10px', 'minHeight': '400px'
                }}>
                    <Loading
                        show={this.state.logsLoading}
                        color="teal"
                        showSpinner={false}
                    />
                    {logs}
                </TabPane>
            );
        }

        const getTransactionDataForDate = (dateString) => {
            let dataToReturn = [];
            if (this.state.transactionHistory && this.state.transactionHistory[dateString]) {
                dataToReturn = this.state.transactionHistory[dateString];
            }
            dataToReturn.sort((a, b) => {
                return a.datetime - (b.datetime);
            });
            return dataToReturn;
        }

        const getTransactionDataCountForDate = (dateString) => {
            if (this.state.transactionHistory && this.state.transactionHistory[dateString]) {
                return this.state.transactionHistory[dateString].length;
            } else {
                return 0;
            }
        }

        const getTransactionHistoryTabPane = () => {
            return (
                <TabPane tab="Transaction" key="transactionHistory" style={{
                    'maxHeight': '550px',
                    'overflowY': 'auto', 'padding': '10px'
                }}>
                    <Loading
                        show={this.state.transactionLoading}
                        color="teal"
                        showSpinner={false}
                    />
                    <ReactTable ref="transactionTable" columns={this.transactionColumns}
                        data={this.state.transactionHistoryParentData}
                        minRows={4}
                        filterable
                        showPagination={false}
                        defaultPageSize={_.get(this.state, 'transactionHistoryParentData', []).length}
                        className="backtestdetail-table"
                        SubComponent={row => {
                            return (
                                <div style={{ 'padding': '20px' }}>
                                    <ReactTable ref="transactionSubTable" columns={this.subTransactionColumns}
                                        data={getTransactionDataForDate(row.original.date)}
                                        minRows={4}
                                        showPagination={false}
                                        defaultPageSize={getTransactionDataCountForDate(row.original.date)}
                                        className="backtestdetail-table"
                                        headerStyle={{ 'textAlign': 'left' }} />
                                </div>
                            );
                        }}
                        headerStyle={{ 'textAlign': 'left' }} />
                </TabPane>
            );
        }

        const getPortfolioDataFromDate = (dateString) => {
            let dataToReturn = [];
            if (this.state.portfolioHistory && this.state.portfolioHistory[dateString]) {
                dataToReturn = this.state.portfolioHistory[dateString];
            }
            return dataToReturn;
        }

        const getPortfolioDataCountFromDate = (dateString) => {
            let dataToReturn = [];
            if (this.state.portfolioHistory && this.state.portfolioHistory[dateString]) {
                dataToReturn = this.state.portfolioHistory[dateString];
            }
            return dataToReturn.length;
        }

        const getPortfolioHistoryTable = () => {
            if (this.state.portfolioHistory) {
                if (this.state.portfolioMode === 'LatestPortfolio' && this.state.latestPortfolio) {
                    return (
                        <ReactTable key={'LatestPortfolio'} columns={this.portfolioColumns}
                            minRows={4}
                            showPagination={false}
                            defaultPageSize={this.state.latestPortfolio.length}
                            data={this.state.latestPortfolio}
                            defaultExpanded={{ 0: true }}
                            SubComponent={row => {
                                return (
                                    <div style={{ 'padding': '20px' }}>
                                        <ReactTable ref="portfolioHistorySubTable" columns={this.subPortfolioColumns}
                                            data={getPortfolioDataFromDate(row.original.date)}
                                            minRows={4}
                                            showPagination={false}
                                            defaultPageSize={getPortfolioDataCountFromDate(row.original.date)}
                                            className="backtestdetail-table"
                                            headerStyle={{ 'textAlign': 'left' }} />
                                    </div>
                                );
                            }}
                            className="backtestdetail-table"
                            headerStyle={{ 'textAlign': 'left' }} />
                    );
                } else if (this.state.portfolioMode === 'PortfolioHistory' && this.state.portfolioParentData) {
                    return (
                        <ReactTable key={'PortfolioHistory'} columns={this.portfolioColumns}
                            minRows={4}
                            filterable
                            showPagination={false}
                            defaultPageSize={this.state.portfolioParentData.length}
                            data={this.state.portfolioParentData}
                            SubComponent={row => {
                                return (
                                    <div style={{ 'padding': '20px' }}>
                                        <ReactTable ref="portfolioHistorySubTable" columns={this.subPortfolioColumns}
                                            data={getPortfolioDataFromDate(row.original.date)}
                                            minRows={4}
                                            showPagination={false}
                                            defaultPageSize={getPortfolioDataCountFromDate(row.original.date)}
                                            className="backtestdetail-table"
                                            headerStyle={{ 'textAlign': 'left' }} />
                                    </div>
                                );
                            }}
                            className="backtestdetail-table"
                            headerStyle={{ 'textAlign': 'left' }} />
                    );
                }
            }
        }

        const getPortfolioHistoryTabPane = () => {
            return (
                <TabPane tab="Portfolio" key="portfolioHistory" style={{
                    'maxHeight': '550px',
                    'overflowY': 'auto', 'padding': '0px 10px'
                }}>
                    <Loading
                        show={this.state.portfolioHistoryLoading}
                        color="teal"
                        showSpinner={false}
                    />
                    <div style={{
                        'display': 'flex', 'justifyContent': 'center',
                        'margin': '10px'
                    }}>
                        <Radio.Group onChange={this.handleModeChange} defaultValue={'LatestPortfolio'}>
                            <Radio.Button value="LatestPortfolio">Latest Portfolio</Radio.Button>
                            <Radio.Button value="PortfolioHistory">Portfolio History</Radio.Button>
                        </Radio.Group>
                    </div>
                    {getPortfolioHistoryTable()}
                </TabPane>
            );
        }


        const getSettingsTabPane = () => {
            let advancedSummary = {
                'slippage': {}
            };
            try {
                advancedSummary = JSON.parse(this.state.backTestData.settings.advanced);
            } catch (err) { }
            return (
                <TabPane tab="Settings" key="settings" style={{
                    'maxHeight': '550px',
                    'overflowY': 'auto'
                }}>
                    <div style={{ 'padding': '20px', 'display': 'flex' }}>
                        <div style={{ 'border': '1px solid #e1e1e1', 'padding': '10px', 'minWidth': '450px' }}>
                            <h2 style={{ 'fontWeight': '700', 'fontSize': '18px' }}>Settings</h2>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Initial Cash:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {(this.state.backTestData.settings) ? this.state.backTestData.settings.initialCash : '-'}
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Start Date:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        <Moment format="DD MMM YYYY">
                                            {(this.state.backTestData.settings) ? this.state.backTestData.settings.startDate : undefined}
                                        </Moment>
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    End Date:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        <Moment format="DD MMM YYYY">
                                            {(this.state.backTestData.settings) ? this.state.backTestData.settings.endDate : undefined}
                                        </Moment>
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Benchmark:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {(this.state.backTestData.settings) ? this.state.backTestData.settings.benchmark : '-'}
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Universe:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {(this.state.backTestData.settings) ? this.state.backTestData.settings.universeIndex : '-'}
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Slippage:
                  </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                                        {(advancedSummary.slippage) ? advancedSummary.slippage.value : '-'}
                                    </p>
                                    <p className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                                        {(advancedSummary.slippage) ? advancedSummary.slippage.model : '-'}
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Comission:
                  </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                                        {(advancedSummary.commission) ? advancedSummary.commission.value : '-'}
                                    </p>
                                    <p className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                                        {(advancedSummary.commission) ? advancedSummary.commission.model : '-'}
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Cancel Policy:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {advancedSummary.cancelPolicy}
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Execution Policy:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {advancedSummary.executionPolicy}
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Rebalance:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {advancedSummary.rebalance}
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Investment Plan:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {advancedSummary.investmentPlan}
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Resolution:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {advancedSummary.resolution}
                                    </p>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </TabPane>
            );
        }

        const getChartAccordingly = () => {
            if (this.state.backTestData && this.state.backTestData.status &&
                this.state.backTestData.status.toLowerCase().trim() === 'active') {
                return (
                    <RunningBacktestChart
                        output={this.state.backTestData.output}
                        onGraphCreated={this.onCustomHighChartCreated}
                        uniqueKey={this.state.backTestData._id + '__' + Math.floor((Math.random() * 100) + 1)} />
                );
            } else {
                return (
                    <CustomHighCharts
                        output={this.state.backTestData.output}
                        uniqueKey={this.state.backTestData._id + '__' + Math.floor((Math.random() * 100) + 1)} />
                );
            }
        }

        const getBackTestTabs = () => {
            if (!this.state.loading) {
                const tabs = [];

                tabs.push(<TabPane tab="Performance" key="performance" style={{
                    'maxHeight': '550px',
                    'overflowY': 'auto'
                }}>
                    {getChartAccordingly()}
                </TabPane>);
                tabs.push(<TabPane tab="Code" key="code" style={{
                    'maxHeight': '550px',
                    'overflowY': 'auto'
                }}>
                    <AceEditor
                        mode="julia"
                        theme="xcode"
                        name="UNIQUE_ID_OF_DIV"
                        readOnly={true}
                        value={this.state.backTestData.code}
                        width="100%"
                        editorProps={{ $blockScrolling: "Infinity" }}
                    />
                </TabPane>);
                tabs.push(getSettingsTabPane());
                // if (this.state.logs){
                tabs.push(getLogsTabPane());
                // }
                // if (this.state.transactionHistory){
                tabs.push(getTransactionHistoryTabPane());
                // }
                // if (this.state.portfolioHistory){
                tabs.push(getPortfolioHistoryTabPane());
                // }
                return (
                    <div style={{ 'border': '1px solid #e1e1e1', 'marginTop': '15px' }}>
                        <Tabs animated={false}>
                            {tabs}
                        </Tabs>
                    </div>
                );
            }
        }

        const getBackTestDiv = () => {
            if (this.state.loading) {
                return (
                    <div style={{
                        'display': 'flex',
                        'alignItems': 'center', 'justifyContent': 'center',
                        'minHeight': '300px'
                    }}>
                        <Spin indicator={antIconLoading} />
                    </div>
                );
            } else {
                return (
                    <div>
                        <Row>
                            <Col span={8}>
                                <h2>{this.state.backTestName}</h2>
                            </Col>
                            <Col span={8} style={{
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
                                    <h2 style={{
                                        'color': 'teal', 'margin': '0px', 'fontSize': '16px', 'fontWeight': '700',
                                        'display': (this.state.isBackTestRunComplete ? 'inherit' : 'none')
                                    }}>
                                        Complete
                  </h2>
                                </div>
                            </Col>
                            {
                                (!this.state.isBacktestRunning) ? (
                                    <Col span={8}>
                                        <div style={{ 'display': 'flex', 'justifyContent': 'flex-end' }}>
                                            <Link to={'/community/newPost?attachedBacktestId=' + this.props.match.params.backtestId}>
                                                <Button type="primary" style={{ 'justifySelf': 'flex-end' }}>
                                                    SHARE BACKTEST
                        </Button>
                                            </Link>
                                        </div>
                                    </Col>
                                ) : null
                            }
                        </Row>
                        <Row style={{ 'marginTop': '10px' }}>
                            <Col sm={12} md={6}>
                                <h2 style={{
                                    'fontWeight': '400', 'fontSize': '14px',
                                    'margin': '0px'
                                }}>
                                    <span style={{
                                        'fontWeight': '300', 'fontSize': '12px',
                                        'margin': '0px'
                                    }}>
                                        Strategy Name:&nbsp;
                  </span>
                                    {this.state.backTestData.strategy_name}
                                </h2>
                            </Col>
                            <Col sm={12} md={6}>
                                <h2 style={{
                                    'fontWeight': '400', 'fontSize': '14px',
                                    'margin': '0px'
                                }}>
                                    <span style={{
                                        'fontWeight': '300', 'fontSize': '12px',
                                        'margin': '0px'
                                    }}>
                                        CreatedAt:&nbsp;
                  </span>
                                    <Moment format="DD/MM/YYYY hh:mm A">{this.state.backTestData.createdAt}</Moment>
                                </h2>
                            </Col>
                            <Col sm={12} md={6}>
                                <h2 style={{
                                    'fontWeight': '400', 'fontSize': '14px',
                                    'margin': '0px'
                                }}>
                                    <span style={{
                                        'fontWeight': '300', 'fontSize': '12px',
                                        'margin': '0px'
                                    }}>
                                        Date Range:&nbsp;
                  </span>
                                    <Moment format="DD/MM/YYYY">
                                        {(this.state.backTestData.settings) ? this.state.backTestData.settings.startDate : undefined}
                                    </Moment> -&nbsp;
                  <Moment format="DD/MM/YYYY">
                                        {(this.state.backTestData.settings) ? this.state.backTestData.settings.endDate : undefined}
                                    </Moment>
                                </h2>
                            </Col>
                            <Col sm={12} md={6}>
                                <h2 style={{
                                    'fontWeight': '400', 'fontSize': '14px',
                                    'margin': '0px'
                                }}>
                                    <span style={{
                                        'fontWeight': '300', 'fontSize': '12px',
                                        'margin': '0px'
                                    }}>
                                        Status:&nbsp;
                  </span>
                                    {Utils.firstLetterUppercase(this.state.backTestData.status)}
                                </h2>
                            </Col>
                        </Row>
                        <div style={{
                            'width': '100%', 'height': '1px', 'margin': '10px 0px 10px 0px',
                            'background': '#e1e1e1'
                        }}>
                        </div>
                        <h3 stye={{ 'fontSize': '16px' }}>
                            Backtest Metrics
                        </h3>
                        <Row style={{ 'marginTop': '10px' }}>
                            <Col sm={6} md={3} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 id="total_return" style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {(this.state.backTestData.output && this.state.backTestData.output.summary &&
                                            this.state.backTestData.output.summary.totalreturn) ?
                                            this.state.backTestData.output.summary.totalreturn + ' %' : '-'}
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Total Return
                  </p>
                                </div>
                            </Col>
                            <Col sm={6} md={3} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 id="annual_return" style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {(this.state.backTestData.output && this.state.backTestData.output.summary &&
                                            this.state.backTestData.output.summary.annualreturn) ?
                                            this.state.backTestData.output.summary.annualreturn + ' %' : '-'}
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Annual Return
                  </p>
                                </div>
                            </Col>
                            <Col sm={6} md={3} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 id="volatility" style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {(this.state.backTestData.output && this.state.backTestData.output.summary
                                            && this.state.backTestData.output.summary.annualstandarddeviation) ?
                                            this.state.backTestData.output.summary.annualstandarddeviation + ' %' : '-'}
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Volatility
                  </p>
                                </div>
                            </Col>
                            <Col sm={6} md={3} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 id="sharpe_ratio" style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {(this.state.backTestData.output && this.state.backTestData.output.summary
                                            && this.state.backTestData.output.summary.sharperatio) ?
                                            this.state.backTestData.output.summary.sharperatio : '-'}
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Sharpe Ratio
                  </p>
                                </div>
                            </Col>
                            <Col sm={6} md={3} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 id="information_ratio" style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {(this.state.backTestData.output && this.state.backTestData.output.summary
                                            && this.state.backTestData.output.summary.informationratio) ?
                                            this.state.backTestData.output.summary.informationratio : '-'}
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Information Ratio
                  </p>
                                </div>
                            </Col>
                            <Col sm={6} md={3} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 id="sortino_ratio" style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            _.get(this.state, 'backTestData.output.summary.sortinoratio', '-')
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Sortino Ratio
                                    </p>
                                </div>
                            </Col>
                            <Col sm={6} md={3} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 id="avg_drawdown" style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            _.get(this.state, 'backTestData.output.summary.avgdrawdown', '-')
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Avg. Drawdown
                                    </p>
                                </div>
                            </Col>
                            <Col sm={6} md={3} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 id="max_drawdown" style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {(this.state.backTestData.output && this.state.backTestData.output.summary
                                            && this.state.backTestData.output.summary.maxdrawdown) ?
                                            this.state.backTestData.output.summary.maxdrawdown : '-'}
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Max Drawdown
                                    </p>
                                </div>
                            </Col>
                        </Row>
                        {getBackTestTabs()}
                    </div>
                );
            }
        }

        const getBreadCrumbBacktestDetail = () => {
            if (!this.state.loading) {
                return (
                    <Breadcrumb separator=">" className="location-breadcrumb">
                        <Breadcrumb.Item>Research</Breadcrumb.Item>
                        <Breadcrumb.Item><Link to="/research">All Strategies</Link></Breadcrumb.Item>
                        <Breadcrumb.Item><Link to={"/research/strategy/" + this.state.strategy._id}>{this.state.strategy.name}</Link></Breadcrumb.Item>
                        <Breadcrumb.Item><Link to={"/research/backtests/" + this.state.strategy._id}>All Backtests</Link></Breadcrumb.Item>
                        <Breadcrumb.Item className="last">{this.state.backTestName}</Breadcrumb.Item>
                    </Breadcrumb>
                );
            }
        }

        const getTotalDiv = () => {
            if (!this.state.loading) {
                return (
                    <div style={{ 'padding': '1% 3% 1% 3%', 'width': '100%', 'minHeight': 'calc(100vh - 70px)' }}>
                        <div style={{ 'display': 'flex', 'marginBottom': '10px' }}>
                            <div>
                                <h2 style={{ 'color': '#3c3c3c', 'fontWeight': 'normal', 'margin': '0px' }}>Backtest Detail</h2>
                                {getBreadCrumbBacktestDetail()}
                            </div>
                        </div>
                        <div className="card" style={{
                            'width': '100%', 'background': 'white',
                            'padding': '10px'
                        }}>
                            {getBackTestDiv()}
                        </div>
                    </div>
                );
            }
        }

        return (
            <React.Fragment>
                <div className="main-loader">
                    <Loading
                        show={this.state.loading}
                        color="teal"
                        showSpinner={false}
                    />
                </div>
                {getTotalDiv()}
                {
                    !this.state.loading &&
                    <Footer />
                }
            </React.Fragment>
        );
    }
}

export default withRouter(BacktestDetail);
