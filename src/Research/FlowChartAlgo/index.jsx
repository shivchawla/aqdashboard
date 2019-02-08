import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Script from './components/desktop/Script';
import Position from './components/desktop/Position';
import ExitConditions from './components/desktop/ExitConditions';
import Entry from './components/desktop/Entry.jsx';
import {verticalBox, horizontalBox} from '../../constants';
import {algo} from './constants';

export default class FlowChartAlgo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            algo: algo
        }
    }

    updateAlgo = modifiedAlgo => {
        this.setState({algo: modifiedAlgo});
    }

    render() {
        const commonProps = {
            algo: this.state.algo,
            updateAlgo: this.updateAlgo
        };

        return (
            <Grid container>
                <Grid item xs={12}>
                    <Script {...commonProps} />
                </Grid>
                <Grid item xs={12}>
                    <Position {...commonProps} />
                </Grid>
                <Grid item xs={12}>
                    <ExitConditions {...commonProps} />
                </Grid>
                <Grid item xs={12}>
                    <Entry {...commonProps} />
                </Grid>
            </Grid>
        );
    }
}