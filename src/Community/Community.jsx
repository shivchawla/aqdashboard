import React, { Component } from 'react';
import _ from 'lodash';
import ReactDOM from 'react-dom';
import axios from 'axios';
import {CommunityMeta} from '../metas';
import Utils from './../Utils';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import MultiRadioGroup from '../components/Selections/MultiRadioGroup';
import Search from './Search/Search.jsx';
import CommunityTabs from './CommunityTabs/CommunityTabs.jsx';
import ThreadList from './ThreadList/ThreadList.jsx';
import Pagination from './Pagination/Pagination.jsx';
import AqDesktopLayout from '../components/Layout/AqDesktopLayout';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import {communityTabsArray} from './CommunityTabs/constants';
// import 'react-loading-bar/dist/index.css';

class Community extends Component {

    _mounted = false;
    cancelGetAnnouncements = undefined;
    cancelGetThreads = undefined;
    recentPostObject = {
        'order_param': 'views',
        'skip': 0,
        'limit': 10,
        'following': false,
        'personal': false,
        'q': '',
        'category': ''
    };

    savedCommunityFilters = {
        'tab': Utils.getCommunityTab(),
        'checkboxes': Utils.getCommunityCheckBox(),
        'searchString': Utils.getCommunitySearchString()
    }
    searchStringCurrent = Utils.getCommunitySearchString();

    containerCard = null;

