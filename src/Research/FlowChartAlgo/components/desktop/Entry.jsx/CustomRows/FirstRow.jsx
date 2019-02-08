import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import {comparators} from '../../../../constants';
import {horizontalBox} from '../../../../../../constants';

export default class FirstRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fristValueAnchorEl: null,
            secondValueAnchorEl: null
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    firstOpenPopover = event => {
        this.setState({
            fristValueAnchorEl: event.currentTarget
        });
    }

    secondOpenPopover = event => {
        this.setState({
            secondValueAnchorEl: event.currentTarget
        });
    }

    firstClosePopover = () => {
        this.setState({
            fristValueAnchorEl: null
        });
    }

    secondClosePopover = () => {
        this.setState({
            secondValueAnchorEl: null
        });
    }

    render() {
        const {firstValue = 0, lastValue = 0, comparator = comparators[0].value} = this.props;
        const {fristValueAnchorEl, secondValueAnchorEl} = this.state;
        const firstValueOpen = Boolean(fristValueAnchorEl);
        const secondValueOpen = Boolean(secondValueAnchorEl);

        return (
            <Grid container alignItems="center">
                <Grid item xs={4}>
                    <Popover
                            open={firstValueOpen}
                            anchorEl={fristValueAnchorEl}
                            onClose={this.firstClosePopover}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                            }}
                    >
                        <SMAContent />
                    </Popover>
                    <TextField
                        id="standard-name"
                        label="SMA"
                        value={firstValue}
                        margin='dense'
                        onClick={this.firstOpenPopover}
                    />
                </Grid>
                <Grid item xs={4}>
                    <Select
                            value={comparator}
                            label='Comparator'
                            onChange={this.onComparatorChange}
                            style={{width: '100%'}}
                    >
                        {
                            comparators.map((comparator, index) => (
                                <MenuItem
                                        value={comparator.value}
                                >
                                    {comparator.label}
                                </MenuItem>
                            ))
                        }
                    </Select>
                </Grid>
                <Grid item xs={4}>
                    <Popover
                            open={secondValueOpen}
                            anchorEl={secondValueAnchorEl}
                            onClose={this.secondClosePopover}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                            }}
                    >
                        <SMAContent />
                    </Popover>
                    <TextField
                        id="standard-name"
                        label="SMA"
                        value={lastValue}
                        margin='dense'
                        onClick={this.secondOpenPopover}
                    />
                </Grid>
            </Grid>
        );
    }
}

const SMAContent = props => {
    return (
        <Grid container style={{padding: '20px'}}>
            <Grid item xs={12}>
                <SMAHEader>SMA</SMAHEader>
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Period"
                    value={props.value}
                    onChange={props.onChange}
                    margin="dense"
                    type="number"
                    style={{width: '100%'}}
                />
            </Grid>
            <Grid item xs={12} style={{...horizontalBox, justifyContent: 'space-between'}}>
                <Button>DONE</Button>
                <Button>CANCEL</Button>
            </Grid>
        </Grid>
    );
}

const SMAHEader = styled.h3`
    font-size: 16px;
    font-weight: 500;
    color: #222;
`;