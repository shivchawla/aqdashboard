/**
 * This file should be renamed to OtherRow.
 * If any other file exists with the same name, that should be deleted
 */

import React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import IndicatorLabel from '../../common/IndicatorLabel';
import ActionIcon from '../../../../../../components/Buttons/ActionIcon';
import {ValueHeader, OptionValue, OptionLabel, Comparator} from '../../common/RowTexts';
import {comparators, conditionalOperators} from '../../../../constants';
import {horizontalBox, verticalBox} from '../../../../../../constants';

export default class OtherRow extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    firstOpenPopover = event => {
        this.setState({
            fristValueAnchorEl: event.currentTarget
        });
    }

    secondOpenPopover = event => {
        this.setState({
            secondValueAnchorEl: event.currentTarget
        });
    }

    firstClosePopover = () => {
        this.setState({
            fristValueAnchorEl: null
        });
    }

    secondClosePopover = () => {
        this.setState({
            secondValueAnchorEl: null
        });
    }

    render() {
        const {
            index = 0,
            toggleEditDialog,
            onConditionChange,
            deleteCondition
        } = this.props;
        const conditionProp = _.get(this.props, 'condition', {});
        const condition = _.get(conditionProp, 'condition', conditionalOperators[0].value);
        const comparator = _.get(conditionProp, 'comparator', comparators[0].value);
        const comparatorObjIndex = _.findIndex(comparators, comparatorItem => comparatorItem.value === comparator);
        const comparatorObj = comparatorObjIndex > -1
                ? comparators[comparatorObjIndex]
                : comparators[0];

        const firstValue = _.get(conditionProp, 'firstValue', {});
        const secondValue = _.get(conditionProp, 'secondValue', {});

        const selectedFirstValue = _.get(firstValue, 'key', '').toUpperCase();
        const selectedSecondValue = _.get(secondValue, 'key', '').toUpperCase();

        const selectedFirstValueLabel = _.get(firstValue, 'label', '');
        const selectedSecondValueLabel = _.get(secondValue, 'label', '');

        const firstValueOptions = _.get(firstValue, 'options', []);
        const secondValueOptions = _.get(secondValue, 'options', []);

        return (
            <Grid 
                    container 
                    alignItems="center"
                    style={{
                        marginBottom: '15px'
                    }}
            >
                <Grid 
                        item 
                        xs={12}
                        style={{
                            marginBottom: '10px'
                        }}
                >
                    <Select
                            value={condition}
                            label='Condition'
                            onChange={e => onConditionChange(e.target.value, index)}
                    >
                        {
                            conditionalOperators.map((comparator, index) => (
                                <MenuItem
                                        value={comparator.value}
                                >
                                    {comparator.label}
                                </MenuItem>
                            ))
                        }
                    </Select>
                </Grid>
                <Grid item xs={12}>
                    <Grid 
                            container
                            style={{
                                background: '#fff',
                                margin: '5px 0',
                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                boxSizing: 'border-box',
                            }}
                            alignItems="center"
                    >
                        <Grid item xs={4}>
                            <div style={{...verticalBox, alignItems: 'flex=start'}}>
                                <ValueHeader>{selectedFirstValue}</ValueHeader>
                                <IndicatorLabel>{selectedFirstValueLabel}</IndicatorLabel>
                            </div>
                            <OptionItems options={firstValueOptions} />
                        </Grid>
                        <Grid item xs={3}>
                            <Chip 
                                label={comparatorObj.label}
                                avatar={<Avatar>{comparatorObj.codeOperator}</Avatar>}
                                // color="primary"
                                variant='outlined'
                            />
                        </Grid>
                        <Grid item xs={5}>
                            <div 
                                    style={{
                                        ...horizontalBox, 
                                        justifyContent: 'space-between',
                                        width: '100%'
                                    }}
                            >
                                <div 
                                        style={{
                                            ...verticalBox, 
                                            alignItems: 'flex-start',
                                            width: '100%'
                                        }}
                                >
                                    <div 
                                            style={{
                                                ...horizontalBox, 
                                                justifyContent: 'space-between', 
                                                width: '100%',
                                                position: 'relative'
                                            }}
                                    >
                                        <ValueHeader>{selectedSecondValue}</ValueHeader>   
                                        <div 
                                                style={{
                                                    ...horizontalBox, 
                                                    justifyContent: 'flex-end',
                                                    position: 'absolute',
                                                    right: 0
                                                }}
                                        >
                                            <ActionIcon 
                                                type='edit' 
                                                onClick={() => toggleEditDialog(index)} 
                                            />
                                            <ActionIcon 
                                                type='cancel'
                                                onClick={() => deleteCondition(index)}
                                                color='#ff5d5d'
                                            />
                                        </div>                         
                                    </div>
                                    <IndicatorLabel>{selectedSecondValueLabel}</IndicatorLabel>
                                </div>
                            </div>
                            <OptionItems options={secondValueOptions} />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        
        );
    }
}

const OptionItems = ({options}) => {
    return (
        <div 
                style={{
                    ...horizontalBox, 
                    justifyContent: 'flex-start',
                }}
        >
            {
                options.map((optionItem, index) => 
                    <OptionItem 
                        key={index} 
                        {...optionItem} 
                    />
                )
            }
        </div>
    );
}

const OptionItem = ({label, value}) => {
    return (
        <div 
                style={{
                    ...verticalBox, 
                    alignItems: 'flex-start',
                    marginRight: '15px'
                }}
        >
            <OptionValue>{value}</OptionValue>
            <OptionLabel>{label}</OptionLabel>
        </div>
    );
}
