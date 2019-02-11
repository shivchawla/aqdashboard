import React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import StockCardRadioGroup from './StockCardRadioGroup';
import DialogComponent from '../../../../../../components/Alerts/DialogComponent';
import {indicators, comparators, getIndicatorValue} from '../../../../constants';
import {verticalBox} from '../../../../../../constants';

const indicatorsArray = Object.keys(indicators);

export default class EditDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedFirstIndicator: indicatorsArray[0],
            selectedComparator: comparators[0].value,
            selectedSecondIndicator: indicatorsArray[0]
        };
    }

    onIndicatorChanged = (e, type = 'firstValue') => {
        const selectedIndex = _.get(this.props, 'selectedIndex', 0);
        const key = e.target.value;
        const algo = _.get(this.props, 'algo', {});
        const entry = _.map(algo.entry, _.cloneDeep);
        let options = indicators[key].options;
        options = options.map(option => ({
            key: option.key, 
            value: 10,
            label: option.label
        }));
        entry[selectedIndex][type] = {
            key,
            options
        }
        const modifiedAlgo = {
            ...algo,
            entry
        }
        this.props.updateAlgo(modifiedAlgo);
    }

    onComparatorChanged = e => {
        const selectedIndex = _.get(this.props, 'selectedIndex', 0);
        const algo = _.get(this.props, 'algo', {});
        const entry = _.map(algo.entry, _.cloneDeep);
        entry[selectedIndex].comparator = e.target.value;
        const modifiedAlgo = {
            ...algo,
            entry
        };
        this.props.updateAlgo(modifiedAlgo);
    }

    processRadioGroupOptions = options => {
        return options.map(option => ({key: option, label: ''}));
    }

    checkIfCustomValue = (options, targetValue) => {
        const targetValueIndex = _.findIndex(options, option => option === targetValue);

        return targetValueIndex > -1;
    }

    onOptionsRadioChanged = (itemKey, key, value, type = 'firstValue') => {
        const selectedValue = getIndicatorValue(itemKey, key, value);
        const selectedIndex = _.get(this.props, 'selectedIndex', 0);
        const algo = _.get(this.props, 'algo', {});
        const entry = _.map(algo.entry, _.cloneDeep);

        const options = _.map(_.get(entry, `[${selectedIndex}][${type}].options`, []), _.cloneDeep);
        const requiredOptionIndex = _.findIndex(options, option => option.key === key);
        options[requiredOptionIndex].value = selectedValue;

        entry[selectedIndex][type] = {
            ...entry[selectedIndex][type],
            options
        };

        const modifiedAlgo = {
            ...algo,
            entry
        }
        this.props.updateAlgo(modifiedAlgo);
    }

    getRadioOptionsSelectedItem = (optioItem, valueOptions) => {
        const selectedIndex = _.findIndex(valueOptions, firstValueOption => firstValueOption.key === optioItem.key);

        return selectedIndex > -1 ? valueOptions[selectedIndex].value : 0;
    }

    render() {
        const selectedIndex = _.get(this.props, 'selectedIndex', 0);
        const {open, onClose, algo} = this.props;
        const firstValueProp = _.get(algo, `entry[${selectedIndex}].firstValue`, {});
        const secondValueProp = _.get(algo, `entry[${selectedIndex}].secondValue`, {});

        const firstValueSelectedOption = _.get(firstValueProp, 'key', 'sma');
        const secondValueSelectedOption = _.get(secondValueProp, 'key', 'sma');

        const firstValueOptions = _.get(firstValueProp, 'options', []);
        const secondValueOptions = _.get(secondValueProp, 'options', []);

        const firstOptions = _.get(indicators, `[${firstValueSelectedOption}].options`, []);
        const secondOptions = _.get(indicators, `[${secondValueSelectedOption}].options`, []);

        const selectedComparator = _.get(algo, `entry[${selectedIndex}].comparator`, comparators[0].value);

        return (
            <DialogComponent
                    title='Edit Condition'
                    open={open}
                    onClose={onClose}
                    style={{
                        width: '90vw',
                        height: '100vh',
                        boxSizing: 'border-box'
                    }}
                    maxWidth='xl'
            >
                <Grid container>
                    <Grid 
                            item 
                            xs={4}
                            style={{
                                ...verticalBox,
                                alignItems: 'flex-start'
                            }}
                    >
                        <Select
                                value={firstValueSelectedOption}
                                onChange={e => this.onIndicatorChanged(e, 'firstValue')}
                        >
                            {
                                indicatorsArray.map((indicator, index) => (
                                    <MenuItem 
                                        key={index}
                                        value={indicator}
                                    >
                                        {indicators[indicator].label}
                                    </MenuItem>
                                ))
                            }
                        </Select>
                        <div>
                            {
                                firstOptions.map((optionItem, index) => (
                                    <StockCardRadioGroup 
                                        label={optionItem.label}
                                        defaultSelected={this.getRadioOptionsSelectedItem(optionItem, firstValueOptions)}
                                        key={index}
                                        items={this.processRadioGroupOptions(optionItem.options)}
                                        hideLabel={true}
                                        checkIfCustom={target => this.checkIfCustomValue(target, firstOptions)}
                                        showSlider={true}
                                        onChange={value => {this.onOptionsRadioChanged(firstValueSelectedOption, optionItem.key, value, 'firstValue')}}
                                    />
                                ))
                            }                        
                        </div>
                    </Grid>
                    <Grid item xs={4}>
                        <Select
                                value={selectedComparator}
                                onChange={this.onComparatorChanged}
                        >
                            {
                                comparators.map((comparator, index) => (
                                    <MenuItem 
                                        key={index}
                                        value={comparator.value}
                                    >
                                        {comparator.label}
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </Grid>
                    <Grid item xs={4}>
                        <Select
                                value={secondValueSelectedOption}
                                onChange={e => this.onIndicatorChanged(e, 'secondValue')}
                        >
                            {
                                indicatorsArray.map((indicator, index) => (
                                    <MenuItem 
                                        key={index}
                                        value={indicator}
                                    >
                                        {indicators[indicator].label}
                                    </MenuItem>
                                ))
                            }
                        </Select>
                        <div>
                            {
                                secondOptions.map((optionItem, index) => (
                                    <StockCardRadioGroup 
                                        defaultSelected={this.getRadioOptionsSelectedItem(optionItem, secondValueOptions)}
                                        key={index}
                                        items={this.processRadioGroupOptions(optionItem.options)}
                                        hideLabel={true}
                                        checkIfCustom={target => this.checkIfCustomValue(target, secondOptions)}
                                        label={optionItem.label}
                                        showSlider={true}
                                        onChange={value => {this.onOptionsRadioChanged(secondValueSelectedOption, optionItem.key, value, 'secondValue')}}
                                    />
                                ))
                            }                        
                        </div>
                    </Grid> 
                </Grid>
            </DialogComponent>
        );
    }
}