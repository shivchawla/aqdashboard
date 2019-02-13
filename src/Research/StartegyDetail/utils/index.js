import _ from 'lodash';
import {comparators, indicators, conditionalOperators} from '../../FlowChartAlgo/constants';

export const processAlgoConditions = (conditions = []) => {
    return conditions.map((condition, index) => {
        const operator = _.get(condition, 'comparator', 'ht').toUpperCase();

        const indicatorOneName = _.get(condition, 'firstValue.key', 'sma').toUpperCase();
        const indicatorTwoName = _.get(condition, 'secondValue.key', 'sma').toUpperCase();

        const inidcatorOneOptions = _.get(condition, 'firstValue.options', []);
        const inidcatorTwoOptions = _.get(condition, 'secondValue.options', []);

        let indicatorOneParams = {};
        inidcatorOneOptions.forEach(indicator => {
            indicatorOneParams = {
                ...indicatorOneParams,
                [indicator.key]: indicator.value
            }
        });

        let indicatorTwoParams = {};
        inidcatorTwoOptions.forEach(indicator => {
            indicatorTwoParams = {
                ...indicatorTwoParams,
                [indicator.key]: indicator.value
            }
        });

        return {
            indicator1: {
                name: indicatorOneName,
                params: indicatorOneParams
            },
            indicator2: {
                name: indicatorTwoName,
                params: indicatorTwoParams
            },
            operator,
            name: `c${index +1}`
        }
    })
}

export const constructLogic = (conditions = []) => {
    let logic = [];

    conditions.forEach((conditionItem, index) => {
        const comparator = _.get(conditionItem, 'condition', null);
        let comparatorValue = '';
        const comparatorIndex = _.findIndex(conditionalOperators, item => item.value === comparator);
        if (comparatorIndex > -1) {
            comparatorValue = conditionalOperators[comparatorIndex].value;
            logic.push(comparatorValue);
            logic.push(`c${index+1}`);
        } else {
            logic.push(`c${index+1}`);
            comparatorValue = '';
        }
    });
    logic = logic.join(' ');
    console.log(logic);
    return logic;
}

export const processConditionsToAlgo = (conditions = [], logic = '') => {
    let requiredLogic = logic.split(' ').filter(item => {
        return (item === 'and' || item === 'or');
    });
    requiredLogic = [null, ...requiredLogic];

    return conditions.map((condition, index) => {
        let comparator = _.get(condition, 'operator', 'GT').toLowerCase();

        const indicator1 = _.get(condition, 'indicator1', {});
        const indicator2 = _.get(condition, 'indicator2', {});

        comparator = processOperator(comparator).value;
        let requiredCondition = requiredLogic[index];
        const firstValue = getIndicatorValueObj(indicator1);
        const secondValue = getIndicatorValueObj(indicator2);

        return {
            condition: requiredCondition,
            firstValue,
            comparator,
            secondValue
        }
    })
}

const processOperator = operator => {
    let operatorObjIndex = _.findIndex(comparators, comparator => comparator.value === operator);
    let operatorObj = null;
    if (operatorObjIndex > -1) {
        operatorObj = comparators[operatorObjIndex];
    }

    return operatorObj;
}

const getIndicatorValueObj = indicator => {
    const indicatorParams = _.get(indicator, 'params', {});
    const indicatorName = _.get(indicator, 'name', 'SMA').toLowerCase();
    let indicatorObj = indicators[indicatorName];
    let indicatorKey = indicatorName;

    if (indicatorObj === undefined) {
        indicatorObj = indicators.sma;
        indicatorKey = 'sma'
    }   

    let options = indicatorObj.options;
    options = options.map(optionItem => {
        const optionItemKey = optionItem.key;
        const paramObjValue = indicatorParams[optionItemKey] || 10;
        
        return {key: optionItemKey, value: paramObjValue, label: optionItem.label};
    })

    return {
        key: indicatorKey,
        label: indicatorObj.label,
        options
    }
}

export const defaultSecondRowEntryCondition = {
    condition: conditionalOperators[0].value, 
    firstValue: {
        key: 'sma',
        label: 'Simple Moving Average',
        options: [{key: indicators.sma.options[0].key, value: 10, label: indicators.sma.options[0].label}]
    },
    comparator: comparators[0].value, 
    secondValue: {
        key: 'sma',
        label: 'Simple Moving Average',
        options: [{key: indicators.sma.options[0].key, value: 10, label: indicators.sma.options[0].label}]
    }
}