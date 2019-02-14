import React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import {horizontalBox} from '../../../../../constants';
import ConditionRow from '../common/ConditionRow';
import {defaultFirstRowEntryCondition, defaultSecondRowEntryCondition} from '../../../constants';
import {primaryColor} from '../../../../../constants';

export default class Exit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editDialogOpen: false,
            selectedCondition: 0
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(_.get(this.props, 'algo.exit', {}), _.get(nextProps, 'algo.exit', {})) 
                || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    onComparatorChange = (value, index) => {
        const {algo} = this.props;
        const exitConditions = _.map(_.get(algo, 'exit', []), _.cloneDeep);
        exitConditions[index]['comparator'] = value;
        const modifiedScript = {
            ...algo,
            exit: exitConditions
        };
        this.props.updateAlgo(modifiedScript);
    }

    onFirstValueChange = (value, index) => {
        const {algo} = this.props;
        const exitConditions = _.map(_.get(algo, 'exit', []), _.cloneDeep);
        exitConditions[index]['firstValue'] = value;
        const modifiedScript = {
            ...algo,
            exit: exitConditions
        };
        this.props.updateAlgo(modifiedScript);
    }

    onSecondValueChange = (value, index) => {
        const {algo} = this.props;
        const exitConditions = _.map(_.get(algo, 'exit', []), _.cloneDeep);
        exitConditions[index]['secondValue'] = value;
        const modifiedScript = {
            ...algo,
            exit: exitConditions
        };
        this.props.updateAlgo(modifiedScript);
    }

    onConditionChange = (value, index) => {
        const {algo} = this.props;
        const exitConditions = _.map(_.get(algo, 'exit', []), _.cloneDeep);
        exitConditions[index]['condition'] = value;
        const modifiedScript = {
            ...algo,
            exit: exitConditions
        };
        this.props.updateAlgo(modifiedScript);
    }

    addCondition = () => {
        const {algo} = this.props;
        const exitConditions = _.map(_.get(algo, 'exit', []), _.cloneDeep);
        if (exitConditions.length >= 5) {
            return;
        }
        const requiredExitCondition = exitConditions.length === 0 
                ? defaultFirstRowEntryCondition
                : defaultSecondRowEntryCondition;
        exitConditions.push(requiredExitCondition);
        const modifiedScript = {
            ...algo,
            exit: exitConditions
        };
        this.props.updateAlgo(modifiedScript);
    }

    deleteCondition = (index = 0) => {
        const {algo} = this.props;
        const exitConditions = _.map(_.get(algo, 'exit', []), _.cloneDeep);
        if (exitConditions.length === 0) {
            return;
        }
        exitConditions.splice(index, 1);
        const modifiedScript = {
            ...algo,
            exit: exitConditions
        };
        this.props.updateAlgo(modifiedScript);
    }

    updateSelectedCondition = index => {
        this.setState({selectedCondition: index}, () => {
            this.toggleEditDialog();
        })
    }

    toggleEditDialog = () => {
        this.setState({editDialogOpen: !this.state.editDialogOpen});
    }

    render() {
        const {algo, updateAlgo, edit = true} = this.props;
        const conditions = _.get(algo, 'exit', []);
        const rowProps = {
            onComparatorChange: this.onComparatorChange,
            onFirstValueChange: this.onFirstValueChange,
            onSecondValueChange: this.onSecondValueChange,
            onConditionChange: this.onConditionChange,
            toggleEditDialog: this.updateSelectedCondition,
            deleteCondition: this.deleteCondition,
            algo,
            updateAlgo,
            edit
        };

        return (
            <Grid 
                    container 
                    style={{
                        boxSizing: 'border-box'
                    }}
            >
                {
                    conditions.length < 5 && edit &&
                    <Grid 
                            item xs={12} 
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'flex-end',
                                marginBottom: '5px',
                                marginTop: '-34px'
                            }}
                    >
                        <Button
                                onClick={this.addCondition}
                                style={{
                                    borderLeft: `2px solid ${primaryColor}`,
                                    borderRadius: 0,
                                    backgroundColor: '#00000012'
                                }}
                                size="small"
                        >
                            Add Condition
                            <Icon style={{marginLeft: '5px', color: primaryColor}}>add_circle</Icon>
                        </Button>
                    </Grid>
                }
                <Grid item xs={12}>
                    {
                        conditions.map((condition, index) => (
                            <ConditionRow 
                                index={index}
                                condition={condition}
                                requiredConditionsKey='exit'
                                {...rowProps}
                            />
                        ))
                    }
                </Grid>
            </Grid>
        );
    }
}
