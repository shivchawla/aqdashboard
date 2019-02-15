import _ from 'lodash';
import {comparators, conditionalOperators} from '../constants';

export const parseObjectToCode = codeObj => {
    const type = _.get(codeObj, 'position.type', 'BUY');
    return `# This is a machine generated code.

${getInitializeMethodString(codeObj)}

${getConditionMethodString('longEntryCondition', codeObj.entry, type === 'BUY')}

${getConditionMethodString('longExitCondition', codeObj.exit, type === 'BUY')}

${getConditionMethodString('shortEntryCondition', codeObj.entry, type === 'SELL')}

${getConditionMethodString('shortExitCondition', codeObj.exit, type === 'SELL')}

${getDataMethodString()}
`;
}

export const getDataMethodString = () => {
    return `function ondata(data, state)

end`;
}

export const getInitializeMethodString = (codeObj) => {
    const script = _.get(codeObj, 'script', {});
    const stopLoss = Number(_.get(codeObj, 'stopLoss', 0)).toFixed(1);
    const target = Number(_.get(codeObj, 'target', 0)).toFixed(1);
    const instruments = _.get(script, 'instruments', []);
    const setUniverseString = setUniverse(instruments);
    const stopLossString = setStopLoss(stopLoss);
    const targetString = setProfitTarget(target);

    const methodString = `function initialize(state)
    ${stopLossString}
    ${targetString}
end`;

    return methodString;
}

export const setUniverse = (instruments = []) => {
    const instrumentString = `setuniverse()`;
    
    return instrumentString;
}

export const setStopLoss = stopLoss => {
    const stopLossString = `setStopLoss(${stopLoss})`;
    
    return stopLossString;
}

export const setProfitTarget = target => {
    const setProfitString = `setProfitTarget(${target})`;
    
    return setProfitString;
}

export const getConditionMethodString = (methodName, conditions, showCode = true) => {
    let parsedString = [];
    parsedString = conditions.map(condition => {
        return getCondition(condition);
    });

    parsedString = parsedString.join('').replace(/\n/g, '');
    let methodString = '';
    methodString = constructMethodString(methodName, parsedString, showCode);

    return methodString;
}

const constructMethodString = (methodName, parsedString, showCode = true) => {
    let methodString = '';
    if (showCode) {
        methodString = `function ${methodName}()
    return${parsedString}
end
    `;
    } else {
        methodString = `${methodName}() = nothing`;
    }

    return methodString;
}   

const getCondition = condition => {
    let conditionOperator = _.get(condition, 'condition', null);
    let comparator = _.get(condition, 'comparator', 'eq');
    
    let firstValue = _.get(condition, 'firstValue', 0);
    let secondValue = _.get(condition, 'secondValue', 0);

    conditionOperator = conditionalOperators.filter(operator => operator.value === conditionOperator)[0];
    conditionOperator = conditionOperator ? conditionOperator.codeOperator : null;

    comparator = comparators.filter(comparatorItem => comparatorItem.value === comparator)[0];
    comparator = comparator ? comparator.codeOperator : null;
    
    let conditionString = '';
    if (comparator === 'crossAbove' || comparator === 'crossBelow') {
        conditionString = ` ${isValuePresent(conditionOperator) ? conditionOperator : ''} ${comparator}(${getIndicatorValue(firstValue)}, ${getIndicatorValue(secondValue)})\n`;
    } else {
        conditionString = ` ${isValuePresent(conditionOperator) ? conditionOperator : ''} (${getIndicatorValue(firstValue)} ${comparator} ${getIndicatorValue(secondValue)})\n`;
    }

    return conditionString;
}

const getIndicatorValue = indicatorValue => {
    const methodName = _.get(indicatorValue, 'key', 'sma').toUpperCase();
    const options = _.get(indicatorValue, 'options', []);
    let argumentString = [];
    options.forEach(optionItem => {
        argumentString.push(`${optionItem.key} = ${optionItem.value}`);
    });

    return `${methodName}(${argumentString.join(',')})`;
}

const isValuePresent = value => {
    return value !== null && value !== undefined;
}
 