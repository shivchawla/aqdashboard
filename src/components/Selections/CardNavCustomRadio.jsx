import React from 'react';
import _ from 'lodash';
import ButtonBase from '@material-ui/core/ButtonBase';
import { primaryColor } from '../../constants';
const inactiveColor = '#9C9C9C';

export default class CardNavCustomRadio extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {checked = false, label='-', small = false, disabled = false} = this.props;
        const background = '#fff';
        const color = checked ? '#ce6564' : '#7C7C7C';
        const borderColor = checked ? '#ce6564' : '#7C7C7C';
        const fontSize = small ?  '12px' : '14px';
        const padding = small ? '4px 8px' : '6px 12px';
        const fontWeight = checked ? '600' : '500';

        return (
            <ButtonBase 
                    style={{
                        ...buttonStyle, 
                        color,
                        fontSize,
                        padding,
                        background,
                        border: `${checked ? '2px' : '1px'} solid ${borderColor}`,
                        fontWeight,
                    }}
                    onClick={this.props.onChange}
                    disabled={disabled}
            >
                <span style={{whiteSpace: 'nowrap'}}>{label}</span>
            </ButtonBase>
        );
    }
}

const buttonStyle = {
    padding: '6px 12px',
    fontSize: '15px',
    margin: '0 3px',
    borderRadius: '2px',
    cursor: 'pointer',
    color: inactiveColor,
    fontFamily: 'Lato, sans-serif',
    fontWeight: 500,
}