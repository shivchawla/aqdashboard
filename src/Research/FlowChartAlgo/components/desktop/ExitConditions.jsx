import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import {withStyles} from '@material-ui/core/styles';
import {horizontalBox} from '../../../../constants';
import ActionIcon from '../../../../components/Buttons/ActionIcon';

const styles = theme => ({
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: '100%'
    },
    dense: {
        marginTop: 16,
    }
})

export default class ExitCondition extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(_.get(this.props, 'algo.exitConditions', {}), _.get(nextProps, 'algo.exitConditions', {})) 
                || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    addExitCondition = () => {
        const {algo} = this.props;
        const conditions = _.map(_.get(algo, 'exitConditions', []), _.cloneDeep);
        if (conditions.length > 5) {
            return;
        }
        conditions.push({
            buyValue: 0,
            sellValue: 0
        });
        const modifiedScript = {
            ...algo,
            exitConditions: conditions
        };
        this.props.updateAlgo(modifiedScript);
    }

    modifyCondition = (index, type = 'buyValue', value) => {
        const {algo} = this.props;
        const conditions = _.map(_.get(algo, 'exitConditions', []), _.cloneDeep);
        conditions[index][type] = value;
        const modifiedScript = {
            ...algo,
            exitConditions: conditions
        };
        this.props.updateAlgo(modifiedScript);
    }

    deleteCondition = index => {
        const {algo} = this.props;
        const conditions = _.map(_.get(algo, 'exitConditions', []), _.cloneDeep);
        conditions.splice(index, 1);
        const modifiedScript = {
            ...algo,
            exitConditions: conditions
        };
        this.props.updateAlgo(modifiedScript);
    }

    render() {
        const {algo} = this.props;
        const conditions = _.get(algo, 'exitConditions', []);

        return (
            <Grid container spacing={24}>
                <Grid 
                        item 
                        xs={12} 
                        style={{
                            ...horizontalBox,
                            justifyContent: 'flex-start'
                        }}
                >
                    <ActionIcon type='add_circle' onClick={this.addExitCondition} />
                    <h3>Add Exit Condition</h3>
                </Grid>
                {
                    conditions.map((condition, index) => {
                        return (
                            <ExitConditionRow 
                                condition={condition}
                                index={index}
                                key={index}
                            />
                        );
                    })
                }
            </Grid>
        );
    }
}

class ExitConditionRowImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null
        };
        this.textField = null
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    openPopover = event => {
        this.setState({
            anchorEl: event.currentTarget
        })
    }

    closePopover = () => {
        this.setState({
            anchorEl: null
        })
    }

    render() {
        const {condition, index, classes} = this.props;

        return (
            <React.Fragment key={index}>
                <Grid item xs={5}>
                    <TextField
                        id={`filled-dense-${index}`}
                        ref={el => this.textField = el}
                        label="LONG"
                        className={classNames(classes.textField, classes.dense)}
                        margin="dense"
                        variant="filled"
                        value={condition.buyValue}
                        onChange={e => {
                            this.modifyCondition(index, 'buyValue', e.target.value);
                        }}
                        type="number"
                        onClick={this.openPopover}
                    />
                </Grid>
                <Grid item xs={5}>
                    <TextField
                        id="filled-dense"
                        label="SHORT"
                        className={classNames(classes.textField, classes.dense)}
                        margin="dense"
                        variant="filled"
                        value={condition.sellValue}
                        onChange={e => {
                            this.modifyCondition(index, 'sellValue', e.target.value);
                        }}
                        type="number"
                    />
                </Grid>
                <Grid item xs={2}>
                    <ActionIcon 
                        type='delete' 
                        onClick={() => this.deleteCondition(index)} 
                    />
                </Grid>
            </React.Fragment>
        );
    }
}

const ExitConditionRow = withStyles(styles)(ExitConditionRowImpl);
