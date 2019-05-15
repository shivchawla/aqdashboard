import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import {withRouter} from 'react-router-dom';
import Button from '@material-ui/core/Button';
import ButtonBase from '@material-ui/core/ButtonBase';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import {lighten} from '@material-ui/core/styles/colorManipulator';
import {processRowData} from '../utils';
import {primaryColor} from '../../../constants';
import {primaryButtonStyle, disabledButtonStyle} from '../../../constants/styles';
import { CircularProgress } from '@material-ui/core';

const rows = [
    { id: 'name', numeric: false, disablePadding: false, label: 'Backtest' },
    { id: 'createdAt', numeric: true, disablePadding: false, label: 'Created Date' },
    { id: 'status', numeric: true, disablePadding: false, label: 'Status' },
    { id: 'dateRange', numeric: true, disablePadding: false, label: 'Date Range' },
    { id: 'totalreturn', numeric: true, disablePadding: false, label: 'Total Ret.' },
    { id: 'sharperatio', numeric: true, disablePadding: false, label: 'Sharpe Ratio' },
    { id: 'sharperatio', numeric: true, disablePadding: false, label: '' }
];

class EnhancedTableHead extends React.Component {
    render() {
        const {order, orderBy, numSelected, rowCount, onAllItemsSelected} = this.props;

        return (
            <TableHead>
                <TableRow>
                    <TableCell padding="checkbox">
                        <Checkbox
                            indeterminate={numSelected > 0 && numSelected < rowCount}
                            checked={numSelected === rowCount}
                            onChange={onAllItemsSelected}
                            color='primary'
                        />
                    </TableCell>
                    {
                        rows.map(
                            row => (
                                <TableCell
                                    key={row.id}
                                    align='left'
                                    padding='none'
                                    sortDirection={orderBy === row.id ? order : false}
                                >
                                    <Tooltip
                                        title="Sort"
                                        placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                                        enterDelay={300}
                                    >
                                        <RowLabel>{row.label}</RowLabel>
                                    </Tooltip>
                                </TableCell>
                            ),
                            this,
                        )}
                </TableRow>
            </TableHead>
        );
    }
}

const toolbarStyles = theme => ({
    root: {
        paddingRight: theme.spacing.unit,
    },
    highlight:
        theme.palette.type === 'light'
            ? {
                color: theme.palette.secondary.main,
                backgroundColor: lighten(theme.palette.secondary.light, 0.85),
            }
            : {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.secondary.dark,
            },
    spacer: {
        flex: '1 1 100%',
    },
    actions: {
        color: theme.palette.text.secondary,
    },
    title: {
        flex: '0 0 auto',
    },
});

let EnhancedTableToolbar = props => {
    const { numSelected, classes, name: strategyName = ''} = props;

    return (
        <Toolbar
            className={
                classNames(classes.root, {
                // [classes.highlight]: numSelected > 0,
            })}
        >
            <div className={classes.title}>
                {
                    numSelected > 0
                        ?   <Typography color="inherit" variant="subtitle1">
                                {numSelected} selected
                            </Typography>
                        :   <Typography variant="h6" id="tableTitle">
                                All Backtests for {strategyName}
                            </Typography>
                }
            </div>
            <div className={classes.spacer} />
            <div className={classes.actions}>
                {
                    numSelected > 1 && numSelected <= 5
                        ?
                            <Button 
                                    variant='contained' 
                                    color='primary'
                                    onClick={props.openCompare}
                            >
                                Compare
                            </Button>
                        :   null
                }
            </div>
            <div className={classes.actions}>
                {
                    numSelected > 0 
                        ?
                            (
                                <Tooltip title="Delete">
                                    <IconButton aria-label="Delete" onClick={props.toggleDeleteDialog}>
                                        <DeleteIcon style={{color: primaryColor}} />
                                    </IconButton>
                                </Tooltip>
                            ) 
                        :   null
                }
            </div>
        </Toolbar>
    );
};

EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar);

const styles = theme => ({
    root: {
        marginTop: '20px'
    },
    tableWrapper: {
        overflowX: 'auto',
    },
});

class EnhancedTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            order: 'asc',
            orderBy: 'calories',
            selected: [],
            page: 0,
            rowsPerPage: 5
        }
    }

    handleSelectAllClick = event => {
        if (event.target.checked) {
            this.setState(state => ({ selected: state.data.map(n => n.id) }));
            return;
        }
        this.setState({ selected: [] });
    };

    handleClick = (name, id) => {
        this.props.history.push('/research/backtests/'
            + this.props.match.params.strategyId + '/' + id
            + '?type=backtest&strategyName=' + _.get(this.props, 'strategyName', '')
            + '&backtestName=' + name);
    };

    isSelected = id => this.state.selected.indexOf(id) !== -1;

    onCheckboxChange = (checked, backtest) => {
        this.props.rowSelection(checked, backtest)
    }

    render() {
        const {classes, strategyName = ''} = this.props;
        const {data = [], disableRunTests = false} = this.props;
        const {order, orderBy} = this.state;

        return (
            <Paper className={classes.root}>
                <EnhancedTableToolbar 
                    numSelected={data.filter(item => item.selected === true).length} 
                    openCompare={this.props.openCompare} 
                    toggleDeleteDialog = {this.props.toggleDeleteDialog}
                    name={strategyName}
                />
                <div className={classes.tableWrapper}>
                    <Table className={classes.table} aria-labelledby="tableTitle">
                        <EnhancedTableHead
                            numSelected={data.filter(item => item.selected === true).length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={this.handleSelectAllClick}
                            rowCount={data.length}
                            onAllItemsSelected={this.props.onAllItemsSelected}
                        />
                        <TableBody>
                            {
                                data.map((item, index) => {
                                    const dataItem = processRowData(item, index);
                                    const isLoading = _.get(dataItem, 'isLoading', false);
                                    const isException = dataItem.status.toLowerCase() === 'exception';
                                    const isStatusComplete = dataItem.status.trim().toLowerCase() === 'complete';
                                    const isForwardTestButtonEnabled = !disableRunTests && isStatusComplete;
                                    const forwardTestButtonStyle = isForwardTestButtonEnabled
                                            ? primaryButtonStyle
                                            : disabledButtonStyle;

                                    return (
                                        <TableRow
                                            hover
                                            role="checkbox"
                                            aria-checked={item.selected}
                                            tabIndex={-1}
                                            key={dataItem.id}
                                            selected={item.selected}
                                            style={{
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <STableCell
                                                    align="left" 
                                                    padding="checkbox"
                                                    onClick={e => e.stopPropagation()}
                                            >
                                                <Checkbox 
                                                    checked={item.selected} 
                                                    onChange={e => {
                                                        e.stopPropagation();
                                                        this.onCheckboxChange(e.target.checked, item)
                                                    }}
                                                    color='primary'
                                                />
                                            </STableCell>
                                            <STableCell align="left" padding='none'>
                                                {dataItem.name}
                                            </STableCell>
                                            <STableCell align="left" padding='none'>
                                                {dataItem.createdAt}
                                            </STableCell>
                                            <STableCell 
                                                    padding='none'
                                                    align="left"
                                                    style={{
                                                        color: isException ? '#ff3737' : '#595959',
                                                        fontWeight: isException ? 700 : 500
                                                    }}
                                            >
                                                {dataItem.status}
                                            </STableCell>
                                            <STableCell align="left" padding='none'>
                                                {dataItem.dateRange}
                                            </STableCell>
                                            <STableCell align="left" padding='none'>
                                                {dataItem.totalReturn}
                                            </STableCell>
                                            <STableCell align="left" padding='none'>
                                                {dataItem.sharpeRatio}
                                            </STableCell>
                                            <STableCell 
                                                    align="left" 
                                                    padding='checkbox'
                                                    onClick={e => e.stopPropagation()}
                                            >
                                                {
                                                    isLoading
                                                    ?   <CircularProgress size={16} />
                                                    :   <ButtonBase 
                                                                style={{
                                                                    ...forwardTestButtonStyle,
                                                                    marginTop: 0,
                                                                    fontSize: '10px',
                                                                    zIndex: 20
                                                                }}
                                                                disabled={!isForwardTestButtonEnabled}
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    this.props.runForwardTest && this.props.runForwardTest(dataItem);
                                                                }}
                                                        >
                                                            RUN FORWARD
                                                        </ButtonBase>
                                                }
                                            </STableCell>
                                        </TableRow>
                                    );
                                })
                            }
                        </TableBody>
                    </Table>
                </div>
            </Paper>
        );
    }
}

export default withStyles(styles)(withRouter(EnhancedTable));

const RowLabel = styled.span`
    font-size: 14px;
    color: #252525;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
`;

const STableCell = styled(TableCell)`
    color: #595959;
    font-family: 'Lato', sans-serif;
    font-size: 14px;
    font-weight: 500
`;