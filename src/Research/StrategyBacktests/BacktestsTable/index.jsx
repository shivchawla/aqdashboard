import React from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
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

let counter = 0;
function createData(name, calories, fat, carbs, protein) {
    counter += 1;
    return { id: counter, name, calories, fat, carbs, protein };
}

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
                                        <span>{row.label}</span>
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
    const { numSelected, classes } = props;

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
                                Nutrition
                            </Typography>
                        )
                }
            </div>
            <div className={classes.spacer} />
            <div className={classes.actions}>
                {
                    numSelected > 0 && numSelected <= 5
                        ?
                            <Button variant='contained' color='secondary'>Compare</Button>
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
        margin: '20px'
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

    handleClick = (event, id) => {
        const { selected } = this.state;
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        this.setState({ selected: newSelected });
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
                <EnhancedTableToolbar numSelected={selected.length} />
                <div className={classes.tableWrapper}>
                    <Table className={classes.table} aria-labelledby="tableTitle">
                        <EnhancedTableHead
                            numSelected={selected.length}
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
                                            onClick={event => this.handleClick(event, dataItem.id)}
                                            role="checkbox"
                                            aria-checked={item.selected}
                                            tabIndex={-1}
                                            key={dataItem.id}
                                            selected={item.selected}
                                        >
                                            <TableCell align="left" padding="checkbox">
                                                <Checkbox 
                                                    checked={item.selected} 
                                                    onChange={e => this.onCheckboxChange(e.target.checked, item)}
                                                />
                                            </TableCell>
                                            <TableCell align="left">
                                                {dataItem.name}
                                            </TableCell>
                                            <TableCell align="left">{dataItem.createdAt}</TableCell>
                                            <TableCell align="left">{dataItem.status}</TableCell>
                                            <TableCell align="left">{dataItem.dateRange}</TableCell>
                                            <TableCell align="left">{dataItem.totalReturn}</TableCell>
                                            <TableCell align="left">{dataItem.sharpeRatio}</TableCell>
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

export default withStyles(styles)(EnhancedTable);
