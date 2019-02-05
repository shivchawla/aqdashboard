import React from 'react';
import { withRouter } from 'react-router-dom';
import BackTests from './../../BackTests/BackTests.jsx';
import { Row, Col, Tabs, Spin, Icon, Button } from 'antd';
import Utils from './../../../Utils';
import axios from 'axios';


class AvailableBackTests extends React.Component {

    _mounted = false;
    cancelGetStrategies = undefined;
    cancelGetBacktests = undefined;
    selectedStrategyName = '';

    constructor(props){
    	super()
    	this.state = {
        'strategies': [],
        'loadingStrategy': true,
        'backtests': [],
        'loadingBackTests': false,
        'selectedBacktestId': undefined
      };

      this.onTabChanged = (strategyPosition) =>{
        this.selectedStrategyName = this.state.strategies[strategyPosition].name;
        this.updateState({'selectedBacktestId': undefined});
        this.getBacktests(this.state.strategies[strategyPosition]._id);
      }

      this.getAllStrategies = () => {
        this.updateState({'loadingStrategy': true,
          'strategies': [],
          'loadingBackTests': false,
          'backtests': []})
         axios(Utils.getBaseUrl() + '/strategy', {
            cancelToken: new axios.CancelToken( (c) => {
              this.cancelGetStrategies = c;
            }),
            'headers': Utils.getAuthTokenHeader()
          })
         .then((response) => {
              this.updateState({'strategies': response.data, 'loadingStrategy': false});
              this.cancelGetStrategies = undefined;
              if (response.data.length > 0){
                this.selectedStrategyName = response.data[0].name;
                this.getBacktests(response.data[0]._id);
              }
          })
          .catch((error) => {
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
              if (error.response.status === 400 || error.response.status === 403) {
                this.props.history.push('/forbiddenAccess');
              }
              Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
              this.cancelGetThreadData = undefined;
            }
            this.updateState({'loadingStrategy': false});
            this.cancelGetStrategies = undefined;
          });
      }

      this.getBacktests = (strategyId) => {
        this.updateState({
          'loadingBackTests': true,
          'backtests': []});
        axios(Utils.getBaseUrl() + '/strategy/' + strategyId + '/backtests?skip=0&limit=0', {
            cancelToken: new axios.CancelToken( (c) => {
              this.cancelGetBacktests = c;
            }),
            'headers': Utils.getAuthTokenHeader()
          })
         .then((response) => {
              this.updateState({'backtests': response.data, 'loadingBackTests': false});
              this.cancelGetBacktests = undefined;
          })
          .catch((error) => {
            Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            this.updateState({'loadingBackTests': false});
            this.cancelGetBacktests = undefined;
          });
      }

      this.onBackTestClicked = () =>{
        const backTestId = this.state.selectedBacktestId;
        if (this.props.onBackTestClicked){
          this.props.onBackTestClicked(backTestId);
        }
      }

      this.updateState = (data) =>{
        if (this._mounted){
          this.setState(data);
        }
      }
      
    }

    componentDidMount(){
      this._mounted = true;
      this.getAllStrategies();
    }

    componentWillUnmount(){
      this._mounted = false;
      if (this.cancelGetStrategies){
        this.cancelGetStrategies();
      }
    }
   
    render() {

      const TabPane = Tabs.TabPane;
      const antIconLoading = <Icon type="loading" style={{ fontSize: 24 }} spin />;

      
      const getStrategyDiv = () =>{
        if (this.state.loadingStrategy){
          return(
            <div style={{'display': 'flex',
              'alignItems': 'center', 'justifyContent': 'center',
              'width': '100%', 'height': 'calc(100% - 25px)'}}>
              <Spin indicator={antIconLoading} />
            </div>
          );
        }else{
          const tabs = [];
          for(let i=0; i<this.state.strategies.length; i++){
            tabs.push(<TabPane tab={this.state.strategies[i].name} key={i}></TabPane>);
          }
          return (
              <Tabs 
                defaultActiveKey="0"
                tabPosition="right"
                style={{'width': '100%'}}
                className="available-stategies-tabs"
                onChange={this.onTabChanged}
              >
                {tabs}
              </Tabs>
          );
        }
      }

      const getBackTestsDiv = () =>{
        if (this.state.loadingBackTests){
          return(
            <div style={{'display': 'flex',
              'alignItems': 'center', 'justifyContent': 'center',
              'width': '100%', 'height': 'calc(100% - 25px)'}}>
              <Spin indicator={antIconLoading} />
            </div>
          );
        }else if(!this.state.loadingStrategy){
          return (
              <React.Fragment>
                <h1 style={{'fontSize': '16px', 'fontWeight': 'bold'}}>Backtests for {this.selectedStrategyName}</h1>
                <BackTests backtests={this.state.backtests} onBackTestClicked={(backtestId) => this.updateState({'selectedBacktestId': backtestId})}/>
              </React.Fragment>
          );
        }
      }


      return (
        <div style={{'height': '100%', 'width': '100%', 'padding': '0px 30px'}}>
          <div style={{'display': 'flex', 'justifyContent': 'flex-end'}}>
            <Button type="primary" disabled={!this.state.selectedBacktestId}
              onClick={this.onBackTestClicked}>
              Attach
            </Button>
          </div>
          <Row style={{'height': 'calc(100% - 35px)'}}>
            <Col span={6} style={{'height': '100%'}}>
              <h1 style={{'fontSize': '16px', 'fontWeight': 'bold'}}>Strategy</h1>
              <div style={{'height': 'calc(100% - 25px)', 'overflowY': 'auto'}}>
                {getStrategyDiv()}
              </div>
            </Col>
            <Col span={18} style={{'height': '100%'}}>
              {getBackTestsDiv()}
            </Col>
          </Row>
        </div>
      );
    }
}
export default withRouter(AvailableBackTests);

