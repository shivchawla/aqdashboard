import React, { Component } from 'react';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Utils from './../../../Utils';
import Moment from 'react-moment';
import AceEditor from 'react-ace';
// import 'brace/mode/julia';
// import 'brace/theme/xcode';
import Chip from '../../../components/DataDisplay/Chip';
import RadioGroup from '../../../components/Selections/RadioGroup';
import CustomRadio from '../../../components/Selections/CardCustomRadio';
import CustomHighCharts from './../../../CustomHighCharts/CustomHighCharts.jsx';
import DialogComponent from '../../../components/Alerts/DialogComponent';
import { processConditionsToAlgo } from '../../../Research/StartegyDetail/utils';
import FlowChartAlgo from '../../../Research/FlowChartAlgo';
import { verticalBox, horizontalBox, primaryColor } from '../../../constants';

class AttachedBackTest extends Component {

    _mounted = false;
    cancelGetBackTestData = undefined;

    constructor(props) {
        super();
        this.state = {
            backTestData: {},
            loading: true,
            selectedTab: 0,
            algo: {},
            type: 'GUI', // this should not be used, type should be obtained from the N/W call
            selectedAlgoView: 0,
            universeDialogOpen: false
        };

        this.getBacktestData = () => {
            this.setState({ "loading": true });
            axios(Utils.getBaseUrl() + '/backtest/' + this.props.backtestId, {
                cancelToken: new axios.CancelToken((c) => {
                    // An executor function receives a cancel function as a parameter
                    this.cancelGetBackTestData = c;
                }),
                'headers': Utils.getAuthTokenHeader()
            })
                .then((response) => {
                    let entryLogic = _.get(response.data, 'entryLogic', '');
                    let exitLogic = _.get(response.data, 'exitLogic', '');
                    let entryConditions = _.get(response.data, 'entryConditions', []);
                    let exitConditions = _.get(response.data, 'exitConditions', []);
                    
                    entryConditions = processConditionsToAlgo(entryConditions, entryLogic);

                    exitConditions = processConditionsToAlgo(exitConditions, exitLogic);

                    const algo = {
                        ...this.state.algo,
                        entry: entryConditions,
                        exit: exitConditions
                    };
                    this.updateState({
                        backTestData: response.data,
                        loading: false,
                        algo
                    });
                    this.cancelGetBackTestData = undefined;
                })
                .catch((error) => {
                    Utils.checkForInternet(error, this.props.history);
                    if (error.response) {
                        Utils.goToErrorPage(error, this.props.history);
                        Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.url);
                    }
                    this.updateState({
                        'loading': false
                    });
                    this.cancelGetBackTestData = undefined;
                    if (this.props.isBackTestAvailable) {
                        this.props.isBackTestAvailable(false);
                    }
                });
        }

