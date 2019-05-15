import React, { Component } from 'react';
import axios from 'axios';
import Moment from 'react-moment';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ButtonBase from '@material-ui/core/ButtonBase';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Checkbox from '../components/Selections/Checkbox';
import {withRouter, Link} from 'react-router-dom';
import {withStyles} from '@material-ui/core/styles';
import NewStartegy from './NewStrategy/NewStrategy.jsx';
import DialogComponent from '../components/Alerts/DialogComponent';
import AqDesktopLayout from '../components/Layout/AqDesktopLayout';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import {StrategiesMeta} from '../metas';
import Utils from './../Utils';
import {horizontalBox, verticalBox, primaryColor} from '../constants';

const styles = theme => ({
    root: {
      flexGrow: 1,
    },
  });

class Research extends Component {

    _mounted = false;
    cancelGetStrategies = undefined;
    forwardTestsStopped = 0;
    strategiesDeleted = 0;

    constructor(props) {
        super();
        this.state = {
            loading: true,
            selectedStrategies: [],
            selectedLiveTests: [],
            allLiveTestsSelected: false,
            strategies: [],
            allSelected: false,
            stopForwardTestLoading: false,
            deleteStrategiesLoading: false,
            searchBoxOpen: false,
            oldSearchString: '',
            showNewStartegyDiv: false,
            showDeleteDialog: false
        };
        this.updateState = (data) => {
            if (this._mounted) {
                this.setState(data);
            }
        }

        this.getAllStrategies = (searchString) => {
            let urlString = Utils.getBaseUrl() + '/strategy';
            if (searchString && searchString.trim().length > 0) {
                urlString = urlString + "?search=" + encodeURIComponent(searchString);
            }
            axios(urlString, {
                cancelToken: new axios.CancelToken((c) => {
                    // An executor function receives a cancel function as a parameter
                    this.cancelGetStrategies = c;
                }),
                'headers': Utils.getAuthTokenHeader()
            })
                .then((response) => {
                    this.updateState({ 'strategies': response.data, 'loading': false });
                    this.cancelGetStrategies = undefined;
                })
                .catch((error) => {
                    Utils.checkForInternet(error, this.props.history);
                    if (error.response) {
                        Utils.goToErrorPage(error, this.props.history);
                        Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                    }
                    this.updateState({
                        'strategies': [],
                        'loading': false
                    });
                    this.cancelGetStrategies = undefined;
                });
        }

        this.strategyCheckBoxChange = (state, strategyId) => {
            let startegyIds = JSON.parse(JSON.stringify(this.state.selectedStrategies));
            let indexOfId = startegyIds.indexOf(strategyId);
            if (state) {
                if (indexOfId === -1) {
                    startegyIds.push(strategyId);
                }
                if (startegyIds.length === this.state.strategies.length) {
                    this.updateState({
                        'selectedStrategies': startegyIds,
                        'allSelected': true
                    });
                } else {
                    this.updateState({ 'selectedStrategies': startegyIds });
                }
            } else if (indexOfId >= 0) {
                startegyIds.splice(indexOfId, 1);
                this.updateState({
                    'selectedStrategies': startegyIds,
                    'allSelected': false
                });
            }

        }

        this.liveTestCheckBoxChange = (state, forwardTestId) => {
            let liveTestIds = JSON.parse(JSON.stringify(this.state.selectedLiveTests));
            let indexOfId = liveTestIds.indexOf(forwardTestId);
            if (state) {
                if (indexOfId === -1) {
                    liveTestIds.push(forwardTestId);
                }
                this.updateState({ 'selectedLiveTests': liveTestIds });
            } else if (indexOfId >= 0) {
                liveTestIds.splice(indexOfId, 1);
                this.updateState({
                    'selectedLiveTests': liveTestIds,
                    'allLiveTestsSelected': false
                });
            }

        }

        this.allStrategiesCheckboxChange = (e) => {
            let selectedStrategies = [];
            if (e.target.checked) {
                for (let i = 0; i < this.state.strategies.length; i++) {
                    selectedStrategies.push(this.state.strategies[i]._id);
                }
            }
            this.updateState({
                'selectedStrategies': selectedStrategies,
                'allSelected': e.target.checked
            });
        }

        this.allLiveTestsCheckBoxChange = (e) => {
            let selectedLiveTests = [];
            if (e.target.checked) {
                for (let i = 0; i < this.state.strategies.length; i++) {
                    if (this.state.strategies[i].forwardtest &&
                        this.state.strategies[i].forwardtest._id) {
                        selectedLiveTests.push(this.state.strategies[i].forwardtest._id);
                    }
                }
            }
            this.updateState({
                'selectedLiveTests': selectedLiveTests,
                'allLiveTestsSelected': e.target.checked
            });
        }

        this.updateLiveTestsState = () => {
            if (this.forwardTestsStopped === this.state.selectedLiveTests.length) {
                this.forwardTestsStopped = 0;
                let strategies = [];
                for (let i = 0; i < this.state.strategies.length; i++) {
                    let strategyLocal = JSON.parse(JSON.stringify(this.state.strategies[i]));
                    if (strategyLocal.forwardtest && this.state.selectedLiveTests.indexOf(strategyLocal.forwardtest._id) >= 0) {
                        strategyLocal.forwardtest.active = false;
                    }
                    strategies.push(strategyLocal);
                }
                this.updateState({
                    'stopForwardTestLoading': false,
                    'selectedLiveTests': [],
                    'strategies': strategies,
                    'allLiveTestsSelected': false
                });
            }
        }

        this.stopforwardTests = (forwardTestId) => {
            axios({
                method: 'PUT',
                url: Utils.getBaseUrl() + '/forwardtest/' + forwardTestId + '?active=false',
                'headers': Utils.getAuthTokenHeader()
            })
                .then((response) => {
                    this.forwardTestsStopped = this.forwardTestsStopped + 1;
                    this.updateLiveTestsState();
                })
                .catch((error) => {
                    this.forwardTestsStopped = this.forwardTestsStopped + 1;
                    this.updateLiveTestsState();
                });
        }

        this.stopAllSelectedForwardTests = () => {
            if (this.state.selectedLiveTests && this.state.selectedLiveTests.length > 0) {
                this.updateState({ 'stopForwardTestLoading': true });
                this.forwardTestsStopped = 0;
                for (let i = 0; i < this.state.selectedLiveTests.length; i++) {
                    this.stopforwardTests(this.state.selectedLiveTests[i]);
                }
            }
        }

        this.updateStrategiesDeleted = () => {
            if (this.strategiesDeleted === this.state.selectedStrategies.length) {
                this.strategiesDeleted = 0;
                let strategies = [];
                for (let i = 0; i < this.state.strategies.length; i++) {
                    let strategyLocal = JSON.parse(JSON.stringify(this.state.strategies[i]));
                    if (this.state.selectedStrategies.indexOf(strategyLocal._id) === -1) {
                        strategies.push(strategyLocal);
                    }
                }
                this.updateState({
                    deleteStrategiesLoading: false,
                    selectedStrategies: [],
                    strategies: strategies,
                    allSelected: false,
                    showDeleteDialog: false
                });
            }
        }

        this.deleteStrategy = (strategyId) => {
            axios({
                method: 'DELETE',
                url: Utils.getBaseUrl() + '/strategy/' + strategyId,
                'headers': Utils.getAuthTokenHeader()
            })
                .then((response) => {
                    this.strategiesDeleted = this.strategiesDeleted + 1;
                    this.updateStrategiesDeleted();
                })
                .catch((error) => {
                    this.strategiesDeleted = this.strategiesDeleted + 1;
                    this.updateStrategiesDeleted();
                });
        }

        this.deleteAllSelectedStrategies = () => {
            if (this.state.selectedStrategies && this.state.selectedStrategies.length > 0) {
                this.updateState({ 'deleteStrategiesLoading': true });
                this.strategiesDeleted = 0;
                for (let i = 0; i < this.state.selectedStrategies.length; i++) {
                    this.deleteStrategy(this.state.selectedStrategies[i]);
                }
            }
        }

        this.showDeleteConfirm = () => {
            const content = this.state.selectedStrategies.length + ' strategies will be deleted.';
            return (
                <DialogComponent
                        title='Are you sure you want to delete?'
                        open={this.state.showDeleteDialog}
                        onCancel={this.toggleDeleteDialog}
                        onOk={this.deleteAllSelectedStrategies}
                        action
                        hideClose
                >
                    {
                        this.state.deleteStrategiesLoading
                            ?   <div style={{...horizontalBox, justifyContent: 'center'}}>
                                    <CircularProgress size={22} />
                                </div>
                            :   <span>{content}</span>
                    }
                </DialogComponent>
            );
        }

        this.toggleDeleteDialog = () => {
            this.setState({showDeleteDialog: !this.state.showDeleteDialog});
        }

        this.showStopConfirm = () => {
            // Modal.confirm({
            //     title: "Are you sure you want to stop?",
            //     content: this.state.selectedLiveTests.length + ' live tests will be stopped.',
            //     okText: 'Yes',
            //     okType: 'danger',
            //     cancelText: 'No',
            //     onOk: () => {
            //         this.stopAllSelectedForwardTests();
            //     },
            //     onCancel: () => {
            //     },
            // });
            console.log('Show Stop Confirm');
        }

        this.onSearchKeyPressed = event => {
            if (event.key === 'Escape') {
                event.target.value = "";
                this.searchStrategies("");
            }
        }

        this.searchStrategies = (value) => {
            if (this.state.oldSearchString !== value) {
                this.updateState({
                    'strategies': [],
                    'loading': true,
                    'oldSearchString': value
                })
                this.getAllStrategies(value);
            }
        }
    }

