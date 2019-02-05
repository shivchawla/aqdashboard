import React, { Component } from 'react';
import Utils from './../../Utils';
import {
    Tag, Row, Col, Radio, Modal, Button, Icon, Spin, Breadcrumb,
    message
} from 'antd';
import { withRouter, Link } from 'react-router-dom';
import AvailableBackTests from './../ThreadView/AvailableBackTests/AvailableBackTests.jsx';
import ReactQuill from 'react-quill';
import ThreadPost from './../ThreadView/ThreadPost/ThreadPost.jsx';
import axios from 'axios';
import { Footer } from '../../Footer/Footer';
import 'react-quill/dist/quill.snow.css';


class NewPost extends Component {

    _mounted = false;
    queryParams = undefined;

    constructor(props) {
        super();
        if (props.location.search) {
            this.queryParams = new URLSearchParams(props.location.search);
        }
        this.state = {
            'title': '',
            'tags': [],
            'selectedPostType': 'Share your Idea',
            'markDownText': '',
            'backtestId': undefined,
            'showReplyPreview': false,
            'attachBackTestModalVisible': false,
            'postLoading': false
        };
        if (this.queryParams) {
            this.state.backtestId = this.queryParams.get('attachedBacktestId');
        }

        if (!Utils.isLoggedIn()) {
            Utils.goToLoginPage(props.history, window.location.href);
        }

        this.titleChange = (event) => {
            this.updateState({
                'title': event.target.value
            })
        }

        this.handleAddTagKeyPress = (event) => {
            if (event.key === 'Enter' && event.target.value && event.target.value.trim().length > 0) {
                if (this.state.tags.length < 5) {
                    this.updateState({
                        'tags': [...this.state.tags, event.target.value.trim()]
                    })
                    event.target.value = '';
                } else {
                    message.error('Max 5 tags allowed.');
                }
            }
        }

        this.tagClosed = (index) => {
            let tags = JSON.parse(JSON.stringify(this.state.tags));
            if (index >= 0 && tags.length > index) {
                tags.splice(index, 1);
            }
            this.updateState({ 'tags': tags });
        }

        this.onPostTypeChange = (event) => {
            this.updateState({ 'selectedPostType': event.target.value });
        }

        this.onBackTestClicked = (batcktestId) => {
            this.updateState({ 'backtestId': batcktestId, 'attachBackTestModalVisible': false });
        }

        this.attachBackTest = () => {
            this.updateState({
                'attachBackTestModalVisible': true
            });
        }

        this.handleReplyChange = (data) => {
            if (data === '<p><br></p>') {
                data = '';
            }
            this.updateState({ 'markDownText': data });
        }

        this.createPost = () => {
            if (this.validatePost()) {
                this.updateState({ 'postLoading': true });
                axios({
                    'method': 'post',
                    'url': Utils.getBaseUrl() + '/thread',
                    'data': {
                        "category": this.state.selectedPostType,
                        "title": this.state.title,
                        "backtestId": this.state.backtestId,
                        "markdownText": this.state.markDownText,
                        "tags": this.state.tags
                    },
                    'headers': Utils.getAuthTokenHeader()
                })
                    .then((response) => {
                        this.props.history.push('/community/postDetail/' + response.data._id);
                    })
                    .catch((error) => {
                        Utils.checkForInternet(error, this.props.history);
                        if (error.response) {
                            if (error.response.status === 400 || error.response.status === 403) {
                                this.props.history.push('/forbiddenAccess');
                            }
                            Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                            this.updateState({
                                'postLoading': false
                            })
                        }
                    });
            }
        }

        this.updateState = (data) => {
            if (this._mounted) {
                this.setState(data);
            }
        }
    }

    validatePost() {
        if (this.state.title && this.state.title.trim().length > 0 &&
            ((this.state.markDownText && this.state.markDownText.trim().length > 0) ||
                this.state.backtestId)) {
            return true;
        }
        message.error('No preview available for empty post. Please create a valid post and a header.');
        return false;
    }

    componentDidMount() {
        this._mounted = true;
        if (this.props.pageChange) {
            this.props.pageChange('community');
        }
    }

    componentWillUnMount() {
        this._mounted = false;
    }


