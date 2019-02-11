/**
 * This file should be renamed to OtherRow.
 * If any other file exists with the same name, that should be deleted
 */

import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ActionIcon from '../../../../../../components/Buttons/ActionIcon';
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

        const firstValueOptions = _.get(firstValue, 'options', []);
        const secondValueOptions = _.get(secondValue, 'options', []);

        return (
            <Grid 
                    container 
                    alignItems="center"
                    style={{
                        background: '#fff',
                        margin: '5px 0',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        marginBottom: '15px'
                    }}
            >
                <Grid 
                        item 
                        xs={4}
                        style={{...horizontalBox, justifyContent: 'flex-start'}}
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
                    <div 
                            style={{
                                ...verticalBox, 
                                alignItems: 'flex-start',
                                marginLeft: '15px'
                            }}
                    >
                        <ValueHeader>{selectedFirstValue}</ValueHeader>
                        <OptionItems options={firstValueOptions} />                    
                    </div>
                </Grid>
                <Grid item xs={4}>
                    <Chip 
                        label={comparatorObj.label}
                        color="primary"
                    />
                </Grid>
                <Grid 
                        item 
                        xs={4}
                        style={{
                            ...horizontalBox,
                            justifyContent: 'space-between'
                        }}
                >
                    <div style={{...verticalBox, alignItems: 'flex-start'}}>
                        <ValueHeader>{selectedSecondValue}</ValueHeader>          
                        <OptionItems options={secondValueOptions} />             
                    </div>
                    <div 
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'flex-end'
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

const SMAHEader = styled.h3`
    font-size: 16px;
    font-weight: 500;
    color: #222;
`;

const ValueHeader = styled.h3`
    font-size: 16px;
    font-weight: 500;
    color: #222;
`;

const OptionValue = styled.h3`
    font-size: 14px;
    font-weight: 500;
    color: #737373;
`;

const OptionLabel = styled.h3`
    font-size: 14px;
    font-weight: 500;
    color: #9D9D9D;
`;