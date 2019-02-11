import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import ActionIcon from '../../../../../../components/Buttons/ActionIcon';
import {comparators} from '../../../../constants';
import {horizontalBox, verticalBox} from '../../../../../../constants';

export default class FirstRow extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {
            index = 0,
            toggleEditDialog
        } = this.props;
        const conditionProp = _.get(this.props, 'condition', {});
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
                        backgroundColor: '#f9f9f9',
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
                        style={{...verticalBox, alignItems: 'flex-start'}}
                >
                    <ValueHeader>{selectedFirstValue}</ValueHeader>
                    <OptionItems options={firstValueOptions} />
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
                    <ActionIcon 
                        type='edit' 
                        onClick={() => toggleEditDialog(index)} 
                    />
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