import React from 'react';
import windowWidth from 'react-window-size';
import styled from 'styled-components';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/lab/Slider';
import {withStyles} from '@material-ui/core/styles';
import ActionIcon from '../../../../../../components/Buttons/ActionIcon';
import CustomRadio from './CustomRadio';
import TextField from '@material-ui/core/TextField';
import {horizontalBox, verticalBox, primaryColor} from '../../../../../../constants';

let sliderInputTimeout = null;

const styles = theme => ({
    trackBefore: {
        backgroundColor: primaryColor
    }
})

class StockCardRadioGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: props.defaultSelected,
            sliderValue: props.defaultSelected,
            showSlider: false,
        };
    }

    toggleSlider = () => {
        this.setState({showSlider: !this.state.showSlider});
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps.defaultSelected, this.props.defaultSelected)) {
            const value = nextProps.defaultSelected === 0 ? null : nextProps.defaultSelected;
            this.setState({
                selected: value,
                sliderValue: value
            })
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    handleChange = (value, itemValue) => {
        if (!_.isEqual(itemValue, this.state.selected)) {
            const requiredValue = this.props.getValue ? this.props.getValue(value) : value;
            this.setState({selected: requiredValue})
            this.props.onChange && this.props.onChange(value);
        }
    }

    handleSliderChange = (e, value) => {
        this.setState({sliderValue: value});
        clearTimeout(sliderInputTimeout);
        sliderInputTimeout = setTimeout(() => {
            this.props.onChange && this.props.onChange(value, false);
        }, 300);
    }

    handleTextChange = (e) => {
        const value = e.target.value;
        const {max = 10000, min = 0} = this.props;
        if (Number(value) >= min && Number(value) <= max) {
            this.setState({sliderValue: value});
            const requiredValue = value.length === 0 ? null : value;
            clearTimeout(sliderInputTimeout);
            sliderInputTimeout = setTimeout(() => {
                this.props.onChange && this.props.onChange(requiredValue, true);
            }, 300);
        } else {}
    }

    checkIfCustom = () => {
        let {items = []} = this.props;
        const {selected = 0} = this.state;
        items = items.map(item => item.key);
        // Checking if the text is same as the options or custom
        const isCustomValue = _.findIndex(items, item => item === Number(selected)) === -1;

        return isCustomValue;
    }

    render() {
        const {items = ['One', 'Two'], showSlider = false, classes, hideSlider = false, style = {}, label = ''} = this.props;
        const isDesktop = this.props.windowWidth > 800;
        const textFieldLabel = this.state.sliderValue;

        return (
            <Grid 
                    container 
                    style={{
                        ...verticalBox, 
                        alignItems: 'flex-start',
                        ...style,
                        // marginTop: '20px',
                        width: '100%'
                    }}
            >
                <Grid item xs={12}>
                    <Label>{label}</Label>
                </Grid>
                <Grid item xs={12} 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            width: '100%',
                            ...this.props.style
                        }}
                >
                    {
                        !this.state.showSlider && 
                        <div
                                style={{
                                    ...horizontalBox, 
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    ...this.props.style
                                }}
                        >
                            {
                                items.map((item, index) => {
                                    return (
                                        <CustomRadio 
                                            key={index}
                                            label={item.key}
                                            secondaryLabel={item.label}
                                            checked={Number(this.state.selected) === item.key}
                                            onChange={() => this.handleChange(index, item.key)}
                                            hideLabel={this.props.hideLabel}
                                            formatValue={this.props.formatValue}
                                        />
                                    );
                                })
                            }
                            <div 
                                    style={{
                                        ...horizontalBox, 
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                            >
                                {
                                    this.checkIfCustom() &&
                                    typeof(this.props.defaultSelected) !== 'boolean' &&
                                    this.props.defaultSelected !== null &&
                                    this.props.defaultSelected !== 0 &&
                                    <div 
                                            style={{
                                                ...verticalBox,
                                                alignItems: 'flex-start',
                                                width: '32px'
                                            }}
                                    >
                                        <ValueContainer>
                                            <CustomValue>{this.props.defaultSelected}</CustomValue>
                                        </ValueContainer>
                                    </div>
                                }
                                {
                                    !hideSlider &&
                                    <ActionIcon 
                                        type="edit" 
                                        color='#444' 
                                        onClick={this.toggleSlider} 
                                        style={{marginLeft: '-10px', fontSize: '20px'}}
                                    />
                                }
                            </div>
                        </div>
                    }
                    {
                        showSlider && this.state.showSlider &&
                        <div
                                style={{
                                    ...horizontalBox, 
                                    width: '100%', 
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                        >
                            <div 
                                    style={{
                                        ...verticalBox, 
                                        alignItems: 'flex-start',
                                        width: '100%'
                                    }}
                            >
                                {
                                    !isDesktop &&
                                    <div 
                                            style={{
                                                ...horizontalBox, 
                                                justifyContent: 'space-between',
                                                width: '100%'
                                            }}
                                    >
                                        <CustomText style={{color: primaryColor, fontWeight: 700, fontSize: '14px'}}>
                                            {this.state.sliderValue} 
                                            {this.props.label}
                                        </CustomText>
                                    </div>
                                }
                                {
                                    isDesktop &&
                                    <TextField
                                        id="standard-name"
                                        label={`Value (${textFieldLabel !== null ? textFieldLabel : ''})`}
                                        value={this.state.sliderValue}
                                        onChange={this.handleTextChange}
                                        type="number"
                                    />
                                }
                                {
                                    !isDesktop &&
                                    <Slider
                                        style={{marginTop: '12px'}}
                                        max={30}
                                        value={Number(this.state.sliderValue)}
                                        min={1}
                                        onChange={this.handleSliderChange}
                                        step={1}
                                        thumb={<ActionIcon type='expand_less' style={{marginTop: '-7px'}} color={primaryColor}/>}
                                        classes={{
                                            trackBefore: classes.trackBefore
                                        }}
                                    />
                                }
                            </div>
                            <ActionIcon 
                                type="check_circle" 
                                color={primaryColor} 
                                onClick={this.toggleSlider} 
                                size={24}
                            />
                        </div>
                    }
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(windowWidth(StockCardRadioGroup));

const ValueContainer = styled.div`
    width: 32px;
    height: 27px;
    min-width: 32px;
    min-height: 27px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    border-radius: 2px;
    background-color: ${primaryColor};
`;

const CustomText = styled.h3`
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    color: #737373;
    font-size: 12px;
    text-align: start;
`;

const CustomValue = styled.h3`
    font-family: 'Lato', sans-serif;
    font-weight: 700;
    font-size: 12px;
    text-align: start;
    color: #fff;
`;

const HelperText = styled.h3`
    font-size: 10px;
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    color: #444;
`;

const Label = styled.h3`
    font-size: 14px;
    margin-top: 5px;
    color: #2e2e2e;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
`;