        this.updateState = (data) => {
            if (this._mounted) {
                this.setState(data);
            }
        }

    }

    componentDidMount() {
        this._mounted = true;
        this.getBacktestData();
    }

    componentWillUnmount() {
        this._mounted = false;
        if (this.cancelGetBackTestData) {
            this.cancelGetBackTestData();
        }
    }

    onTabChanged = (event, value) => {
        this.setState({ selectedTab: value });
    }

    toggleUniverseDialog = () => {
        this.setState({universeDialogOpen: !this.state.universeDialogOpen});
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

        const getSettingsTabPane = () => {
            let advancedSummary = {
                'slippage': {}
            };
            try {
                advancedSummary = JSON.parse(this.state.backTestData.settings.advanced);
            } catch (err) { }
            return (
                <div 
                        tab="Settings" 
                        key="settings" 
                        style={{
                            maxHeight: '500px',
                            overflowY: 'auto'
                        }}
                >
                    <div style={{ 'padding': '20px', 'display': 'flex' }}>
                        <div style={{ 'border': '1px solid #e1e1e1', 'padding': '10px', 'minWidth': '450px' }}>
                            <h2 style={{ 'fontWeight': '700', 'fontSize': '18px' }}>Settings</h2>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4} style={{textAlign: 'start'}}>
                                    Initial Capital:
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {
                                            this.state.backTestData.settings
                                            ? Utils.formatInvestmentValueNormal(this.state.backTestData.settings.initialCash) 
                                            : '-'
                                        }
                                    </p>
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4} style={{textAlign: 'start'}}>
                                    Resolution:
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {advancedSummary.resolution}
                                    </p>
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4} style={{textAlign: 'start'}}>
                                    Universe:
                                </Grid>
                                <Grid 
                                        item xs={8} 
                                        style={{ 
                                            ...horizontalBox,
                                            justifyContent: 'flex-start',
                                            alignItems: 'center'
                                        }}
                                >
                                    {
                                        _.get(this.state, 'backTestData.settings.universe', '').length > 0
                                            ?   _.get(this.state, 'backTestData.settings.universe', '')
                                                .split(',')
                                                .splice(0, 3)
                                                .map((item, index) => {
                                                    return (
                                                        <Chip 
                                                            label={item}
                                                            key={index}
                                                            style={{marginRight: '3px'}}
                                                        />
                                                    );
                                                })
                                            :   '-'
                                    }
                                    {
                                        _.get(this.state, 'backTestData.settings.universe', '').length > 0 &&
                                        <h3
                                                style={{
                                                    fontFamily: 'Lato, sans-serif',
                                                    fontSize: '12px',
                                                    color: primaryColor,
                                                    marginLeft: '5px',
                                                    cursor: 'pointer',
                                                    fontWeight: 700
                                                }}
                                                onClick={this.toggleUniverseDialog}
                                        >
                                            more
                                        </h3>
                                    }
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4} style={{textAlign: 'start'}}>
                                    Date Range:
                                </Grid>
                                <Grid 
                                        item xs={6} 
                                        style={{ 
                                            ...horizontalBox,
                                            justifyContent: 'space-between'
                                        }}
                                >
                                    <p className="attached-backtest-settings-value">
                                        <Moment format="DD MMM YYYY">
                                            {(this.state.backTestData.settings) ? this.state.backTestData.settings.startDate : undefined}
                                        </Moment>
                                    </p>
                                    <h3
                                            style={{
                                                fontFamily: 'Lato, sans-serif',
                                                fontWeight: 500,
                                                color: '#444',
                                                fontSize: '13px'
                                            }}
                                    >
                                        to
                                    </h3>
                                    <p className="attached-backtest-settings-value">
                                        <Moment format="DD MMM YYYY">
                                            {(this.state.backTestData.settings) ? this.state.backTestData.settings.endDate : undefined}
                                        </Moment>
                                    </p>
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4} style={{textAlign: 'start'}}>
                                    Target (%):
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {advancedSummary ? advancedSummary.profitTarget : '-'}
                                    </p>
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4} style={{textAlign: 'start'}}>
                                    Stop Loss (%):
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {advancedSummary ? advancedSummary.stopLoss : '-'}
                                    </p>
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4} style={{textAlign: 'start'}}>
                                    Benchmark:
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {(this.state.backTestData.settings) ? this.state.backTestData.settings.benchmark : '-'}
                                    </p>
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4} style={{textAlign: 'start'}}>
                                    Rebalance:
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {advancedSummary.rebalance}
                                    </p>
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4} style={{textAlign: 'start'}}>
                                    Comission:
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                                        {(advancedSummary.commission) ? advancedSummary.commission.value : '-'}
                                    </p>
                                    <p className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                                        {(advancedSummary.commission) ? advancedSummary.commission.model : '-'}
                                    </p>
                                </Grid>
                            </Grid>
                            <Grid container type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Grid item xs={4} style={{textAlign: 'start'}}>
                                    Slippage:
                                </Grid>
                                <Grid item xs={8} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                                        {(advancedSummary.slippage) ? advancedSummary.slippage.value : '-'}
                                    </p>
                                    <p className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                                        {(advancedSummary.slippage) ? advancedSummary.slippage.model : '-'}
                                    </p>
                                </Grid>
                            </Grid>
                        </div>
                    </div>
                
                </div>
            );
        }

        const getBackTestBody = () => {
            if (!this.state.loading) {
                const tabs = [];
                const shouldShowAlgo = _.get(this.state, 'backTestData', 'CODE') === 'GUI' 
                        || _.get(this.state, 'backTestData.entryConditions', []).length > 0;
                const codeContent = (
                    <AceEditor
                        mode="julia"
                        theme="xcode"
                        name="UNIQUE_ID_OF_DIV"
                        readOnly={true}
                        value={this.state.backTestData.code}
                        width="100%"
                        editorProps={{ $blockScrolling: "Infinity" }}
                    />
                );
                const guiContent = (
                    <div style={{...verticalBox, alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                        <div style={{...horizontalBox, justifyContent: 'center', width: '100%'}}>
                            <RadioGroup 
                                items={['ALGORITHM', 'CODE']}
                                onChange={value => this.setState({selectedAlgoView: value})}
                                defaultSelected={this.state.selectedAlgoView}
                                CustomRadio={CustomRadio}
                            />
                        </div>
                        {
                            this.state.selectedAlgoView === 0 
                                ? <FlowChartAlgo algo={this.state.algo} edit={false}/>
                                : codeContent
                        }
                    </div>
                );

                tabs.push(
                    <div 
                            tab="Performance" 
                            key="performance" 
                            style={{
                                maxHeight: '500px',
                                overflowY: 'auto'
                            }}
                    >
                        <CustomHighCharts
                            output={this.state.backTestData.output}
                            uniqueKey={this.state.backTestData._id + '__' + Math.floor((Math.random() * 100) + 1)} 
                        />
                    </div>
                );
                tabs.push(
                    <div 
                            tab="Code" 
                            key="code" 
                            style={{
                                maxHeight: '500px',
                                overflowY: 'auto'
                            }}
                    >
                        {shouldShowAlgo ? guiContent : codeContent}
                    </div>
                );
                tabs.push(getSettingsTabPane());

                return (
                    <div 
                            style={{ 
                                width: '100%', 
                                padding: '15px',
                                boxSizing: 'border-box'
                            }}
                    >
                        <h1 style={{ 'fontWeight': '700', 'fontSize': '22px', marginBottom: '12px'}}>
                            Attached Backtest Details
                        </h1>
                        <Grid container>
                            <Grid item sm={6} md={3} style={{ 'textAlign': 'center' }}>
                                <h2 style={{
                                    'fontWeight': '400', 'fontSize': '14px',
                                    'margin': '0px'
                                }}>
                                    {_.get(this.state, 'backTestData.strategy_name', '')}
                                </h2>
                                <p style={{
                                    'fontWeight': '300', 'fontSize': '12px',
                                    'margin': '0px'
                                }}>
                                    Strategy Name
                                </p>
                            </Grid>
                            <Grid item sm={6} md={3} style={{ 'textAlign': 'center' }}>
                                <h2 style={{
                                    'fontWeight': '400', 'fontSize': '14px',
                                    'margin': '0px'
                                }}>
                                    <Moment format="DD/MM/YYYY hh:mm A">
                                        {_.get(this.state, 'backTestData.createdAt', null)}
                                    </Moment>
                                </h2>
                                <p style={{
                                    'fontWeight': '300', 'fontSize': '12px',
                                    'margin': '0px'
                                }}>
                                    CreatedAt
                                </p>
                            </Grid>
                            <Grid item sm={6} md={3} style={{ 'textAlign': 'center' }}>
                                <h2 style={{
                                    'fontWeight': '400', 'fontSize': '14px',
                                    'margin': '0px'
                                }}>
                                    <Moment format="DD/MM/YYYY">
                                        {
                                            (this.state.backTestData.settings)
                                                ? this.state.backTestData.settings.startDate
                                                : undefined
                                        }
                                    </Moment> -&nbsp;
                                    <Moment format="DD/MM/YYYY">
                                        {
                                            (this.state.backTestData.settings)
                                                ? this.state.backTestData.settings.endDate
                                                : undefined
                                        }
                                    </Moment>
                                </h2>
                                <p style={{
                                    'fontWeight': '300', 'fontSize': '12px',
                                    'margin': '0px'
                                }}>
                                    Date Range
                                </p>
                            </Grid>
                            <Grid item sm={6} md={3} style={{ 'textAlign': 'center' }}>
                                <h2 style={{
                                    'fontWeight': '400', 'fontSize': '14px',
                                    'margin': '0px'
                                }}>
                                    {Utils.firstLetterUppercase(this.state.backTestData.status)}
                                </h2>
                                <p style={{
                                    'fontWeight': '300', 'fontSize': '12px',
                                    'margin': '0px'
                                }}>
                                    Status
                                </p>
                            </Grid>
                        </Grid>
                        <div style={{
                            'width': '100%', 'height': '1px', 'margin': '10px 0px 10px 0px',
                            'background': '#e1e1e1'
                        }}>
                        </div>
                        <h3 style={{fontSize: '16px', marginBottom: '12px', fontWeight: 500}}>
                            Backtest Metrics
                        </h3>
                        <Grid container>
                            <Grid item sm={4} md={2} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            (this.state.backTestData.output && this.state.backTestData.output.summary)
                                                ? this.state.backTestData.output.summary.totalreturn.toFixed(2) + ' %'
                                                : '-'
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Total Return
                                    </p>
                                </div>
                            </Grid>
                            <Grid item sm={4} md={2} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            (this.state.backTestData.output && this.state.backTestData.output.summary)
                                                ? this.state.backTestData.output.summary.annualreturn.toFixed(2) + ' %'
                                                : '-'
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Annual Return
                                    </p>
                                </div>
                            </Grid>
                            <Grid item sm={4} md={2} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            (this.state.backTestData.output && this.state.backTestData.output.summary)
                                                ? this.state.backTestData.output.summary.annualstandarddeviation.toFixed(2) + ' %'
                                                : '-'
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Volatility
                                    </p>
                                </div>
                            </Grid>
                            <Grid item sm={4} md={2} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            (this.state.backTestData.output && this.state.backTestData.output.summary)
                                                ? this.state.backTestData.output.summary.sharperatio.toFixed(2)
                                                : '-'
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Sharpe Ratio
                                    </p>
                                </div>
                            </Grid>
                            <Grid item sm={4} md={2} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            (this.state.backTestData.output && this.state.backTestData.output.summary)
                                                ? this.state.backTestData.output.summary.informationratio.toFixed(2)
                                                : '-'
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Information Ratio
                                    </p>
                                </div>
                            </Grid>
                            <Grid item sm={4} md={2} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            (this.state.backTestData.output && this.state.backTestData.output.summary)
                                                ? `${this.state.backTestData.output.summary.maxdrawdown.toFixed(2)}%`
                                                : '-'
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Max Drawdown
                                    </p>
                                </div>
                            </Grid>
                        </Grid>
                        <div style={{ 'border': '1px solid #e1e1e1', 'marginTop': '15px' }}>
                            <Tabs
                                value={this.state.selectedTab}
                                onChange={this.onTabChanged}
                                indicatorColor='primary'
                            >
                                <Tab label='Performance' />
                                <Tab label={shouldShowAlgo ? 'ALGO' : 'CODE'} />
                                <Tab label='Settings' />
                            </Tabs>
                            {tabs[this.state.selectedTab]}
                        </div>
                    </div>
                );
            }
        }

        return (
            <div >
                <DialogComponent 
                        open={this.state.universeDialogOpen}
                        onClose={this.toggleUniverseDialog}
                        title="Universe"
                >
                    <div 
                            style={{...horizontalBox}}
                    >
                        {
                            _.get(this.state, 'backTestData.settings.universe', '')
                            .split(',')
                            .map((item, index) => {
                                return (
                                    <Chip 
                                        title="Universe"
                                        key={index}
                                        label={item}
                                        style={{margin: '5px'}}
                                    />
                                );
                            })
                        }
                    </div>
                </DialogComponent>
                {getLoadingDiv()}
                {getBackTestBody()}
            </div>
        );
    }
}

export default AttachedBackTest;
