import React from 'react';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';
import {withStyles} from '@mui/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Radio from '@mui/material/Radio';
import moment from 'moment';
import Utils from './../../Utils';

const styles = theme => ({
    cellRoot: {
        padding: '0 10px',
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
                    dataObj['totalreturn'] = _.get(dty, 'output.summary.totalreturn', 0).toFixed(2);
                }
                if (dty.output && dty.output.summary) {
                    dataObj['sharperatio'] = _.get(dty, 'output.summary.sharperatio', 0).toFixed(2);
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
                    data.map((dataItem, index) => {
                        const isException = dataItem.status.toLowerCase() === 'exception';

                        return (
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
                                        color='primary'
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
                                        style={{
                                            color: isException ? '#ff3737' : '#595959',
                                            fontWeight: isException ? 500 : 500
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
                                        :   '-'
                                    }
                                </TableCell>
                                <TableCell 
                                        align="left"
                                        classes={{
                                            root: classes.cellRoot
                                        }}
                                >
                                    {dataItem.sharperatio || '-'}
                                </TableCell>
                            </TableRow>
                        )
                    })
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
export default withStyles(styles)(BackTests);

