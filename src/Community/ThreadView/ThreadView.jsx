import React, { Component } from 'react';
import {withRouter, Link} from 'react-router-dom';
import axios from 'axios';
import { Spin, Icon, Row, Col, Button, Tag, Modal, Breadcrumb, message } from 'antd';
import Utils from './../../Utils';
import ThreadReply from './ThreadReply/ThreadReply.jsx';
import ThreadPost from './ThreadPost/ThreadPost.jsx';
import AvailableBackTests from './AvailableBackTests/AvailableBackTests.jsx';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {Footer} from '../../Footer/Footer';
import Loading from 'react-loading-bar'
import 'react-loading-bar/dist/index.css'

class ThreadView extends Component {

  _mounted = false;
  cancelGetThreadData = undefined;

  constructor(props){
  	super(); 
  	this.state = {
      "id": props.match.params.postId,
      "loading": true,
      "threadData": {},
      'userReply': '',
      'userReplyAttachedId': undefined,
      'showReplyPreview': false,
      'attachBackTestModalVisible': false,
      'followLoading': false
  	};

    this.getThreadData = () =>{
      this.setState({"loading": true});
      axios(Utils.getBaseUrl() + '/thread/'+this.state.id, {
        cancelToken: new axios.CancelToken( (c) => {
          // An executor function receives a cancel function as a parameter
          this.cancelGetThreadData = c;
        }),
        'headers': Utils.getAuthTokenHeader()
      })
       .then((response) => {
            this.updateState({
              'threadData': response.data,
              'loading': false
            });
            this.cancelGetThreadData = undefined;
            this.updatePostView();
          })
          .catch((error) => {
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
              if (error.response.status === 400 || error.response.status === 403) {
                this.props.history.push('/forbiddenAccess');
              }
              Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
              this.updateState({
                'threadData': error,
                'loading': false
              });
              this.cancelGetThreadData = undefined;
            }
          });
    }

    this.updatePostView = () => {
      axios({
                method: 'post',
                url: Utils.getBaseUrl() + '/thread/'+this.state.id+'/view',
                data: {
                  "threadId": this.state.id
                },
                'headers': Utils.getAuthTokenHeader()
              }, {
              cancelToken: new axios.CancelToken( (c) => {
              })
            })
            .then((response) => {
            })
            .catch((error) => {
            });
    }

    this.handleReplyChange = (data) => {
      if(data === '<p><br></p>'){
        data = '';
      }
      this.updateState({'userReply': data});
    }

    this.updateFollowers = (data) => {
      this.updateState(data);
    }

    this.postReply = () => {
      if (this.validatePost()){
        axios({
                method: 'post',
                url: Utils.getBaseUrl() + '/thread/'+this.state.id,
                data: {
                  "markdownText": this.state.userReply,
                  "backtestId": this.state.userReplyAttachedId
                },
                'headers': Utils.getAuthTokenHeader()
              }, {
              cancelToken: new axios.CancelToken( (c) => {
              })
            })
            .then((response) => {
                this.updateState({
                  'userReply': '',
                  'userReplyAttachedId': undefined,
                  'showReplyPreview': false,
                  'threadData': {
                    ...this.state.threadData,
                    'replies': [...this.state.threadData.replies, {
                      'user': Utils.getUserInfo(),
                      'updatedAt': new Date().toISOString(),
                      'markdownText': this.state.userReply,
                      'backtestId': this.state.userReplyAttachedId
                    }]
                  }
                });
            })
            .catch((error) => {
              Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            });
      }
    }

    this.attachBackTest = () =>{
        this.updateState({
          'attachBackTestModalVisible': true
        });
    }

    this.onBackTestClicked = (backtestId) =>{
      this.updateState({'attachBackTestModalVisible': false,
        'userReplyAttachedId': backtestId});
    }


