import _ from 'lodash';
import {indicators as nIndicators} from './indicators';
export const buy = 'BUY';
export const sell = 'SELL';

export const intervals = [
    {label: '1 Minute', value: 60},
    {label: '3 Minutes', value: 180},
    {label: '5 Minutes', value: 300},
    {label: '10 Minutes', value: 600},
    {label: '15 Minutes', value: 900},
    {label: '30 Minutes', value: 1800},
    {label: '1 Hour', value: 3600},
    {label: '2 Hours', value: 7200},
    {label: '5 Hours', value: 18000},
    {label: '7 Hours', value: 25200},
    {label: '10 Hours', value: 36000},
    {label: '15 Hours', value: 54000},
    {label: '20 Hours', value: 72000}
];

export const comparators = [
    {label: 'Is Greater Than', value: 'gt', codeOperator: '>'},
    {label: 'Is Greater Than or Equalto', value: 'gte', codeOperator: '>='},
    {label: 'Is Lower Than', value: 'lt', codeOperator: '<'},
    {label: 'Is Lower Than or Equalto', value: 'lte', codeOperator: '<='},
    {label: 'Crosses Above', value: 'ca', codeOperator: 'crossAbove'},
    {label: 'Crosses Below', value: 'cb', codeOperator: 'crossBelow'},
    {label: 'Is Equal To', value: 'eq', codeOperator: '=='},
];

export const conditionalOperators = [
    {label: 'AND', value: 'and', codeOperator: '&'},
    {label: 'OR', value: 'or', codeOperator: '||'}
];

export const indicators = {
    SMA: {
        label: 'Simple Moving Average',
        options: [
            {key: 'horizon', label: 'Horizon', value: 10, options: [10, 20, 30, 40, 50]}
        ]
    },
    ema: {
        label: 'Exponential Moving Average',
        options: [
            {key: 'horizon', label: 'Horizon', value: 10, options: [10, 20, 30, 40, 50]}
        ]
    },
    macd: {
        label: 'Moving Average Convergence Divergence ',
        options: [
            {key: 'fastPeriod', label: 'Fast', value: 10, options: [10, 20, 30, 40, 50]},
            {key: 'slowPeriod', label: 'Slow', value: 10, options: [10, 20, 30, 40, 50]},
            {key: 'weirdPeriod', label: 'Weird', value: 10, options: [10, 20, 30, 40, 50]}
        ]
    },
    rsi: {
        label: 'Relative Strength Index',
        options: [
            {key: 'period', label: 'Period', value: 10, options: [10, 20, 30, 40, 50]},
            {key: 'close', label: 'Close', value: 10, options: [10, 20, 30, 40, 50]}
        ]
    },
    obv: {
        label: 'On Balance Volume',
        options: [
            {key: 'volume', label: 'Volume', value: 10, options: [10, 20, 30, 40, 50]},
            {key: 'close', label: 'Close', value: 10, options: [10, 20, 30, 40, 50]}
        ]
    }
}

export const getIndicatorValue = (itemKey, key, valueIndex, resolution = 'daily') => {
    const options = _.get(nIndicators, `${itemKey}.options`, []);
    const selectedOptionIndex = _.findIndex(options, option => option.key === key);
    if (selectedOptionIndex > -1) {
        const value = options[selectedOptionIndex].values[resolution][valueIndex] || valueIndex;

        return value;
    } else {
        return valueIndex;
    }
}

export const defaultFirstRowEntryCondition = {
    condition: null, 
    firstValue: {
        key: 'SMA',
        label: 'Simple Moving Average',
        options: [{key: indicators.SMA.options[0].key, value: 10, label: indicators.SMA.options[0].label}]
    },
    comparator: comparators[0].value, 
    secondValue: {
        key: 'SMA',
        label: 'Simple Moving Average',
        options: [{key: indicators.SMA.options[0].key, value: 10, label: indicators.SMA.options[0].label}]
    }
};

export const defaultSecondRowEntryCondition = {
    condition: conditionalOperators[0].value, 
    firstValue: {
        key: 'SMA',
        label: 'Simple Moving Average',
        options: [{key: indicators.SMA.options[0].key, value: 10, label: indicators.SMA.options[0].label}]
    },
    comparator: comparators[0].value, 
    secondValue: {
        key: 'SMA',
        label: 'Simple Moving Average',
        options: [{key: indicators.SMA.options[0].key, value: 10, label: indicators.SMA.options[0].label}]
    }
}

// This wil change 
export const algo = {
    script: {
        instruments: [],
        interval: intervals[0].value
    },
    position: {
        type: buy,
        quantity: null
    },
    entry: [defaultFirstRowEntryCondition],
    exit: [],
    exitConditions: [{buyValue: null, sellValue: null}],
    target: 20,
    stopLoss: 10,
    name: 'My Strategy'
};