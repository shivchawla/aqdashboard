import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import {horizontalBox} from '../../constants';
import Checkbox from '@mui/material/Checkbox';

export default class CustomCheckbox extends React.Component {
    render() {
        const {label = ''} = this.props;
        const {labelStyle = {}} = this.props;
        const checkboxProps = _.omit(this.props, ['label', 'labelStyle']);

        return (
            <div style={{...horizontalBox, alignItems: 'center'}}>
                <Checkbox {...checkboxProps}/>
                <Label {...labelStyle}>
                    {label}
                </Label>
            </div>
        );
    }
}

const Label = styled.h3`
    font-size: ${props => props.fontSize || '14px'};
    color: ${props => props.color || '#222'};
    font-weight: 500;
    font-family: 'Lato', sans-serif;
`;