    render() {

        const antIconLoading = <Icon type="loading" style={{ fontSize: 24 }} spin />;

        const tags = [];
        for (let i = 0; i < this.state.tags.length; i++) {
            tags.push(<Tag closable color="#cc6666" key={i} onClose={(e) => { e.preventDefault(); this.tagClosed(i) }}>{this.state.tags[i]}</Tag>)
        }

        const RadioGroup = Radio.Group;

        const attachBackTestModal = () => {
            return (
                <Modal
                    title="Attach BackTest"
                    wrapClassName="vertical-center-modal"
                    visible={this.state.attachBackTestModalVisible}
                    footer={null}
                    onCancel={() => this.updateState({ 'attachBackTestModalVisible': false })}
                    className="attach-backtest-model"
                >
                    <AvailableBackTests style={{ 'height': '100%', 'width': '100%' }} onBackTestClicked={this.onBackTestClicked} />
                </Modal>
            );
        }

        const getAttachButtonDiv = () => {
            if (this.state.backtestId) {
                return (
                    <Tag color="#cc6666" closable
                        onClose={(e) => { e.preventDefault(); this.updateState({ 'backtestId': undefined }) }}>
                        Attached Backtest ID: {this.state.backtestId}
                    </Tag>
                );
            } else {
                return (
                    <Button onClick={() => { this.attachBackTest() }}>ATTACH
            <Icon style={{ 'transform': 'rotate(-45deg)' }} type="paper-clip" />
                    </Button>
                );
            }
        }

        const getUserReplyDiv = () => {
            if (this.state.showReplyPreview) {
                return (
                    <div style={{ 'marginTop': '30px' }} >
                        <ThreadPost threadData={{
                            'user': Utils.getUserInfo(),
                            'updatedAt': new Date().toISOString(),
                            'markdownText': this.state.markDownText,
                            'backtestId': this.state.backtestId,
                            'title': this.state.title,
                            'tags': this.state.tags,
                            'category': this.state.selectedPostType
                        }} followActionDisabled={true} />
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
                        <ReactQuill
                            placeholder="Write a post..."
                            style={{ 'marginTop': '10px' }}
                            className="card qlEditor"
                            value={this.state.markDownText}
                            onChange={this.handleReplyChange}
                            modules={Utils.getReactQuillEditorModules()}
                        />
                    </React.Fragment>
                );
            }
        }


        const getUserReplyButtons = () => {
            if (this.state.postLoading) {
                return (
                    <div style={{
                        'display': 'flex',
                        'alignItems': 'center', 'justifyContent': 'flex-end',
                        'minWidth': '100px'
                    }}>
                        <Spin indicator={antIconLoading} />
                    </div>
                );
            } else {
                if (this.state.showReplyPreview) {
                    return (
                        <Row style={{ 'marginTop': '10px' }}>
                            <Col span={24} style={{ 'textAlign': 'right' }}>
                                <Button onClick={() => { this.updateState({ 'showReplyPreview': false }) }}
                                    className="no-border-radius-button" size="small" type="primary"
                                    style={{ 'marginRight': '15px' }}>
                                    EDIT
                </Button>
                                <Button onClick={this.createPost} className="no-border-radius-button" size="small" type="primary">
                                    SUBMIT
                </Button>
                            </Col>
                        </Row>
                    );
                } else {
                    return (
                        <Row style={{ 'marginTop': '10px' }}>
                            <Col span={12}>
                                <Button onClick={() => { if (this.validatePost()) { this.updateState({ 'showReplyPreview': true }) } }} className="no-border-radius-button" size="small" type="primary">
                                    PREVIEW
                </Button>
                            </Col>
                            <Col span={12} style={{ 'textAlign': 'right' }}>
                                <Button onClick={this.createPost} className="no-border-radius-button" size="small" type="primary">
                                    CREATE POST
                </Button>
                            </Col>
                        </Row>
                    );
                }
            }
        }

        const getHeaderDiv = () => {
            if (!this.state.showReplyPreview) {
                return (
                    <React.Fragment>
                        <input value={this.state.title} type="text" style={{
                            'width': '100%',
                            'padding': '4px 10px 4px 10px', 'fontSize': '26px', 'color': '#cc6666',
                            'border': '1px solid #e1e1e1'
                        }} placeholder="Title"
                            onChange={this.titleChange} />
                        <Row type="flex" align="middle" style={{ 'marginTop': '15px', 'border': '1px solid #e1e1e1' }}>
                            <Col sm={24} md={12}>
                                <input type="text" style={{
                                    'width': '100%',
                                    'border': 'none', 'padding': '4px 10px 4px 10px'
                                }} placeholder="Add tags here"
                                    onKeyPress={this.handleAddTagKeyPress} />
                            </Col>
                            <Col sm={24} md={12}>
                                {tags}
                            </Col>
                        </Row>
                        <div style={{ 'marginTop': '5px' }}>
                            <p style={{ 'float': 'right', 'fontSize': '12px' }}>Add upto 5 tags</p>
                        </div>
                        <div style={{ 'marginTop': '20px', 'display': 'flex', 'alignItems': 'center' }}>
                            <p style={{ 'fontSize': '14px', 'margin': '0px 10px 0px 0px' }}>Post Type: </p>
                            <RadioGroup onChange={this.onPostTypeChange} value={this.state.selectedPostType}>
                                <Radio value={'Share your Idea'}>Share your Idea</Radio>
                                <Radio value={'Questions and Answers'}>Questions and Answers</Radio>
                            </RadioGroup>
                        </div>
                    </React.Fragment>
                );
            }
        }

        const getBreadcrumbNewPost = () => {
            return (
                <Breadcrumb separator=">" className="location-breadcrumb">
                    <Breadcrumb.Item><Link to="/community">Community</Link></Breadcrumb.Item>
                    <Breadcrumb.Item className="last">Create a Post</Breadcrumb.Item>
                </Breadcrumb>
            );
        }

        return (
            <React.Fragment>
                <div className="thread-view-div" style={{ 'padding': '1% 3% 1% 3%', 'width': '100%', 'minHeight': 'calc(100vh - 70px)' }}>
                    <Row style={{ 'marginBottom': '10px' }} type="flex" align="middle">
                        <Col span={12}>
                            <h2 style={{ 'color': '#3c3c3c', 'fontWeight': 'normal', 'margin': '0px' }}>Create a Post</h2>
                            {getBreadcrumbNewPost()}
                        </Col>
                        <Col span={12} style={{ 'display': 'flex', 'justifyContent': 'flex-end' }}>
                            {(this.state.showReplyPreview) ? getUserReplyButtons() : ''}
                        </Col>
                    </Row>
                    <div className="card" style={{
                        'width': '100%', 'background': 'white',
                        'padding': '40px 5% 40px 5%'
                    }}>
                        {getHeaderDiv()}
                        {getUserReplyDiv()}
                        {getUserReplyButtons()}
                    </div>
                </div>
                {
                    !this.state.loading &&
                    <Footer />
                }
            </React.Fragment>
        );
    }
}

export default withRouter(NewPost);
