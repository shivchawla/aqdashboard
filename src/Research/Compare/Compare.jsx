import React, { Component } from 'react';
import axios from 'axios';
import ReactTable from "react-table";
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import RadioGroup from '../../components/Selections/RadioGroup';
import CardRadio from '../../components/Selections/CardCustomRadio';
import Utils from './../../Utils';
import "react-table/react-table.css";
import AceDiff from 'ace-diff';

// optionally, include CSS, or use your own
import 'ace-diff/dist/ace-diff.min.css';
import Loading from 'react-loading-bar';
import 'react-loading-bar/dist/index.css';

import BacktestCompareHighChart from './../../CustomHighCharts/BacktestCompareHighChart.jsx';
import { processConditionsToAlgo } from '../StartegyDetail/utils';
import { verticalBox } from '../../constants';
import FlowChartAlgo from '../FlowChartAlgo';


class Compare extends Component {

    _mounted = false;

    years = [];
    months = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    totalBacktestrequests = 0;
    summaryColumns = [
        {
            Header: 'Backtest',
            accessor: 'backtest'
        },
        {
            Header: 'Total Return',
            accessor: 'totalReturn'
        },
        {
            Header: 'Annual Return',
            accessor: 'annualReturn'
        },
        {
            Header: 'Volatility',
            accessor: 'volatility'
        },
        {
            Header: 'Sharpe Ratio',
            accessor: 'sharpeRatio'
        },
        {
            Header: 'Max Drawdown',
            accessor: 'maxDrawdown'
        },
        {
            Header: 'Beta',
            accessor: 'beta'
        }
    ];
    differ = undefined;
    codeDiffBacktestIdOne = undefined;
    codeDiffBacktestIdTwo = undefined;

    constructor(props) {
        super();
        this.state = {
            summaryTimePeriod: 0,
            backtests: [],
            loading: true,
            year: undefined,
            month: 'All',
            settingsLeft: [],
            settingsRight: [],
            selectedTab: 0,
            selectedFirstGUIBacktest: 0,
            selectedSecondGUIBacktest: 1
        };
        this.updateState = (data) => {
            if (this._mounted) {
                this.setState(data);
            }
        }

        this.getAllBacktests = () => {
			for (let key in this.props.selectedBacktests) {
				this.getBacktestData(key)
					.then((response) => {
						this.totalBacktestrequests = this.totalBacktestrequests + 1;
						let backtestsNow = JSON.parse(JSON.stringify(this.state.backtests));
                        let dtLocal = JSON.parse(JSON.stringify(response.data));
                        let entryLogic = _.get(dtLocal, 'entryLogic', '');
                        let exitLogic = _.get(dtLocal, 'exitLogic', '');

                        let entryConditions = _.get(dtLocal, 'entryConditions', []);
                        let exitConditions = _.get(dtLocal, 'exitConditions', []);

                        entryConditions = processConditionsToAlgo(entryConditions, entryLogic);
                        exitConditions = processConditionsToAlgo(exitConditions, exitLogic);

                        const algo = {
                            entry: entryConditions,
                            exit: exitConditions
                        };

                        dtLocal['fullBacktestName'] = this.props.selectedBacktests[dtLocal._id];
                        dtLocal['algo'] = algo;
						backtestsNow.push(dtLocal);
						backtestsNow.sort((a, b) => {
							return a.fullBacktestName.localeCompare(b.fullBacktestName);
						});
						if (this.totalBacktestrequests === Object.keys(this.props.selectedBacktests).length) {
							const yearNMonth = this.updateYearsMonths(backtestsNow);
							const getCodeDiffIdsDefault = this.getCodeDiffIds(backtestsNow);
							this.updateState({
								'backtests': backtestsNow,
								'loading': false,
								'year': yearNMonth['year'],
								'month': yearNMonth['month'],
								'codeDiffBacktestIdOne': getCodeDiffIdsDefault['codeDiffBacktestIdOne'],
								'codeDiffBacktestIdTwo': getCodeDiffIdsDefault['codeDiffBacktestIdTwo']
							});
						} else {
							this.updateState({ 'backtests': backtestsNow });
						}
					})
					.catch((error) => {
						this.totalBacktestrequests = this.totalBacktestrequests + 1;
						Utils.checkForInternet(error, this.props.history);
						if (error.response) {
							if (error.response.status === 400 || error.response.status === 403) {
								this.props.history.push('/forbiddenAccess');
							}
							Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
						}
						if (this.totalBacktestrequests === Object.keys(this.props.selectedBacktests).length) {
							const yearNMonth = this.updateYearsMonths(this.state.backtests);
							const getCodeDiffIdsDefault = this.getCodeDiffIds();
							this.updateState({
								'loading': false,
								'year': yearNMonth['year'], 'month': yearNMonth['month'],
								'codeDiffBacktestIdOne': getCodeDiffIdsDefault['codeDiffBacktestIdOne'],
								'codeDiffBacktestIdTwo': getCodeDiffIdsDefault['codeDiffBacktestIdTwo']
							});
						}
					});
			}
		}

        this.summaryTimePeriodChange = (value) => {
            this.updateState({summaryTimePeriod: value});
        }

        this.summaryYearChange = (value) => {
            this.updateState({year: this.years[value]});
        }

        this.summaryMonthChange = (value) => {
            this.updateState({month: this.months[value]});
        }

        this.firstDiffIdChange = (value) => {
            const backtests = this.state.backtests.map(backtest => backtest._id);
            const backtestId = backtests[value];
            if (backtestId !== undefined) {
                if (this.state.codeDiffBacktestIdOne !== backtestId) {
                    this.updateState({codeDiffBacktestIdOne: backtestId });

                    if (this.state.selectedTab === 2) {
                        setTimeout(() => {
                            try {
                                this.updateCodeDiffs();
                            } catch (err) {}
                        }, 100);
                    } else if (this.state.selectedTab === 4) {
                        setTimeout(() => {
                            try {
                                this.updateSettingsDiffs();
                            } catch(err) {console.log('firstDiffIdChange', err)}
                        }, 100);
                    }
                }
            }
        }

        this.secondDiffIdChange = (value) => {
            const backtests = this.state.backtests.map(backtest => backtest._id);
            const backtestId = backtests[value];
            if (backtestId !== undefined) {
                if (this.state.codeDiffBacktestIdTwo !== backtestId) {
                    this.updateState({ 'codeDiffBacktestIdTwo': backtestId });
                    if (this.state.selectedTab === 2) {
                        setTimeout(() => {
                            try {
                                this.updateCodeDiffs();
                            } catch(err) {}
                        }, 100);
                    } else if (this.state.selectedTab === 4) {
                        setTimeout(() => {
                            try {
                                this.updateSettingsDiffs();
                            } catch(err) {console.log('secondDiffIdChange', err)} 
                        }, 100);
                    }
                }
            }
        }

    }

