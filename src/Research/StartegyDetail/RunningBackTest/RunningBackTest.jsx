import React, { Component } from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import { Spin, Icon, Row, Col } from 'antd';
import Moment from 'react-moment';
import Utils from './../../../Utils';
import RunningBacktestChart from './../../../CustomHighCharts/RunningBacktestChart.jsx';

class RunningBackTest extends Component {

  _mounted = false;

  constructor(props){
  	super(); 
  	this.state = {
  	};

    this.updateState = (data) =>{
      if (this._mounted){
        this.setState(data);
      }
    }

  }

  componentDidMount(){
    this._mounted = true;
  }

  componentWillUnmount(){
    this._mounted = false;
  }

  render() {
    const antIconLoading = <Icon type="loading" style={{ fontSize: 24 }} spin />;
    let backTestData = _.get(this.props, 'backTestData', {});
    const strategyName = _.get(backTestData, 'strategy_name', '-');
    const createdAt = _.get(backTestData, 'createdAt', null);
    const startDate = _.get(backTestData, 'settings.startDate', null);
    const endDate = _.get(backTestData, 'settings.endDate', null);
    const status = _.get(backTestData, 'status', 'undefined');
    const totalReturn = _.get(backTestData, 'output.summary.totalreturn', null);
    const annualReturn = _.get(backTestData, 'output.summary.annualreturn', null);
    const standardDeviation = _.get(backTestData.output, 'summary.annualstandarddeviation', null);
    const sharpeRatio = _.get(backTestData, 'output.summary.sharperatio', null);
    const informationRatio = _.get(backTestData, 'output.summary.informationratio', null);
    const maxDrawDown = _.get(backTestData, 'output.summary.maxdrawdown', null);

    const getLoadingDiv = () => {
      if (this.state.loading){
        return (
          <div className="height_width_full" style={{'display': 'flex',
            'alignItems': 'center', 'justifyContent': 'center',
            'minHeight': '300px'}}>
            <Spin indicator={antIconLoading} />
          </div>
        );
      }
    }

    const getBackTestBody = () =>{
      if (!this.state.loading){
        return (
          <div style={{'width': '100%', 'padding': '15px'}}>
            <Row>
              <Col sm={12} md={6} style={{'textAlign': 'center'}}>
                <h2 style={{'fontWeight': '400', 'fontSize': '14px',
                  'margin': '0px'}}>
                  {/* {(backTestData.strategy_name) ? backTestData.strategy_name : '-'} */}
                  {strategyName}
                </h2>
                <p style={{'fontWeight': '300', 'fontSize': '12px',
                  'margin': '0px'}}>
                  Strategy Name
                </p>
              </Col> 
              <Col sm={12} md={6} style={{'textAlign': 'center'}}>
                <h2 style={{'fontWeight': '400', 'fontSize': '14px',
                  'margin': '0px'}}>
                  {/* {(backTestData.createdAt) ? 
                    <Moment format="DD/MM/YYYY hh:mm A">{backTestData.createdAt}</Moment>
                    : '-'} */}
                  {
                    createdAt !== null 
                      ? <Moment format="DD/MM/YYYY hh:mm A">{backTestData.createdAt}</Moment>
                      : '-'
                  }
                </h2>
                <p style={{'fontWeight': '300', 'fontSize': '12px',
                  'margin': '0px'}}>
                  CreatedAt
                </p>
              </Col>
              <Col sm={12} md={6} style={{'textAlign': 'center'}}>
                {createdAt ? 
                  <h2 style={{'fontWeight': '400', 'fontSize': '14px',
                    'margin': '0px'}}>
                    <Moment format="DD/MM/YYYY">
                      {startDate}
                    </Moment> -&nbsp; 
                    <Moment format="DD/MM/YYYY">
                      {/* {(backTestData.settings) ? backTestData.settings.endDate : undefined} */}
                      {endDate}
                    </Moment>
                  </h2>
                  : '-'
                }
                <p style={{'fontWeight': '300', 'fontSize': '12px',
                  'margin': '0px'}}>
                  Date Range
                </p>
              </Col>
              <Col sm={12} md={6} style={{'textAlign': 'center'}}>
                <h2 style={{'fontWeight': '400', 'fontSize': '14px',
                  'margin': '0px'}}>
                  {Utils.firstLetterUppercase(status)}
                </h2>
                <p style={{'fontWeight': '300', 'fontSize': '12px',
                  'margin': '0px'}}>
                  Status
                </p>
              </Col>
            </Row>
            <div style={{'width': '100%', 'height': '1px', 'margin': '10px 0px 10px 0px',
                'background': '#e1e1e1'}}>
              </div>
            <h3 stye={{'fontSize': '16px'}}>
              Backtest Metrics
            </h3>
            <Row>
              <Col sm={8} md={4} style={{'display': 'flex', 'justifyContent': 'center'}}>
                <div style={{'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                  'textAlign': 'left', 'margin': '0px 5px'}}>
                  <h2 id="totalReturnTextElem" style={{'fontSize': '20px', 'fontWeight': '400', 'margin': '0px'}}>
                      {/* {
                        _.get(backTestData, 'output.summary.totalreturn', null) !== null
                        ? _.get(backTestData, 'output.summary.totalreturn', null) + '%'
                        : '-'
                      } */}
                      {
                        totalReturn !== null ? `${totalReturn}%` : '-'
                      }
                  </h2>
                  <p style={{'fontSize': '12px', 'fontWeight': '400', 'margin': '0px'}}>
                    Total Return
                  </p>
                </div>
              </Col> 
              <Col sm={8} md={4} style={{'display': 'flex', 'justifyContent': 'center'}}>
                <div style={{'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                  'textAlign': 'left', 'margin': '0px 5px'}}>
                  <h2 id="annualReturnTextElem" style={{'fontSize': '20px', 'fontWeight': '400', 'margin': '0px'}}>
                      {/* {
                        _.get(backTestData, 'output.summary.annualreturn', null) !== null
                        ? _.get(backTestData, 'output.summary.annualreturn', null) + '%'
                        : '-'
                      } */}
                      {
                        annualReturn !== null ? `${annualReturn}%` : '-'
                      }
                  </h2>
                  <p style={{'fontSize': '12px', 'fontWeight': '400', 'margin': '0px'}}>
                    Annual Return
                  </p>
                </div>
              </Col> 
              <Col sm={8} md={4} style={{'display': 'flex', 'justifyContent': 'center'}}>
                <div style={{'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                  'textAlign': 'left', 'margin': '0px 5px'}}>
                  <h2 id="volatilityTextElem" style={{'fontSize': '20px', 'fontWeight': '400', 'margin': '0px'}}>
                    {/* {(backTestData.output && backTestData.output.summary) ?
                     backTestData.output.summary.annualstandarddeviation + ' %' : '-'} */}
                    {
                        standardDeviation !== null ? `${standardDeviation}%` : '-'
                    }
                  </h2>
                  <p style={{'fontSize': '12px', 'fontWeight': '400', 'margin': '0px'}}>
                    Volatility
                  </p>
                </div>
              </Col> 
              <Col sm={8} md={4} style={{'display': 'flex', 'justifyContent': 'center'}}>
                <div style={{'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                  'textAlign': 'left', 'margin': '0px 5px'}}>
                  <h2 id="sharpeRatioTextElem" style={{'fontSize': '20px', 'fontWeight': '400', 'margin': '0px'}}>
                    {/* {(backTestData.output && backTestData.output.summary) ? 
                     backTestData.output.summary.sharperatio : '-'} */}
                    {
                      sharpeRatio !== null ? `${sharpeRatio}%` : '-'
                    }
                  </h2>
                  <p style={{'fontSize': '12px', 'fontWeight': '400', 'margin': '0px'}}>
                    Sharpe Ratio
                  </p>
                </div>
              </Col> 
              <Col sm={8} md={4} style={{'display': 'flex', 'justifyContent': 'center'}}>
                <div style={{'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                  'textAlign': 'left', 'margin': '0px 5px'}}>
                  <h2 id="infoRatioTextElem" style={{'fontSize': '20px', 'fontWeight': '400', 'margin': '0px'}}>
                    {/* {(backTestData.output && backTestData.output.summary) ? 
                      backTestData.output.summary.informationratio : '-'} */}
                    {
                      informationRatio !== null ? `${informationRatio}%` : '-'
                    }
                  </h2>
                  <p style={{'fontSize': '12px', 'fontWeight': '400', 'margin': '0px'}}>
                    Information Ratio
                  </p>
                </div>
              </Col> 
              <Col sm={8} md={4} style={{'display': 'flex', 'justifyContent': 'center'}}>
                <div style={{'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                  'textAlign': 'left', 'margin': '0px 5px'}}>
                  <h2 id="maxDrawdownTextElem" style={{'fontSize': '20px', 'fontWeight': '400', 'margin': '0px'}}>
                    {/* {(backTestData.output && backTestData.output.summary) ?
                     backTestData.output.summary.maxdrawdown : '-'} */}
                    {
                      maxDrawDown !== null ? `${maxDrawDown}%` : '-'
                    }
                  </h2>
                  <p style={{'fontSize': '12px', 'fontWeight': '400', 'margin': '0px'}}>
                    Max Drawdown
                  </p>
                </div>
              </Col> 
            </Row>
            <div style={{'border': '1px solid #e1e1e1', 'marginTop': '15px'}}>
              <RunningBacktestChart 
                output={backTestData.output}
                onGraphCreated = {this.props.onGraphCreated}
                RunningBackTestDivUnmount={this.props.RunningBackTestDivUnmount}
                uniqueKey={backTestData._id + '__' + Math.floor((Math.random() * 100) + 1)} />
            </div>
          </div>
        );
      }
    }

    return (
	    <div style={{'width': '100%', 'height': '100%', 'overflowY': 'auto'}}>
        {getLoadingDiv()}
        {getBackTestBody()}
      </div>
    );
  }
}

export default withRouter(RunningBackTest);
