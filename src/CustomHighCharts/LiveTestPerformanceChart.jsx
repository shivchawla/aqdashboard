import React from 'react';
import { useNavigate } from 'react-router-dom';

import Highstocks from 'highcharts/highstock';
import Highcharts from 'highcharts';
import moment from 'moment';
import RadioGroup from '../components/Selections/RadioGroup';

class LiveTestPerformanceChart extends React.Component {

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
        yAxis:{
            title:{
                'text': 'Returns (%)'
            }
        },
        credits: {
            enabled: false
        },
        tooltip: {
            split: false,
            shared: true,
            xDateFormat: '%B %e, %Y'
        },
        series: [],
        colors: [ "#0375b4", "#cc6666", "#6e2667", "#FFAA1D","#007849","#fc4a1a"]
    };
    dataBarXAxis = [];
    chart = undefined;
    _mounted = false;
    currentGraphMode = "Cumulative";

    constructor(props){
        super();
      this.state = {
      };

      this.handleModeChange = (selectedValue) => {
        const value = selectedValue === 0 ? 'Cumulative' : 'Monthly';
        if (value !== this.currentGraphMode){
            this.updateChartAccordingly(value);
            this.currentGraphMode = value;
        }
      }

      this.updateChartAccordingly = this.updateChartAccordingly.bind(this);

      this.updateState = (data) =>{
        if (this._mounted){
            this.setState(data);
        }
      }
      
    }

    componentDidMount(){
      // Extend Highcharts with modules
      this._mounted = true;
        if (this.props.modules) {
            this.props.modules.forEach(function (module) {
                module(Highcharts);
            });
        }
        if(this._mounted){
            this.updateChartAccordingly('Cumulative');
        }
    }

    updateChartAccordingly(type){
        if (this.chart){
            this.chart.destroy();
            this.chart = undefined;
        }
        if(type === 'Cumulative'){
            // Set container which the chart should render to.
            this.chart = new Highstocks[this.props.type || "StockChart"](
                this.props.uniqueKey, 
                this.dataObj
            );
            if (this.props.chartData && this.props.chartData.algorithm){
                const pushSeries = {
                    'name': 'Strategy',
                    'data': []
                }
                let oldValue = undefined;
                
                Object.keys(this.props.chartData.algorithm).sort().forEach(key => {
                    /*if (oldValue === undefined){
                        oldValue = this.props.chartData.algorithm[key];
                    }
                    const value = ((this.props.chartData.algorithm[key] - oldValue)/this.props.chartData.algorithm[key]) * 100;
                    */

                    const value = this.props.chartData.algorithm[key];
                    //pushSeries.data.push([moment(key, "YYYY-MM-DD").valueOf(), value]);
                    pushSeries.data.push([(new Date(key)).getTime(), value]);
                });
                pushSeries.data.sort((a, b) => {
                    return a[0] - b[0];
                });


                this.chart.addSeries(pushSeries);
            }
            if (this.props.chartData && this.props.chartData.benchmark){
                const pushSeries = {
                    'name': 'NIFTY_50',
                    'data': []
                }
                let oldValue = undefined;
                Object.keys(this.props.chartData.benchmark).sort().forEach(key => {
                    let value = 0;
                    /*if (oldValue === undefined){
                        oldValue = this.props.chartData.benchmark[key];
                    }else{
                        let divByValue = oldValue + 0;
                        if (divByValue === 0){
                            divByValue = 1;
                        }*/
                        //value = ((this.props.chartData.benchmark[key] - oldValue)/divByValue) * 100;
                    //}
                    value = this.props.chartData.benchmark[key];
                    //pushSeries.data.push([moment(key, "YYYY-MM-DD").valueOf(), value]);
                    pushSeries.data.push([(new Date(key)).getTime(), value]);
                });
                pushSeries.data.sort((a, b) => {
                    return a[0] - b[0];
                });
                this.chart.addSeries(pushSeries);
            }
        }else{
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
                && this.props.output.performance.detail.returns.monthly){
                const algoData = this.props.output.performance.detail.returns.monthly['algorithm'];
                const benchData = this.props.output.performance.detail.returns.monthly['benchmark'];
                if (this.dataBarXAxis.length === 0){
                    for(let key in algoData){
                        this.dataBarXAxis.push(key);
                    }
                    this.dataBarXAxis.sort((a,b)=>{
                        return a-b;
                    });
                }
                this.dataBarObj.xAxis.categories = [];
                for(let i=0; i<this.dataBarXAxis.length; i++){
                    const keyL = this.dataBarXAxis[i];
                    this.dataBarObj.xAxis.categories.push(moment(keyL, "YYYYMM").format("MMM YY"));
                    if (algoData[keyL]){
                        algoSeries.data.push(algoData[keyL]);
                    }else{
                        algoSeries.data.push(0);
                    }
                    if (benchData[keyL]){
                        benchSeries.data.push(benchData[keyL]);
                    }else{
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
        }
    }

    componentWillUnmount(){
      this.chart.destroy();
      this._mounted = false;
    }
   
    render() {

      const getRadioDiv = () => {
        if (this.props.isForwardTestActive){
            return (
                <RadioGroup
                    onChange={this.handleModeChange}
                    defaultSelected={0}
                    items={['Cumulative', 'Monthly']}
                    fontSize='12px'
                />
            );
        }
      }


      return (
        <div >
            <div style={{'display': 'flex', 'justifyContent': 'flex-end',
                'margin': '10px'}}>
                {getRadioDiv()}
            </div>
            <div id={this.props.uniqueKey}>
            </div>
        </div>
      );
    }
}
export default LiveTestPerformanceChart;

