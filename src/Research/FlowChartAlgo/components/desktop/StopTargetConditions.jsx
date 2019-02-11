import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import classNames from 'classnames';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import {withStyles} from '@material-ui/core/styles';
import SectionHeader from './common/SectionHeader';

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
        if (conditions.length > 1) {
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
            <Grid 
                    container 
                    spacing={24}
            >
                <Grid item xs={12}>
                    {
                        conditions.map((condition, index) => {
                            return (
                                <ExitConditionRow 
                                    condition={condition}
                                    index={index}
                                    key={index}
                                    deleteCondition={this.deleteCondition}
                                    modifyCondition={this.modifyCondition}
                                />
                            );
                        })
                    }
                </Grid>
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
        const {condition, index, classes, modifyCondition} = this.props;

        return (
            <Grid 
                    container 
                    key={index}
                    style={{
                        boxSizing: 'border-box',
                        // padding: '0 20px',
                    }}
                    spacing={24}
            >
                {/* <Grid item xs={12}>
                    <SectionHeader>Stop/Target</SectionHeader>
                </Grid> */}
                <Grid item xs={6} style={{marginLeft: '-8px'}}>
                    <TextField
                        id={`filled-dense-${index}`}
                        ref={el => this.textField = el}
                        className={classNames(classes.textField, classes.dense)}
                        margin="dense"
                        value={condition.buyValue}
                        placeholder="Exit"
                        onChange={e => {
                            modifyCondition(index, 'buyValue', e.target.value);
                        }}
                        type="number"
                        onClick={this.openPopover}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        id="filled-dense"
                        className={classNames(classes.textField, classes.dense)}
                        margin="dense"
                        placeholder="Target"
                        value={condition.sellValue}
                        onChange={e => {
                            modifyCondition(index, 'sellValue', e.target.value);
                        }}
                        type="number"
                    />
                </Grid>
            </Grid>
        );
    }
}

const ExitConditionRow = withStyles(styles)(ExitConditionRowImpl);
