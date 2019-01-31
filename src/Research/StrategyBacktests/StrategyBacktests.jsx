import React, { Component } from 'react';
import Utils from './../../Utils';
import { Spin, Icon, Row, Col, Button, Table, Modal, Breadcrumb } from 'antd';
import axios from 'axios';
import { withRouter, Link } from 'react-router-dom';
import moment from 'moment';
import Compare from './../Compare/Compare.jsx';
import Loading from 'react-loading-bar'
import 'react-loading-bar/dist/index.css';
import {Footer} from '../../Footer/Footer';


class StrategyBacktests extends Component {

  _mounted = false;
  cancelGetBackTests = undefined;
  cancelGetStrategy = undefined;
  deletesCompleted = 0;

  constructor(props){
  	super();
  	this.state = {
      'loading': true,
      'selectedBacktests': [],
      'strategy':{},
      'backtests': [],
      'allSelected': false,
      'disableRunTests': false,
      'tableButtonsLoading': false,
      'backtestsCompareModalVisible': false
  	};
    this.updateState = (data) => {
      if (this._mounted){
        this.setState(data);
      }
    }
    this.getStrategy = () =>{
      axios(Utils.getBaseUrl() + '/strategy/'+props.match.params.strategyId, {
        cancelToken: new axios.CancelToken( (c) => {
          // An executor function receives a cancel function as a parameter
          this.cancelGetStrategy = c;
        }),
        'headers': Utils.getAuthTokenHeader()
      })
        .then((response) => {
            if(response.data && response.data.forwardtest &&
              response.data.forwardtest.active){
              this.updateState({'strategy': response.data, 'disableRunTests': true});
            }else{
              this.updateState({'strategy': response.data});
            }
            this.getAllBacktests();
            this.cancelGetStrategy = undefined;
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
              'backtests': [],
              'loading': false
            });
            this.cancelGetStrategy = undefined;
          });
    }
    this.getAllBacktests = () =>{
      axios(Utils.getBaseUrl() + '/strategy/'+props.match.params.strategyId+'/backtests?skip=0&limit=0', {
        cancelToken: new axios.CancelToken( (c) => {
          // An executor function receives a cancel function as a parameter
          this.cancelGetBackTests = c;
        }),
        'headers': Utils.getAuthTokenHeader()
      })
        .then((response) => {
            this.updateState({'backtests': response.data, 'loading': false});
            this.cancelGetBackTests = undefined;
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
              'backtests': [],
              'loading': false
            });
            this.cancelGetBackTests = undefined;
          });
    }

    this.runForwardTestApiCall = (backtestId) => {
      axios({
                'method': 'post',
                'url': Utils.getBaseUrl() + '/forwardtest',
                'data': {
                  "strategyId": this.props.match.params.strategyId,
                  "backtestId": backtestId
                },
                'headers': Utils.getAuthTokenHeader()
            })
           .then((response) => {
                this.props.history.push('/research');
              })
              .catch((error) => {
                Utils.checkForInternet(error, this.props.history);
                if (error.response) {
                  if (error.response.status === 400 || error.response.status === 403) {
                    this.props.history.push('/forbiddenAccess');
                  }
                  Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                }
                this.removeAllLoading();
              });
    }

    this.removeAllLoading = () => {
      let backtests = JSON.parse(JSON.stringify(this.state.backtests));
      for(let i=0; i<backtests.length; i++){
        if(backtests[i].isLoading){
          backtests[i]['isLoading'] = false;
        }
      }
      this.updateState({'backtests': backtests});
    }

    this.strategyCheckBoxChange = (state, backtestId) => {
      let startegyIds = JSON.parse(JSON.stringify(this.state.selectedBacktests));
      let indexOfId = startegyIds.indexOf(backtestId);
      if(state){
        if (indexOfId === -1){
          startegyIds.push(backtestId);
        }
        this.updateState({'selectedBacktests': startegyIds});
      }else if(indexOfId >= 0){
        startegyIds.splice(indexOfId, 1);
        this.updateState({'selectedBacktests': startegyIds,
        'allSelected': false});
      }
      
    }

    this.allBacktestsCheckboxChange = (e) =>{
      let selectedBacktests = [];
      if (e.target.checked){
        for(let i=0; i<this.state.backtests.length; i++){
          selectedBacktests.push(this.state.backtests[i]._id);
        }
      }
      this.updateState({'selectedBacktests': selectedBacktests,
        'allSelected': e.target.checked});
    }

    this.runForwardTest = (record) => {
      let backtests = JSON.parse(JSON.stringify(this.state.backtests));
      for(let i=0; i<backtests.length; i++){
        if(record.key === backtests[i]._id){
          backtests[i]['isLoading'] = true;
          break;
        }
      }
      this.updateState({'backtests': backtests});
      this.runForwardTestApiCall(record.key);
    }

    this.deleteSelectedBacktests = () => {
      if (this.state.selectedBacktests && this.state.selectedBacktests.length > 0){
        this.updateState({'tableButtonsLoading': true});
        this.deletesCompleted = 0;
        for(let i=0; i<this.state.selectedBacktests.length; i++){
          this.deleteSingleBacktest(this.state.selectedBacktests[i]);
        }
      }
    }


    this.deleteSingleBacktest = (backtestId) => {
      axios({
              method: 'DELETE',
              url: Utils.getBaseUrl() + '/backtest/'+backtestId,
             'headers': Utils.getAuthTokenHeader()
            })
          .then((response) => {
            this.deletesCompleted = this.deletesCompleted + 1;
            if (this.deletesCompleted === this.state.selectedBacktests.length){
              this.updateBacktestsDeleted();
            }
          })
          .catch((error) => {
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
              if (error.response.status === 400 || error.response.status === 403) {
                this.props.history.push('/forbiddenAccess');
              }
              Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
            this.deletesCompleted = this.deletesCompleted + 1;
            if (this.deletesCompleted === this.state.selectedBacktests.length){
              this.updateBacktestsDeleted();
            }
          });
    }

    this.updateBacktestsDeleted = () =>{
      if(this.state.selectedBacktests){
        let backtests = [];
        for(let i=0; i<this.state.backtests.length; i++){
          if (this.state.selectedBacktests.indexOf(this.state.backtests[i]._id) === -1){
            backtests.push(this.state.backtests[i]);
          }
        } 
        if(backtests.length > 0){
          this.updateState({
            'tableButtonsLoading': false,
            'selectedBacktests': [],
            'backtests': backtests,
            'allSelected': false
          });
        }else{
          this.props.history.push('/research');
        }
      }else{
        this.updateState({'tableButtonsLoading': false});
      }
    }

    this.showDeleteConfirm = (title, content) => {
      Modal.confirm({
        title: title,
        content: content,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: () => {
          this.deleteSelectedBacktests()
        },
        onCancel: () => {
        },
      });
    }

    this.showcompareModal = () => {
      this.updateState({'backtestsCompareModalVisible': true});
    }
  }

  componentDidMount(){
    this._mounted = true;
    if (!Utils.isLoggedIn()){
      Utils.goToLoginPage(this.props.history, window.location.href);
    }else{
      this.props.pageChange('research');
      if (this._mounted){
        this.getStrategy();
      }
    }
  }

  componentWillUnmount() {
    this._mounted = false;
    if (this.cancelGetBackTests){
      this.cancelGetBackTests();
    }
    if (this.cancelGetStrategy){
      this.cancelGetStrategy();
    }
  }

  render() {

    const antIconLoading = <Icon type="loading" style={{ fontSize: 34 }} spin />;
    const { Column } = Table;
    const columns = [
      <Column
        title= 'Backtest' 
        dataIndex= 'name' 
        key= 'name'
      />,
      <Column
        title= 'Created Date' 
        dataIndex= 'createdAt' 
        key= 'createdAt'
      />,
      <Column
        title= 'Status' 
        dataIndex= 'status' 
        key= 'status'
      />,
      <Column
        title= 'Date Range' 
        dataIndex= 'dateRange' 
        key= 'dateRange'
      />,
      <Column
        title= 'Total Return' 
        dataIndex= 'totalreturn' 
        key= 'totalreturn'
      />,
      <Column
        title= 'Sharpe Ratio' 
        dataIndex= 'sharperatio' 
        key= 'sharperatio'
      />,
      <Column
        title= '' 
        key= 'actions' 
        render={(text, record) => {
          if(record.isLoading){
            return(
              <div style={{'display': 'flex',
                'alignItems': 'center', 'justifyContent': 'center',
                'minWidth': '100px'}}>
                <Spin indicator={antIconLoading} />
              </div>
            );
          }else if(!this.state.disableRunTests && 
            record.status.trim().toLowerCase() === 'complete'){
            return(
              <Button type="primary" ghost onClick={(e) => {
                e.stopPropagation();
                this.runForwardTest(record);
              }}>
                Run Forward
              </Button>
            );
          }else{
            return(
              <Button type="primary" ghost disabled>
                Run Forward
              </Button>
            );
          }
        }}
      />];
      // rowSelection object indicates the need for row selection
      const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
          this.updateState({
            'selectedBacktests': selectedRowKeys
          })
        }
      };


    const data = [];
      if(this.state.backtests){
        for(let i=0; i<this.state.backtests.length; i++){
          const dty = this.state.backtests[i];
          let dataObj = {};
          dataObj['name'] = "Backtest " + (i+1);
          dataObj['createdAt'] = moment(dty.createdAt).format('DD/MM/YYYY hh:mm A');
          dataObj['status'] = (dty.status) ? (dty.status[0].toUpperCase() + dty.status.substring(1)) : '';
          dataObj['key'] = dty._id;
          if(dty.output && dty.output.summary){
            dataObj['totalreturn'] = (dty.output.summary.totalreturn) ? (dty.output.summary.totalreturn + ' %') : '';
          }
          if(dty.output && dty.output.summary){
            dataObj['sharperatio'] = dty.output.summary.sharperatio;
          }
          if (dty.settings && dty.settings.startDate && dty.settings.endDate){
            dataObj['dateRange'] = moment(dty.settings.startDate).format('DD/MM/YYYY') + ' - '
              + moment(dty.settings.endDate).format('DD/MM/YYYY');
          }else{
            dataObj['dateRange'] = "";
          }
          if(dty.isLoading){
            dataObj['isLoading'] = true;
          }
          data.push(dataObj);
        }
      }

    const getCompareModal = () => {
      const selectedBacktests = {};
      for(let i=0; i<this.state.backtests.length; i++){
        if (this.state.selectedBacktests.indexOf(this.state.backtests[i]._id) > -1){
          selectedBacktests[this.state.backtests[i]._id] = 'Backtest ' + (i+1);
        }
      }
      return (
        <Modal
          title="Bactests compare"
          wrapClassName="vertical-center-modal"
          visible={this.state.backtestsCompareModalVisible}
          footer={null}
          onCancel={() => this.updateState({'backtestsCompareModalVisible': false})}
          className="attach-backtest-model no-padding" 
        >
          {(this.state.backtestsCompareModalVisible) ? (<Compare 
            selectedBacktests={selectedBacktests}
            strategy={this.state.strategy}
            />) : null}
        </Modal>
      );
    }

    const getTableButtons = () => {
      if (!this.state.loading){
        if (this.state.tableButtonsLoading){
          return(
            <div style={{'display': 'flex',
              'alignItems': 'center', 'justifyContent': 'center',
              'minWidth': '100px'}}>
              <Spin indicator={antIconLoading} />
            </div>
          );
        }else{
          return (
            <React.Fragment>
              {getCompareButton()}
              {getCompareModal()}
              {getDeleteButton()}
            </React.Fragment>
          );
        }
      }
    }

    const getCompareButton = () => {
      if (this.state.selectedBacktests && this.state.selectedBacktests.length > 1 &&
        this.state.selectedBacktests.length <= 5){
        return(
          <Button style={{'marginRight': '10px'}} type="primary" ghost
            onClick={()=>this.showcompareModal()}>
            Compare
          </Button>
        );
      }else{
        return(
          <Button style={{'marginRight': '10px'}} type="primary" ghost disabled>
            Compare
          </Button>
        );
      }
    }

    const getDeleteButton = () => {
      if (this.state.selectedBacktests && this.state.selectedBacktests.length > 0){
        return(
          <Button type="danger" ghost onClick={()=> {this.showDeleteConfirm('Are you sure you want to delete?',  this.state.selectedBacktests.length+' backtests will be deleted.')}}>
            <Icon type="delete" />Delete Selected
          </Button>
        );
      }else{
        return (
          <Button type="danger" ghost disabled>
            <Icon type="delete" />Delete Selected
          </Button>
        );
      }
    }

    const getBacktestsDiv = () => {
      if (this.state.loading){
        return (
          <div style={{'display': 'flex',
            'alignItems': 'center', 'justifyContent': 'center',
            'minHeight': '300px'}}>
            <Spin indicator={antIconLoading} />
          </div>
        );
      }else{
        return (
          <div>
            <Row>
              <Col md={12} sm={24}>
                <h2>All Backtests for {this.state.strategy.name}</h2>
              </Col>
              <Col md={12} sm={24}>
                <div style={{'display': 'flex', 'justifyContent': 'flex-end'}}>
                  {getTableButtons()}
                </div>
              </Col>
            </Row>
            <Table rowSelection={rowSelection} 
               dataSource={data} pagination={false} style={{'border': '1px solid #e1e1e1'}}
                onRow={(record) => {
                    return {
                      onClick: () => {
                        this.props.history.push('/research/backtests/'
                            +this.props.match.params.strategyId+'/'+record.key
                            +'?type=backtest&strategyName='+this.state.strategy.name
                            +'&backtestName='+record.name);
                      }
                    };
                  }
                }
            >
              {columns}
            </Table>
          </div>
        );
      }
    }

    const getBreadCrumbAllBacktests = () => {
      if (!this.state.loading){
        return(
          <Breadcrumb separator=">" className="location-breadcrumb">
              <Breadcrumb.Item>Research</Breadcrumb.Item>
              <Breadcrumb.Item><Link to="/research">All Strategies</Link></Breadcrumb.Item>
              <Breadcrumb.Item><Link to={"/research/strategy/"+this.state.strategy._id}>{this.state.strategy.name}</Link></Breadcrumb.Item>
              <Breadcrumb.Item className="last">All Backtests</Breadcrumb.Item>
          </Breadcrumb>
        );
      }
    }

    const getTotalDiv = () => {
      if (!this.state.loading){
        return (
          <div className="research-div" style={{'padding': '1% 3% 1% 3%', 'width': '100%', 'minHeight': 'calc(100vh - 70px)'}}>
            <div style={{'display': 'flex', 'marginBottom': '10px'}}>
              <div>
                <h2 style={{'color': '#3c3c3c', 'fontWeight': 'normal', 'margin': '0px'}}>All Backtests</h2>
                {getBreadCrumbAllBacktests()}
              </div>
            </div>
            <div className="card" style={{'width': '100%', 'background': 'white',
              'padding': '40px 5% 40px 5%'}}>
              {getBacktestsDiv()}
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

export default withRouter(StrategyBacktests);
