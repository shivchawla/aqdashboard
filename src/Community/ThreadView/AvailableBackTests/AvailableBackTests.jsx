import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import BackTests from './../../BackTests/BackTests.jsx';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import { Tabs, Tab, TabPanel, TabList } from 'react-web-tabs';
import Utils from './../../../Utils';
import axios from 'axios';
import 'react-web-tabs/dist/react-web-tabs.css';

class AvailableBackTests extends React.Component {

    _mounted = false;
    cancelGetStrategies = undefined;
    cancelGetBacktests = undefined;
    selectedStrategyName = '';

    constructor(props) {
        super()
        this.state = {
            'strategies': [],
            'loadingStrategy': true,
            'backtests': [],
            'loadingBackTests': false,
            'selectedBacktestId': undefined
        };

        this.onTabChanged = (tabId) => {
            const { strategies = [] } = this.state;
            const strategyIndex = _.findIndex(strategies, backtest => backtest._id === tabId);
            if (strategyIndex > -1) {
                this.selectedStrategyName = this.state.strategies[strategyIndex].name;
                this.updateState({ 'selectedBacktestId': undefined });
                this.getBacktests(this.state.strategies[strategyIndex]._id);
            }
        }

        this.getAllStrategies = () => {
            this.updateState({
                'loadingStrategy': true,
                'strategies': [],
                'loadingBackTests': false,
                'backtests': []
            })
            axios(Utils.getBaseUrl() + '/strategy', {
                cancelToken: new axios.CancelToken((c) => {
                    this.cancelGetStrategies = c;
                }),
                'headers': Utils.getAuthTokenHeader()
            })
                .then((response) => {
                    this.updateState({ 'strategies': response.data, 'loadingStrategy': false });
                    this.cancelGetStrategies = undefined;
                })
                .catch((error) => {
                    Utils.checkForInternet(error, this.props.history);
                    if (error.response) {
                        if (error.response.status === 400 || error.response.status === 403) {
                            this.props.history.push('/forbiddenAccess');
                        }
                        Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                        this.cancelGetThreadData = undefined;
                    }
                    this.updateState({ 'loadingStrategy': false });
                    this.cancelGetStrategies = undefined;
                });
        }

        this.getBacktests = (strategyId) => {
            this.updateState({
                'loadingBackTests': true,
                'backtests': []
            });
            axios(Utils.getBaseUrl() + '/strategy/' + strategyId + '/backtests?skip=0&limit=0', {
                cancelToken: new axios.CancelToken((c) => {
                    this.cancelGetBacktests = c;
                }),
                'headers': Utils.getAuthTokenHeader()
            })
                .then((response) => {
                    this.updateState({ 'backtests': response.data, 'loadingBackTests': false });
                    this.cancelGetBacktests = undefined;
                })
                .catch((error) => {
                    Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                    this.updateState({ 'loadingBackTests': false });
                    this.cancelGetBacktests = undefined;
                });
        }

        this.onBackTestClicked = () => {
            const backTestId = this.state.selectedBacktestId;
            if (this.props.onBackTestClicked) {
                this.props.onBackTestClicked(backTestId);
            }
        }

        this.updateState = (data) => {
            if (this._mounted) {
                this.setState(data);
            }
        }

    }

    componentDidMount() {
        this._mounted = true;
        this.getAllStrategies();
    }

    componentWillUnmount() {
        this._mounted = false;
        if (this.cancelGetStrategies) {
            this.cancelGetStrategies();
        }
    }

    render() {
        const TabPane = Tabs.TabPane;
        const getStrategyDiv = () => {
            if (this.state.loadingStrategy) {
                return (
                    <div style={{
                        'display': 'flex',
                        'alignItems': 'center', 'justifyContent': 'center',
                        'width': '100%', 'height': 'calc(100% - 25px)'
                    }}>
                        <CircularProgress size={22} />
                    </div>
                );
            } else {
                const tabs = [], tabsPanel = [];
                for (let i = 0; i < this.state.strategies.length; i++) {
                    tabs.push(
                        <Tab tabFor={this.state.strategies[i]._id}>{this.state.strategies[i].name}</Tab>
                    );
                }
                for (let j = 0; j < this.state.strategies.length; j++) {
                    tabsPanel.push(
                        <TabPanel tabId={this.state.strategies[j]._id} />
                    );
                }

                return (
                    <Tabs
                        vertical
                        onChange={this.onTabChanged}
                    >
                        <TabList>{tabs}</TabList>
                        {tabsPanel}
                    </Tabs>
                );
            }
        }

        const getBackTestsDiv = () => {
            if (this.state.loadingBackTests) {
                return (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                        }}
                    >
                        <CircularProgress size={24} />
                    </div>
                );
            } else if (!this.state.loadingStrategy) {
                return (
                    <React.Fragment>
                        <h1 style={{ 'fontSize': '16px', 'fontWeight': 'bold'}}>Backtests for {this.selectedStrategyName}</h1>
                        <BackTests
                            backtests={this.state.backtests}
                            onBackTestClicked={(backtestId) => this.updateState({ 'selectedBacktestId': backtestId })}
                        />
                    </React.Fragment>
                );
            }
        }


        return (
            <div
                style={{
                    width: '100%',
                    boxSizing: 'border-box'
                }}
            >
                <div style={{ 'display': 'flex', 'justifyContent': 'flex-end' }}>
                    <Button
                        color="primary"
                        disabled={!this.state.selectedBacktestId}
                        onClick={this.onBackTestClicked}
                        variant='contained'
                    >
                        Attach
                    </Button>
                </div>
                <Grid container>
                    <Grid item xs={3} style={{ 'height': '100%' }}>
                        <h1 style={{ 'fontSize': '16px', 'fontWeight': 'bold' }}>Strategy</h1>
                        <div style={{overflowY: 'auto' }}>
                            {getStrategyDiv()}
                        </div>
                    </Grid>
                    <Grid item xs={9}>
                        {getBackTestsDiv()}
                    </Grid>
                </Grid>
            </div>
        );
    }
}
export default withRouter(AvailableBackTests);

