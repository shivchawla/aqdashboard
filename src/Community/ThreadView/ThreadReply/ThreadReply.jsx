import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Moment from 'react-moment';
import Utils from './../../../Utils';
import 'highlight.js/styles/atelier-cave-light.css';
import Highlight from './../../HighLight/Highlight.jsx';
import AttachedBackTest from './../AttachedBackTest/AttachedBackTest.jsx';


class ThreadReply extends Component {

    _mounted = false;

    constructor(props) {
        super();
        this.state = {
        };
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

        const getInitials = () => {
            return Utils.getInitials(_.get(this.props, 'replyData.user.firstName', ''), _.get(this.props, 'replyData.user.lastName', ''));
        }

        const getAttachmentDiv = () => {
            if (this.props.replyData.backtestId) {
                if (Utils.isLoggedIn()) {
                    return (
                        <React.Fragment>
                            <div style={{
                                'width': '100%', 'height': '1px', 'margin': '10px 0px 10px 0px',
                                'background': '#e1e1e1'
                            }}>
                            </div>
                            <AttachedBackTest backtestId={this.props.replyData.backtestId} />
                        </React.Fragment>
                    );
                } else {
                    return (
                        <h2 onClick={() => { Utils.goToLoginPage(this.props.history, window.location.href) }} style={{
                            'color': 'teal', 'fontSize': '14px',
                            'fontStyle': 'italic', 'fontWeight': '700', 'cursor': 'pointer'
                        }}>
                            Login to view attached backtest
            </h2>
                    );
                }
            }
        }

        return (
            <div className="card" style={{ 'padding': '20px', 'marginTop': '15px' }}>
                <Grid container style={{ 'marginTop': '15px' }}>
                    <Grid item xs={12}>
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
                                    {_.get(this.props, 'replyData.user.firstName', '') + " " + _.get(this.props, 'replyData.user.lastName', '')}
                                </p>
                                <p style={{
                                    'margin': '0px', 'color': '#646464',
                                    'fontWeight': '400', 'fontSize': '0.75em'
                                }}>
                                    on <Moment format="dddd, MMM DD, YYYY, hh:mm A">{this.props.replyData.updatedAt}</Moment>
                                </p>
                            </div>
                        </div>
                    </Grid>
                </Grid>
                <div style={{
                    'margin': '10px 0px', 'width': '100%',
                    'height': '1px', 'backgroundColor': '#E0E0E0'
                }}></div>
                <Highlight className='julia'>
                    <div className="post-markdown-text"
                        dangerouslySetInnerHTML={{ __html: this.props.replyData.markdownText }}
                        style={{ 'padding': '20px' }}>
                    </div>
                </Highlight>
                {getAttachmentDiv()}
            </div>
        );
    }
}

export default withRouter(ThreadReply);
