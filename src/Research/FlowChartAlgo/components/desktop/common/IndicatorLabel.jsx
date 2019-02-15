import React from 'react';
import styled from 'styled-components';
import {primaryColor} from '../../../../../constants';

export default styled.h3`
    font-size: 14px;
    font-weight: 400;
    color: ${primaryColor};
    /* max-width: 200px; */
    width: 200px;
    /* min-width: 150px; */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;
