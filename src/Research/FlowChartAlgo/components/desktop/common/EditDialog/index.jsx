import React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {withStyles} from '@material-ui/core/styles';
import StockCardRadioGroup from './StockCardRadioGroup';
import AutoComplete from '../../../../../../components/input/AutoComplete';
import {indicators, comparators, getIndicatorValue} from '../../../../constants';
import {verticalBox, horizontalBox} from '../../../../../../constants';

const indicatorsArray = Object.keys(indicators);

const styles = {
    menuItemRoot: {
        fontSize: '14px',
        fontWeight: 400,
        fontFamily: 'Lato, sans-serif'
    },
    selectInput: {
        fontSize: '14px',
        fontWeight: 700,
        fontFamily: 'Lato, sans-serif'
    }
}

class EditDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedFirstIndicator: indicatorsArray[0],
            selectedComparator: comparators[0].value,
            selectedSecondIndicator: indicatorsArray[0]
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.state, nextState) || !_.isEqual(nextProps, this.props)) {
            return true;
        }

        return false;
    }

    onIndicatorChanged = (key, type = 'firstValue') => {
        const selectedIndex = _.get(this.props, 'selectedIndex', 0);
        const {requiredConditionsKey} = this.props;
        const algo = _.get(this.props, 'algo', {});
        const conditions = _.map(algo[requiredConditionsKey], _.cloneDeep);
        let options = indicators[key].options;
        options = options.map(option => ({
            key: option.key, 
            value: 10,
            label: option.label
        }));
        conditions[selectedIndex][type] = {
            label: indicators[key].label,
            key,
            options,
        }
        const modifiedAlgo = {
            ...algo,
            [requiredConditionsKey]: conditions
        }
        this.props.updateAlgo(modifiedAlgo);
    }

    onComparatorChanged = e => {
        const selectedIndex = _.get(this.props, 'selectedIndex', 0);
        const {requiredConditionsKey} = this.props;
        const algo = _.get(this.props, 'algo', {});
        const conditions = _.map(algo[requiredConditionsKey], _.cloneDeep);
        conditions[selectedIndex].comparator = e.target.value;
        const modifiedAlgo = {
            ...algo,
            [requiredConditionsKey]: conditions
        };
        this.props.updateAlgo(modifiedAlgo);
    }

    processRadioGroupOptions = options => {
        return options.map(option => ({key: option, label: ''}));
    }

    checkIfCustomValue = (options, targetValue) => {
        const targetValueIndex = _.findIndex(options, option => option === targetValue);

        return targetValueIndex === -1;
    }

    onOptionsRadioChanged = (itemKey, key, value, type = 'firstValue', custom = false) => {
        const selectedValue = custom ? value : getIndicatorValue(itemKey, key, value);
        const selectedIndex = _.get(this.props, 'selectedIndex', 0);
        const {requiredConditionsKey} = this.props;
        const algo = _.get(this.props, 'algo', {});
        const conditions = _.map(algo[requiredConditionsKey], _.cloneDeep);

        const options = _.map(_.get(conditions, `[${selectedIndex}][${type}].options`, []), _.cloneDeep);
        const requiredOptionIndex = _.findIndex(options, option => option.key === key);
        options[requiredOptionIndex].value = selectedValue;

        conditions[selectedIndex][type] = {
            ...conditions[selectedIndex][type],
            options
        };

        const modifiedAlgo = {
            ...algo,
            [requiredConditionsKey]: conditions
        }
        this.props.updateAlgo(modifiedAlgo);
    }

    getRadioOptionsSelectedItem = (optioItem, valueOptions) => {
        const selectedIndex = _.findIndex(valueOptions, firstValueOption => firstValueOption.key === optioItem.key);

        return selectedIndex > -1 ? valueOptions[selectedIndex].value : 0;
    }

    formatIndicatorsToAutoCompleteOptions = () => {
        return indicatorsArray.map(indicator => {
            return {
                value: indicator, 
                label: indicators[indicator].label
            }
        })
    }

    constructAutocompleteValue = key => {
        return {value: key, label: key.toUpperCase()};
    }

    render() {
        const {classes} = this.props;
        const selectedIndex = _.get(this.props, 'selectedIndex', 0);
        const {algo, requiredConditionsKey} = this.props;
        const firstValueProp = _.get(algo, `[${requiredConditionsKey}][${selectedIndex}].firstValue`, {});
        const secondValueProp = _.get(algo, `[${requiredConditionsKey}][${selectedIndex}].secondValue`, {});

        const firstValueSelectedOption = _.get(firstValueProp, 'key', 'sma');
        const secondValueSelectedOption = _.get(secondValueProp, 'key', 'sma');

        const firstValueOptions = _.get(firstValueProp, 'options', []);
        const secondValueOptions = _.get(secondValueProp, 'options', []);

        const firstOptions = _.get(indicators, `[${firstValueSelectedOption}].options`, []);
        const secondOptions = _.get(indicators, `[${secondValueSelectedOption}].options`, []);

        const selectedComparator = _.get(algo, `[${requiredConditionsKey}][${selectedIndex}].comparator`, comparators[0].value);

        return (
            <div 
                    style={this.props.style}
            >
                <Grid 
                        container 
                        alignItems="flex-start"
                        style={{
                            padding: '10px',
                            boxSizing: 'border-box',
                            background: '#fff'
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
                        <AutoComplete 
                            options={this.formatIndicatorsToAutoCompleteOptions()}
                            async={false}
                            onClick={item => this.onIndicatorChanged(item.value, 'firstValue')}
                            defaultMenuIsOpen={false}
                            value={this.constructAutocompleteValue(firstValueSelectedOption)}
                        />
                        <div>
                            {
                                firstOptions.map((optionItem, index) => (
                                    <StockCardRadioGroup 
                                        label={optionItem.label}
                                        defaultSelected={this.getRadioOptionsSelectedItem(optionItem, firstValueOptions)}
                                        key={index}
                                        items={this.processRadioGroupOptions(optionItem.options)}
                                        hideLabel={true}
                                        checkIfCustom={target => this.checkIfCustomValue(optionItem.options, target)}
                                        showSlider={true}
                                        onChange={(value, custom = false) => {this.onOptionsRadioChanged(firstValueSelectedOption, optionItem.key, value, 'firstValue', custom)}}
                                    />
                                ))
                            }                        
                        </div>
                    </Grid>
                    <Grid item xs={4} style={{...horizontalBox, justifyContent: 'center'}}>
                        <Select
                                value={selectedComparator}
                                onChange={this.onComparatorChanged}
                                classes={{
                                    select: classes.selectInput
                                }}
                        >
                            {
                                comparators.map((comparator, index) => (
                                    <MenuItem 
                                        key={index}
                                        value={comparator.value}
                                        classes={{
                                            root: classes.menuItemRoot
                                        }}
                                    >
                                        {comparator.label}
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </Grid>
                    <Grid item xs={4}>
                        <AutoComplete 
                            options={this.formatIndicatorsToAutoCompleteOptions()}
                            async={false}
                            onClick={item => this.onIndicatorChanged(item.value, 'secondValue')}
                            defaultMenuIsOpen={false}
                            value={this.constructAutocompleteValue(secondValueSelectedOption)}
                        />
                        <div>
                            {
                                secondOptions.map((optionItem, index) => (
                                    <StockCardRadioGroup 
                                        defaultSelected={this.getRadioOptionsSelectedItem(optionItem, secondValueOptions)}
                                        key={index}
                                        items={this.processRadioGroupOptions(optionItem.options)}
                                        hideLabel={true}
                                        checkIfCustom={target => this.checkIfCustomValue(optionItem.options, target)}
                                        label={optionItem.label}
                                        showSlider={true}
                                        onChange={(value, custom = false) => {this.onOptionsRadioChanged(secondValueSelectedOption, optionItem.key, value, 'secondValue', custom)}}
                                    />
                                ))
                            }                        
                        </div>
                    </Grid> 
                </Grid>
            </div>
        );
    }
}

export default withStyles(styles)(EditDialog)