import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import Highstocks from 'highcharts/highstock';
import Highcharts from 'highcharts';
import moment from 'moment';
import RadioGroup from '../components/Selections/RadioGroup';

class BacktestCompareHighChart extends React.Component {

    dataObj = {

        rangeSelector: {
            selected: 4
        },

        yAxis: [
            {
                labels: {
                    formatter: function () {
                        return (this.value > 0 ? ' + ' : '') + this.value + '%';
                    }
                },
                plotLines: [{
                    value: 0,
                    width: 2,
                    color: 'silver'
                }],
                lineWidth: 2,
                resize: {
                    enabled: true
                }
            }
        ],

        plotOptions: {
            series: {
                showInNavigator: true,
                compare: 'percent'
            },
        },

        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.change}%</b><br/>',
            valueDecimals: 2,
            split: false,
            shared: true,
            xDateFormat: '%B %e, %Y'
        },

        series: [],
        colors: [ "#0375b4", "#cc6666", "#6e2667", "#FFAA1D","#007849","#fc4a1a"]

    };

    dataBarObj = {
        title: '',
        chart: {
            type: 'column'
        },
        xAxis: {
            categories: []
        },
        credits: {
            enabled: false
        },
        yAxis: {
            title: {
                'text': 'Returns (%)'
            }
        },
        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}%</b><br/>',
            valueDecimals: 2,
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
        if(type === 'Cumulative'){
            // Set container which the chart should render to.
            this.chart = new Highstocks[this.props.type || "StockChart"](
                this.props.uniqueKey, 
                this.dataObj
            );
            if (this.props.chartData && this.props.chartData.cumulative){
                for(let backtestName in this.props.chartData.cumulative){
                    const pushSeries = {
                        'name': backtestName,
                        'data': []
                    };
                    const cumulativeData = _.get(this.props, `chartData.cumulative[${backtestName}]`, {});
                    if (cumulativeData !== null) {
                        Object.keys(_.get(this.props, `chartData.cumulative[${backtestName}]`, {})).sort().forEach(key => {
                            pushSeries.data.push([
                                moment(key, "YYYY-MM-DD").valueOf(), 
                                1 + _.get(this.props, `chartData.cumulative[${backtestName}][${key}]`, 0) / 100 
                            ]) ;
                        });
                        pushSeries.data.sort((a, b) => {
                            return a[0] - b[0];
                        });
                        this.chart.addSeries(pushSeries);
                    }
                }
            }
        } else {
            this.chart = new Highstocks[this.props.type || "Chart"](
                this.props.uniqueKey,
                this.dataBarObj
            );
            if (this.props.chartData && this.props.chartData.monthly) {
                for (let backtestName in this.props.chartData.monthly) {
                    const algoData = this.props.chartData.monthly[backtestName];
                    if (this.dataBarXAxis.length === 0) {
                        for (let key in algoData) {
                            this.dataBarXAxis.push(key);
                        }
                        this.dataBarXAxis.sort((a, b) => {
                            return a - b;
                        });
                    }
                    this.dataBarObj.xAxis.categories = [];
                    const algoSeries = {
                        'name': backtestName,
                        'data': []
                    };
                    for (let i = 0; i < this.dataBarXAxis.length; i++) {
                        const keyL = this.dataBarXAxis[i];
                        this.dataBarObj.xAxis.categories.push(moment(keyL, "YYYYMM").format("MMM YY"));
                        if (algoData[keyL]) {
                            algoSeries.data.push(algoData[keyL]);
                        } else {
                            algoSeries.data.push(0);
                        }
                    }
                    this.chart.addSeries(algoSeries);
                }
            }
        }
    }

    componentWillUnmount() {
        this.chart.destroy();
        this._mounted = false;
    }

    render() {

        const getRadioDiv = () => {
            return (
                // <Radio.Group onChange={this.handleModeChange} defaultValue={'Cumulative'}>
                //     <Radio.Button value="Cumulative">Cumulative</Radio.Button>
                //     <Radio.Button value="Monthly">Monthly</Radio.Button>
                // </Radio.Group>
                <RadioGroup
                    onChange={this.handleModeChange}
                    defaultSelected={0}
                    items={['Cumulative', 'Monthly']}
                    fontSize='12px'
                />
            );
        }


        return (
            <div >
                <div style={{
                    'display': 'flex', 'justifyContent': 'flex-end',
                    'margin': '10px'
                }}>
                    {getRadioDiv()}
                </div>
                <div id={this.props.uniqueKey}>
                </div>
            </div>
        );
    }
}
export default withRouter(BacktestCompareHighChart);

