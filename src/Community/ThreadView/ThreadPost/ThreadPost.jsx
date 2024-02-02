import React, { Component } from 'react';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Chip from '../../../components/DataDisplay/Chip';
import CircularProgress from '@mui/material/CircularProgress';    
import Utils from './../../../Utils';
import Moment from 'react-moment';
import ThreadReply from './../ThreadReply/ThreadReply.jsx';
import AttachedBackTest from './../AttachedBackTest/AttachedBackTest.jsx';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

class ThreadPost extends Component {

    _mounted = false;

    constructor(props) {
        super();
        this.state = {
            'isBackTestAvailable': true
        };

        this.clickedOnFollow = () => {
            if (!this.props.followActionDisabled) {
                if (Utils.isLoggedIn()) {
                    this.props.updateFollowers({
                        'followLoading': true
                    });
                    axios({
                        'method': 'post',
                        'url': Utils.getBaseUrl() + '/thread/' + this.props.threadData._id + '/follow',
                        'data': {},
                        'headers': Utils.getAuthTokenHeader()
                    })
                        .then((response) => {
                            let threadData = JSON.parse(JSON.stringify(this.props.threadData));
                            threadData.followers = response.data;
                            this.props.updateFollowers({
                                'threadData': threadData,
                                'followLoading': false
                            })
                        })
                        .catch((error) => {
                            this.props.updateFollowers({
                                'followLoading': false
                            })
                            if (error.response) {
                                Utils.checkForInternet(error, this.props.history);
                                Utils.goToErrorPage(error, this.props.history);
                                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.url);
                            }
                        });
                } else {
                    Utils.goToLoginPage(this.props.history, window.location.href);
                }
            }
        }

        this.isBackTestAvailable = (isAvailable) => {
            this.updateState({ 'isBackTestAvailable': isAvailable });
        }

