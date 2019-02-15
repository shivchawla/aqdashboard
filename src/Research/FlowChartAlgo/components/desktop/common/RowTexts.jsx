import React from 'react';
import styled from 'styled-components';
import {primaryColor} from '../../../../../constants';

export const ValueHeader = styled.h3`
    font-size: 16px;
    font-weight: 700;
    color: #222;
    cursor: pointer;
`;

export const OptionValue = styled.h3`
    font-size: 16px;
    font-weight: 700;
    color: #222;
`;

export const OptionLabel = styled.h3`
    font-size: 12px;
    font-weight: 500;
    color: #9D9D9D;
    margin-top: -5px;
`;

export const Comparator = styled.h3`
    font-size: 30px;
    color: ${primaryColor};
    font-weight: 500;
`;