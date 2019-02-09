import _ from 'lodash';
import {comparators, conditionalOperators} from '../constants';

export const parseObjectToCode = codeObj => {
    return `# © AIMSQUANT PVT. LTD.

${getInitializeMethodString(codeObj)}

${getLongEntryMethodString(codeObj)}`;
}

export const getInitializeMethodString = (codeObj) => {
    const script = _.get(codeObj, 'script', {});
    const instruments = _.get(script, 'instruments', []);
    const setUniverseString = setUniverse(instruments);
    console.log(setUniverseString);

    const methodString = `function initialize(state)
    ${setUniverseString}
end`;

    return methodString;
}

export const setUniverse = (instruments = []) => {
    const instrumentString = `setuniverse([${instruments.join(',')}])`;
    
    return instrumentString;
}

export const getLongEntryMethodString = (codeObj) => {
    const entryConditions = _.get(codeObj, 'entry', []);
    let parsedString = [];
    parsedString = entryConditions.map(condition => {
        return getLongEntryCondition(condition);
    });

    parsedString = parsedString.join('').replace(/\n/g, '');

    const methodString = `function longEntryCondition()
    return ${parsedString}
end
    `;
    console.log(methodString);

    return methodString;
}

const getLongEntryCondition = condition => {
    let conditionOperator = _.get(condition, 'condition', null);
    let comparator = _.get(condition, 'comparator', 'eq');
    let firstValue = _.get(condition, 'firstValue', 0);
    let secondValue = _.get(condition, 'secondValue', 0);

    conditionOperator = conditionalOperators.filter(operator => operator.value === conditionOperator)[0];
    conditionOperator = conditionOperator ? conditionOperator.codeOperator : null;

    comparator = comparators.filter(comparatorItem => comparatorItem.value === comparator)[0];
    comparator = comparator ? comparator.codeOperator : null;

    const conditionString = ` ${isValuePresent(conditionOperator) ? conditionOperator : ''} (SMA(horizon=${firstValue}) ${comparator} SMA(horizon=${secondValue}))`;

    return conditionString;
}

const isValuePresent = value => {
    return value !== null && value !== undefined;
}
 