import React, { Component } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Icon from '@material-ui/core/Icon';
import Chip from '../../../components/DataDisplay/Chip';
// import Chip from '@material-ui/core/Chip';
import { withRouter } from 'react-router-dom';
import Moment from 'react-moment';
import Utils from './../../../Utils';
class ThreadListItem extends Component {

    _mounted = false;

    constructor(props) {
        super();
        this.state = {
        };
        this.clickedThread = () => {
            props.history.push('/community/postDetail/' + props.threadData._id)
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

        const getInitials = () => {
            return Utils.getInitials(_.get(this.props, 'threadData.user.firstName', ''), _.get(this.props, 'threadData.user.lastName', ''));
        }

        const tags = [];
        if (this.props.threadData.tags) {
            for (let i = 0; i < this.props.threadData.tags.length; i++) {
                tags.push(
                    <Chip 
                        label={this.props.threadData.tags[i]}
                        style={{backgroundColor: '#cc6666', color: '#fff', margin: '0 5px'}}
                        key={i}
                    />
                )
            }
        }

        const getTags = () => {
            if (tags.length > 0) {
                return (
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
                );
            }
        }

        const getAttachmentIfExists = () => {
            let showAttachmentIcon = false;
            if (this.props.threadData.backtestId) {
                showAttachmentIcon = true;
            }
            if (!showAttachmentIcon && this.props.threadData.replies) {
                for (let i = 0; i < this.props.threadData.replies.length; i++) {
                    if (this.props.threadData.replies[i].backtestId) {
                        showAttachmentIcon = true;
                        break;
                    }
                }
            }
            if (showAttachmentIcon) {
                return (
                    <Icon
                            style={{
                                marginLeft: 'auto', 
                                color: '#cc4444', 
                                transform: 'rotate(90deg)',
                                fontSize: '24px',
                            }}
                    >
                        attach_file
                    </Icon>
                );
            } else {
                return (
                    null
                );
            }
        }

        let iconLeft = "message";
        if (this.props.threadData.category === "Share your Idea") {
            iconLeft = "wb_sunny";
        }

        return (
            <div 
                    className="card-1" 
                    style={{
                        width: '100%', 
                        marginTop: '20px',
                        borderRadius: '2px', 
                        padding: '15px 20px 10px 20px',
                        cursor: 'pointer',
                        boxSizing: 'border-box'
                    }}
                    onClick={this.clickedThread}
            >
                <div style={{ 'display': 'flex' }}>
                    <Icon
                       style={{
                            alignSelf: 'center', 
                            color: '#cc4444', 
                            fontWeight: 'bold'
                        }} 
                        size={34}
                    >
                        {iconLeft}
                    </Icon>
                    <div style={{ 'marginLeft': '10px' }}>
                        <PostName>{this.props.threadData.title}</PostName>
                        <p style={{
                            'margin': '0px', 'color': '#3c3c3c',
                            'fontSize': '0.9em', 'fontStyle': 'italic'
                        }}>
                            {this.props.threadData.category}
                        </p>
                    </div>
                    {getAttachmentIfExists()}
                </div>
                {getTags()}
                <div style={{
                    'margin': '10px 0px', 'width': '100%',
                    'height': '1px', 'backgroundColor': '#E0E0E0'
                }}></div>
                <div style={{ 'display': 'flex' }}>
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
                            <Moment format="dddd, MMM DD, YYYY, hh:mm A">{this.props.threadData.updatedAt}</Moment>
                        </p>
                    </div>
                    <div style={{ 'marginLeft': 'auto', 'display': 'flex' }}>
                        <p style={{color: '#515050'}}>Views: <span style={{ 'fontSize': '14px', 'fontWeight': '400' }}>{this.props.threadData.views}</span></p>
                        <p style={{ 'marginLeft': '10px', color: '#515050'}}>Replies: <span style={{ 'fontSize': '14px', 'fontWeight': '400' }}>{this.props.threadData.replies.length}</span></p>
                        <p style={{ 'marginLeft': '10px', color: '#515050'}}>Followers: <span style={{ 'fontSize': '14px', 'fontWeight': '400' }}>{this.props.threadData.followers.length}</span></p>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(ThreadListItem);

const PostName = styled.h3`
    font-size: 16px;
    font-weight: 400;
`;