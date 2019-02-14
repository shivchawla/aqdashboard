import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Entry from './components/desktop/Entry';
import Exit from './components/desktop/Exit';
import SectionHeader from './components/desktop/common/SectionHeader';

export default class FlowChartAlgo extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props.algo, nextProps.algo) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    updateAlgo = modifiedAlgo => {
        this.props.updateAlgo(modifiedAlgo);
    }

    render() {
        const {edit = true} = this.props;
        const commonProps = {
            algo: this.props.algo,
            updateAlgo: this.updateAlgo,
            edit
        };
        const commonStyle = {
            borderLeft: '2px dotted #979797',
            position: 'relative',
            paddingBottom :'70px',
            paddingTop: '25px',
            paddingLeft: '20px',
            boxSizing: 'border-box'
        };
        const entryConditions = _.get(this.props, 'algo.entry', []);
        const exitConditions = _.get(this.props, 'algo.exit', []);

        return (
            <Grid 
                    container 
                    style={{
                        padding: '10px', 
                        boxSizing: 'border-box'
                    }}
            >
                <Grid 
                        item 
                        xs={12}
                        style={{
                            padding: '1% 3%',
                            borderRadius: '4px'
                        }}
                        alignItems="flex-start"
                        spacing={24}
                >
                    <Grid 
                            item 
                            xs={12}
                            style={commonStyle}
                    >
                        <DotContainer>
                            <Dot />
                            <SectionHeader>Entry Conditions</SectionHeader>
                        </DotContainer>
                        <Entry {...commonProps} />
                    </Grid>
                    <Grid 
                            item 
                            xs={12}
                            style={commonStyle}
                    >
                        <DotContainer>
                            <Dot />
                            <SectionHeader>Exit Conditions {exitConditions.length === 0 && `- (None Selected)`}</SectionHeader>
                        </DotContainer>
                        <Exit {...commonProps} />
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

const Dot = styled.h3`
    width: 15px;
    height: 15px;
    background-color: #15b0b0;
    border-radius: 100%;
`;

const DotContainer = styled.div`
    position: absolute;
    top: 0px;
    left: -8px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
`;