    componentDidMount() {
        this._mounted = true;
        const params = new URLSearchParams(this.props.location.search);
        const token = params.get('token');
        // if (Utils.checkToken(token) && !Utils.isLoggedIn()) {
        //     Utils.autoLogin(token,this.props.history, this.props.match.url, () => {
        //       this.updateState({'loading': true});
        //       this.props.completeLogin();
        //       if (this._mounted){
        //         this.getAllStrategies(undefined);
        //       }
        //     });
        // } else {
        if (!Utils.isLoggedIn()) {
            Utils.goToLoginPage(this.props.history, window.location.href);
        } else {
            this.updateState({ 'loading': true });
            if (this._mounted) {
                this.getAllStrategies(undefined);
            }
            // }
        }
    }

    componentWillUnmount() {
        this._mounted = false;
        if (this.cancelGetStrategies) {
            this.cancelGetStrategies();
        }
    }

    render() {
        const getDeleteButton = () => {
            if (this.state.deleteStrategiesLoading) {
                return (
                    <div style={{
                        'display': 'flex',
                        'alignItems': 'center', 'justifyContent': 'center',
                        'minWidth': '100px'
                    }}>
                        {/* <Spin indicator={antIconLoading} /> */}
                        <CircularProgress size={22} />
                    </div>
                );
            } else if (this.state.selectedStrategies && this.state.selectedStrategies.length > 0) {
                return (
                    <Button 
                        variant='contained' 
                        color='primary' 
                        onClick={this.toggleDeleteDialog}
                        size='small'
                    >
                        <Icon>delete</Icon>
                        Delete Selected
                    </Button>
                );
            } else {
                return (
                    <Button 
                            variant='contained' 
                            color='primary' 
                            disabled 
                            size='small'
                    >
                        <Icon>delete</Icon>
                        Delete Selected
                    </Button>
                );
            }
        }

        const getDeleteButtonLiveTests = () => {
            let showStopButton = false;
            if (this.state.selectedLiveTests && this.state.selectedLiveTests.length > 0) {
                showStopButton = true;
                for (let i = 0; i < this.state.strategies.length; i++) {
                    if (this.state.strategies[i].forwardtest &&
                        this.state.strategies[i].forwardtest._id &&
                        this.state.selectedLiveTests.indexOf(this.state.strategies[i].forwardtest._id) > -1 &&
                        !this.state.strategies[i].forwardtest.active) {
                        showStopButton = false;
                    }
                }
            }
            if (this.state.stopForwardTestLoading) {
                return (
                    <div style={{
                        'display': 'flex',
                        'alignItems': 'center', 'justifyContent': 'center',
                        'minWidth': '100px'
                    }}>
                        <CircularProgress size={22} />
                    </div>
                );
            } else if (showStopButton) {
                return (
                    <Button 
                            variant='contained' 
                            color='primary' 
                            onClick={
                                () => {
                                    this.showStopConfirm();
                                }
                            }
                            size='small'
                    >
                        <Icon>cancel</Icon>
                        Stop selected
                </Button>
                );
            } else {
                return (
                    <Button 
                            variant='contained' 
                            color='primary' 
                            disabled
                            size='small'
                    >
                        <Icon>cancel</Icon>
                        Stop selected
                    </Button>
                );
            }
        }

        const getBackTestsButton = (numOfBacktests, strategyId) => {
            if (numOfBacktests > 0) {
                return (
                    <ButtonBase 
                            style={backtestButtonStyle}
                            onClick={() => {
                                this.props.history.push('/research/backtests/' + strategyId)
                            }}
                    >
                        Backtests ({numOfBacktests})
                    </ButtonBase>
                );
            } else {
                return (
                    <ButtonBase style={disabledButtonStyle} disabled>
                        Backtests (0)
                    </ButtonBase>
                );
            }
        }

        const getLiveTestStatus = (active, error, forwardTestId) => {
            if (error) {
                return (
                    <p style={{
                        'backgroundColor': '#bd362f',
                        'fontSize': '12px', 'fontWeight': '700',
                        'color': 'white', 'padding': '3px 6px', 'borderRadius': '2px'
                    }}>
                        ERROR
          </p>
                );
            } else if (active) {
                return (
                    <p style={{
                        'backgroundColor': '#339933',
                        'fontSize': '12px', 'fontWeight': '700',
                        'color': 'white', 'padding': '3px 6px', 'borderRadius': '2px'
                    }}>
                        RUNNING
          </p>
                );
            } else {
                return (
                    <p style={{
                        'backgroundColor': '#bd362f',
                        'fontSize': '12px', 'fontWeight': '700',
                        'color': 'white', 'padding': '3px 6px', 'borderRadius': '2px'
                    }}>
                        STOPPED
          </p>
                );
            }
        }

        const getLiveTestsDiv = () => {
            if (!this.state.loading) {
                const liveTests = [];
                for (let i = 0; i < this.state.strategies.length; i++) {
                    if (this.state.strategies[i].forwardtest &&
                        this.state.strategies[i].forwardtest._id) {
                        let liveTestLocal = JSON.parse(JSON.stringify(this.state.strategies[i].forwardtest));
                        liveTestLocal['fullName'] = this.state.strategies[i].fullName;
                        liveTests.push(liveTestLocal);
                    }
                }
                if (liveTests.length > 0) {
                    return (
                        <div 
                                style={{
                                    width: '100%', 
                                    boxSizing: 'border-box'
                                }}
                        >
                            <h2 
                                    style={{
                                        fontWeight: '700', 
                                        fontSize: '16px', 
                                        margin: '0px',
                                        marginLeft: '8px'
                                    }}
                            >
                                LIVE TESTS
                            </h2>
                            <Grid container alignItems="center">
                                <Grid item xs={6}>
                                    <Checkbox 
                                        onChange={this.allLiveTestsCheckBoxChange}
                                        checked={this.state.allLiveTestsSelected} 
                                        label='All Tests'
                                        labelStyle={{fontSize: '18px'}}
                                        color='primary'
                                    />
                                </Grid>
                                <Grid item xs={6} >
                                    <div style={{ 'display': 'flex', 'justifyContent': 'flex-end' }}>
                                        {getDeleteButtonLiveTests()}
                                    </div>
                                </Grid>
                            </Grid>
                            <div style={{
                                width: '100%',
                                boxSizing: 'border-box'
                            }}>
                                <Grid container>
                                    {
                                        liveTests.map((liveTest, index) => (
                                            <Grid
                                                    key={index} 
                                                    item xs={6} 
                                                    style={{
                                                        ...verticalBox, 
                                                        alignItems: 'flex-start', 
                                                        padding: '8px',
                                                        boxSizing: 'border-box',
                                                    }}
                                            >
                                                <LiveTestListItem 
                                                    item={liveTest}
                                                    liveTestCheckBoxChange={this.liveTestCheckBoxChange}
                                                    selectedLiveTests={this.state.selectedLiveTests}
                                                    getLiveTestStatus={getLiveTestStatus}
                                                    history={this.props.history}
                                                />
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                            </div>
                        </div>
                    );
                }
            }
        }

        const getNewStartegyModal = () => {
            return (
                <DialogComponent
                    title="Create Strategy"
                    open={this.state.showNewStartegyDiv}
                    onClose={() => this.updateState({ 'showNewStartegyDiv': false })}
                    maxWidth='xl'
                    style={{
                        width: '400px'
                    }}
                >
                    <NewStartegy
                        onCancel={() => this.updateState({ 'showNewStartegyDiv': false })}
                    />
                </DialogComponent>
            );
        }

        const getSearchTextAsNeeded = () => {
            if (this.state.oldSearchString && this.state.oldSearchString.trim().length > 0) {
                return (
                    <h3>Strategy results for &nbsp;
            <span style={{ 'color': 'teal' }}>
                            "{this.state.oldSearchString}"
            </span>
                    </h3>
                );
            }
        }

        const getStrategiesListDiv = () => {
            if (this.state.strategies && this.state.strategies.length > 0) {
                return (
                    <Grid container>
                        {
                            this.state.strategies.map((item, index) => (
                                <Grid
                                        key={index} 
                                        item xs={6} 
                                        style={{
                                            ...verticalBox, 
                                            alignItems: 'flex-start', 
                                            padding: '8px',
                                            boxSizing: 'border-box',
                                        }}
                                >
                                    <StrategyListItem
                                        index={index}
                                        item={item}
                                        getBackTestsButton={getBackTestsButton}
                                        selectedStrategies={this.state.selectedStrategies}
                                        strategyCheckBoxChange={this.strategyCheckBoxChange}
                                    />
                                </Grid>
                            ))
                        }
                    </Grid>
                );
            } else {
                return (
                    <div style={{
                        minHeight: '250px', 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%'
                    }}>
                        <h2>No Strategies yet!!&nbsp;
                            <span onClick={() => this.updateState({ 'showNewStartegyDiv': true })}
                                    style={{ 'cursor': 'pointer', 'color': 'teal' }}
                            >
                                Create New
                            </span>
                        </h2>
                    </div>
                );
            }
        }

        const getStrategiesDiv = () => {
            if (this.state.loading) {
                return (
                    <div style={{
                        'display': 'flex',
                        'alignItems': 'center', 'justifyContent': 'center',
                        'minHeight': '300px'
                    }}>
                        <CircularProgress size={22} />
                    </div>
                );
            } else {

                return (
                    <React.Fragment>
                        {this.showDeleteConfirm()}
                        {getSearchTextAsNeeded()}
                        <Grid 
                                container
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box'
                                }}
                        >
                            <Grid 
                                    item 
                                    xs={12}
                                    className='card'
                                    style={{
                                        borderRadius: '2px',
                                        marginBottom: '20px',
                                        padding: '15px'
                                    }}
                            >
                                {getLiveTestsDiv()}
                            </Grid>
                            <Grid 
                                    item 
                                    xs={12}
                                    className='card'
                                    style={{
                                        ...verticalBox,
                                        borderRadius: '2px',
                                        padding: '15px',
                                        alignItems: 'flex-start'
                                    }}
                            >
                                <h2 
                                        style={{
                                            fontWeight: '700', 
                                            fontSize: '16px', 
                                            margin: '0px',
                                            marginLeft: '8px'
                                        }}
                                >
                                    TEST STRATEGIES
                                </h2>
                                <Grid container alignItems="center">
                                    <Grid item xs={6}>
                                        <Checkbox 
                                                onChange={this.allStrategiesCheckboxChange}
                                                checked={this.state.allSelected}
                                                label='All Strategies'
                                                labelStyle={{
                                                    fontSize: '18px'
                                                }}
                                                color='primary'
                                        />
                                    </Grid>
                                    <Grid item xs={6} >
                                        <div style={{ 'display': 'flex', 'justifyContent': 'flex-end' }}>
                                            {getDeleteButton()}
                                        </div>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12}>
                                    {getStrategiesListDiv()}
                                </Grid>
                            </Grid>
                        </Grid>
                    </React.Fragment>
                );
            }
        }

        const getBreadCrumbAllStrategies = () => {
            const breadcrumbs = [
                {label: 'Research'},
                {label: 'All Strategies'},
            ];
            return <Breadcrumbs breadcrumbs={breadcrumbs} />;
        }

        const getTotalDiv = () => {
            return (
                <div 
                        className="research-div" 
                        style={{
                            width: '100%', 
                            minHeight: 'calc(100vh - 70px)',
                            padding: '1% 3%',
                            boxSizing: 'border-box'
                        }}
                >
                    <Grid container style={{ 'marginBottom': '10px' }} alignItems="center">
                        <Grid item xs={6} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                            <div>
                                <h2 
                                        style={{
                                            color: '#3c3c3c', 
                                            fontWeight: 'normal',
                                            marginBottom: 0,
                                            marginTop: 0
                                        }}
                                >
                                    All Strategies
                                </h2>
                                {getBreadCrumbAllStrategies()}
                            </div>
                        </Grid>
                        <Grid item xs={6} style={{ 'display': 'flex', 'justifyContent': 'flex-end', 'alignItems': 'center' }}>
                            <Button 
                                    color="primary" 
                                    style={{float: 'right', boxShadow: 'none'}}
                                    onClick={() => this.updateState({ 'showNewStartegyDiv': true })}
                                    variant='contained'
                            >
                                CREATE NEW
                            </Button>
                            {getNewStartegyModal()}
                        </Grid>
                    </Grid>
                    <div 
                            style={{
                                width: '100%', 
                                background: 'white',
                                boxSizing: 'border-box'
                            }}
                    >
                        {getStrategiesDiv()}
                    </div>
                </div>
            );
        }

        return (
            <AqDesktopLayout loading={this.state.loading}>
                <StrategiesMeta />
                {getTotalDiv()}
            </AqDesktopLayout>
        );
    }
}