    getCodeDiffIds(backtests = this.state.backtests) {
		const returnObj = {
			'codeDiffBacktestIdOne': '',
			'codeDiffBacktestIdTwo': ''
		}
		if (backtests.length > 0) {
			returnObj['codeDiffBacktestIdOne'] = backtests[0]._id;
			returnObj['codeDiffBacktestIdTwo'] = backtests[0]._id;
		}
		if (backtests.length > 1) {
			returnObj['codeDiffBacktestIdTwo'] = backtests[1]._id;
		}
		return returnObj;
	}

    updateSettingsDiffs() {
        const updatedSettings = this.getLatestSettingsDiff();
        this.updateState({
            'settingsLeft': updatedSettings.left,
            'settingsRight': updatedSettings.right
        });
    }

    getLatestSettingsDiff() {
        const settings = {
            'left': [],
            'right': []
        };
        let codeDiffIdOne = '';
        let codeDiffIdTwo = '';
        if (!this.state.codeDiffBacktestIdOne) {
            if (this.state.backtests.length > 0) {
                codeDiffIdOne = this.state.backtests[0]._id;
            }
        } else {
            codeDiffIdOne = this.state.codeDiffBacktestIdOne;
        }

        if (!this.state.codeDiffBacktestIdTwo) {
            if (this.state.backtests.length > 1) {
                codeDiffIdTwo = this.state.backtests[1]._id;
            } else if (this.state.backtests.length > 0) {
                codeDiffIdTwo = this.state.backtests[0]._id;
            }
        } else {
            codeDiffIdTwo = this.state.codeDiffBacktestIdTwo;
        }
        for (let i = 0; i < this.state.backtests.length; i++) {
            if (this.state.backtests[i]._id === codeDiffIdOne) {
                settings.left = this.computeSettings(this.state.backtests[i].settings);
            }
            if (this.state.backtests[i]._id === codeDiffIdTwo) {
                settings.right = this.computeSettings(this.state.backtests[i].settings);
            }
        }
        const leftKeys = {};
        const rightKeys = {};
        for (let i = 0; i < settings.left.length; i++) {
            leftKeys[settings.left[i].label] = i;
        }
        for (let i = 0; i < settings.right.length; i++) {
            rightKeys[settings.right[i].label] = i;
        }
        for (let key in leftKeys) {
            const leftSetting = settings.left[leftKeys[key]];
            const rightSetting = settings.right[leftKeys[key]];
            if (leftSetting && rightSetting &&
                leftSetting.label === rightSetting.label &&
                leftSetting.value === rightSetting.value &&
                leftSetting.value2 === rightSetting.value2) {
                settings.left[leftKeys[key]].isSame = true;
                settings.right[leftKeys[key]].isSame = true;
            }
        }
        return settings;
    }

