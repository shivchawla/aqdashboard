import React, { Component } from 'react';
import axios from 'axios';
import _ from 'lodash';
import Utils from './../../Utils';
import ReactTable from "react-table";
import Loading from 'react-loading-bar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {withRouter} from 'react-router-dom';
import Moment from 'react-moment';
import moment from 'moment';
import AceEditor from 'react-ace';
import 'brace/mode/julia';
import 'brace/theme/xcode';
import CustomHighCharts from './../../CustomHighCharts/CustomHighCharts.jsx';
import RunningBacktestChart from './../../CustomHighCharts/RunningBacktestChart.jsx';
import AqDesktopLayout from '../../components/Layout/AqDesktopLayout';
import RadioGroup from '../../components/Selections/RadioGroup';
import CardCustomRadio from '../../components/Selections/CardCustomRadio';
import "react-table/react-table.css";
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
    progressCounter = 0;

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
            backtestProgress: 0,
            progressCounter: 0,
            defaultSelectedPortfolio: 0,
            selectedTab: 0
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

        this.handleModeChange = value => {
            const portfolioValues = ['LatestPortfolio', 'PortfolioHistory'];
            this.updateState({ portfolioMode: portfolioValues[value] });
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

    setupWebSocketConnections = (backtestId) => {
        Utils.openSocketConnection();
        Utils.webSocket.onopen = () => {
            this.handleSocketToGetLiveData(backtestId);
        }
        Utils.webSocket.onclose = () => {
            setTimeout(() => {
                this.numberOfTimeSocketConnectionCalled++;
                Utils.openSocketConnection();
            }, Math.min(this.socketOpenConnectionTimeout * this.numberOfTimeSocketConnectionCalled, 5000));
        }
        Utils.webSocket.onerror = (data) => {
            this.checkAndGoToBacktestPageIfNoData(backtestId);
        }
        Utils.webSocket.onmessage = (msg) => {
            this.atleastOneMessageReceived = true;
            if (msg.data) {
                const data = JSON.parse(msg.data);
                //Temporary Fix: Route to detail if "Exception" happens before any WS message
                console.log(data);
                if (data.status == "exception" || data.status === "complete") {
                    const backtestRedirectUrl = `/research/backtests/${this.state.strategy._id}/${backtestId}`;
                    this.props.history.push(backtestRedirectUrl);
                }

                if (data.data) {
                    this.progressCounter += data.data.filter(item => {
                        item = JSON.parse(item);
                        const outputType = _.get(item, 'outputtype', null);
                        return outputType === 'performance';
                    }).length;
                    console.log('Progress Counter ', this.pro);
                    this.updateState({ 'backtestProgress': Math.round((this.progressCounter /  this.totalDataLength) * 100)});
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

    addNewSeriesToGraph(seriesName, yAxisIndex, percentage = false) {
        const percentageConfig = {
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}%</b><br/>'
            }
        };
        const extraConfig = percentage ? percentageConfig : {};

        const series = {
            'name': seriesName,
            'data': [],
            'yAxis': yAxisIndex,
            ...extraConfig
        };
        this.runningBackTestChart.addSeries(series, false, false);
        this.highStockSeriesPosition[seriesName] = Object.keys(this.highStockSeriesPosition).length;
    }

    updateGraphWithCategories(categories) {
        try {
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
        } catch(err) {}
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
                        this.addNewSeriesToGraph('Strategy', 0, true);
                    }
                    if (this.highStockSeriesPosition['NIFTY_50'] === undefined) {
                        this.addNewSeriesToGraph('NIFTY_50', 0, true);
                    }
                    if (_.get(this.runningBackTestChart, `series[${this.highStockSeriesPosition['NIFTY_50']}]`, null) !== null) {
                        this.runningBackTestChart.series[this.highStockSeriesPosition['NIFTY_50']].addPoint([dtValue, dt.totalreturn_benchmark], false, false);
                    }
                    if (_.get(this.runningBackTestChart, `series[${this.highStockSeriesPosition['Strategy']}]`, null) !== null) {
                        this.runningBackTestChart.series[this.highStockSeriesPosition['Strategy']].addPoint([dtValue, dt.totalreturn], false, false);
                    }
                    if (dt.variables) {
                        for (let key2 in dt.variables) {
                            if (this.highStockSeriesPosition[key2] === undefined) {
                                this.addNewSeriesToGraph(key2, 1);
                            }
                            if (_.get(this.runningBackTestChart, `series[${this.highStockSeriesPosition[key2]}]`, null) !== null) {
                                this.runningBackTestChart.series[this.highStockSeriesPosition[key2]].addPoint([dtValue, dt.variables[key2]], false, false);
                            }
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
                if (_.get(this.runningBackTestChart, `xAxis[0]`, null) !== null) {
                    this.runningBackTestChart.xAxis[0].setExtremes(null, null, false, false);
                }
                
                if (_.get(this.runningBackTestChart, `xAxis[1]`, null) !== null) {
                    this.runningBackTestChart.xAxis[1].setExtremes(null, null, false, false);
                }
                
                try {
                    this.runningBackTestChart.redraw(true);
                } catch(err) {}
            }
        }
        if (this.graphData.length > 0 || !this.gotBacktestCompleteLog) {
            setTimeout(() => {
                this.recursiveUpdateGraphData();
            }, 100);
        } else {
            // this.updateBackTestComplete();
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

    handleTabChange = (event, value) => {
        this.setState({selectedTab: value});
    }

    render() {
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
                <div 
                        className="backtest-logs" 
                        style={{
                            maxHeight: '550px',
                            overflowY: 'auto', 
                            background: '#323232', 
                            padding: '10px', 
                            minHeight: '400px'
                        }}
                >
                    <Loading
                        show={this.state.logsLoading}
                        color="teal"
                        showSpinner={false}
                    />
                    {logs}
                </div>
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
                <div 
                        style={{
                            maxHeight: '550px',
                            overflowY: 'auto', 
                            padding: '10px'
                        }}
                >
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
                </div>
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
                <div 
                        style={{
                            maxHeight: '550px',
                            overflowY: 'auto', 'padding': '0px 10px'
                        }}
                >
                    <Loading
                        show={this.state.portfolioHistoryLoading}
                        color="teal"
                        showSpinner={false}
                    />
                    <div style={{
                        'display': 'flex', 'justifyContent': 'center',
                        'margin': '10px'
                    }}>
                        <RadioGroup
                            items={['Latest Portfolio', 'Portfolio History']}
                            defaultSelected={this.state.defaultSelectedPortfolio}
                            onChange={this.handleModeChange}
                            CustomRadio={CardCustomRadio}
                        />
                    </div>
                    {getPortfolioHistoryTable()}
                </div>
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
                <div 
                        style={{
                            maxHeight: '550px',
                            overflowY: 'auto'
                        }}
                >
                    <div style={{ 'padding': '20px', 'display': 'flex' }}>
                        <div style={{ 'border': '1px solid #e1e1e1', 'padding': '10px', 'minWidth': '450px' }}>
                            <h2 style={{ 'fontWeight': '700', 'fontSize': '18px' }}>Settings</h2>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4}>
                                    Initial Cash:
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {(this.state.backTestData.settings) ? this.state.backTestData.settings.initialCash : '-'}
                                    </p>
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4}>
                                    Start Date:
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        <Moment format="DD MMM YYYY">
                                            {(this.state.backTestData.settings) ? this.state.backTestData.settings.startDate : undefined}
                                        </Moment>
                                    </p>
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4}>
                                    End Date:
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        <Moment format="DD MMM YYYY">
                                            {(this.state.backTestData.settings) ? this.state.backTestData.settings.endDate : undefined}
                                        </Moment>
                                    </p>
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4}>
                                    Benchmark:
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {(this.state.backTestData.settings) ? this.state.backTestData.settings.benchmark : '-'}
                                    </p>
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4}>
                                    Universe:
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {(this.state.backTestData.settings) ? this.state.backTestData.settings.universeIndex : '-'}
                                    </p>
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4}>
                                    Slippage:
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                                        {(advancedSummary.slippage) ? advancedSummary.slippage.value : '-'}
                                    </p>
                                    <p className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                                        {(advancedSummary.slippage) ? advancedSummary.slippage.model : '-'}
                                    </p>
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4}>
                                    Comission:
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                                        {(advancedSummary.commission) ? advancedSummary.commission.value : '-'}
                                    </p>
                                    <p className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                                        {(advancedSummary.commission) ? advancedSummary.commission.model : '-'}
                                    </p>
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4}>
                                    Cancel Policy:
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {advancedSummary.cancelPolicy}
                                    </p>
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4}>
                                    Execution Policy:
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {advancedSummary.executionPolicy}
                                    </p>
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4}>
                                    Rebalance:
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {advancedSummary.rebalance}
                                    </p>
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4}>
                                    Investment Plan:
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {advancedSummary.investmentPlan}
                                    </p>
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4}>
                                    Resolution:
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {advancedSummary.resolution}
                                    </p>
                                </Grid>
                            </Grid>
                        </div>
                    </div>
                </div>
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
            const tabs = [];
            tabs.push(
                <div 
                        style={{
                            maxHeight: '550px',
                            overflowY: 'auto'
                        }}
                >
                    {getChartAccordingly()}
                </div>
            );
            tabs.push(
                <div 
                        style={{
                            maxHeight: '550px',
                            overflowY: 'auto'
                        }}
                >
                    <AceEditor
                        mode="julia"
                        theme="xcode"
                        name="UNIQUE_ID_OF_DIV"
                        readOnly={true}
                        value={this.state.backTestData.code}
                        width="100%"
                        editorProps={{ $blockScrolling: "Infinity" }}
                    />
                </div>
            );

            tabs.push(getSettingsTabPane());
            tabs.push(getLogsTabPane());
            tabs.push(getTransactionHistoryTabPane());
            tabs.push(getPortfolioHistoryTabPane());

            return (
                <div style={{ 'border': '1px solid #e1e1e1', 'marginTop': '15px' }}>
                    <Tabs
                        onChange={this.handleTabChange}
                        value={this.state.selectedTab}
                        indicatorColor='primary'
                    >
                        <Tab label='Performance' />
                        <Tab label='Code' />
                        <Tab label='Settings' />
                        <Tab label='Logs' />
                        <Tab label='Transaction' />
                        <Tab label='Portfolio' />
                    </Tabs>
                    {
                        tabs[this.state.selectedTab]
                    }
                </div>
            );
        }

        const getBackTestDiv = () => {
            if (this.state.loading) {
                return (
                    <div style={{
                        'display': 'flex',
                        'alignItems': 'center', 'justifyContent': 'center',
                        'minHeight': '300px'
                    }}>
                        <CircularProgress size={22} />
                    </div>
                );
            } else {
                return (
                    <div>
                        <Grid container>
                            <Grid item xs={4}>
                                <h2>{this.state.backTestName}</h2>
                            </Grid>
                            <Grid item xs={4} style={{
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
                                        <CircularProgress size={22} style={{ 'marginLeft': '10px' }} />
                                    </div>
                                    <h2 style={{
                                        'color': 'teal', 'margin': '0px', 'fontSize': '16px', 'fontWeight': '700',
                                        'display': (this.state.isBackTestRunComplete ? 'inherit' : 'none')
                                    }}>
                                        Complete
                                    </h2>
                                </div>
                            </Grid>
                            {
                                (!this.state.isBacktestRunning) ? (
                                    <Grid item xs={4}>
                                        <div style={{ 'display': 'flex', 'justifyContent': 'flex-end' }}>
                                            <Button
                                                color="primary"
                                                style={{ 'justifySelf': 'flex-end' }}
                                                variant='contained'
                                                onClick={() => {
                                                    this.props.history.push('/community/newPost?attachedBacktestId=' + this.props.match.params.backtestId)
                                                }}
                                            >
                                                SHARE BACKTEST
                                            </Button>
                                        </div>
                                    </Grid>
                                ) : null
                            }
                        </Grid>

                        <Grid container style={{ 'marginTop': '10px' }}>
                            <Grid item sm={6} md={3}>
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
                            </Grid>
                            <Grid item sm={6} md={3}>
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
                            </Grid>
                            <Grid item sm={6} md={3}>
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
                            </Grid>
                            <Grid item sm={6} md={3}>
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
                            </Grid>
                        </Grid>

                        <div style={{
                            'width': '100%', 'height': '1px', 'margin': '10px 0px 10px 0px',
                            'background': '#e1e1e1'
                        }}>
                        </div>

                        <h3 stye={{ 'fontSize': '16px' }}>
                            Backtest Metrics

                        </h3>

                        <Grid container style={{ 'marginTop': '10px' }}>
                            <Grid item sm={3} md={2} style={{ 'display': 'flex', marginBottom: '10px'}}>
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
                            </Grid>
                            <Grid item sm={3} md={2} style={{ 'display': 'flex', marginBottom: '10px'}}>
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
                            </Grid>
                            <Grid item sm={3} md={2} style={{ 'display': 'flex', marginBottom: '10px'}}>
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
                            </Grid>
                            <Grid item sm={3} md={2} style={{ 'display': 'flex', marginBottom: '10px'}}>
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
                            </Grid>
                            <Grid item sm={3} md={2} style={{ 'display': 'flex', marginBottom: '10px'}}>
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
                            </Grid>
                            <Grid item sm={3} md={2} style={{ 'display': 'flex', marginBottom: '10px'}}>
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
                            </Grid>
                        </Grid>
                        {getBackTestTabs()}
                    </div>
                );
            }
        }

        // const getBreadCrumbBacktestDetail = () => {
        //     if (!this.state.loading) {
        //         return (
        //             <Breadcrumb separator=">" className="location-breadcrumb">
        //                 <Breadcrumb.Item>Research</Breadcrumb.Item>
        //                 <Breadcrumb.Item><Link to="/research">All Strategies</Link></Breadcrumb.Item>
        //                 <Breadcrumb.Item><Link to={"/research/strategy/" + this.state.strategy._id}>{this.state.strategy.name}</Link></Breadcrumb.Item>
        //                 <Breadcrumb.Item><Link to={"/research/backtests/" + this.state.strategy._id}>All Backtests</Link></Breadcrumb.Item>
        //                 <Breadcrumb.Item className="last">{this.state.backTestName}</Breadcrumb.Item>
        //             </Breadcrumb>
        //         );
        //     }
        // }

        const getTotalDiv = () => {
            return (
                <div 
                        style={{ 
                            padding: '1% 3%', 
                            width: '100%', 
                            minHeight: 'calc(100vh - 70px)',
                            boxSizing: 'border-box' 
                        }}
                >
                    <div style={{ 'display': 'flex', 'marginBottom': '10px' }}>
                        <div>
                            <h2 style={{ 'color': '#3c3c3c', 'fontWeight': 'normal', 'margin': '0px' }}>Backtest Detail</h2>
                            {/* {getBreadCrumbBacktestDetail()} */}
                        </div>
                    </div>
                    <div 
                            className="card" 
                            style={{
                                width: '100%', 
                                background: 'white',
                                padding: '10px',
                                boxSizing: 'border-box'
                            }}
                    >
                        {getBackTestDiv()}
                    </div>
                </div>
            );
        }

        return (
            <AqDesktopLayout loading={this.state.loading}>
                {getTotalDiv()}
            </AqDesktopLayout>
        );
    }
}

export default withRouter(BacktestDetail);