export default withStyles(styles)(withRouter(Research));

const LiveTestListItem = ({
        item, 
        liveTestCheckBoxChange, 
        selectedLiveTests, 
        getLiveTestStatus, 
        history
}) => {
    return (
        <div
                onClick={() => history.push('/research/forwardtest/'+item.strategy._id+'/'+item._id+'?strategyName='+item.fullName)}
                style={{
                    ...horizontalBox, 
                    justifyContent: 'flex-start', 
                    alignItems: 'flex-start', 
                    width: '100%',
                    borderRadius: '2px',
                    border: '1px solid #e1e1e1',
                    padding: '10px 0',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                }}
        >
            <div onClick={e => e.stopPropagation()}>
                {
                    item.active
                    ?   <Checkbox 
                            style={{'fontSize': '18px'}}
                            onChange={e => {
                                e.stopPropagation();
                                liveTestCheckBoxChange(e.target.checked, item._id)
                            }}
                            checked={(selectedLiveTests.indexOf(item._id) >= 0) ? true : false}
                            color='primary' 
                        />
                    :   <Checkbox style={{'fontSize': '18px'}} disabled color='primary' />
                }
            </div>
            <Grid container alignItems="center">
                <Grid item xs={12} sm={6}>
                    <div style={{paddingLeft: '15px'}}>
                        <StrategyName>{item.fullName}</StrategyName>
                        <DateTimeText>
                            Created At: 
                            <Moment format="DD/MM/YYYY hh:mm A">
                                {item.createdAt}
                            </Moment>
                        </DateTimeText>
                    </div>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <div 
                            style={{
                                display: 'flex', 
                                justifyContent: 'flex-end', 
                                paddingRight: '15px'
                            }}
                    >
                        {getLiveTestStatus(item.active, item.error, item._id)}
                    </div>
                </Grid>
            </Grid>
        </div>
    );
}

