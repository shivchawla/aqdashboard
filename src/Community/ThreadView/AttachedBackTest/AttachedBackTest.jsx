import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import { Spin, Icon, Row, Col, Tabs } from 'antd';
import Utils from './../../../Utils';
import Moment from 'react-moment';
import AceEditor from 'react-ace';
import 'brace/mode/julia';
import 'brace/theme/xcode';
import CustomHighCharts from './../../../CustomHighCharts/CustomHighCharts.jsx';

class AttachedBackTest extends Component {

    _mounted = false;
    cancelGetBackTestData = undefined;

    constructor(props) {
        super();
        this.state = {
            "backTestData": {},
            "loading": true
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
                    this.updateState({
                        'backTestData': response.data,
                        'loading': false
                    });
                    this.cancelGetBackTestData = undefined;
                })
                .catch((error) => {
                    Utils.checkForInternet(error, this.props.history);
                    if (error.response) {
                        if (error.response.status === 400 || error.response.status === 403) {
                            this.props.history.push('/forbiddenAccess');
                        }
                        Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
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

    render() {
        const TabPane = Tabs.TabPane;

        const antIconLoading = <Icon type="loading" style={{ fontSize: 24 }} spin />;

        const getLoadingDiv = () => {
            if (this.state.loading) {
                return (
                    <div className="height_width_full" style={{
                        'display': 'flex',
                        'alignItems': 'center', 'justifyContent': 'center',
                        'minHeight': '300px'
                    }}>
                        <Spin indicator={antIconLoading} />
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
                <TabPane tab="Settings" key="settings" style={{
                    'maxHeight': '500px',
                    'overflowY': 'auto'
                }}>
                    <div style={{ 'padding': '20px', 'display': 'flex' }}>
                        <div style={{ 'border': '1px solid #e1e1e1', 'padding': '10px', 'minWidth': '450px' }}>
                            <h2 style={{ 'fontWeight': '700', 'fontSize': '18px' }}>Settings</h2>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Initial Cash:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {(this.state.backTestData.settings) ? this.state.backTestData.settings.initialCash : '-'}
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Start Date:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        <Moment format="DD MMM YYYY">
                                            {(this.state.backTestData.settings) ? this.state.backTestData.settings.startDate : undefined}
                                        </Moment>
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    End Date:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        <Moment format="DD MMM YYYY">
                                            {(this.state.backTestData.settings) ? this.state.backTestData.settings.endDate : undefined}
                                        </Moment>
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Benchmark:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {(this.state.backTestData.settings) ? this.state.backTestData.settings.benchmark : '-'}
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Universe:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {(this.state.backTestData.settings) ? this.state.backTestData.settings.universeIndex : '-'}
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Slippage:
                  </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                                        {(advancedSummary.slippage) ? advancedSummary.slippage.value : '-'}
                                    </p>
                                    <p className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                                        {(advancedSummary.slippage) ? advancedSummary.slippage.model : '-'}
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Comission:
                  </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                                        {(advancedSummary.commission) ? advancedSummary.commission.value : '-'}
                                    </p>
                                    <p className="attached-backtest-settings-value" style={{ 'margin': '0px 5px 0px 0px' }}>
                                        {(advancedSummary.commission) ? advancedSummary.commission.model : '-'}
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Cancel Policy:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {advancedSummary.cancelPolicy}
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Execution Policy:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {advancedSummary.executionPolicy}
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Rebalance:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {advancedSummary.rebalance}
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Investment Plan:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {advancedSummary.investmentPlan}
                                    </p>
                                </Col>
                            </Row>
                            <Row type="flex" align="middle" style={{ 'marginTop': '10px' }}>
                                <Col span={8}>
                                    Resolution:
                </Col>
                                <Col span={16} style={{ 'display': 'flex', 'alignItems': 'center' }}>
                                    <p className="attached-backtest-settings-value">
                                        {advancedSummary.resolution}
                                    </p>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </TabPane>
            );
        }

        const getBackTestBody = () => {
            if (!this.state.loading) {
                const tabs = [];

                tabs.push(<TabPane tab="Performance" key="performance" style={{
                    'maxHeight': '500px',
                    'overflowY': 'auto'
                }}>
                    <CustomHighCharts
                        output={this.state.backTestData.output}
                        uniqueKey={this.state.backTestData._id + '__' + Math.floor((Math.random() * 100) + 1)} />
                </TabPane>);
                tabs.push(<TabPane tab="Code" key="code" style={{
                    'maxHeight': '500px',
                    'overflowY': 'auto'
                }}>
                    <AceEditor
                        mode="julia"
                        theme="xcode"
                        name="UNIQUE_ID_OF_DIV"
                        readOnly={true}
                        value={this.state.backTestData.code}
                        width="100%"
                        editorProps={{ $blockScrolling: "Infinity" }}
                    />
                </TabPane>);
                tabs.push(getSettingsTabPane());
                return (
                    <div style={{ 'width': '100%', 'padding': '15px' }}>
                        <h1 style={{ 'fontWeight': '700', 'fontSize': '22px' }}>
                            Attached Backtest Details
                        </h1>
                        <Row>
                            <Col sm={12} md={6} style={{ 'textAlign': 'center' }}>
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
                            </Col>
                            <Col sm={12} md={6} style={{ 'textAlign': 'center' }}>
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
                            </Col>
                            <Col sm={12} md={6} style={{ 'textAlign': 'center' }}>
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
                            </Col>
                            <Col sm={12} md={6} style={{ 'textAlign': 'center' }}>
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
                            </Col>
                        </Row>
                        <div style={{
                            'width': '100%', 'height': '1px', 'margin': '10px 0px 10px 0px',
                            'background': '#e1e1e1'
                        }}>
                        </div>
                        <h3 stye={{ 'fontSize': '16px' }}>
                            Backtest Metrics
            </h3>
                        <Row>
                            <Col sm={8} md={4} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            (this.state.backTestData.output && this.state.backTestData.output.summary) 
                                                ?   this.state.backTestData.output.summary.totalreturn.toFixed(2) + ' %' 
                                                :   '-'
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Total Return
                  </p>
                                </div>
                            </Col>
                            <Col sm={8} md={4} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            (this.state.backTestData.output && this.state.backTestData.output.summary) 
                                                ?   this.state.backTestData.output.summary.annualreturn.toFixed(2) + ' %' 
                                                :   '-'
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Annual Return
                  </p>
                                </div>
                            </Col>
                            <Col sm={8} md={4} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            (this.state.backTestData.output && this.state.backTestData.output.summary) 
                                                ?   this.state.backTestData.output.summary.annualstandarddeviation.toFixed(2) + ' %' 
                                                :   '-'
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Volatility
                  </p>
                                </div>
                            </Col>
                            <Col sm={8} md={4} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            (this.state.backTestData.output && this.state.backTestData.output.summary) 
                                                ?   this.state.backTestData.output.summary.sharperatio.toFixed(2) 
                                                : '-'
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Sharpe Ratio
                  </p>
                                </div>
                            </Col>
                            <Col sm={8} md={4} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            (this.state.backTestData.output && this.state.backTestData.output.summary) 
                                                ?   this.state.backTestData.output.summary.informationratio.toFixed(2)
                                                :   '-'
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Information Ratio
                  </p>
                                </div>
                            </Col>
                            <Col sm={8} md={4} style={{ 'display': 'flex', 'justifyContent': 'center' }}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'minWidth': '130px', 'padding': '10px',
                                    'textAlign': 'left'
                                }}>
                                    <h2 style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            (this.state.backTestData.output && this.state.backTestData.output.summary) 
                                            ?   this.state.backTestData.output.summary.maxdrawdown.toFixed(2)
                                            :   '-'
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Max Drawdown
                  </p>
                                </div>
                            </Col>
                        </Row>
                        <div style={{ 'border': '1px solid #e1e1e1', 'marginTop': '15px' }}>
                            <Tabs>
                                {tabs}
                            </Tabs>
                        </div>
                    </div>
                );
            }
        }

        return (
            <div >
                {getLoadingDiv()}
                {getBackTestBody()}
            </div>
        );
    }
}

export default withRouter(AttachedBackTest);
