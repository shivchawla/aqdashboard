import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import {comparators, conditionalOperators} from '../../../../constants';
import {horizontalBox} from '../../../../../../constants';

export default class SecondRow extends React.Component {
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
        const {
            onConditionChange,
            onComparatorChange,
            onFirstValueChange,
            onSecondValueChange,
            index = 0
        } = this.props;
        const conditionProp = _.get(this.props, 'condition', {});
        const comparator = _.get(conditionProp, 'comparator', comparators[0].value);
        const condition = _.get(conditionProp, 'condition', conditionalOperators[0].value);
        const firstValue = _.get(conditionProp, 'firstValue', 0);
        const secondValue = _.get(conditionProp, 'secondValue', 0);


        const {fristValueAnchorEl, secondValueAnchorEl} = this.state;
        const firstValueOpen = Boolean(fristValueAnchorEl);
        const secondValueOpen = Boolean(secondValueAnchorEl);

        return (
            <Grid container alignItems="center">
                <Grid item xs={3}>
                    <Select
                            value={condition}
                            label='Condition'
                            onChange={e => onConditionChange(e.target.value, index)}
                            style={{width: '100%'}}
                    >
                        {
                            conditionalOperators.map((comparator, index) => (
                                <MenuItem
                                        value={comparator.value}
                                >
                                    {comparator.label}
                                </MenuItem>
                            ))
                        }
                    </Select>
                </Grid>
                <Grid item xs={3}>
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
                        <SMAContent 
                            value={firstValue}
                            onChange={onFirstValueChange}
                            index={index}
                            closePopOver={this.firstClosePopover}
                        />
                    </Popover>
                    <TextField
                        id="standard-name"
                        label="SMA"
                        value={firstValue}
                        margin='dense'
                        onClick={this.firstOpenPopover}
                    />
                </Grid>
                <Grid item xs={3}>
                    <Select
                            value={comparator}
                            label='Comparator'
                            onChange={e => onComparatorChange(e.target.value, index)}
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
                <Grid item xs={3}>
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
                        <SMAContent 
                            value={secondValue}
                            onChange={onSecondValueChange}
                            index={index}
                            closePopOver={this.secondClosePopover}
                        />
                    </Popover>
                    <TextField
                        id="standard-name"
                        label="SMA"
                        value={secondValue}
                        margin='dense'
                        onClick={this.secondOpenPopover}
                    />
                </Grid>
            </Grid>
        );
    }
}

const SMAContent = props => {
    const {value, onChange, index = null, closePopOver} = props;

    return (
        <Grid 
                container 
                style={{
                    padding: '20px',
                    backgroundColor: '#eceff1',
                    margin: '5px 0'
                }}
        >
            <Grid item xs={12}>
                <SMAHEader>SMA</SMAHEader>
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Period"
                    value={value}
                    onChange={e => onChange(e.target.value, index)}
                    margin="dense"
                    style={{width: '100%'}}
                    type="number"
                />
            </Grid>
            <Grid item xs={12} style={{...horizontalBox, justifyContent: 'space-between'}}>
                <Button onClick={closePopOver}>OK</Button>
            </Grid>
        </Grid>
    );
}

const SMAHEader = styled.h3`
    font-size: 16px;
    font-weight: 500;
    color: #222;
`;