const StrategyListItem = ({
        item, 
        getBackTestsButton, 
        selectedStrategies, 
        strategyCheckBoxChange, 
        hideBottomBorder = false
}) => {
    return (
        <div 
                style={{
                    ...horizontalBox, 
                    justifyContent: 'flex-start', 
                    alignItems: 'flex-start', 
                    width: '100%',
                    borderRadius: '2px',
                    border: '1px solid #e1e1e1',
                    padding: '10px 0',
                    boxSizing: 'border-box',
                }}
        >
            <Checkbox
                onChange={(e) => {strategyCheckBoxChange(e.target.checked, item._id)}}
                checked={(selectedStrategies.indexOf(item._id) >= 0) ? true : false}
                style={{marginTop: '-10px'}}
                color='primary'
            />
            <Grid container>
                <Grid item sm={6} xs={12}>
                    <div>
                        <StrategyLink to={'/research/strategy/' + item._id}>
                            {item.fullName}
                        </StrategyLink>
                        <DateTimeText 
                                style={{marginTop: '10px'}}
                        >
                            Created At:
                            <Moment format="DD/MM/YYYY hh:mm A">
                                {item.createdAt}
                            </Moment>
                        </DateTimeText>
                    </div>
                </Grid>
                <Grid sm={6} xs={12}>
                    <div style={{ 'display': 'flex', 'justifyContent': 'flex-end' }}>
                        {getBackTestsButton(item.numBacktests, item._id)}
                    </div>
                </Grid>
                <Grid item xs={12} style={{marginTop: '10px'}}>
                    <StrategyDescription>
                        {item.description}
                    </StrategyDescription>
                </Grid>
            </Grid>
        </div>
    );
}

