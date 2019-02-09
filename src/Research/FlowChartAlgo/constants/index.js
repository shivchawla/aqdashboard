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
    {label: 'Higher Than', value: 'ht', codeOperator: '>'},
    {label: 'Lower Than', value: 'lt', codeOperator: '<'},
    {label: 'Crosses Above', value: 'ca', codeOperator: 'ca'},
    {label: 'Crosses Below', value: 'cb', codeOperator: 'cb'},
    {label: 'Equal To', value: 'eq', codeOperator: '='},
];

export const conditionalOperators = [
    {label: 'AND', value: 'and', codeOperator: '&'},
    {label: 'OR', value: 'or', codeOperator: '||'}
];

// This wil change 
export const algo = {
    script: {
        instruments: [],
        interval: intervals[0].value
    },
    position: {
        type: buy,
        quantity: 10
    },
    entry: [
        {condition: null, firstValue: 0, comparator: comparators[0].value, secondValue: 0}
    ],
    exitConditions: [{buyValue: 0, sellValue: 0}]
};

export const indicators = {
    sma: {
        label: 'SMA',
        options: [
            {key: 'period', label: 'Period', value: 0}
        ]
    },
    ema: {
        label: 'EMA',
        options: [
            {key: 'period', label: 'Period', value: 0}
        ]
    },
    macd: {
        label: 'MACD',
        options: [
            {key: 'fastPeriod', label: 'Fast Period', value: 0},
            {key: 'slowPeriod', label: 'Slow Period', value: 0},
            {key: 'slowPeriod', label: 'Slow Period', value: 0}
        ]
    },
    rsi: {
        label: 'Relative Strength Index',
        options: [
            {key: 'period', label: 'Period', value: 0},
            {key: 'close', label: 'Close', value: 0}
        ]
    },
    obv: {
        label: 'On Balance Volume',
        options: [
            {key: 'volume', label: 'Volume', value: 0},
            {key: 'close', label: 'Close', value: 0}
        ]
    }
}