import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import classNames from 'classnames';
import {withStyles} from '@mui/styles';
import {useNavigate} from 'react-router-dom';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import { lighten } from '@mui/system';
import {processRowData} from '../utils';
import {primaryColor} from '../../../constants';
import { withRouter } from '../../function2Class.js';

const rows = [
    { id: 'name', numeric: false, disablePadding: false, label: 'Backtest' },
    { id: 'createdAt', numeric: true, disablePadding: false, label: 'Created Date' },
    { id: 'status', numeric: true, disablePadding: false, label: 'Status' },
    { id: 'dateRange', numeric: true, disablePadding: false, label: 'Date Range' },
    { id: 'totalreturn', numeric: true, disablePadding: false, label: 'Total Return' },
    { id: 'sharperatio', numeric: true, disablePadding: false, label: 'Sharpe Ratio' },
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
                                    padding={row.disablePadding ? 'none' : 'default'}
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
            + this.props.params.strategyId + '/' + id
            + '?type=backtest&strategyName=' + _.get(this.props, 'strategyName', '')
            + '&backtestName=' + name);
    };

    isSelected = id => this.state.selected.indexOf(id) !== -1;

    onCheckboxChange = (checked, backtest) => {
        this.props.rowSelection(checked, backtest)
    }

    render() {
        const {classes, strategyName = ''} = this.props;
        const {data = []} = this.props;
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
                                    const isException = dataItem.status.toLowerCase() === 'exception';

                                    return (
                                        <TableRow
                                            hover
                                            onClick={event => this.handleClick(dataItem.name, dataItem.id)}
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
                                            <STableCell align="left">
                                                {dataItem.name}
                                            </STableCell>
                                            <STableCell align="left">{dataItem.createdAt}</STableCell>
                                            <STableCell 
                                                    align="left"
                                                    style={{
                                                        color: isException ? '#ff3737' : '#595959',
                                                        fontWeight: isException ? 700 : 500
                                                    }}
                                            >
                                                {dataItem.status}
                                            </STableCell>
                                            <STableCell align="left">{dataItem.dateRange}</STableCell>
                                            <STableCell align="left">{dataItem.totalReturn}</STableCell>
                                            <STableCell align="left">{dataItem.sharpeRatio}</STableCell>
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