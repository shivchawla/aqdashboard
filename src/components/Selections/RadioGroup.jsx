import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Radio from '@material-ui/core/Radio';
import {horizontalBox, primaryColor} from '../../constants';

const disabledColor = '#bdbdbd';

export default class RadioGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: props.defaultSelected || 0
        };
    }

    handleChange = value => {
        this.setState({selected: value});
        this.props.onChange && this.props.onChange(value);
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
        const {items = ['One', 'Two'], CustomRadio = null, disabled = false, small = false} = this.props;
        const CustomRadioComponent = CustomRadio !== null ? CustomRadio : RadioComponent;

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
                            <CustomRadioComponent 
                                key={index}
                                label={item}
                                checked={this.state.selected === index}
                                onChange={() => this.handleChange(index)}
                                fontSize={this.props.fontSize || '14px'}
                                disabled={disabled}
                                small={small}
                                hideLabel={true}
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
            <Radio checked={checked} onChange={onChange} disabled={disabled} color='primary' />
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