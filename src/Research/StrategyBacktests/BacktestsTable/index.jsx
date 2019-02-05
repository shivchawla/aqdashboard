import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import {withRouter} from 'react-router-dom';
import Button from '@material-ui/core/Button';
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
        const { onSelectAllClick, order, orderBy, numSelected, rowCount } = this.props;

        return (
            <TableHead>
                <TableRow>
                    <TableCell padding="checkbox">
                        <Checkbox
                            indeterminate={numSelected > 0 && numSelected < rowCount}
                            checked={numSelected === rowCount}
                            onChange={onSelectAllClick}
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
    const { numSelected, classes, name = ''} = props;

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
                        ? 
                        (
                            <Typography color="inherit" variant="subtitle1">
                                {numSelected} selected
                            </Typography>
                        ) 
                        : 
                        (
                            <Typography variant="h6" id="tableTitle">
                                All Backtests for {name}
                            </Typography>
                        )
                }
            </div>
            <div className={classes.spacer} />
            <div className={classes.actions}>
                {
                    numSelected > 0 && numSelected <= 5
                        ?
                            <Button 
                                    variant='contained' 
                                    color='secondary'
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
                                    <IconButton aria-label="Delete">
                                        <DeleteIcon style={{color: 'red'}} />
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
        console.log(name);
        console.log(id);
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
        const { classes } = this.props;
        const {data = []} = this.props;
        const {order, orderBy, selected} = this.state;

        return (
            <Paper className={classes.root}>
                <EnhancedTableToolbar 
                    numSelected={data.filter(item => item.selected === true).length} 
                    openCompare={this.props.openCompare} 
                />
                <div className={classes.tableWrapper}>
                    <Table className={classes.table} aria-labelledby="tableTitle">
                        <EnhancedTableHead
                            numSelected={data.filter(item => item.selected === true).length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={this.handleSelectAllClick}
                            rowCount={data.length}
                        />
                        <TableBody>
                            {
                                data.map((item, index) => {
                                    const dataItem = processRowData(item, index);
                                    return (
                                        <TableRow
                                            hover
                                            onClick={event => this.handleClick(dataItem.name, dataItem.id)}
                                            role="checkbox"
                                            aria-checked={item.selected}
                                            tabIndex={-1}
                                            key={dataItem.id}
                                            selected={item.selected}
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
                                                />
                                            </STableCell>
                                            <STableCell align="left">
                                                {dataItem.name}
                                            </STableCell>
                                            <STableCell align="left">{dataItem.createdAt}</STableCell>
                                            <STableCell align="left">{dataItem.status}</STableCell>
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
`;