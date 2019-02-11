import React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import {updateScript} from '../../utils';

export default class Name extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(_.get(this.props, 'algo.name', {}), _.get(nextProps, 'algo.name', {})) 
                || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    onNameChange = event => {
        const {algo} = this.props;
        const modifiedScript = {
            ...algo,
            name: event.target.value
        };
        this.props.updateAlgo(modifiedScript);
    }

    render() {
        const {algo} = this.props;
        const selectedQuantity = _.get(algo, 'name', '');

        return (
            <Grid 
                    container 
                    alignItems='center'
                    style={{
                        boxSizing: 'border-box',
                    }}
            >
                <Grid item xs={12}>
                    <Grid container>
                        <Grid item xs={12} style={{padding: '6px', marginTop: '-5px'}}>
                            <TextField
                                value={selectedQuantity}
                                onChange={this.onNameChange}
                                margin="dense"
                                style={{width: '100%'}}
                                placeholder="Name"
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}