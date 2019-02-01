import React from 'react';
import { withRouter } from 'react-router-dom';

import Highstocks from 'highcharts/highstock';
import Highcharts from 'highcharts';

class RunningBacktestChart extends React.Component {

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
                        height: '60%',
                        lineWidth: 2,
                        resize: {
                            enabled: true
                        }
                    },
                    {
                        plotLines: [{
                            value: 0,
                            width: 2,
                            color: 'silver'
                        }],
                        top: '65%',
                        height: '35%',
                        offset: 0,
                        lineWidth: 2
                    }
                ],

                plotOptions: {
                    series: {
                        showInNavigator: true
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
                colors: [ "#fc4a1a", "#0375b4", "#cc6666", "#6e2667", "#FFAA1D","#007849"]
            };

    chart = undefined;
    _mounted = false;

    constructor(props){
        super();
      this.state = {
      };

      this.updateChartAccordingly = this.updateChartAccordingly.bind(this);

      this.updateState = (data) =>{
        if (this._mounted){
            this.setState(data);
        }
      }

      this.updateChartData = () => {
        this.updateChartAccordingly();
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
            this.updateChartAccordingly();
        }
    }

    updateChartAccordingly(){
        if (this.chart){
            this.chart.destroy();
            this.chart = undefined;
        }
            // Set container which the chart should render to.
            this.chart = new Highstocks[this.props.type || "StockChart"](
                this.props.uniqueKey, 
                this.dataObj
            );
            if (this.props.onGraphCreated){
                this.props.onGraphCreated(this.chart);
            }
    }

    componentWillUnmount(){
      this.chart.destroy();
      if (this.props.RunningBackTestDivUnmount){
        this.props.RunningBackTestDivUnmount();
      }
      this._mounted = false;
    }
   
    render() {
      return (
        <div >
            <div id={this.props.uniqueKey}>
            </div>
        </div>
      );
    }
}
export default withRouter(RunningBacktestChart);

