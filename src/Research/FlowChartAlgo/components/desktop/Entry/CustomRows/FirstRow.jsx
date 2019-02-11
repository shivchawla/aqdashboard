import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import IndicatorLabel from '../../common/IndicatorLabel';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import ActionIcon from '../../../../../../components/Buttons/ActionIcon';
import {comparators} from '../../../../constants';
import {ValueHeader, OptionValue, OptionLabel, Comparator} from '../../common/RowTexts';
import {horizontalBox, verticalBox, primaryColor} from '../../../../../../constants';

export default class FirstRow extends React.Component {
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

        const selectedFirstValueLabel = _.get(firstValue, 'label', '');
        const selectedSecondValueLabel = _.get(secondValue, 'label', '');

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
                        style={{
                            ...verticalBox,
                            alignItems: 'flex-start'
                        }}
                >
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
                <Grid 
                        item 
                        xs={5}
                        style={{
                            ...verticalBox,
                            alignItems: 'flex-start'
                        }}
                >
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
                                <ActionIcon 
                                    type='edit' 
                                    onClick={() => toggleEditDialog(index)} 
                                    style={{position: 'absolute', right: 0}}
                                />
                            </div>
                            <IndicatorLabel>{selectedSecondValueLabel}</IndicatorLabel>
                        </div>
                    </div>
                    <OptionItems options={secondValueOptions} />
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