        this.updateState = (data) => {
            if (this._mounted) {
                this.setState(data);
            }
        }
    }

    componentDidMount() {
        this._mounted = true;
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    render() {
        let iconLeft = "message";
        if (this.props.threadData.category === "Share your Idea") {
            iconLeft = "wb_sunny";
        }

        const tags = [];
        if (this.props.threadData.tags) {
            for (let i = 0; i < this.props.threadData.tags.length; i++) {
                tags.push(
                    <Chip 
                        label={this.props.threadData.tags[i]} 
                        style={{
                            backgroundColor: '#cc6666',
                            color: '#fff',
                            margin: '0 2px'
                        }}
                    />
                )
            }
        }

        const replies = [];
        if (this.props.threadData.replies) {
            for (let i = 0; i < this.props.threadData.replies.length; i++) {
                replies.push(<ThreadReply style={{ 'marginTop': '10px' }} key={i} replyData={this.props.threadData.replies[i]} />)
            }
        }

        const getFollowersCount = () => {
            if (this.props.threadData.followers) {
                return this.props.threadData.followers.length;
            } else {
                return 0;
            }
        }

        const getFollowButton = () => {
            const showUnFollow = Utils.isLoggedIn() && this.props.threadData.followers &&
                    this.props.threadData.followers.indexOf(Utils.getUserId()) > -1 &&
                    !this.props.followActionDisabled;

            return (
                <Button 
                        small
                        onClick={this.clickedOnFollow} 
                        style={{fontSize: '12px'}}
                        color={showUnFollow ? 'default' : 'primary'}
                        variant='outlined'
                >
                    {showUnFollow ? 'UN FOLLOW' : 'FOLLOW'}
                    {
                        this.props.followLoading && <CircularProgress size={20} />
                    }
                </Button>
            );
        }

        const getInitials = () => {
            return Utils.getInitials(_.get(this.props, 'threadData.user.firstName', ''), _.get(this.props, 'threadData.user.lastName', ''));
        }

        const getAttachmentDiv = () => {
            if (!Utils.isLoggedIn()) {
                return (
                    <h2 onClick={() => { Utils.goToLoginPage(this.props.history, window.location.href) }} style={{
                        'color': 'teal', 'fontSize': '14px',
                        'fontStyle': 'italic', 'fontWeight': '700', 'cursor': 'pointer'
                    }}>
                        Login to view attached backtest
            </h2>
                );
            } else if (Utils.isLoggedIn() && this.props.threadData.backtestId &&
                this.state.isBackTestAvailable) {
                return (
                    <React.Fragment>
                        <div style={{
                            'width': '100%', 'height': '1px', 'margin': '10px 0px 10px 0px',
                            'background': '#e1e1e1'
                        }}>
                        </div>
                        <AttachedBackTest backtestId={this.props.threadData.backtestId}
                            isBackTestAvailable={this.isBackTestAvailable} />
                    </React.Fragment>
                );
            }
        }

        const getRepliesDiv = () => {
            if (this.props.threadData.replies) {
                return (
                    <React.Fragment>
                        <p style={{
                            'fontSize': '1em', 'fontWeight': '700', 'color': '#4e4e4e',
                            'margin': '20px 0px 10px 0px'
                        }}>
                            REPLIES ({this.props.threadData.replies.length})
			            </p>
                        {replies}
                    </React.Fragment>
                );
            }
        }

        return (
            <div>
                <div className="card" style={{ 'padding': '20px' }}>
                    <Grid container>
                        <Grid item sm={12} md={6}>
                            <div style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                <KeyboardArrowLeftIcon
                                    style={{
                                        alignSelf: 'center', 
                                        fontSize: 34,
                                        color: '#cc4444', 
                                        fontWeight: 'bold'
                                    }} 
                                />
                                <div style={{ 'marginLeft': '10px' }}>
                                    <h3 style={{
                                        'margin': '0px', 'fontSize': '1.4em',
                                        'fontWeight': '700'
                                    }}>{this.props.threadData.title}</h3>
                                    <p style={{
                                        'margin': '0px', 'color': '#cc6666',
                                        'fontSize': '0.9em', 'fontStyle': 'italic'
                                    }}>
                                        {this.props.threadData.category}
                                    </p>
                                </div>
                            </div>
                        </Grid>
                        <Grid item sm={12} md={6}>
                            <div style={{
                                'display': 'flex', 'alignItems': 'center',
                                'justifyContent': 'flex-end'
                            }}>
                                <p style={{
                                    'margin': '0px 10px 0px 0px', 'fontSize': '0.8em',
                                    'color': '#24293d'
                                }}>Following: {getFollowersCount()}</p>
                                {getFollowButton()}
                            </div>
                        </Grid>
                    </Grid>
                    <Grid container style={{ 'marginTop': '15px' }}>
                        <Grid item sm={12} md={6}>
                            <div style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                <div style={{
                                    'borderRadius': '50%', 'border': '1px solid black',
                                    'alignSelf': 'center', 'height': '2.5em', 'width': '2.5em', 'display': 'flex',
                                    'justifyContent': 'center', 'alignItems': 'center'
                                }}>
                                    <h3 style={{ 'margin': '0px', 'fontWeight': 'normal' }}>
                                        {getInitials()}
                                    </h3>
                                </div>
                                <div style={{ 'marginLeft': '10px' }}>
                                    <p style={{
                                        'margin': '0px', 'color': '#646464',
                                        'fontWeight': '400', 'fontSize': '1.1em'
                                    }}>
                                        {_.get(this.props, 'threadData.user.firstName', '') + " " + _.get(this.props, 'threadData.user.lastName', '')}
                                    </p>
                                    <p style={{
                                        'margin': '0px', 'color': '#646464',
                                        'fontWeight': '400', 'fontSize': '0.75em'
                                    }}>
                                        on <Moment format="dddd, MMM DD, YYYY, hh:mm A">{this.props.threadData.updatedAt}</Moment>
                                    </p>
                                </div>
                            </div>
                        </Grid>
                        <Grid item sm={12} md={6}>
                            <div style={{
                                'display': 'flex', 'alignItems': 'center',
                                'justifyContent': 'flex-end'
                            }}>
                                <p style={{
                                    'margin': '0px 10px 0px 0px',
                                    'color': '#919191', 'fontSize': '0.8em'
                                }}>Tags: </p>
                                {tags}
                            </div>
                        </Grid>
                    </Grid>
                    <div style={{
                        'margin': '10px 0px', 'width': '100%',
                        'height': '1px', 'backgroundColor': '#E0E0E0'
                    }}></div>
                    <div className="post-markdown-text"
                        dangerouslySetInnerHTML={{ __html: this.props.threadData.markdownText }}
                        style={{ 'padding': '20px', 'color': 'black' }}>
                    </div>
                    {getAttachmentDiv()}
                </div>
                {getRepliesDiv()}
            </div>
        );
    }
}

export default ThreadPost;
