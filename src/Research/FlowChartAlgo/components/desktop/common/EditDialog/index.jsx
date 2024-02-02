import React from 'react';
import _ from 'lodash';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {withStyles} from '@mui/styles';
import StockCardRadioGroup from './StockCardRadioGroup';
import AutoComplete from '../../../../../../components/input/AutoComplete';
import RadioGroup from '../../../../../../components/Selections/RadioGroup';
import CustomRadio from '../../../../../../components/Selections/CardCustomRadio';
import {comparators, getIndicatorValue} from '../../../../constants';
import {indicators as nIndicators} from '../../../../constants/indicators';
import {verticalBox, horizontalBox} from '../../../../../../constants';

const indicatorsArray = Object.keys(nIndicators);

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
        let {resolution = 'Day'} = this.props;
        resolution = resolution.toUpperCase() === 'DAY' ? 'daily' : 'minute';
        
        const selectedIndex = _.get(this.props, 'selectedIndex', 0);
        const {requiredConditionsKey} = this.props;
        const algo = _.get(this.props, 'algo', {});
        const conditions = _.map(algo[requiredConditionsKey], _.cloneDeep);
        let options = _.get(nIndicators, `[${key}].options`, []);
        options = options.map(option => ({
            key: option.key, 
            value: _.get(option, `defaultValue[${resolution}]`, null),
            label: option.label,
            type: _.get(option, 'type', 'Integer')
        }));
        conditions[selectedIndex][type] = {
            label: nIndicators[key].label,
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

    processRadioGroupOptions = (options = []) => {
        return options.map(option => ({key: option, label: ''}));
    }

    checkIfCustomValue = (options, targetValue) => {
        const targetValueIndex = _.findIndex(options, option => option === targetValue);

        return targetValueIndex === -1;
    }

    onOptionsRadioChanged = (itemKey, key, value, type = 'firstValue', custom = false) => {
        let {resolution = 'Day'} = this.props;
        resolution = resolution.toLowerCase() === 'day' ? 'daily' : 'minute';
        const selectedValue = custom ? value : getIndicatorValue(itemKey, key, value, resolution);
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

    onRadioGroupItemChanged = (key, value, type = 'firstValue') => {
        const selectedValue = value === 0 ? true : false;
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

    getRadioGroupSelectedItem = (optioItem, valueOptions) => {
        const selectedIndex = _.findIndex(valueOptions, firstValueOption => firstValueOption.key === optioItem.key);

        return selectedIndex > -1 
            ? valueOptions[selectedIndex].value === true ? 0 : 1 
            : 0;        
    }

    formatIndicatorsToAutoCompleteOptions = () => {
        return indicatorsArray.map(indicator => {
            return {
                value: indicator, 
                label: nIndicators[indicator].label
            }
        })
    }

    constructAutocompleteValue = key => {
        return {value: key, label: key};
    }

    render() {
        let {classes, resolution = 'Day'} = this.props;

        resolution = resolution.toUpperCase() === 'DAY' ? 'daily' : 'minute';

        const selectedIndex = _.get(this.props, 'selectedIndex', 0);
        const {algo, requiredConditionsKey} = this.props;
        const firstValueProp = _.get(algo, `[${requiredConditionsKey}][${selectedIndex}].firstValue`, {});
        const secondValueProp = _.get(algo, `[${requiredConditionsKey}][${selectedIndex}].secondValue`, {});

        const firstValueSelectedOption = _.get(firstValueProp, 'key', 'SMA');
        const secondValueSelectedOption = _.get(secondValueProp, 'key', 'SMA');

        const firstValueOptions = _.get(firstValueProp, 'options', []);
        const secondValueOptions = _.get(secondValueProp, 'options', []);

        let firstOptions = _.get(nIndicators, `[${firstValueSelectedOption}].options`, []);
        let secondOptions = _.get(nIndicators, `[${secondValueSelectedOption}].options`, []);

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
                            paddingTop: '20px',
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
                                firstOptions.map((optionItem, index) => {
                                    const items = this.processRadioGroupOptions(_.get(optionItem, `values[${resolution}]`, []));
                                    const type = _.get(optionItem, 'type', '');
                                    return (type.toUpperCase() === 'INTEGER' || type.toUpperCase() === 'CONSTANT')
                                    ?   (
                                            <StockCardRadioGroup 
                                                label={optionItem.label}
                                                defaultSelected={this.getRadioOptionsSelectedItem(optionItem, firstValueOptions)} // not done
                                                key={index}
                                                items={items}
                                                max={_.get(optionItem, `maxValue[${resolution}]`, 0)}
                                                min={_.get(optionItem, `minValue[${resolution}]`, 0)}
                                                hideLabel={true}
                                                checkIfCustom={target => this.checkIfCustomValue(_.get(optionItem, `values[${resolution}]`), target)}
                                                showSlider={true}
                                                onChange={(value, custom = false) => {this.onOptionsRadioChanged(firstValueSelectedOption, optionItem.key, value, 'firstValue', custom)}}
                                            />
                                        )
                                    :   <RadioSelection 
                                            label={_.get(optionItem, 'label', '')}
                                            value={this.getRadioGroupSelectedItem(optionItem, firstValueOptions)}
                                            onChange={value => this.onRadioGroupItemChanged(optionItem.key, value, 'firstValue')}
                                        />
                                })
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
                                secondOptions.map((optionItem, index) => {
                                    const type = _.get(optionItem, 'type', '');

                                    return (
                                        type.toUpperCase() === 'INTEGER' || 
                                        type.toUpperCase() === 'CONSTANT' ||
                                        type.toUpperCase() === 'FLOAT' 
                                    )
                                    ?   (
                                            <StockCardRadioGroup 
                                                defaultSelected={this.getRadioOptionsSelectedItem(optionItem, secondValueOptions)}
                                                key={index}
                                                items={this.processRadioGroupOptions(_.get(optionItem, `values[${resolution}]`, []))}
                                                hideLabel={true}
                                                max={_.get(optionItem, `maxValue[${resolution}]`, 0)}
                                                min={_.get(optionItem, `minValue[${resolution}]`, 0)}
                                                checkIfCustom={target => this.checkIfCustomValue(_.get(optionItem, `values[${resolution}]`), target)}
                                                label={optionItem.label}
                                                showSlider={true}
                                                onChange={(value, custom = false) => {this.onOptionsRadioChanged(secondValueSelectedOption, optionItem.key, value, 'secondValue', custom)}}
                                            />
                                        )
                                    :   <RadioSelection 
                                            value={this.getRadioGroupSelectedItem(optionItem, secondValueOptions)}
                                            label={_.get(optionItem, 'label', '')}
                                            onChange={value => this.onRadioGroupItemChanged(optionItem.key, value, 'secondValue')}
                                        />
                                })
                            }                        
                        </div>
                    </Grid> 
                </Grid>
            </div>
        );
    }
}

export default withStyles(styles)(EditDialog)

const RadioSelection = ({label, onChange, value=0}) => {
    return (
        <div style={{...verticalBox, alignItems: 'flex-start'}}>
            <h3 
                    style={{
                        fontSize: '14px',
                        color: '#2e2e2e',
                        fontWeight: 500,
                        fontFamily: 'Lato, sans-serif'
                    }}
            >
                {label}
            </h3>
            <RadioGroup 
                items={['True', 'False']}
                defaultSelected={value}
                onChange={onChange}
                small
                CustomRadio={CustomRadio}
                style={{
                    marginTop: '7px'
                }}
            /> 
        </div>
    );
}