    this.updateState = (data) =>{
      if (this._mounted){
        this.setState(data);
      }
    }

  }

  validatePost(){
    if((this.state.userReply && this.state.userReply.trim().length > 0) ||
          this.state.userReplyAttachedId){
      return true;
    }
    message.error('No preview available for empty reply. Please attach a backtest or enter some data.');
    return false;
  }

  componentDidMount(){
    this._mounted = true;
    if (this.props.pageChange){
      this.props.pageChange('community');
    }
    this.getThreadData();
  }

  componentWillUnmount(){
    this._mounted = false;
    if (this.cancelGetThreadData){
      this.cancelGetThreadData();
    }
  }

  render() {

    const antIconLoading = <Icon type="loading" style={{ fontSize: 24 }} spin />;

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


    const getThreadDetailsData = () =>{
      if (!this.state.loading){
        return(
          <ThreadPost threadData={this.state.threadData} followLoading={this.state.followLoading}
            updateFollowers={this.updateFollowers} />
        );
      }
    }


    const attachBackTestModal = () => {
      return (
        <Modal
          title="Attach BackTest"
          wrapClassName="vertical-center-modal"
          visible={this.state.attachBackTestModalVisible}
          footer={null}
          onCancel={() => this.updateState({'attachBackTestModalVisible': false})}
          className="attach-backtest-model" 
        >
          <AvailableBackTests style={{'height': '100%', 'width': '100%'}} onBackTestClicked={this.onBackTestClicked} />
        </Modal>
      );
    }


    

    const getAttachButtonDiv = () =>{
      if (this.state.userReplyAttachedId){
        return (
          <Tag color="#cc6666" closable 
            onClose={(e) => {e.preventDefault(); this.updateState({'userReplyAttachedId': undefined})}}>
            {this.state.userReplyAttachedId}
          </Tag>
        );
      }else{
        return (
          <Button onClick={() => {this.attachBackTest()}}>ATTACH
            <Icon style={{'transform': 'rotate(-45deg)'}} type="paper-clip" />
          </Button>
        );
      }
    }

    const getUserReplyDiv = () =>{
      if (Utils.isLoggedIn()){
        if (this.state.showReplyPreview){
          return(
            <div style={{'marginTop': '30px'}} >
              <ThreadReply replyData={{
                'user': Utils.getUserInfo(),
                'updatedAt': new Date().toISOString(),
                'markdownText': this.state.userReply,
                'backtestId': this.state.userReplyAttachedId
              }} />
            </div>
          );
        }else{
          return (
            <React.Fragment>
              <div style={{'display': 'flex', 'justifyContent': 'flex-end',
                  'marginTop': '40px'}}>
                {getAttachButtonDiv()}
                {attachBackTestModal()}
              </div>
              <ReactQuill placeholder="Write a post..." style={{'marginTop': '10px'}} className="card qlEditor" value={this.state.userReply}
                    onChange={this.handleReplyChange} modules={Utils.getReactQuillEditorModules()} />
            </React.Fragment>
          );
        }
      }else{
        return (
          <Button onClick={() => {Utils.goToLoginPage(this.props.history, window.location.href)}} style={{'marginTop': '25px'}}>Log In to Comment</Button>
        );
      }
    }

    const getUserReplyButtons = () =>{
      if (Utils.isLoggedIn()){
        if (this.state.showReplyPreview){
          return (
            <Row style={{'marginTop': '10px'}}>
              <Col span={24} style={{'textAlign': 'right'}}>
                <Button onClick={() => {this.updateState({'showReplyPreview': false})}} 
                  className="no-border-radius-button" size="small" type="primary"
                  style={{'marginRight': '15px'}}>
                  EDIT
                </Button>
                <Button onClick={this.postReply} className="no-border-radius-button" size="small" type="primary">
                  SUBMIT
                </Button>
              </Col>
            </Row>
          );
        }else{
          return (
            <Row style={{'marginTop': '10px'}}>
              <Col span={12}>
                <Button onClick={() => {if(this.validatePost()){this.updateState({'showReplyPreview': true})}}} className="no-border-radius-button" size="small" type="primary">
                  PREVIEW
                </Button>
              </Col>
              <Col span={12} style={{'textAlign': 'right'}}>
                <Button onClick={this.postReply} className="no-border-radius-button" size="small" type="primary">
                  POST REPLY
                </Button>
              </Col>
            </Row>
          );
        }
      }
    }

    const getBreadCrumbThreadView = () => {
      if(!this.state.loading){
        return(
          <Breadcrumb separator=">" className="location-breadcrumb">
              <Breadcrumb.Item><Link to="/community">Community</Link></Breadcrumb.Item>
              <Breadcrumb.Item className="last">{this.state.threadData.title}</Breadcrumb.Item>
          </Breadcrumb>
        );
      }
    }

    const getTotalDiv = () => {
      if (!this.state.loading){
        return (
          <div className="thread-view-div" style={{'padding': '1% 3% 1% 3%', 'width': '100%', 'minHeight': 'calc(100vh - 70px)'}}>
            <div style={{'display': 'flex', 'marginBottom': '10px'}}>
              <div>
                <h2 style={{'color': '#3c3c3c', 'fontWeight': 'normal', 'margin': '0px'}}>Post Detail</h2>
                {getBreadCrumbThreadView()}
              </div>
            </div>
            <div className="card" style={{'width': '100%', 'background': 'white',
              'padding': '40px 5% 40px 5%'}}>
              {getLoadingDiv()}
              {getThreadDetailsData()}
              {getUserReplyDiv()}
              {getUserReplyButtons()}
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

export default withRouter(ThreadView);
