import React from 'react';
import styled from 'styled-components';

export default class Tag extends React.Component {
    render() {
        return (
            <SDiv>
                {this.props.children}
            </SDiv>
        );
    }
}

const SDiv = styled.div`
    padding: 5px;
    border-radius: 20%;
    background-color: #87d5d5;
`;