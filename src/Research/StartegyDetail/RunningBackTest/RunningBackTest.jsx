import React, { Component } from 'react';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';
import {withStyles} from '@mui/styles';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Moment from 'react-moment';
import Utils from './../../../Utils';
import RunningBacktestChart from './../../../CustomHighCharts/RunningBacktestChart.jsx';

const styles = theme => ({
    root: {
      flexGrow: 1,
    }
});
  

class RunningBackTest extends Component {

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
        let backTestData = _.get(this.props, 'backTestData', {});
        const strategyName = _.get(backTestData, 'strategy_name', '-');
        const createdAt = _.get(backTestData, 'createdAt', null);
        const startDate = _.get(backTestData, 'settings.startDate', null);
        const endDate = _.get(backTestData, 'settings.endDate', null);
        const status = _.get(backTestData, 'status', '-');
        const totalReturn = _.get(backTestData, 'output.summary.totalreturn', 0).toFixed(2);
        const annualReturn = _.get(backTestData, 'output.summary.annualreturn', 0).toFixed(2);
        const standardDeviation = _.get(backTestData.output, 'summary.annualstandarddeviation', 0).toFixed(2);
        const sharpeRatio = _.get(backTestData, 'output.summary.sharperatio', 0).toFixed(2);
        const informationRatio = _.get(backTestData, 'output.summary.informationratio', 0).toFixed(2);
        const maxDrawDown = _.get(backTestData, 'output.summary.maxdrawdown', 0).toFixed(2);

        const getLoadingDiv = () => {
            if (this.state.loading) {
                return (
                    <div className="height_width_full" style={{
                        'display': 'flex',
                        'alignItems': 'center', 'justifyContent': 'center',
                        'minHeight': '300px'
                    }}>
                        <CircularProgress size={24} />
                    </div>
                );
            }
        }

        const getBackTestBody = () => {
            const { classes } = this.props;
            
            if (!this.state.loading) {
                return (
                    <div style={{ 'width': '100%', 'padding': '15px', boxSizing: 'border-box'}}>
                        <Grid container>
                            <Grid item sm={6} md={3} style={{ 'textAlign': 'center' }}>
                                <h2 style={{
                                    'fontWeight': '400', 'fontSize': '14px',
                                    'margin': '0px'
                                }}>
                                    {strategyName}
                                </h2>
                                <p style={{
                                    'fontWeight': '300', 'fontSize': '12px',
                                    'margin': '0px'
                                }}>
                                    Strategy Name
                                </p>
                            </Grid>
                            <Grid sm={6} md={3} style={{ 'textAlign': 'center' }}>
                                <h2 style={{
                                    'fontWeight': '400', 'fontSize': '14px',
                                    'margin': '0px'
                                }}>
                                    {
                                        createdAt !== null
                                            ? <Moment format="DD/MM/YYYY hh:mm A">{backTestData.createdAt}</Moment>
                                            : '-'
                                    }
                                </h2>
                                <p style={{
                                    'fontWeight': '300', 'fontSize': '12px',
                                    'margin': '0px'
                                }}>
                                    CreatedAt
                                </p>
                            </Grid>
                            <Grid sm={6} md={3} style={{ 'textAlign': 'center' }}>
                                {createdAt ?
                                    <h2 style={{
                                        'fontWeight': '400', 'fontSize': '14px',
                                        'margin': '0px'
                                    }}>
                                        <Moment format="DD/MM/YYYY">
                                            {startDate}
                                        </Moment> -&nbsp;
                                        <Moment format="DD/MM/YYYY">
                                            {endDate}
                                        </Moment>
                                    </h2>
                                    : '-'
                                }
                                <p style={{
                                    'fontWeight': '300', 'fontSize': '12px',
                                    'margin': '0px'
                                }}>
                                    Date Range
                                </p>
                            </Grid>
                            <Grid sm={6} md={3} style={{ 'textAlign': 'center' }}>
                                <h2 style={{
                                    'fontWeight': '400', 'fontSize': '14px',
                                    'margin': '0px'
                                }}>
                                    {Utils.firstLetterUppercase(status)}
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
                        <h3 
                                style={{ 
                                    fontSize: '16px',
                                    fontWeight: 400,
                                    padding: '10px 0'
                                }}
                        >
                            Backtest Metrics
                        </h3>
                        <Grid 
                                container 
                                // className={classes.root} 
                                spacing={16} 
                                style={{marginTop: '5px', boxSizing: 'border-box'}}
                        >
                            <Grid item sm={4} md={2}>
                                <div 
                                        style={{
                                            border: '1px solid #e1e1e1', 
                                            padding: '10px',
                                            textAlign: 'left', 
                                        }}
                                >
                                    <h2 id="totalReturnTextElem" style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            totalReturn !== null ? `${totalReturn}%` : '-'
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Total Return
                                    </p>
                                </div>
                            </Grid>
                            <Grid item sm={4} md={2}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'padding': '10px',
                                    'textAlign': 'left',
                                }}>
                                    <h2 id="annualReturnTextElem" style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            annualReturn !== null ? `${annualReturn}%` : '-'
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Annual Return
                                    </p>
                                </div>
                            </Grid>
                            <Grid item sm={4} md={2}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'padding': '10px',
                                    'textAlign': 'left',
                                }}>
                                    <h2 id="volatilityTextElem" style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            standardDeviation !== null ? `${standardDeviation}%` : '-'
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Volatility
                                    </p>
                                </div>
                            </Grid>
                            <Grid item sm={4} md={2}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'padding': '10px',
                                    'textAlign': 'left',
                                }}>
                                    <h2 id="sharpeRatioTextElem" style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            sharpeRatio !== null ? `${sharpeRatio}` : '-'
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Sharpe Ratio
                                    </p>
                                </div>
                            </Grid>
                            <Grid item sm={4} md={2}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'padding': '10px',
                                    'textAlign': 'left',
                                }}>
                                    <h2 id="infoRatioTextElem" style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            informationRatio !== null ? `${informationRatio}` : '-'
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Inf. Ratio
                                    </p>
                                </div>
                            </Grid>
                            <Grid item sm={4} md={2}>
                                <div style={{
                                    'border': '1px solid #e1e1e1', 'padding': '10px',
                                    'textAlign': 'left',
                                }}>
                                    <h2 id="maxDrawdownTextElem" style={{ 'fontSize': '20px', 'fontWeight': '400', 'margin': '0px' }}>
                                        {
                                            maxDrawDown !== null ? `${maxDrawDown}%` : '-'
                                        }
                                    </h2>
                                    <p style={{ 'fontSize': '12px', 'fontWeight': '400', 'margin': '0px' }}>
                                        Max Drawdown
                                    </p>
                                </div>
                            </Grid>
                        </Grid>
                        
                        <div style={{ 'border': '1px solid #e1e1e1', 'marginTop': '15px' }}>
                            <RunningBacktestChart
                                output={backTestData.output}
                                onGraphCreated={this.props.onGraphCreated}
                                RunningBackTestDivUnmount={this.props.RunningBackTestDivUnmount}
                                uniqueKey={backTestData._id + '__' + Math.floor((Math.random() * 100) + 1)} />
                        </div>
                    </div>
                );
            }
        }

        return (
            <div style={{ 'width': '100%', 'height': '100%', 'overflowY': 'auto' }}>
                {getLoadingDiv()}
                {getBackTestBody()}
            </div>
        );
    }
}

export default withStyles(styles)(RunningBackTest);
