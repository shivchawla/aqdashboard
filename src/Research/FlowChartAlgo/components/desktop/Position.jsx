import React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import {buy, sell} from '../../constants';
import {updateScript} from '../../utils';

export default class Position extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(_.get(this.props, 'algo.position', {}), _.get(nextProps, 'algo.position', {})) 
                || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    onIntervalChange = event => {
        const {algo} = this.props;
        const modifiedScript = updateScript(algo, 'position', {type: event.target.value});
        this.props.updateAlgo(modifiedScript);
    }

    onQuantityChange = event => {
        const {algo} = this.props;
        const modifiedScript = updateScript(algo, 'position', {quantity: event.target.value});
        this.props.updateAlgo(modifiedScript);
    }

    render() {
        const {algo} = this.props;
        const selectedType = _.get(algo, 'position.type', buy);
        const selectedQuantity = _.get(algo, 'position.quantity', 10);

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
                        <Grid item xs={3} style={{padding: '6px'}}>
                            <Select 
                                    value={selectedType} 
                                    label='Interval'
                                    onChange={this.onIntervalChange}
                                    style={{width: '100%'}}
                            >
                                <MenuItem value={buy}>
                                    BUY
                                </MenuItem>
                                <MenuItem 
                                        value={sell}
                                >
                                    SELL
                                </MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={9} style={{padding: '6px', marginTop: '-5px'}}>
                            <TextField
                                value={selectedQuantity}
                                onChange={this.onQuantityChange}
                                margin="dense"
                                style={{width: '100%'}}
                                type="number"
                                placeholder="Quantity"
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}