    computeSettings(allSettings) {
        var basicSettings = [];
        var brokerageSettings = [];
        var otherSettings = [];
        var settings = [];
        var benchmark = _.get(allSettings, 'benchmark', 'NIFTY_50');
        benchmark = benchmark.length === 0 ? 'NIFTY_50' : benchmark;
        var universeIndex = _.get(allSettings, 'universeIndex', 'Nifty 50');
        universeIndex = universeIndex.length === 0 ? 'Nifty 50' : universeIndex;

        var advancedSettings = JSON.parse(allSettings.advanced);
        var commission = _.get(advancedSettings, 'commission.value', 0).toString();
        var commisionModel = _.get(advancedSettings, 'commission.model', '');
        const slippage = _.get(advancedSettings, 'slippage.value', 0).toString();
        const slippageModel = _.get(advancedSettings, 'slippage.model', '');
        const cancelPolicy = _.get(advancedSettings, 'cancelPolicy', '');
        const executionPolicy = _.get(advancedSettings, 'executionPolicy', '');
        const rebalance = _.get(advancedSettings, 'rebalance', '');
        const resolution = _.get(advancedSettings, 'resolution', '');
        const investmentPlan = _.get(advancedSettings, 'investmentPlan', '');

        basicSettings.push({ label: "Initial Cash", value: Utils.formatMoneyValueMaxTwoDecimals(allSettings["initialCash"].toFixed(0)), value2: "" });

        //var dates = new Date(allSettings["startDate"]).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric' })+" to "+ new Date(allSettings["endDate"]).toLocaleDateString('en-IN', {year: 'numeric', month: 'long', day: 'numeric'});

        //var dates = new Date(allSettings["startDate"]).toLocaleDateString('en-IN')+"  to  "+ new Date(allSettings["endDate"]).toLocaleDateString('en-IN');

        var startDate = new Date(allSettings["startDate"]).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

        var endDate = new Date(allSettings["endDate"]).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

        basicSettings.push({ label: "Start Date", value: "", value2: startDate });

        basicSettings.push({ label: "End Date", value: "", value2: endDate });

        basicSettings.push({
            label: "Benchmark",
            value: "",
            value2: benchmark
        });

        basicSettings.push({ label: "Universe", value: "", value2: universeIndex });

        if (advancedSettings.commission) {
            brokerageSettings.push({ label: "Commission", value: commission + '%', value2: commisionModel });
        }

        if (advancedSettings.slippage) {
            brokerageSettings.push({ label: "Slippage", value: slippage + '%', value2: slippageModel });
        }

        if (advancedSettings.cancelPolicy) {
            brokerageSettings.push({ label: "Cancel Policy", value2: cancelPolicy, value: "" });
        }

        if (advancedSettings.executionPolicy) {
            otherSettings.push({ label: "Execution Policy", value2: executionPolicy, value: "" });
        }

        if (advancedSettings.rebalance) {
            otherSettings.push({ label: "Rebalance", value2: rebalance, value: "" });
        }

        if (advancedSettings.resolution) {
            otherSettings.push({ label: "Resolution", value2: resolution, value: "" });
        }

        if (advancedSettings.investmentPlan) {
            otherSettings.push({ label: "Investment Plan", value2: investmentPlan, value: "" });
        }

        settings = settings.concat(basicSettings).concat(brokerageSettings).concat(otherSettings);

        if (settings.length > 0) {
            return settings;
        } else {
            return [];
        }
    };

