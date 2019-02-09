import React from 'react';
import Grid from '@material-ui/core/Grid';
import Script from './components/desktop/Script';
import Position from './components/desktop/Position';
import StopTargetConditions from './components/desktop/StopTargetConditions';
import Entry from './components/desktop/Entry.jsx';
import {algo} from './constants';
import {parseObjectToCode} from './utils/parser';

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
        console.log(parsedObjectCode);
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
                    <Entry {...commonProps} />
                </Grid>
                <Grid item xs={12}>
                    <StopTargetConditions {...commonProps} />
                </Grid>
            </Grid>
        );
    }
}