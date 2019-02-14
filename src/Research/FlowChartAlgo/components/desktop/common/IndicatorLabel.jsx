import React from 'react';
import styled from 'styled-components';
import {primaryColor} from '../../../../../constants';

export default styled.h3`
    font-size: 14px;
    font-weight: 400;
    color: ${primaryColor};
    width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;