    updateCodeDiffs() {
        let codeDiffIdOne = '';
        let codeDiffIdTwo = '';
        // let reRenderDiff = false;
        if (!this.state.codeDiffBacktestIdOne) {
            if (this.state.backtests.length > 0) {
                codeDiffIdOne = this.state.backtests[0]._id;
            }
            // reRenderDiff = true;
        } else {
            codeDiffIdOne = this.state.codeDiffBacktestIdOne;
        }

        if (!this.state.codeDiffBacktestIdTwo) {
            if (this.state.backtests.length > 1) {
                codeDiffIdTwo = this.state.backtests[1]._id;
            } else if (this.state.backtests.length > 0) {
                codeDiffIdTwo = this.state.backtests[0]._id;
            }
            // reRenderDiff = true;
        } else {
            codeDiffIdTwo = this.state.codeDiffBacktestIdTwo;
        }


        let codeOne = '';
        let codeTwo = '';
        for (let i = 0; i < this.state.backtests.length; i++) {
            if (this.state.backtests[i]._id === codeDiffIdOne) {
                codeOne = this.state.backtests[i].code;
            }
            if (this.state.backtests[i]._id === codeDiffIdTwo) {
                codeTwo = this.state.backtests[i].code;
            }
        }

        // if (this.differ) {
        //     this.differ.destroy();
        // }
        this.differ = new AceDiff({
            element: '.acediff',
            left: {
                content: codeOne,
                editable: false,
                copyLinkEnabled: false
            },
            right: {
                content: codeTwo,
                editable: false,
                copyLinkEnabled: false
            }
        });
        if (_.get(this, `differ.editors.left.ace['$blockScrolling']`, null) !== null) {
            this.differ.editors.left.ace['$blockScrolling'] = 'Infinity';
        }

        if (_.get(this, `differ.editors.right.ace['$blockScrolling']`, null) !== null) {
            this.differ.editors.right.ace['$blockScrolling'] = 'Infinity';
        }
    }

    getBacktestData(backtestId) {
        return axios(Utils.getBaseUrl() + '/backtest/' + backtestId, {
            'headers': Utils.getAuthTokenHeader()
        });
    }


    updateYearsMonths(backtests) {
        this.years = [];
        let ydict = {};
        for (let i = 0; i < backtests.length; i++) {
            const backtestLocal = backtests[i];
            // console.log(backtestLocal);
            let noYearlyData = _.get(backtestLocal, 'output.performance.detail.analytics.fixed.yearly', null) === null;

            // let noYearlyData = !backtestLocal||!backtestLocal.output||!backtestLocal.output.performance||!backtestLocal.output.performance.detail||!backtestLocal.output.performance.detail.analytics||!backtestLocal.output.performance.detail.analytics.fixed||!backtestLocal.output.performance.detail.analytics.fixed.yearly;

            if (!noYearlyData) {
                const years = Object.keys(backtestLocal.output.performance.detail.analytics.fixed.yearly);

                for (let j = 0; j < years.length; j++) {
                    ydict[years[j]] = 1;
                }

            }
        }

        this.years = Object.keys(ydict).sort();
        const returnObj = {
            'year': undefined,
            'month': this.months[0]
        };
        if (this.years.length > 0) {
            returnObj['year'] = this.years[0];
        }
        return returnObj;
    }


