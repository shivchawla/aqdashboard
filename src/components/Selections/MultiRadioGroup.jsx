import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Radio from '@mui/material/Radio';
import Checkbox from '@mui/material/Checkbox';
import {horizontalBox, primaryColor} from '../../constants';

const disabledColor = '#bdbdbd';

export default class MultiRadioGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: props.defaultSelected || []
        };
    }

    handleChange = value => {
        const selectedArray = _.map(this.state.selected, _.cloneDeep);
        const valueIndex = _.findIndex(selectedArray, item => item === value);
        if (valueIndex > -1) {
            selectedArray.splice(valueIndex, valueIndex + 1);
        } else  {
            selectedArray.push(value);
        }
        this.setState({selected: selectedArray});
        this.props.onChange && this.props.onChange(selectedArray);
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps.defaultSelected, this.props.defaultSelected)) {
            this.setState({selected: nextProps.defaultSelected || 0})
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || (!_.isEqual(this.state, nextState))) {
            return true;
        }

        return false;
    }

    render() {
        const {items = ['One', 'Two'], CustomRadio = null, small = false} = this.props;
        // const CustomRadioComponent = CustomRadio !== null ? CustomRadio : RadioComponent;

        return (
            <div 
                    style={{
                        ...horizontalBox, 
                        display: 'inline-flex',
                        justifyContent: 'flex-end',
                        ...this.props.style
                    }}
            >
                {
                    items.map((item, index) => {
                        return (
                            <RadioComponent 
                                key={index}
                                label={item}
                                checked={_.findIndex(this.state.selected, selectedItem => selectedItem === index) > -1}
                                onChange={() => this.handleChange(index)}
                                fontSize={this.props.fontSize || '14px'}
                                small={small}
                            />
                        );
                    })
                }
            </div>
        );
    }
}

const RadioComponent = ({label, checked, onChange, fontSize = 14, disabled=false}) => {
    const labelColor = disabled ? disabledColor : primaryColor;

    return (
        <div style={radioContainerStyle}>
            <Checkbox 
                checked={checked} 
                onChange={onChange} 
                disabled={disabled} 
                color='primary'
            />
            <RadioLabel 
                    fontSize={fontSize} 
                    onClick={!disabled ? onChange : null}
                    color={labelColor}
            >
                {label}
            </RadioLabel>
        </div>
    );
}

const radioContainerStyle = {
    ...horizontalBox,
    justifyContent: 'flex-start',
    marginRight: '20px'
};

const RadioLabel = styled.h3`
    cursor: pointer;
    font-size: ${props => props.fontSize || '14px'};
    color: ${props => props.color || primaryColor};
    font-weight: 400;
`;