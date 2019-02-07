import React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import {withStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Radio from '@material-ui/core/Radio';
import moment from 'moment';
import Utils from './../../Utils';

const styles = theme => ({
    cellRoot: {
        padding: '0 10px'
    }
})

class BackTests extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedBacktestId: null
        };
        this.onBackTestClicked = (backtestId) => {
            if (this.props.onBackTestClicked) {
                this.props.onBackTestClicked(backtestId);
            }
        }

    }

    renderHeader = () => {
        const headers = ['Backtest', 'Created Date', 'Status', 'Date Range', 'Total Return', 'Sharpe Ratio'];
        const {classes} = this.props;

        return (
            <TableHead>
                <TableRow style={{backgroundColor: '#fafafa'}}>
                    <TableCell 
                            padding="checkbox"
                            classes={{
                                root: classes.cellRoot
                            }}
                            variant="head"
                    ></TableCell>
                    {
                        headers.map((header, index) => (
                            <TableCell 
                                    key={index}
                                    classes={{
                                        root: classes.cellRoot
                                    }}
                                    variant="head"
                            >
                                {header}
                            </TableCell>
                        ))
                    }
                </TableRow>
            </TableHead>
        );
    }

    getBacktestData = () => {
        const data = [];
        if (this.props.backtests) {
            for (let i = 0; i < this.props.backtests.length; i++) {
                const dty = this.props.backtests[i];
                let dataObj = {};
                dataObj['name'] = "Backtest " + (i + 1);
                dataObj['createdAt'] = moment(dty.createdAt).format('DD/MM/YYYY hh:mm A');
                dataObj['status'] = Utils.firstLetterUppercase(dty.status);
                dataObj['key'] = dty._id;
                if (dty.output && dty.output.summary) {
                    dataObj['totalreturn'] = dty.output.summary.totalreturn;
                }
                if (dty.output && dty.output.summary) {
                    dataObj['sharperatio'] = dty.output.summary.sharperatio;
                }
                if (dty.settings && dty.settings.startDate && dty.settings.endDate) {
                    dataObj['dateRange'] = moment(dty.settings.startDate).format('DD/MM/YYYY') + ' - '
                        + moment(dty.settings.endDate).format('DD/MM/YYYY');
                } else {
                    dataObj['dateRange'] = "";
                }
                data.push(dataObj);
            }
        }

        return data;
    }

    onRadioChange = item => {
        const id = _.get(item, 'key', null);
        this.setState({selectedBacktestId: id});
        this.onBackTestClicked(id);
    }

    renderRows = () => {
        const data = this.getBacktestData();
        const {classes} = this.props;

        return (
            <TableBody>
                {
                    data.map((dataItem, index) => (
                        <TableRow key={index}>
                            <TableCell 
                                    align="left"
                                    padding="checkbox"
                                    onClick={e => e.stopPropagation()}
                                    style={{boxSizing: 'border-box'}}
                                    classes={{
                                        root: classes.cellRoot
                                    }}
                            >
                                <Radio 
                                    onChange={e => {
                                        e.stopPropagation();
                                        this.onRadioChange(dataItem)
                                    }}
                                    checked={dataItem.key === this.state.selectedBacktestId}
                                />
                            </TableCell>
                            <TableCell 
                                    align="left" 
                                    classes={{
                                        root: classes.cellRoot
                                    }}
                            >
                                {dataItem.name}
                            </TableCell>
                            <TableCell 
                                    align="left"
                                    classes={{
                                        root: classes.cellRoot
                                    }}
                            >
                                {dataItem.createdAt}
                            </TableCell>
                            <TableCell 
                                    align="left"
                                    classes={{
                                        root: classes.cellRoot
                                    }}
                            >
                                {dataItem.status}
                            </TableCell>
                            <TableCell 
                                    align="left"
                                    classes={{
                                        root: classes.cellRoot
                                    }}
                            >
                                {dataItem.dateRange}
                            </TableCell>
                            <TableCell 
                                    align="left"
                                    classes={{
                                        root: classes.cellRoot
                                    }}
                            >
                                {
                                    dataItem.totalreturn
                                    ?   dataItem.totalreturn + '%'
                                    :   null
                                }
                            </TableCell>
                            <TableCell 
                                    align="left"
                                    classes={{
                                        root: classes.cellRoot
                                    }}
                            >
                                {dataItem.sharperatio}
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        );
    }

    render() {
        return (
            <div 
                    style={{
                        overflowY: 'auto', 
                        height: '65vh', 
                        boxSizing: 'border-box',
                        paddingTop: '10px'
                    }}
            >
                <Table>
                    {this.renderHeader()}
                    {this.renderRows()}
                </Table>
            </div>
        );
    }
}
export default withStyles(styles)(withRouter(BackTests));