    componentDidMount() {
        this._mounted = true;
        if (!Utils.isLoggedIn()) {
            Utils.goToLoginPage(this.props.history, window.location.href);
        } else {
            this.getAllBacktests();
        }
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    onTabChanged = (event, value) => {
        this.updateState({selectedTab: value});
        if (value === 2) {
            setTimeout(() => {
                try {
                    this.updateCodeDiffs();
                } catch(err) {console.log('Error ', err)}
            }, 100);
        } else if (this.state.selectedTab === 3) {
            setTimeout(() => {
                try {
                    this.updateSettingsDiffs();
                } catch(err) {console.log('Error ', err)}
            }, 100);
        }
    }

    render() {
        const getSummaryData = () => {

            var result = [];
            for (var i = 0; i < this.state.backtests.length; i++) {

                if (this.state.summaryTimePeriod === 0) {

                    var summary = this.state.backtests[i].output.summary;
                    var totalReturn = _.get(summary, 'totalreturn', 0);
                    var annualReturn = _.get(summary, 'annualreturn', 0);
                    var annualstandarddeviation = _.get(summary, 'annualstandarddeviation', 0);
                    var sharperatio = _.get(summary, 'sharperatio', 0);
                    var informationratio = _.get(summary, 'informationratio', 0);
                    var maxdrawdown = _.get(summary, 'maxdrawdown', 0);
                    var calmarratio = _.get(summary, 'calmarratio', 0);
                    var beta = _.get(summary, 'beta', 0);
                    var stability = _.get(summary, 'stability', 0);
                    var alpha = _.get(summary, 'alpha', 0);

                    result.push({
                        'backtest': _.get(this.state, `backtests[${i}].fullBacktestName`, null),
                        'key': _.get(this.state, `backtests[${i}].fullBacktestName`, null),
                        // 'totalReturn':((summary.totalreturn || summary.totalreturn===0) ? summary.totalreturn.toFixed(2) : '')+'%',
                        'totalReturn': totalReturn.toFixed(2) + '%',
                        'annualReturn': annualReturn + '%',
                        'volatility': annualstandarddeviation + '%',
                        'sharpeRatio': sharperatio,
                        '5': informationratio,
                        'maxDrawdown': maxdrawdown + '%',
                        '7': calmarratio,
                        'beta': beta,
                        '9': stability,
                        '10': alpha
                    });
                } else if (this.state.summaryTimePeriod === 1) {

                    var rolling = _.get(this.state, `backtests[${i}].output.performance.detail.analytics.rolling`);

                    result.push({
                        'backtest': _.get(this.state, `backtests[${i}].fullBacktestName`, ''),
                        'key': _.get(this.state, `backtests[${i}].fullBacktestName`, ''),
                        'totalReturn': _.get(rolling, 'totalreturn', 0) + '%',
                        'annualReturn': _.get(rolling, 'annualreturn', 0) + '%',
                        'volatility': _.get(rolling, 'annualstandarddeviation', 0) + '%',
                        'sharpeRatio': _.get(rolling, 'sharperatio', 0),
                        '5': _.get(rolling, 'informationratio', 0),
                        'maxDrawdown': _.get(rolling, 'maxdrawdown', 0) + '%',
                        '7': _.get(rolling, 'calmarratio', 0),
                        'beta': _.get(rolling, 'beta', 0),
                        '9': _.get(rolling, 'stability', 0),
                        '10': _.get(rolling, 'alpha', 0)
                    });
                } else if ((_.get(this.state, 'summaryTimePeriod', 0)) === 2) {

                    var year = (this.state.year) ? this.state.year.toString() : '';
                    var month = this.state.month;

                    if (month === 'All') {
                        var yearField = _.get(this.state, `backtests[${i}].output.performance.detail.analytics.fixed.yearly[${year}]`, null);

                        if (yearField) {

                            result.push({
                                'backtest': _.get(this.state, `backtests[${i}].fullBacktestName`, ''),
                                'key': _.get(this.state, `backtests[${i}].fullBacktestName`, ''),
                                'totalReturn': _.get(yearField, 'totalreturn', 0) + '%',
                                'annualReturn': _.get(yearField, 'annualreturn', 0) + '%',
                                'volatility': _.get(yearField, 'annualstandarddeviation', 0) + '%',
                                'sharpeRatio': _.get(yearField, 'sharperatio', 0),
                                '5': _.get(yearField, 'informationratio', 0),
                                'maxDrawdown': _.get(yearField, 'maxdrawdown', 0) + '%',
                                '7': _.get(yearField, 'calmarratio', 0),
                                'beta': _.get(yearField, 'beta', 0),
                                '9': _.get(yearField, 'stability', 0),
                                '10': _.get(yearField, 'alpha', 0)
                            });
                        } else {
                            result.push({
                                'backtest': _.get(this.state, `backtests[${i}].fullBacktestName`, ''),
                                'key': _.get(this.state, `backtests[${i}].fullBacktestName`, ''),
                                'totalReturn': '-',
                                'annualReturn': '-',
                                'volatility': '-',
                                'sharpeRatio': '-',
                                '5': '-',
                                'maxDrawdown': '-',
                                '7': '-',
                                'beta': '-',
                                '9': '-',
                                '10': '-',
                            });
                        }
                    } else {
                        var numericMonth = this.months.indexOf(month);
                        if (numericMonth < 10) {
                            numericMonth = '0' + numericMonth.toString();
                        } else {
                            numericMonth = numericMonth.toString();
                        }

                        var key = year.toString() + numericMonth;
                        var monthField = this.state.backtests[i].output.performance.detail.analytics.fixed.monthly[key];

                        if (monthField) {
                            result.push({
                                'backtest': _.get(this.state, `backtests[${i}].fullBacktestName`, ''),
                                'key': _.get(this.state, `backtests[${i}].fullBacktestName`, ''),
                                'totalReturn': _.get(monthField, 'totalreturn', 0) + '%',
                                'annualReturn': _.get(monthField, 'annualreturn', 0) + '%',
                                'volatility': _.get(monthField, 'annualstandarddeviation', 0) + '%',
                                'sharpeRatio': _.get(monthField, 'sharperatio', 0),
                                '5': _.get(monthField, 'informationratio', 0),
                                'maxDrawdown': _.get(monthField, 'maxdrawdown', 0) + '%',
                                '7': _.get(monthField, 'calmarratio', 0),
                                'beta': _.get(monthField, 'beta', 0),
                                '9': _.get(monthField, 'stability', 0),
                                '10': _.get(monthField, 'alpha', 0)
                            });
                        } else {
                            result.push({
                                'backtest': _.get(this.state, `backtests[${i}].fullBacktestName`, ''),
                                'key': _.get(this.state, `backtests[${i}].fullBacktestName`, ''),
                                'totalReturn': '-',
                                'annualReturn': '-',
                                'volatility': '-',
                                'sharpeRatio': '-',
                                '5': '-',
                                'maxDrawdown': '-',
                                '7': '-',
                                'beta': '-',
                                '9': '-',
                                '10': '-',
                            });
                        }

                    }
                }
            }
            return result;
        };


        const getReturnsChartData = () => {
            const chartData = {
                'cumulative': {},
                'monthly': {}
            };
            for (let i = 0; i < this.state.backtests.length; i++) {
                const bkTestLcl = this.state.backtests[i];
                chartData.cumulative[bkTestLcl['fullBacktestName']] = _.get(bkTestLcl, 'output.totalreturn.algorithm', null);
                chartData.monthly[bkTestLcl['fullBacktestName']] = _.get(bkTestLcl, 'output.performance.detail.returns.monthly.algorithm', null);
            }
            return chartData;
        }

        const getTitle = () => {
            let titleString = "";
            for (let i = 0; i < this.state.backtests.length; i++) {
                titleString = titleString + "<span style=\"color: black; font-weight:700\">" + this.state.backtests[i]['fullBacktestName'] + "</span>";
                if (i !== (this.state.backtests.length - 1)) {
                    titleString = titleString + " vs ";
                }
            }
            titleString = titleString + " comparision for <span style=\"color: #cc4444; font-weight: 700\">" + _.get(this.props, 'strategy.fullName', '') + "</span>";
            return { __html: titleString };
        }

        const getCustomRadioButtons = () => {
            if (this.state.summaryTimePeriod === 2 && this.years.length > 0 && this.months.length > 0) {
                return (
                    <div style={{ 'flex': '1', 'marginLeft': '10px' }}>
                        <div style={{ 'marginBottom': '10px' }}>
                            <RadioGroup 
                                items={this.years}
                                onChange={this.summaryYearChange}
                                defaultSelected={
                                    this.state.year === undefined
                                        ?   0
                                        :   _.findIndex(this.years, year => year === this.state.year)
                                }
                                small
                                CustomRadio={CardRadio}
                            />
                        </div>
                        <div>
                            <RadioGroup 
                                items={this.months}
                                onChange={this.summaryMonthChange}
                                defaultSelected={_.findIndex(this.months, item => item === this.state.month)}
                                small
                                CustomRadio={CardRadio}
                            />
                        </div>
                    </div>
                );
            }
        }

        const getSummaryTabPane = () => {
            const summaryDataArr = getSummaryData();
            return (
                <div style={{ 'height': '100%', 'overflowY': 'auto' }}>
                    <div style={{ 'display': 'flex', 'alignItems': 'flex-start', 'marginBottom': '10px' }}>
                        <div style={{ 'display': 'flex', 'alignItems': 'center' }}>
                            <h3 style={{ 'margin': '0px 5px 0px 0px', 'color': '#cc4444', 'fontSize': '14px' }}>
                                Time Period
                            </h3>
                            <RadioGroup 
                                items={['ALL', 'Last 252 Days', 'Custom']}
                                onChange={this.summaryTimePeriodChange}
                                defaultSelected={this.state.summaryTimePeriod}
                                small
                            />
                        </div>
                        {getCustomRadioButtons()}
                    </div>
                    <ReactTable columns={this.summaryColumns}
                        data={summaryDataArr}
                        minRows={4}
                        showPagination={false}
                        defaultPageSize={summaryDataArr.length}
                        className="backtestcompare-summary-table" />
                </div>
            );
        }

        const getCodeTabPane = () => {
            const backtests = this.state.backtests.map(backtest => backtest._id);

            return (
                <div style={{ 'height': '100%' }}>
                    <Grid container style={{ 'marginBottom': '10px' }}>
                        <Grid item xs={6}>
                            <div style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <RadioGroup 
                                    items={this.state.backtests.map(backtest => backtest.fullBacktestName)}
                                    onChange={this.firstDiffIdChange}
                                    defaultSelected={_.findIndex(backtests, backtestId => backtestId === this.state.codeDiffBacktestIdOne)}
                                    CustomRadio={CardRadio}
                                />
                            </div>
                        </Grid>
                        <Grid item xs={6}>
                            <div style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <RadioGroup 
                                    items={this.state.backtests.map(backtest => backtest.fullBacktestName)}
                                    onChange={this.secondDiffIdChange}
                                    defaultSelected={_.findIndex(backtests, backtestId => backtestId === this.state.codeDiffBacktestIdTwo)}
                                    CustomRadio={CardRadio}
                                />
                            </div>
                        </Grid>
                    </Grid>
                    <div style={{ 'height': 'calc(100% - 40px)', 'overflowY': 'auto', 'position': 'relative' }}>
                        <div className="acediff"></div>
                    </div>
                </div>
            );
        }

        const getGuiTabPane = () => {
            const backtests = this.state.backtests;

            return (
                <div style={{height: '100%'}}>
                    <Grid container style={{ 'marginBottom': '10px' }}>
                        <Grid 
                                item 
                                xs={6}
                                style={{ 
                                    ...verticalBox,
                                    alignItems: 'center'
                                }}
                        >
                            <RadioGroup 
                                items={backtests.map(backtest => backtest.fullBacktestName)}
                                onChange={value => this.setState({selectedFirstGUIBacktest: value})}
                                defaultSelected={this.state.selectedFirstGUIBacktest}
                                CustomRadio={CardRadio}
                            />
                            <FlowChartAlgo 
                                algo={_.get(backtests, `[${this.state.selectedFirstGUIBacktest}].algo`)}
                                edit={false}
                            />
                        </Grid>
                        <Grid 
                                item 
                                xs={6}
                                style={{ 
                                    ...verticalBox,
                                    alignItems: 'center'
                                }}
                        >
                            <RadioGroup 
                                items={backtests.map(backtest => backtest.fullBacktestName)}
                                onChange={value => this.setState({selectedSecondGUIBacktest: value})}
                                defaultSelected={this.state.selectedSecondGUIBacktest}
                                CustomRadio={CardRadio}
                            />
                            <FlowChartAlgo 
                                algo={_.get(backtests, `[${this.state.selectedSecondGUIBacktest}].algo`)}
                                edit={false}
                            />
                        </Grid>
                    </Grid>
                </div>
            );
        }

        const getReturnsTabPane = () => {
            return (
                <div style={{ 'height': '100%', 'overflowY': 'auto' }}>
                    <BacktestCompareHighChart
                        chartData={getReturnsChartData()}
                        uniqueKey={'backtestsComparereturns'}
                    />
                </div>
            );
        }

        const getSettingsTabPane = () => {
            const backtests = this.state.backtests.map(backtest => backtest._id);
            const settingsLeft = _.get(this.state, 'settingsLeft', []);
            const settingsRight = _.get(this.state, 'settingsRight', []);
            const rowsLeft = [];
            for (let i = 0; i < settingsLeft.length; i++) {
                const values = [];
                if (_.get(settingsLeft, `[${i}].value`) !== '') {
                    values.push(
                        <p key={'1'} className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                            {_.get(settingsLeft, `[${i}].value`)}
                        </p>
                    );
                }
                if (this.state.settingsLeft[i].value2 !== '') {
                    values.push(
                        <p key={'2'} className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                            {_.get(settingsLeft, `[${i}].value2`)}
                        </p>
                    );
                }
                rowsLeft.push(
                    <Grid 
                            container 
                            key={i} 
                            type="flex" 
                            align="middle" 
                            style={{
                                marginTop: '10px',
                                padding: (!_.get(this.state, `settingsLeft[${i}].isSame`, false)) ? '10px' : '0px',
                                border: (!_.get(this.state, `settingsLeft[${i}].isSame`, false)) ? '1px solid #e1e1e1' : 'none'
                    }       }
                    >
                        <Grid item xs={4}>
                            {_.get(this.state, `settingsLeft[${i}].label`, '')}
                        </Grid>
                        <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                            {values}
                        </Grid>
                    </Grid>
                );
            }

            const rowsRight = [];
            for (let i = 0; i < settingsRight.length; i++) {
                const values = [];
                if (_.get(settingsRight, `[${i}].value`, '') !== '') {
                    values.push(
                        <p key={'1'} className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                            {_.get(settingsRight, `[${i}].value`, '')}
                        </p>
                    );
                }
                if (_.get(settingsRight, `[${i}].value2`, '') !== '') {
                    values.push(
                        <p key={'2'} className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                            {_.get(settingsRight, `[${i}].value2`, '')}
                        </p>
                    );
                }
                rowsRight.push(
                    <Grid 
                            container 
                            key={i} 
                            align="middle" 
                            style={{
                                marginTop: '10px',
                                padding: !_.get(this.state, `settingsRight[${i}].isSame`, false) ? '10px' : '0px',
                                border: !_.get(this.state, `settingsRight[${i}].isSame`, false) ? '1px solid #e1e1e1' : 'none'
                            }}
                    >
                        <Grid item xs={4}>
                            {_.get(settingsRight, `[${i}].label`, '')}
                        </Grid>
                        <Grid item xs={8} style={{display: 'flex', alignItems: 'center'}}>
                            {values}
                        </Grid>
                    </Grid>
                );
            }

            return (
                <div style={{ 'height': '100%', 'overflowY': 'auto' }}>
                    <Grid container style={{ 'marginBottom': '10px' }}>
                        <Grid item xs={6}>
                            <div style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <RadioGroup 
                                    items={this.state.backtests.map(backtest => backtest.fullBacktestName)}
                                    onChange={this.firstDiffIdChange}
                                    defaultSelected={_.findIndex(backtests, backtestId => backtestId === this.state.codeDiffBacktestIdOne)}
                                    CustomRadio={CardRadio}
                                />
                            </div>
                        </Grid>
                        <Grid item xs={6}>
                            <div style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <RadioGroup 
                                    items={this.state.backtests.map(backtest => backtest.fullBacktestName)}
                                    onChange={this.secondDiffIdChange}
                                    defaultSelected={_.findIndex(backtests, backtestId => backtestId === this.state.codeDiffBacktestIdTwo)}
                                    CustomRadio={CardRadio}
                                />
                            </div>
                        </Grid>
                    </Grid>
                    <div style={{ 'height': 'calc(100% - 55px)', 'overflowY': 'auto', 'position': 'relative' }}>
                        <Grid container>
                            <Grid item xs={6} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{ 'padding': '10px', 'border': '1px solid #e1e1e1', 'minWidth': '400px' }}>
                                    {rowsLeft}
                                </div>
                            </Grid>
                            <Grid item xs={6} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{ 'padding': '10px', 'border': '1px solid #e1e1e1', 'minWidth': '400px' }}>
                                    {rowsRight}
                                </div>
                            </Grid>
                        </Grid>
                    </div>
                </div>
            );
        }