    constructor(props) {
        super();
        this.state = {
            'announcements': undefined,
            'selectedTabValue': 'popular',
            'threads': [],
            'loading': true,
            'mainLoading': true,
            'numberOfPages': 1,
            dataCount: 0,
            'page': 1
        };

        if (this.savedCommunityFilters.tab === 'newest' ||
            this.savedCommunityFilters.tab === 'popular') {
            this.state.selectedTabValue = this.savedCommunityFilters.tab;
        } else if (this.savedCommunityFilters.tab && Utils.isLoggedIn()) {
            this.state.selectedTabValue = this.savedCommunityFilters.tab;
        }

        if (!Utils.isLoggedIn()) {
            this.savedCommunityFilters['searchString'] = '';
        }


        this.getAnnouncementData = () => {
            axios(Utils.getAnnouncementUrl(), {
                cancelToken: new axios.CancelToken((c) => {
                    // An executor function receives a cancel function as a parameter
                    this.cancelGetAnnouncements = c;
                })
            })
            .then((response) => {
                this.updateState({ 'announcements': response.data.announcements });
                this.cancelGetAnnouncements = undefined;
            })
            .catch((error) => {
                console.log(error);
                Utils.checkForInternet(error, this.props.history);
                if (error.response) {
                    Utils.goToErrorPage(error, this.props.history);
                }
                this.cancelGetAnnouncements = undefined;
            });
        }
        this.clickedOnSearch = (searchString) => {
            if (searchString !== this.searchStringCurrent) {
                Utils.saveCommunitySearchString(searchString);
                this.searchStringCurrent = searchString;
                this.getThreads({ 'q': searchString });
                this.updateState({
                    'loading': true,
                    'threads': []
                });
            }
        }

        this.pageChanged = (newPage) => {
            if (newPage > 0) {
                this.handleScrollToTop();
                this.getThreads({ 'skip': ((newPage - 1) * 10) });
                this.updateState({
                    'loading': true,
                    'threads': [],
                    'page': newPage
                });
            }
        }

        this.onTabChanged = (e, value) => {
            const event = communityTabsArray[value];

            Utils.saveCommunityTab(event);
            if (event === 'newest') {
                this.getThreads({
                    'order_param': 'createdAt',
                    'following': false,
                    'personal': false,
                    'skip': 0
                });
                this.updateState({
                    'loading': true,
                    'order_param': 'createdAt',
                    'selectedTabValue': event,
                    'following': false,
                    'personal': false,
                    'numberOfPages': 1,
                    'page': 1,
                    'threads': []
                });
            } else if (event === 'popular') {
                this.getThreads({
                    'order_param': 'views',
                    'following': false,
                    'personal': false,
                    'skip': 0
                });
                this.updateState({
                    'loading': true,
                    'order_param': 'views',
                    'selectedTabValue': event,
                    'following': false,
                    'personal': false,
                    'numberOfPages': 1,
                    'page': 1,
                    'threads': []
                });
            } else if (event === 'following') {
                this.getThreads({
                    'order_param': '',
                    'following': true,
                    'personal': false,
                    'skip': 0
                });
                this.updateState({
                    'loading': true,
                    'order_param': '',
                    'selectedTabValue': event,
                    'following': true,
                    'personal': false,
                    'numberOfPages': 1,
                    'page': 1,
                    'threads': []
                });
            } else if (event === 'personal') {
                this.getThreads({
                    'personal': true,
                    'order_param': '',
                    'following': false,
                    'skip': 0
                });
                this.updateState({
                    'loading': true,
                    'order_param': '',
                    'selectedTabValue': event,
                    'following': false,
                    'personal': true,
                    'numberOfPages': 1,
                    'page': 1,
                    'threads': []
                });
            }
        }

        this.updateThreads = (threads, dataCount) => {
            if (this._mounted) {
                if (threads) {
                    let numberOfPages = 0;
                    if (dataCount) {
                        numberOfPages = Math.floor(dataCount / 10);
                    }
                    // numberOfPages++;
                    this.updateState({ 'threads': threads, 'loading': false, 'mainLoading': false, 'numberOfPages': numberOfPages, dataCount});
                    // if (numberOfPages) {
                        
                    // } else {
                    //     this.updateState({ 'threads': threads, 'loading': false, 'mainLoading': false, 'numberOfPages': 1, dataCount});
                    // }
                } else {
                    this.updateState({ 'loading': false, 'mainLoading': false });
                }
            }
        }

        this.categorySelectionChange = (selectedItems) => {
            let categoryCheckBoxOptions = ['All', 'Ideas', 'Questions', 'News'];
            const checkedList = selectedItems.map(item => {
                return categoryCheckBoxOptions[item];
            })
            let category = '';
            if (checkedList.indexOf('All') === -1 && checkedList.length < 3) {
                if (checkedList.indexOf('Ideas') > -1) {
                    if (category.length > 0) {
                        category = category + ' | Share your Idea';
                    } else {
                        category = category + 'Share your Idea';
                    }
                }
                if (checkedList.indexOf('Questions') > -1) {
                    if (category.length > 0) {
                        category = category + ' | Questions and Answers';
                    } else {
                        category = category + 'Questions and Answers';
                    }
                }
                if (checkedList.indexOf('News') > -1) {
                    if (category.length > 0) {
                        category = category + ' | News and Announcements';
                    } else {
                        category = category + 'News and Announcements';
                    }
                }
                Utils.saveCommunityCheckBox(category);
                this.getThreads({ 'category': category });
            } else {
                Utils.saveCommunityCheckBox('');
                this.getThreads({ 'category': '' });
            }
        }

        this.getThreads = (data) => {
            for (let key in data) {
                this.recentPostObject[key] = data[key];
            }
            let url = Utils.getBaseUrl() + '/thread_default?order=-1&order_param=' + this.recentPostObject['order_param'];
            if (Utils.isLoggedIn()) {
                url = 'order=-1';
                for (let key in this.recentPostObject) {
                    if (url.length > 0) {
                        url = url + '&';
                    }
                    url = url + key + '=' + encodeURIComponent(this.recentPostObject[key]);
                }
                url = Utils.getBaseUrl() + '/thread?' + url;
            }
            axios(url, {
                cancelToken: new axios.CancelToken((c) => {
                    // An executor function receives a cancel function as a parameter
                    this.cancelGetThreads = c;
                }),
                'headers': Utils.getAuthTokenHeader()
            })
                .then((response) => {
                    if (response.data.threads) {
                        this.updateThreads(response.data.threads, response.data.count);
                    } else {
                        this.updateThreads();
                    }
                    this.cancelGetThreads = undefined;
                })
                .catch((error) => {
                    Utils.checkForInternet(error, this.props.history);
                    if (error.response) {
                        Utils.goToErrorPage(error, this.props.history);
                    }
                    this.updateThreads();
                    this.cancelGetThreads = undefined;
                });
        }

        this.updateState = (data) => {
            if (this._mounted) {
                this.setState(data);
            }
        }
    }


