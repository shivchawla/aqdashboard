import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Script from './components/desktop/Script';
import Position from './components/desktop/Position';
import StopTargetConditions from './components/desktop/StopTargetConditions';
import Entry from './components/desktop/Entry';
import Exit from './components/desktop/Exit';
import Name from './components/desktop/Name';
import SectionHeader from './components/desktop/common/SectionHeader';
import {algo} from './constants';
import {parseObjectToCode} from './utils/parser';
import { verticalBox } from '../../constants';

export default class FlowChartAlgo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            algo: algo
        }
    }

    updateAlgo = modifiedAlgo => {
        this.setState({algo: modifiedAlgo});
        const parsedObjectCode = parseObjectToCode(modifiedAlgo);
    }

    render() {
        const commonProps = {
            algo: this.state.algo,
            updateAlgo: this.updateAlgo
        };
        const commonStyle = {
            borderLeft: '2px dotted #979797',
            position: 'relative',
            paddingBottom :'70px',
            paddingTop: '25px',
            paddingLeft: '20px',
            boxSizing: 'border-box'
        };

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
                            backgroundColor: '#f5faff',
                            borderRadius: '4px'
                        }}
                >
                    {/* <Grid 
                            item 
                            xs={12}
                            style={commonStyle}
                    >
                        <DotContainer>
                            <Dot />
                            <SectionHeader>Script</SectionHeader>
                        </DotContainer>
                        <Script {...commonProps} />
                    </Grid>
                    <Grid 
                            item 
                            xs={12}
                            style={{
                                ...commonStyle,
                                ...verticalBox,
                                alignItems: 'flex-start'
                            }}
                    >
                        <DotContainer>
                            <Dot />
                            <SectionHeader>Position</SectionHeader>
                        </DotContainer>
                        <Position {...commonProps} />
                    </Grid> */}
                    <Grid 
                            item 
                            xs={12}
                            style={commonStyle}
                    >
                        <DotContainer>
                            <Dot />
                            <SectionHeader>Entry</SectionHeader>
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
                            <SectionHeader>Exit</SectionHeader>
                        </DotContainer>
                        <Exit {...commonProps} />
                    </Grid>
                    {/* <Grid 
                            item 
                            xs={12}
                            style={commonStyle}
                    >
                        <DotContainer>
                            <Dot />
                            <SectionHeader>Stop/Target</SectionHeader>
                        </DotContainer>
                        <StopTargetConditions {...commonProps} />
                    </Grid>
                    <Grid 
                            item 
                            xs={12}
                            style={commonStyle}
                    >
                        <DotContainer>
                            <Dot />
                            <SectionHeader>Algo Name</SectionHeader>
                        </DotContainer>
                        <Name {...commonProps} />
                    </Grid> */}
                </Grid>
                {/* <Grid item xs={3}></Grid> */}
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