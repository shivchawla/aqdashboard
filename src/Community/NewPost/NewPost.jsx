import React, { Component } from 'react';
import Utils from './../../Utils';
import Chip from '../../components/DataDisplay/Chip';
import Grid from '@material-ui/core/Grid';
import {NewPostMeta} from '../../metas';
import DialogComponent from '../../components/Alerts/DialogComponent';
import RadioGroup from '../../components/Selections/RadioGroup';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withRouter} from 'react-router-dom';
import SnackbarComponent from '../../components/Alerts/SnackbarComponent';
import AvailableBackTests from './../ThreadView/AvailableBackTests/AvailableBackTests.jsx';
import ReactQuill from 'react-quill';
import ThreadPost from './../ThreadView/ThreadPost/ThreadPost.jsx';
import Breadcrumbs from '../../components/UI/Breadcrumbs';
import axios from 'axios';
import AqLayoutDesktop from '../../components/Layout/AqDesktopLayout';
import 'react-quill/dist/quill.snow.css';

const postTypes = ['Share your Idea', 'Questions and Answers'];

class NewPost extends Component {

    _mounted = false;
    queryParams = undefined;

    constructor(props) {
        super();
        if (props.location.search) {
            this.queryParams = new URLSearchParams(props.location.search);
        }
        this.state = {
            title: '',
            tags: [],
            selectedPostType: 'Share your Idea',
            markDownText: '',
            backtestId: undefined,
            showReplyPreview: false,
            attachBackTestModalVisible: false,
            postLoading: false,
            snackbar: {
                open: false,
                message: ''
            }
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
                    this.openSnackbar('Max 5 tags allowed.');
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

        this.onPostTypeChange = (value) => {
            this.updateState({ 'selectedPostType': postTypes[value]});
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

    openSnackbar = (message = '') => {
        this.setState({
            snackbar: {open: true, message}
        })
    }

    closeSnackbar = () => {
        this.setState({
            snackbar: {...this.state.snackbar, open: false}
        });
    }

    validatePost() {
        if (this.state.title && this.state.title.trim().length > 0 &&
            ((this.state.markDownText && this.state.markDownText.trim().length > 0) ||
                this.state.backtestId)) {
            return true;
        }
        this.openSnackbar('No preview available for empty post. Please create a valid post and a header.');
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
        const tags = [];
        for (let i = 0; i < this.state.tags.length; i++) {
            tags.push(
                <Chip 
                    label={this.state.tags[i]}
                    key={i}
                    onDelete={e => {
                        e.preventDefault(); 
                        this.tagClosed(i); 
                    }}
                    style={{
                        background: '#cc6666',
                        color: '#fff',
                        margin: '0 2px'
                    }}
                />
            );
        }

        const attachBackTestModal = () => {
            return (
                <DialogComponent
                        title="Attach BackTest"
                        open={this.state.attachBackTestModalVisible}
                        onClose={() => this.updateState({ 'attachBackTestModalVisible': false })}
                        style={{
                            width: '90vw',
                            height: '76vh',
                            boxSizing: 'border-box'
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
            if (this.state.backtestId) {
                return (
                    <Chip 
                        label={`Attached Backtest ID: ${this.state.backtestId}`}
                        style={{
                            backgroundColor: '#cc6666',
                            color: '#fff'
                        }}
                        onDelete={e => {
                            e.preventDefault(); 
                            this.updateState({backtestId: undefined})
                        }}
                    />
                );
            } else {
                return (
                    <Button 
                            onClick={() => { this.attachBackTest() }}
                            variant='outlined'
                            size="small"
                    >
                        ATTACH<Icon style={{fontSize: '18px'}}>attach_file</Icon>
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
                        <CircularProgress size={22} />
                    </div>
                );
            } else {
                if (this.state.showReplyPreview) {
                    return (
                        <Grid container style={{ 'marginTop': '10px' }}>
                            <Grid item xs={12} style={{ 'textAlign': 'right' }}>
                                <Button 
                                        onClick={() => { this.updateState({ 'showReplyPreview': false }) }}
                                        className="no-border-radius-button" 
                                        small
                                        color="primary"
                                        style={{ 'marginRight': '15px' }}
                                        variant='contained'
                                >
                                    EDIT
                                </Button>
                                <Button 
                                        onClick={this.createPost} 
                                        className="no-border-radius-button" 
                                        small 
                                        color="primary"
                                        variant='contained'
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
                                        onClick={() => { if (this.validatePost()) { this.updateState({ 'showReplyPreview': true }) } }} 
                                        className="no-border-radius-button" 
                                        small
                                        color="primary"
                                        variant='contained'
                                >
                                    PREVIEW
                                </Button>
                            </Grid>
                            <Grid item xs={6} style={{ 'textAlign': 'right' }}>
                                <Button 
                                        onClick={this.createPost} 
                                        className="no-border-radius-button" 
                                        small
                                        color="primary"
                                        variant='contained'
                                >
                                    CREATE POST
                                </Button>
                            </Grid>
                        </Grid>
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
                        <Grid
                                container 
                                align="middle" 
                                style={{
                                    marginTop: '15px', 
                                    border: '1px solid #e1e1e1',
                                    padding: '4px'
                                }}
                        >
                            <Grid item sm={12} md={6}>
                                <input type="text" style={{
                                    'width': '100%',
                                    'border': 'none', 'padding': '4px 10px 4px 10px'
                                }} placeholder="Add tags here"
                                    onKeyPress={this.handleAddTagKeyPress} />
                            </Grid>
                            <Grid item sm={12} md={6}>
                                {tags}
                            </Grid>
                        </Grid>
                        <div style={{ 'marginTop': '5px' }}>
                            <p style={{ 'float': 'right', 'fontSize': '12px' }}>Add upto 5 tags</p>
                        </div>
                        <div style={{ 'marginTop': '20px', 'display': 'flex', 'alignItems': 'center' }}>
                            <p style={{ 'fontSize': '14px', 'margin': '0px 10px 0px 0px' }}>Post Type: </p>
                            <RadioGroup 
                                items={postTypes}
                                defaultSelected={0}
                                onChange={this.onPostTypeChange}
                                small
                            />
                        </div>
                    </React.Fragment>
                );
            }
        }

        const getBreadcrumbNewPost = () => {
            const breadcrumbs = [
                {url: '/community', label: 'Community'},
                {ur: '', label: 'Create a Post'}
            ];

            return (
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            );
        }

        return (
            <AqLayoutDesktop>
                <NewPostMeta />
                <SnackbarComponent 
                    openStatus={this.state.snackbar.open}
                    message={this.state.snackbar.message}
                    handleClose={this.closeSnackbar}
                    position='top'
                />
                <div 
                        className="thread-view-div" 
                        style={{ 
                            padding: '1% 3%', 
                            width: '100%', 
                            minHeight: 'calc(100vh - 70px)',
                            boxSizing: 'border-box'
                        }}
                >
                    <Grid 
                            container 
                            style={{ 'marginBottom': '10px' }} 
                            align="middle"
                    >
                        <Grid item xs={6}>
                            <h2 
                                    style={{ 
                                        color: '#3c3c3c', 
                                        fontWeight: 'normal', 
                                        margin: '0px',
                                        textAlign: 'start'
                                    }}
                            >
                                Create a Post
                            </h2>
                            {getBreadcrumbNewPost()}
                        </Grid>
                        <Grid 
                                item 
                                xs={6} 
                                style={{ 
                                    display: 'flex', 
                                    justifyContent: 'flex-end' 
                                }}
                        >
                            {(this.state.showReplyPreview) ? getUserReplyButtons() : ''}
                        </Grid>
                    </Grid>
                    <div 
                            className="card" 
                            style={{
                                width: '100%', 
                                background: 'white',
                                padding: '40px 5%',
                                boxSizing: 'border-box'
                            }}
                    >
                        {getHeaderDiv()}
                        {getUserReplyDiv()}
                        {getUserReplyButtons()}
                    </div>
                </div>
            </AqLayoutDesktop>
        );
    }
}

export default withRouter(NewPost);
