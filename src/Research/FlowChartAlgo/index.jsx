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
import AqLayoutDesktop from '../../components/Layout/AqDesktopLayout';
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
            <AqLayoutDesktop>
                <Grid 
                        container 
                        style={{
                            padding: '10px', 
                            boxSizing: 'border-box',
                            minHeight: '100vh'
                        }}
                        alignItems="flex-start"
                        spacing={24}
                >
                    <Grid 
                            item 
                            xs={4}
                            style={{
                                ...verticalBox,
                                alignItems: 'flex-start'
                            }}
                    >
                        <Script {...commonProps} />
                        <Position {...commonProps} />
                        <StopTargetConditions {...commonProps} />
                    </Grid>
                    <Grid 
                            item 
                            xs={4}
                    >
                        <Entry {...commonProps} />
                    </Grid>
                    <Grid item xs={4}>
                        <Exit {...commonProps} />
                    </Grid>
                </Grid>
            </AqLayoutDesktop>
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