const defaultButtonStyle = {
    fontSize: '10px',
    fontWeight: 700,
    borderRadius: '4px',
    padding: '8px',
    margin: '0 10px',
    marginTop: '8px',
    fontFamily: 'Lato, sans-serif',
    textTransform: 'uppercase',
};

const forwardTestButtonStyle = {
    ...defaultButtonStyle,
    border: `1px solid #388E3C`,
    color: '#388E3C'
};

const disabledButtonStyle = {
    ...defaultButtonStyle,
    border: '1px solid #aeaeae',
    color: '#aeaeae'
};

const backtestButtonStyle = {
    ...defaultButtonStyle,
    border: `1px solid ${primaryColor}`,
    color: primaryColor
}

const StrategyName = styled.h3`
    font-size: 16px;
    color: #000000d9;
    font-weight: 500;
    margin-bottom: 10px;
`;

const StrategyLink = styled(Link)`
    font-size: 16px;
    color: #000000d9;
    font-weight: 500;
    margin-bottom: 10px;
    text-decoration: none;
    &:hover {
        text-decoration: #000000d9;
    }
`;

const DateTimeText = styled.h3`
    font-size: 12px;
    font-weight: 400;
    color: #494949;
`;

const StrategyDescription = styled.h3`
    font-size: 14px;
    line-height: 1.5;
    color: #000000a6;
    font-weight: 400;
`;