    getOrderParam(tabKey) {
        if (tabKey === 'newest') {
            return {
                'order_param': 'createdAt',
                'following': false,
                'personal': false
            };
        } else if (tabKey === 'popular') {
            return {
                'order_param': 'views',
                'following': false,
                'personal': false
            };
        } else if (tabKey === 'following') {
            return {
                'order_param': '',
                'following': true,
                'personal': false
            };
        } else if (tabKey === 'personal') {
            return {
                'personal': true,
                'order_param': '',
                'following': false
            };
        }
    }

    componentDidMount() {
        this._mounted = true;
        const params = new URLSearchParams(this.props.location.search);
        // const token = params.get('token');
        // if (Utils.checkToken(token) && !Utils.isLoggedIn()) {  
        //   Utils.autoLogin(token,this.props.history, this.props.url, () => {
        //     this.props.completeLogin();
        //   });
        // } 
        this.getAnnouncementData();
        let overridePost = {};
        if (this.state.selectedTabValue) {
            overridePost = this.getOrderParam(this.state.selectedTabValue);
        } else {
            overridePost['order_param'] = 'views';
        }
        if (this.savedCommunityFilters.searchString) {
            overridePost['q'] = this.savedCommunityFilters.searchString;
        }
        if (this.savedCommunityFilters.checkboxes) {
            overridePost['category'] = this.savedCommunityFilters.checkboxes;
        }
        this.getThreads(overridePost);
    }

    componentWillUnmount() {
        this._mounted = false;
        if (this.cancelGetAnnouncements) {
            this.cancelGetAnnouncements();
        }
        if (this.cancelGetThreads) {
            this.cancelGetThreads();
        }
    }

    handleScrollToTop = () =>{
        const node = ReactDOM.findDOMNode(this.containerCard)
        if (node){
          window.scrollTo(0, node.offsetTop);
        }
      }

