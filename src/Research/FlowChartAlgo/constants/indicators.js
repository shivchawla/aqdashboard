export const indicators = {
    "SMA": {
        "label": "Simple Moving Average",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]    
    },

    "CONSTANT": {
        "label": "Constant Value",
        "options": [{
            "defaultValue": {"daily": 10, "minute": 30}, 
            "type": "Constant",
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  1000000, "minute": 1000000}
        }]    
    },

    "EMA": {
        "label": "Exponential Moving Average",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        },
        {
            "key": "wilder", "label": "Wilder", "type": "Boolean",
            "defaultValue": {"daily": false, "minute": false} 
        }]    
    },

    "KAMA": {
        "label": "Kaufman's Adaptive Moving Average",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        },
        {
            "key": "fast", "label": "Fast", "type": "Integer",
            "defaultValue": {"daily": 5, "minute": 10}, 
            "values": {"daily" : [5, 10, 15, 20, 25], "minute": [10, 20, 30, 40, 50]},
            "maxValue" : {"daily":  252, "minute": 9375}
        },
        {
            "key": "slow", "label": "Slow", "type": "Integer",
            "defaultValue": {"daily": 20, "minute": 60}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [60, 120, 180, 240, 300]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]    
    },

    "DEMA": {
        "label": "Double Exponential Moving Average",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        },
        {
            "key": "wilder", "label": "Wilder", "type": "Boolean",
            "defaultValue": {"daily": false, "minute": false} 
        }]    
    },

    "TEMA": {
        "label": "Triple Exponential Moving Average",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        },
        {
            "key": "wilder", "label": "Wilder", "type": "Boolean",
            "defaultValue": {"daily": false, "minute": false} 
        }]    
    },

    "ROC": {
        "label": "Rate of Change",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]    
    },

    "UBB": {
        "label": "Upper Bollinger Band",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 5}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        },
        {
            "key": "width", "label": "Width", "type": "Float",
            "defaultValue": {"daily": 2, "minute": 2}, 
            "values": {"daily" : [1, 2, 3, 4, 5], "minute": [1, 2, 3, 4, 5]},
            "maxValue" : {"daily":  10, "minute": 10}
        }]    
    },

    "LBB": {
        "label": "Lower Bollinger Band",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        },
        {
            "key": "width", "label": "Width", "type": "Float",
            "defaultValue": {"daily": 2, "minute": 30}, 
            "values": {"daily" : [1, 2, 3, 4, 5], "minute": [1, 2, 3, 4, 5]},
            "maxValue" : {"daily":  10, "minute": 10}
        }]    
    },

    "MBB": {
        "label": "Middle Bollinger Band",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        },
        {
            "key": "width", "label": "Width", "type": "Float",
            "defaultValue": {"daily": 2, "minute": 2}, 
            "values": {"daily" : [1, 2, 3, 4, 5], "minute": [1, 2, 3, 4, 5]},
            "maxValue" : {"daily":  10, "minute": 10}
        }]    
    },

    "ADX": {
        "label": "Average Directional Index",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]    
    },

    "PlusDI": {
        "label": "Plus Directional Index",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]    
    },

    "MinusDI": {
        "label": "Minus Directional Index",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]    
    },

    "RSI": {
        "label": "Relative Strength Index",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        },
        {
            "key": "wilder", "label": "Wilder", "type": "Boolean",
            "defaultValue": {"daily": false, "minute": false} 
        }]    
    },

    "CCI": {
        "label": "Commodity Channel Index",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]    
    },

    "MACD": {
        "label": "Moving Average Convergence Diverence",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 20}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [20, 40, 60, 80, 100]},
            "maxValue" : {"daily":  252, "minute": 9375}
        },
        {
            "key": "fast", "label": "Fast", "type": "Integer",
            "defaultValue": {"daily": 5, "minute": 10}, 
            "values": {"daily" : [5, 10, 15, 20, 25], "minute": [10, 20, 30, 40, 50]},
            "maxValue" : {"daily":  252, "minute": 9375}
        },
        {
            "key": "slow", "label": "Slow", "type": "Integer",
            "defaultValue": {"daily": 20, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]    
    },

    "MACDSignal": {
        "label": "Moving Average Convergence Diverence Signal",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 20}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [20, 40, 60, 80, 100]},
            "maxValue" : {"daily":  252, "minute": 9375}
        },
        {
            "key": "fast", "label": "Fast", "type": "Integer",
            "defaultValue": {"daily": 5, "minute": 10}, 
            "values": {"daily" : [5, 10, 15, 20, 25], "minute": [10, 20, 30, 40, 50]},
            "maxValue" : {"daily":  252, "minute": 9375}
        },
        {
            "key": "slow", "label": "Slow", "type": "Integer",
            "defaultValue": {"daily": 20, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]    
    },

    "PrevOPEN": {
        "label": "Previous Open"
    },

    "PrevHIGH": {
        "label": "Previous High"
    },

    "PrevLOW": {
        "label": "Previous Low"
    },

    "PrevCLOSE": {
        "label": "Previous Close"
    },

    "PrevVOLUME": {
        "label": "Previous Volume"
    },

    "LagOPEN": {
        "label": "Lagged Open",
        "options":[{
            "key": "period", "type": "Integer",
            "label": "Lag Period",
            "defaultValue": {"daily": 1, "minute": 5}, 
            "values": {"daily" : [1, 2, 3, 4, 5], "minute": [1, 5, 10, 30, 60]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]
    },

    "LagHIGH": {
        "label": "Lagged High",
        "options":[{
            "key": "period", "type": "Integer",
            "label": "Lag Period",
            "defaultValue": {"daily": 1, "minute": 5}, 
            "values": {"daily" : [1, 2, 3, 4, 5], "minute": [1, 5, 10, 30, 60]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]
    },

    "LagLOW": {
        "label": "Lagged Low",
        "options":[{
            "key": "period", "type": "Integer",
            "label": "Lag Period",
            "defaultValue": {"daily": 1, "minute": 5}, 
            "values": {"daily" : [1, 2, 3, 4, 5], "minute": [1, 5, 10, 30, 60]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]
    },

    "LagCLOSE": {
        "label": "Lagged Close",
        "options":[{
            "key": "period", "type": "Integer",
            "label": "Lag Period",
            "defaultValue": {"daily": 1, "minute": 5}, 
            "values": {"daily" : [1, 2, 3, 4, 5], "minute": [1, 5, 10, 30, 60]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]
    },

    "LagVOLUME": {
        "label": "Lagged Volume",
        "options":[{
            "key": "period", "type": "Integer",
            "label": "Lag Period",
            "defaultValue": {"daily": 1, "minute": 5}, 
            "values": {"daily" : [1, 2, 3, 4, 5], "minute": [1, 5, 10, 30, 60]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]
    },

    "TYPICAL": {
        "label": "Typical Price"
    },

    "TRUERANGE": {
        "label": "True Range"
    },

    "ATR": {
        "label": "Average True Range",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]
    },

    "VWAP": {
        "label": "Volume Weighted Average Price",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]    
    },

    "OBV": {
        "label": "On Balance Volume",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]    
    },

    "ADL": {
        "label": "Accumulation/Distribution Line",
    },

    "AROON_UP":{
        "label":"Aroon Up",
         "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]
    },

    "AROON_DOWN":{
        "label":"Aroon Down",
         "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]
    },

    "AROON_OSC":{
        "label":"Aroon Oscillator",
         "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]
    },

    "CHAIKIN_VOL":{
        "label":"Chaikin Volatility",
         "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        },
        {
            "key": "smooth", "label": "Smooth", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]
    },

    "DONCHIAN_UP":{
        "label":"Donchian Channel (UP)",
         "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]
    },

    "DONCHIAN_DOWN":{
        "label":"Donchian Channel (DOWN)",
         "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]
    },

    "DONCHIAN_MID":{
        "label":"Donchian Channel (MID)",
         "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]
    },

    "CHAIKIN_OSC": {
        "label": "Chaikin Oscillator",
        "options": [{
            "key": "horizon", "label": "Horizon", "type": "Integer",
            "defaultValue": {"daily": 10, "minute":30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        },
        {
            "key": "fast", "label": "Fast", "type": "Integer",
            "defaultValue": {"daily": 5, "minute": 30}, 
            "values": {"daily" : [5, 10, 15, 20, 25], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        },
        {
            "key": "slow", "label": "Slow", "type": "Integer",
            "defaultValue": {"daily": 20, "minute": 30}, 
            "values": {"daily" : [10, 20, 30, 40, 50], "minute": [30, 60, 90, 120, 150]},
            "maxValue" : {"daily":  252, "minute": 9375}
        }]    
    }
}