        const getCompareDiv = () => {
            // const shouldShowAlgo = _.get(this.props, 'strategy.type', 'CODE') === 'GUI';
            // const codeOrGUITabPane = shouldShowAlgo ? getGuiTabPane() : getCodeTabPane();
            const tabs = [
                getSummaryTabPane(),
                getGuiTabPane(),
                getCodeTabPane(),
                getReturnsTabPane(),
                getSettingsTabPane()
            ];

            if (this.state.loading) {
                return (
                    <div style={{
                        'display': 'flex',
                        'alignItems': 'center', 'justifyContent': 'center',
                        'minHeight': '300px'
                    }}>
                        <CircularProgress size={24}/>
                    </div>
                );
            } else {
                return (
                    <React.Fragment>
                        <div style={{ 'marginBottom': '10px' }}>
                            <p style={{ 'color': '#8c8c8c', 'fontWeight': '400', 'fontSize': '15px' }}
                                dangerouslySetInnerHTML={getTitle()}>
                            </p>
                        </div>
                        <div style={{ 'width': '100%', 'height': '100%' }}>
                            <Tabs
                                    onChange={this.onTabChanged}
                                    value={this.state.selectedTab}
                                    indicatorColor='primary'
                                    style={{marginBottom: '10px'}}
                            >
                                <Tab label='SUMMARY' />
                                {/* <Tab label={shouldShowAlgo ? 'ALGO' : 'CODE'} /> */}
                                <Tab label='ALGO' />
                                <Tab label='CODE' />
                                <Tab label='RETURNS' />
                                <Tab label='SETTINGS' />
                            </Tabs>
                            {
                                tabs[this.state.selectedTab]
                            }
                        </div>
                    </React.Fragment>
                );
            }
        }

        const getTotalDiv = () => {
            if (!this.state.loading) {
                return (
                    <div 
                            className="compare-backtests-div" 
                            style={{
                                width: '100%', 
                                height: '100%' 
                            }}
                    >
                        {getCompareDiv()}
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
            </React.Fragment>
        );
    }
}

export default withRouter(Compare);
