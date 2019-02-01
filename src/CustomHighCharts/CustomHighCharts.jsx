import React from 'react';
import { withRouter } from 'react-router-dom';
import Highstocks from 'highcharts/highstock';
import Highcharts from 'highcharts';
import moment from 'moment';
import RadioGroup from '../components/Selections/RadioGroup';
import Utils from '../Utils'

class CustomHighCharts extends React.Component {

    yAxisZero = {
        labels: {
            formatter: function () {
                return (this.value > 0 ? ' + ' : '') + this.value + '%';
            }
        },
        title: {
            'text': ''
        },
        plotLines: [{
            value: 0,
            width: 2,
            color: 'silver'
        }],
        height: '60%',
        lineWidth: 2,
        resize: {
            enabled: true
        }
    };
    yAxisOne = {
        plotLines: [{
            value: 0,
            width: 2,
            color: 'silver'
        }],
        top: '65%',
        height: '35%',
        offset: 0,
        lineWidth: 2
    };

    dataObj = {

        rangeSelector: {
            selected: 4
        },

        yAxis: [],

        plotOptions: {
            series: {
                showInNavigator: true,
                compare: 'percent'
            }
        },

        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.change}%</b><br/>',
            valueDecimals: 2,
            changeDecimals: 2,
            split: false,
            shared: true,
            xDateFormat: '%B %e, %Y'
        },

        series: [],
        colors: ["#0375b4", "#cc6666", "#6e2667", "#FFAA1D", "#007849", "#fc4a1a"]

    };

    dataBarObj = {
        title: '',
        chart: {
            type: 'column'
        },
        xAxis: {
            categories: []
        },
        yAxis: {
            title: {
                'text': 'Returns (%)'
            }
        },
        credits: {
            enabled: false
        },
        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}%</b><br/>',
            split: false,
            shared: true,
            xDateFormat: '%B %e, %Y'
        },
        series: [],
        colors: ["#0375b4", "#cc6666", "#6e2667", "#FFAA1D", "#007849", "#fc4a1a"]
    };
    dataBarXAxis = [];
    chart = undefined;
    _mounted = false;
    currentGraphMode = "Cumulative";

    constructor(props) {
        super();
        this.state = {
        };

        this.handleModeChange = (selectedValue) => {
            const value = selectedValue === 0 ? 'Cumulative' : 'Monthly';
            if (value !== this.currentGraphMode) {
                this.updateChartAccordingly(value);
                this.currentGraphMode = value;
            }
        }

        this.updateChartAccordingly = this.updateChartAccordingly.bind(this);

        this.updateState = (data) => {
            if (this._mounted) {
                this.setState(data);
            }
        }

    }

    componentDidMount() {
        // Extend Highcharts with modules
        this._mounted = true;
        if (this.props.modules) {
            this.props.modules.forEach(function (module) {
                module(Highcharts);
            });
        }
        if (this._mounted) {
            this.updateChartAccordingly('Cumulative');
        }
    }

    updateChartAccordingly(type) {
        if (this.chart) {
            this.chart.destroy();
            this.chart = undefined;
        }
        if (type === 'Cumulative') {
            let niftySeries = {
                'name': 'NIFTY_50'
            };
            let strategySeries = {
                'name': 'Strategy'
            };
            let secondGraphSeries = {};
            if (this.props.output && this.props.output.totalreturn) {
                for (let key in this.props.output.totalreturn) {
                    const dty = this.props.output.totalreturn[key];
                    const data = []
                    for (let key1 in dty) {
                        data.push([Utils.getTime(key1), (1.0 + dty[key1] / 100)])
                    }
                    data.sort((a, b) => {
                        return a[0] - b[0];
                    });
                    if (key === 'benchmark') {
                        niftySeries['data'] = data;
                    } else {
                        strategySeries['data'] = data;
                    }
                }
            }
            if (this.props.output && this.props.output.performance
                && this.props.output.performance.detail && this.props.output.performance.detail.variables) {
                const dty = this.props.output.performance.detail.variables;
                for (let key1 in dty) {
                    const localDty = dty[key1];
                    for (let key2 in localDty) {
                        if (!secondGraphSeries[key2]) {
                            secondGraphSeries[key2] = {
                                'name': key2,
                                'data': [],
                                'yAxis': 1
                            }
                        }
                        secondGraphSeries[key2].data.push([Utils.getTime(key1), dty[key1][key2]]);
                    }
                }
                for (let key in secondGraphSeries) {
                    secondGraphSeries[key].data.sort((a, b) => {
                        return a[0] - b[0];
                    });
                }
            }
            if (Object.keys(secondGraphSeries).length > 0) {
                this.dataObj.yAxis = [];
                this.dataObj.yAxis.push(this.yAxisZero);
                this.dataObj.yAxis.push(this.yAxisOne);
                // Set container which the chart should render to.
                this.chart = new Highstocks[this.props.type || "StockChart"](
                    this.props.uniqueKey,
                    this.dataObj
                );
                this.chart.addSeries(strategySeries);
                this.chart.addSeries(niftySeries);
                for (let key in secondGraphSeries) {
                    this.chart.addSeries(secondGraphSeries[key]);
                }
            } else {
                this.dataObj.yAxis = [];
                const yAxisZ = JSON.parse(JSON.stringify(this.yAxisZero));
                yAxisZ.height = '100%';
                // console.log(yAxisZ);
                this.dataObj.yAxis.push(yAxisZ);
                // Set container which the chart should render to.
                this.chart = new Highstocks[this.props.type || "StockChart"](
                    this.props.uniqueKey,
                    this.dataObj
                );
                this.chart.addSeries(niftySeries);
                this.chart.addSeries(strategySeries);
            }

        } else {
            const algoSeries = {
                'name': 'Strategy',
                'data': []
            };
            const benchSeries = {
                'name': 'NIFTY_50',
                'data': []
            };
            if (this.props.output && this.props.output.performance
                && this.props.output.performance.detail
                && this.props.output.performance.detail.returns
                && this.props.output.performance.detail.returns.monthly) {
                const algoData = this.props.output.performance.detail.returns.monthly['algorithm'];
                const benchData = this.props.output.performance.detail.returns.monthly['benchmark'];
                if (this.dataBarXAxis.length === 0) {
                    for (let key in algoData) {
                        this.dataBarXAxis.push(key);
                    }
                    this.dataBarXAxis.sort((a, b) => {
                        return a - b;
                    });
                }
                this.dataBarObj.xAxis.categories = [];
                for (let i = 0; i < this.dataBarXAxis.length; i++) {
                    const keyL = this.dataBarXAxis[i];
                    this.dataBarObj.xAxis.categories.push(moment(keyL, "YYYYMM").format("MMM YY"));
                    if (algoData[keyL]) {
                        algoSeries.data.push(algoData[keyL]);
                    } else {
                        algoSeries.data.push(0);
                    }
                    if (benchData[keyL]) {
                        benchSeries.data.push(benchData[keyL]);
                    } else {
                        benchSeries.data.push(0);
                    }
                }
            }
            this.chart = new Highstocks[this.props.type || "Chart"](
                this.props.uniqueKey,
                this.dataBarObj
            );
            this.chart.addSeries(algoSeries);
            this.chart.addSeries(benchSeries);
            if (this.props.onCustomHighChartCreated) {
                this.props.onCustomHighChartCreated(this.chart);
            }
        }
    }

    componentWillUnmount() {
        this.chart.destroy();
        this._mounted = false;
    }

    render() {


        return (
            <div >
                <div 
                        style={{
                            'display': 'flex', 'justifyContent': 'flex-end',
                            'margin': '10px'
                        }}
                >
                    <RadioGroup
                        onChange={this.handleModeChange}
                        defaultSelected={0}
                        items={['Cumulative', 'Monthly']}
                        fontSize='12px'
                    />
                </div>
                <div id={this.props.uniqueKey}>
                </div>
            </div>
        );
    }
}
export default withRouter(CustomHighCharts);

