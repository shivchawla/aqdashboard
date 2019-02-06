import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import axios from 'axios';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Utils from './../../Utils';
import ThreadReply from './ThreadReply/ThreadReply.jsx';
import ThreadPost from './ThreadPost/ThreadPost.jsx';
import DialogComponent from '../../components/Alerts/DialogComponent';
import AvailableBackTests from './AvailableBackTests/AvailableBackTests.jsx';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AqDesktopLayout from '../../components/Layout/AqDesktopLayout';

class ThreadView extends Component {

    _mounted = false;
    cancelGetThreadData = undefined;

    constructor(props) {
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

        this.getThreadData = () => {
            this.setState({ "loading": true });
            axios(Utils.getBaseUrl() + '/thread/' + this.state.id, {
                cancelToken: new axios.CancelToken((c) => {
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
                url: Utils.getBaseUrl() + '/thread/' + this.state.id + '/view',
                data: {
                    "threadId": this.state.id
                },
                'headers': Utils.getAuthTokenHeader()
            }, {
                    cancelToken: new axios.CancelToken((c) => {
                    })
                })
                .then((response) => {
                })
                .catch((error) => {
                });
        }

        this.handleReplyChange = (data) => {
            if (data === '<p><br></p>') {
                data = '';
            }
            this.updateState({ 'userReply': data });
        }

        this.updateFollowers = (data) => {
            this.updateState(data);
        }

        this.postReply = () => {
            if (this.validatePost()) {
                axios({
                    method: 'post',
                    url: Utils.getBaseUrl() + '/thread/' + this.state.id,
                    data: {
                        "markdownText": this.state.userReply,
                        "backtestId": this.state.userReplyAttachedId
                    },
                    'headers': Utils.getAuthTokenHeader()
                }, {
                        cancelToken: new axios.CancelToken((c) => {
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

        this.attachBackTest = () => {
            this.updateState({
                'attachBackTestModalVisible': true
            });
        }

        this.onBackTestClicked = (backtestId) => {
            this.updateState({
                'attachBackTestModalVisible': false,
                'userReplyAttachedId': backtestId
            });
        }


        this.updateState = (data) => {
            if (this._mounted) {
                this.setState(data);
            }
        }

    }

    validatePost() {
        if ((this.state.userReply && this.state.userReply.trim().length > 0) ||
            this.state.userReplyAttachedId) {
            return true;
        }
        // message.error('No preview available for empty reply. Please attach a backtest or enter some data.');
        return false;
    }

    componentDidMount() {
        this._mounted = true;
        if (this.props.pageChange) {
            this.props.pageChange('community');
        }
        this.getThreadData();
    }

    componentWillUnmount() {
        this._mounted = false;
        if (this.cancelGetThreadData) {
            this.cancelGetThreadData();
        }
    }

    render() {
        const getLoadingDiv = () => {
            if (this.state.loading) {
                return (
                    <div className="height_width_full" style={{
                        'display': 'flex',
                        'alignItems': 'center', 'justifyContent': 'center',
                        'minHeight': '300px'
                    }}>
                        <CircularProgress size={22} />
                    </div>
                );
            }
        }


        const getThreadDetailsData = () => {
            if (!this.state.loading) {
                return (
                    <ThreadPost threadData={this.state.threadData} followLoading={this.state.followLoading}
                        updateFollowers={this.updateFollowers} />
                );
            }
        }


        const attachBackTestModal = () => {
            return (
                // <Modal
                //     title="Attach BackTest"
                //     wrapClassName="vertical-center-modal"
                //     visible={this.state.attachBackTestModalVisible}
                //     footer={null}
                //     onCancel={() => this.updateState({ 'attachBackTestModalVisible': false })}
                //     className="attach-backtest-model"
                // >
                //     <AvailableBackTests style={{ 'height': '100%', 'width': '100%' }} onBackTestClicked={this.onBackTestClicked} />
                // </Modal>
                <DialogComponent
                        title="Attach BackTest"
                        open={this.state.attachBackTestModalVisible}
                        onClose={() => this.updateState({ 'attachBackTestModalVisible': false })}
                        style={{
                            width: '90vw',
                            height: '100vh'
                        }}
                        maxWidth='xl'
                >
                    <AvailableBackTests 
                        style={{ 
                            height: '100%', 
                            width: '100%' 
                        }} 
                        onBackTestClicked={this.onBackTestClicked} 
                    />
                </DialogComponent>
            );
        }




        const getAttachButtonDiv = () => {
            if (this.state.userReplyAttachedId) {
                return (
                    <Chip 
                        label={this.state.userReplyAttachedId}
                        style={{
                            background: '#cc6666',
                            color: '#fff',
                        }}
                        onDelete={e => { 
                            e.preventDefault(); 
                            this.updateState({ 'userReplyAttachedId': undefined });
                        }}
                    />
                );
            } else {
                return (
                    <Button onClick={() => { this.attachBackTest() }}>
                        ATTACH<Icon>attach</Icon>
                    </Button>
                );
            }
        }

        const getUserReplyDiv = () => {
            if (Utils.isLoggedIn()) {
                if (this.state.showReplyPreview) {
                    return (
                        <div style={{ 'marginTop': '30px' }} >
                            <ThreadReply replyData={{
                                'user': Utils.getUserInfo(),
                                'updatedAt': new Date().toISOString(),
                                'markdownText': this.state.userReply,
                                'backtestId': this.state.userReplyAttachedId
                            }} />
                        </div>
                    );
                } else {
                    return (
                        <React.Fragment>
                            <div style={{
                                'display': 'flex', 'justifyContent': 'flex-end',
                                'marginTop': '40px'
                            }}>
                                {getAttachButtonDiv()}
                                {attachBackTestModal()}
                            </div>
                            <ReactQuill placeholder="Write a post..." style={{ 'marginTop': '10px' }} className="card qlEditor" value={this.state.userReply}
                                onChange={this.handleReplyChange} modules={Utils.getReactQuillEditorModules()} />
                        </React.Fragment>
                    );
                }
            } else {
                return (
                    <Button onClick={() => { Utils.goToLoginPage(this.props.history, window.location.href) }} style={{ 'marginTop': '25px' }}>Log In to Comment</Button>
                );
            }
        }

        const getUserReplyButtons = () => {
            if (Utils.isLoggedIn()) {
                if (this.state.showReplyPreview) {
                    return (
                        <Grid container style={{ 'marginTop': '10px' }}>
                            <Grid item xs={12} style={{ 'textAlign': 'right' }}>
                                <Button 
                                        onClick={() => { this.updateState({showReplyPreview: false })}}
                                        className="no-border-radius-button" 
                                        small
                                        color="primary"
                                        style={{marginRight: '15px' }}
                                >
                                    EDIT
                                </Button>
                                <Button 
                                        onClick={this.postReply} 
                                        className="no-border-radius-button" 
                                        small
                                        color="primary"
                                >
                                    SUBMIT
                                </Button>
                            </Grid>
                        </Grid>
                    );
                } else {
                    return (
                        <Grid container style={{ 'marginTop': '10px' }}>
                            <Grid item xs={6}>
                                <Button 
                                        onClick={() => { 
                                            if (this.validatePost()) {
                                                this.updateState({ 'showReplyPreview': true }); 
                                            } 
                                        }} 
                                        className="no-border-radius-button" 
                                        small
                                        color="primary"
                                >
                                    PREVIEW
                                </Button>
                            </Grid>
                            <Grid item xs={6} style={{ 'textAlign': 'right' }}>
                                <Button 
                                        onClick={this.postReply} 
                                        className="no-border-radius-button" 
                                        small
                                        color="primary"
                                >
                                    POST REPLY
                                </Button>
                            </Grid>
                        </Grid>
                    );
                }
            }
        }

        const getBreadCrumbThreadView = () => {
            if (!this.state.loading) {
                // return (
                //     <Breadcrumb separator=">" className="location-breadcrumb">
                //         <Breadcrumb.Item><Link to="/community">Community</Link></Breadcrumb.Item>
                //         <Breadcrumb.Item className="last">{this.state.threadData.title}</Breadcrumb.Item>
                //     </Breadcrumb>
                // );
                return null;
            }
        }

        const getTotalDiv = () => {
            return (
                <div 
                        className="thread-view-div" 
                        style={{ 
                            padding: '1% 3% 1% 3%', 
                            width: '100%', 
                            minHeight: 'calc(100vh - 70px)',
                            boxSizing: 'border-box'
                        }}
                >
                    <div style={{ 'display': 'flex', 'marginBottom': '10px' }}>
                        <div>
                            <h2 style={{ 'color': '#3c3c3c', 'fontWeight': 'normal', 'margin': '0px' }}>Post Detail</h2>
                            {getBreadCrumbThreadView()}
                        </div>
                    </div>
                    <div className="card" style={{
                        width: '100%', 
                        background: 'white',
                        padding: '40px 5%',
                        boxSizing: 'border-box'
                    }}>
                        {getLoadingDiv()}
                        {getThreadDetailsData()}
                        {getUserReplyDiv()}
                        {getUserReplyButtons()}
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

export default withRouter(ThreadView);