    render() {

        const getListDivSize = () => {
            if (this.state.announcements) {
                return 9;
            } else {
                return 12;
            }
        }

        const getAnnouncementData = () => {
            if (this.state.announcements) {
                let data = "";
                for (let i = 0; i < this.state.announcements.length; i++) {
                    let ann = this.state.announcements[i].announcement;
                    for (let j = 0; j < ann.length; j++) {
                        data = data + ann[j];
                    }
                }
                return <div dangerouslySetInnerHTML={{ __html: data }}></div>;
            }
        }

        const categoryCheckBoxOptions = ['All', 'Ideas', 'Questions', 'News'];

        const getCheckBoxDefaultSelection = () => {
            let returnData = [];
            if (this.savedCommunityFilters.checkboxes) {
                if (this.savedCommunityFilters.checkboxes.indexOf('Share your Idea') >= 0) {
                    returnData.push(1);
                }
                if (this.savedCommunityFilters.checkboxes.indexOf('Questions and Answers') >= 0) {
                    returnData.push(2);
                }
                if (this.savedCommunityFilters.checkboxes.indexOf('News and Announcements') >= 0) {
                    returnData.push(3);
                }
            }
            if (returnData.length === 0 || returnData.length >= 3) {
                returnData = [0];
            }
            return returnData;
        }

        const getCheckBoxGroup = () => {
            if (Utils.isLoggedIn()) {
                return (
                    <MultiRadioGroup 
                        items={categoryCheckBoxOptions}
                        onChange={this.categorySelectionChange} 
                        defaultSelected={getCheckBoxDefaultSelection()}
                        small
                        style={{display: 'flex'}}
                    />
                );
            }
        }

        const getBreadCrumbCommunity = () => {
            const breadcrumbs = [
                {url: '', label: 'Community'}
            ];
            return (
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            );
        }

        const getSearchTextAsNeeded = () => {
            if (this.searchStringCurrent && this.searchStringCurrent.trim().length > 0) {
                return (
                    <h3 style={{ 'margin': '15px 0px', 'borderBottom': '1px solid #e1e1e1' }}>Search results for &nbsp;
            <span style={{ 'color': 'rgba(0, 0, 0, 0.6' }}>
                            "{this.searchStringCurrent}"
            </span>
                    </h3>
                );
            }
        }

        const getTotalDiv = () => {
            return (
                <div 
                        style={{ 
                            padding: '0px', 
                            width: '100%', 
                            minHeight: 'calc(100vh - 70px)' 
                        }}
                >
                    <div 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                padding: '1% 3%',
                                boxSizing: 'border-box' 
                            }}
                    >
                        <div style={{ 'display': 'flex', 'marginBottom': '10px' }}>
                            <div>
                                <h2 style={{ 'color': '#3c3c3c', 'fontWeight': 'normal', 'margin': '0px' }}>Community</h2>
                                {getBreadCrumbCommunity()}
                            </div>
                            <Button 
                                    type="primary" 
                                    color = "primary"
                                    variant="contained"
                                    onClick={() => this.props.history.push('/community/newPost')}
                                    style={{marginLeft: 'auto', height: '35px'}}
                            >
                                New Post
                            </Button>
                        </div>
                        <div 
                                className="card"
                                style={{ 
                                    height: 'calc(100% - 40px)', 
                                    width: '100%', 
                                    background: 'white' 
                                }}
                                ref={el => this.containerCard = el}
                        >
                            <Grid 
                                    container 
                                    style={{ 'height': '100%' }}
                            >
                                <Grid 
                                        item 
                                        xs={12} 
                                        sm={12} 
                                        md={getListDivSize()} 
                                        lg={getListDivSize()} 
                                        xl={getListDivSize()} 
                                        style={{ 'height': '100%' }}
                                >
                                    <div 
                                            className="height_width_full" 
                                            style={{ 
                                                padding: '2% 2% 2% 6%',
                                                boxSizing: 'border-box'
                                            }}
                                    >
                                        <Search clickedOnSearch={this.clickedOnSearch}
                                            searchDefaultValue={this.savedCommunityFilters.searchString} />
                                        {getSearchTextAsNeeded()}
                                        <div style={{ 'height': 'calc(100% - 50px)' }}>
                                            <CommunityTabs 
                                                    onTabChanged={this.onTabChanged} 
                                                    selectedTabValue={this.state.selectedTabValue} 
                                            />
                                            {getCheckBoxGroup()}
                                            <ThreadList loading={this.state.loading} threads={this.state.threads} />
                                        </div>
                                        <Pagination 
                                            page={this.state.page} 
                                            onpageChanged={this.pageChanged} 
                                            numberOfPages={this.state.numberOfPages} 
                                            dataCount={this.state.dataCount}
                                        />
                                    </div>
                                </Grid>
                                <Grid 
                                        item
                                        xs={0} 
                                        sm={0} 
                                        md={12 - getListDivSize()} 
                                        lg={12 - getListDivSize()} 
                                        xl={12 - getListDivSize()} 
                                        style={{ 'height': '100%' }}
                                >
                                    <div 
                                            className="height_width_full center-content" 
                                            style={{ 
                                                padding: '25% 10% 10% 0px',
                                                boxSizing: 'border-box'
                                            }}
                                    >
                                        <div 
                                                className="card announcement" 
                                                style={{
                                                    width: '100%', 
                                                    padding: '15px', 
                                                    maxHeight: '60%',
                                                    overflowY: 'auto'
                                                }}
                                        >
                                            <h2 
                                                    style={{ 
                                                        color: 'teal',
                                                        fontSize: '22px',
                                                        fontWeight: '500' 
                                                    }}
                                            >
                                                ANNOUNCEMENT
                                            </h2>
                                            {getAnnouncementData()}
                                        </div>
                                    </div>
                                </Grid>
                            </Grid>
                        </div>
                    </div>
                </div>
            );
        }


        return (
            <AqDesktopLayout loading={this.state.mainLoading}>
                <CommunityMeta />
                {getTotalDiv()}
            </AqDesktopLayout>
        );
    }
}

export default Community;
