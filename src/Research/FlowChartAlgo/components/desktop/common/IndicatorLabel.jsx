import React from 'react';
import styled from 'styled-components';
import {primaryColor} from '../../../../../constants';

export default styled.h3`
    font-size: 12px;
    font-weight: 400;
    color: ${primaryColor};
    width: 175px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;
