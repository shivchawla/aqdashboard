import React from 'react';
import styled from 'styled-components';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import IndicatorLabel from './IndicatorLabel';
import Popover from '@material-ui/core/Popover';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {withStyles} from '@material-ui/core/styles';
import EditDialog from './EditDialog';
import ActionIcon from '../../../../../components/Buttons/ActionIcon';
import {comparators, conditionalOperators} from '../../../constants';
import {ValueHeader, OptionValue, OptionLabel} from './RowTexts';
import {horizontalBox, verticalBox, primaryColor} from '../../../../../constants';

const styles = {
    backdropRoot: {
        backgroundColor: 'rgba(0,0,0,0.6)'
    },
    menuItemRoot: {
        fontSize: '14px',
        fontWeight: 400,
        fontFamily: 'Lato, sans-serif'
    },
    selectInput: {
        fontSize: '14px',
        fontWeight: 700,
        fontFamily: 'Lato, sans-serif',
    }
}

class ConditionRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fristValueAnchorEl: null,
            secondValueAnchorEl: null,
            popoverWidth: 0
        }
        this.containerEl = null
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    firstOpenPopover = event => {
        const {edit = true} = this.props;
        if (edit) {
            const node = ReactDOM.findDOMNode(this.containerEl);
            this.setState({
                popoverWidth: node.clientWidth,
                fristValueAnchorEl: ReactDOM.findDOMNode(node)
            });
        }
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

    checkIfConditionsEqual = () => {
        const conditionProp = _.get(this.props, 'condition', {});
        const firstValue = _.get(conditionProp, 'firstValue', {});
        const secondValue = _.get(conditionProp, 'secondValue', {});

        if (_.isEqual(firstValue, secondValue)) {
            return true;
        }

        return false;
    }

    render() {
        const {
            index = 0,
            onConditionChange,
            algo,
            deleteCondition,
            requiredConditionsKey,
            classes,
            edit = true
        } = this.props;
        this.checkIfConditionsEqual();
        const conditionProp = _.get(this.props, 'condition', {});
        const condition = _.get(conditionProp, 'condition', null);
        const comparator = _.get(conditionProp, 'comparator', comparators[0].value);
        const comparatorObjIndex = _.findIndex(comparators, comparatorItem => comparatorItem.value === comparator);
        const comparatorObj = comparatorObjIndex > -1
                ? comparators[comparatorObjIndex]
                : comparators[0];

        const firstValue = _.get(conditionProp, 'firstValue', {});
        const secondValue = _.get(conditionProp, 'secondValue', {});

        const selectedFirstValue = _.get(firstValue, 'key', '').toUpperCase();
        const selectedSecondValue = _.get(secondValue, 'key', '').toUpperCase();

        const selectedFirstValueLabel = _.get(firstValue, 'label', '');
        const selectedSecondValueLabel = _.get(secondValue, 'label', '');

        const firstValueOptions = _.get(firstValue, 'options', []);
        const secondValueOptions = _.get(secondValue, 'options', []);

        const {fristValueAnchorEl} = this.state;
        const firstValueOpen = Boolean(fristValueAnchorEl);

        return (
            <Grid 
                    container 
                    alignItems="center"
                    style={{marginBottom: '15px'}}
            >
                <Popover
                        open={firstValueOpen}
                        anchorEl={fristValueAnchorEl}
                        onClose={this.firstClosePopover}
                        anchorOrigin={{
                            vertical: 'center',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'center',
                            horizontal: 'center',
                        }}
                        BackdropProps={{style: {backgroundColor: 'rgba(0,0,0,0.5)'}}}
                        PaperProps={{
                            style: {
                                overflowY: 'initial', 
                                overflowX: 'inherit',
                                borderRadius: '4px'
                            }
                        }}
                >
                    <EditDialog 
                        algo={algo}
                        updateAlgo={this.props.updateAlgo}
                        selectedIndex={index}
                        style={{
                            width: this.state.popoverWidth,
                            borderRadius: '4px'
                        }}
                        requiredConditionsKey={this.props.requiredConditionsKey}
                    />
                </Popover>
                {
                    condition !== null &&
                    <Grid 
                            item 
                            xs={12}
                            style={{
                                marginBottom: '10px'
                            }}
                    >
                        <Select
                                value={condition}
                                label='Condition'
                                onChange={e => onConditionChange(e.target.value, index)}
                                classes={{
                                    select: classes.selectInput
                                }}
                                disabled={!edit}
                        >
                            {
                                conditionalOperators.map((comparator, index) => (
                                    <MenuItem
                                            value={comparator.value}
                                            classes={{
                                                root: classes.menuItemRoot
                                            }}
                                    >
                                        {comparator.label}
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </Grid>
                }
                <Grid item xs={12}>
                    <Grid 
                            ref={el => this.containerEl = el}
                            container
                            style={{
                                background: '#fff',
                                margin: '5px 0',
                                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                                padding: '5px 20px',
                                borderRadius: '4px',
                                boxSizing: 'border-box',
                            }}
                            alignItems="center"
                    >
                        <Grid 
                                item 
                                xs={12}
                                style={{
                                    ...horizontalBox,
                                    justifyContent: 'space-between',
                                }}
                        >
                            <div 
                                    style={{
                                        ...verticalBox,
                                        alignItems: 'flex-start',
                                    }}
                            >
                                <div style={{...verticalBox, alignItems: 'flex=start'}}>
                                    <ValueHeader 
                                            onClick={this.firstOpenPopover}
                                    >
                                        {selectedFirstValue}
                                    </ValueHeader>
                                    <IndicatorLabel>{selectedFirstValueLabel}</IndicatorLabel>
                                </div>
                                <OptionItems options={firstValueOptions} />
                            </div>
                            <div 
                                    style={{
                                        ...verticalBox
                                    }}
                            >
                                <Comparator onClick={this.firstOpenPopover}>
                                    {comparatorObj.label}
                                </Comparator>
                                {
                                    this.checkIfConditionsEqual() &&
                                    <EqualCondition>* same indicators</EqualCondition>
                                }
                            </div>
                            <div 
                                    style={{
                                        ...verticalBox,
                                        alignItems: 'flex-start',
                                    }}
                            >
                                <div 
                                        style={{
                                            ...horizontalBox, 
                                            justifyContent: 'space-between',
                                            width: '100%'
                                        }}
                                >
                                    <div 
                                            style={{
                                                ...verticalBox, 
                                                alignItems: 'flex-start',
                                                width: '100%'
                                            }}
                                    >
                                        <div 
                                                style={{
                                                    ...horizontalBox, 
                                                    justifyContent: 'space-between',
                                                    width: '100%',
                                                    // position: 'relative'
                                                }}
                                        >
                                            <ValueHeader
                                                    onClick={this.firstOpenPopover}
                                            >
                                                {selectedSecondValue}
                                            </ValueHeader>
                                            {
                                                edit &&
                                                <div
                                                        style={{
                                                            ...horizontalBox, 
                                                            justifyContent: 'flex-end',
                                                            position: 'absolute',
                                                            right: 0
                                                        }}
                                                >
                                                    <ActionIcon 
                                                        type='edit' 
                                                        onClick={this.firstOpenPopover} 
                                                    />
                                                    {
                                                        (index > 0 || requiredConditionsKey === 'exit') &&
                                                        <ActionIcon 
                                                            type='cancel'
                                                            onClick={() => deleteCondition(index)}
                                                            color='#ff5d5d'
                                                        />
                                                    }
                                                </div>
                                            }
                                        </div>
                                        <IndicatorLabel>
                                            {selectedSecondValueLabel}
                                        </IndicatorLabel>
                                    </div>
                                </div>
                                <OptionItems options={secondValueOptions} />
                            </div>
                        </Grid>
                        {/* <Grid 
                                item 
                                xs={4}
                                style={{
                                    ...verticalBox,
                                    alignItems: 'flex-start'
                                }}
                        >
                            <div style={{...verticalBox, alignItems: 'flex=start'}}>
                                <ValueHeader>{selectedFirstValue}</ValueHeader>
                                <IndicatorLabel>{selectedFirstValueLabel}</IndicatorLabel>
                            </div>
                            <OptionItems options={firstValueOptions} />
                        </Grid> */}
                        {/* <Grid 
                                item 
                                xs={3}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}
                        >
                            <Comparator>{comparatorObj.label}</Comparator>
                        </Grid> */}
                        {/* <Grid 
                                item 
                                xs={5}
                                style={{
                                    ...verticalBox,
                                    alignItems: 'flex-start'
                                }}
                        >
                            <div 
                                    style={{
                                        ...horizontalBox, 
                                        justifyContent: 'space-between',
                                        width: '100%'
                                    }}
                            >
                                <div 
                                        style={{
                                            ...verticalBox, 
                                            alignItems: 'flex-start',
                                            width: '100%'
                                        }}
                                >
                                    <div 
                                            style={{
                                                ...horizontalBox, 
                                                justifyContent: 'space-between',
                                                width: '100%',
                                                position: 'relative'
                                            }}
                                    >
                                        <ValueHeader>{selectedSecondValue}</ValueHeader>
                                        {
                                            edit &&
                                            <div
                                                    style={{
                                                        ...horizontalBox, 
                                                        justifyContent: 'flex-end',
                                                        position: 'absolute',
                                                        right: 0
                                                    }}
                                            >
                                                <ActionIcon 
                                                    type='edit' 
                                                    onClick={this.firstOpenPopover} 
                                                />
                                                {
                                                    (index > 0 || requiredConditionsKey === 'exit') &&
                                                    <ActionIcon 
                                                        type='cancel'
                                                        onClick={() => deleteCondition(index)}
                                                        color='#ff5d5d'
                                                    />
                                                }
                                            </div>
                                        }
                                    </div>
                                    <IndicatorLabel>{selectedSecondValueLabel}</IndicatorLabel>
                                </div>
                            </div>
                            <OptionItems options={secondValueOptions} />
                        </Grid> */}
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}


export default withStyles(styles)(ConditionRow);

const OptionItems = ({options}) => {
    return (
        <div 
                style={{
                    ...horizontalBox, 
                    justifyContent: 'flex-start',
                    marginTop: '5px'
                }}
        >
            {
                options.map((optionItem, index) => 
                    <OptionItem 
                        key={index} 
                        {...optionItem} 
                    />
                )
            }
        </div>
    );
}

const OptionItem = ({label, value}) => {
    value = typeof(value) === 'number'
        ?   value
        :   value === true
                ?   'True'
                :   'False'   
    
    return (
        <div 
                style={{
                    ...verticalBox, 
                    alignItems: 'flex-start',
                    marginRight: '15px'
                }}
        >
            <OptionValue>{value}</OptionValue>
            <OptionLabel>{label}</OptionLabel>
        </div>
    );
}

const Comparator = styled.h3`
    font-size: 14px;
    color: #222;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
    padding: 5px 10px;
    display: inline;
    cursor: pointer;
`;

const EqualCondition = styled.h3`
    font-size: 12px;
    color: ${primaryColor};
    font-weight: 500;
    font-family: 'Lato', sans-serif;
`;