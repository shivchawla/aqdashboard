import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import ActionIcon from '../Buttons/ActionIcon';
import DatePicker from 'material-ui-pickers/DatePicker';
import {withRouter} from 'react-router-dom';
import {horizontalBox} from '../../constants';
const DateHelper = require('../../utils/date');

const dateFormat = 'Do MMM YY';
const backendDateFormat = 'YYYY-MM-DD';

class DateComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: props.selectedDate || moment(DateHelper.getPreviousNonHolidayWeekday(moment().add(1, 'days').toDate()))
        }
    }

    componentWillMount() {
        this.onDateChange(this.state.selectedDate);
    }

    navigateToPreviousDate = () => {
        const {type ='daily'} = this.props;
        const date = type === 'daily' 
            ? moment(DateHelper.getPreviousNonHolidayWeekday(this.state.selectedDate.toDate()))
            : moment(DateHelper.getEndOfLastWeek(this.state.selectedDate.toDate()));
        // window.history.pushState("", "AdviceQube: Daily Trading Contest", this.constructUrlDate(date));
        // this.props.history.push(this.constructUrlDate(date));
        this.setState({selectedDate: date}, () => this.onDateChange());
    }

    onDateChange = () => {
        this.props.onDateChange && this.props.onDateChange(this.state.selectedDate);
    }

    navigateToNextDate = () => {
        const {type ='daily'} = this.props;
        const date = type === 'daily' 
            ? moment(DateHelper.getNextNonHolidayWeekday(this.state.selectedDate.toDate()))
            : moment(DateHelper.getNextEndOfWeek(this.state.selectedDate.toDate()));
        if (!this.isFutureDate(date)) {
            // window.history.pushState("", "AdviceQube: Daily Trading Contest", this.constructUrlDate(date));
            // this.props.history.push(this.constructUrlDate(date));
            this.setState({selectedDate: date}, () => this.onDateChange());
            
        }
    }

    constructUrlDate = date => {
        return `${this.props.location.pathname}?date=${date.format(backendDateFormat)}`;
    }

    isFutureDate = date => {
        return moment().isBefore(date);
    }

    handleDatePickerChange = date => {
        const selectedDate = moment(date).format(dateFormat);
        this.setState({selectedDate});
        this.props.onDateChange && this.props.onDateChange(moment(date, dateFormat));
    }

    handleDateChange = (date) => {
        const selectedDate = moment(date).format(dateFormat);
        window.history.pushState("", "AdviceQube: Daily Trading Contest", this.constructUrlDate(date));
        this.setState({ selectedDate: date });
        this.props.onDateChange && this.props.onDateChange(moment(selectedDate, dateFormat));
        this.props.history.push(this.constructUrlDate(date));
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    renderCompactView = () => {
        const {
            color = '#fff', 
            disabledDate = null, 
            disabled = false, 
            disableFuture = false, 
            value = null,
            format = 'DD MMM',
            style={},
            hideNavButtons = false
        } = this.props;

        return (
            <div 
                    style={{
                        ...horizontalBox, 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        ...style
                    }}
            >
                {
                    !hideNavButtons &&
                    <ActionIcon 
                        disabled={disabled} 
                        size={22} 
                        color={color} 
                        type='chevron_left' 
                        onClick={this.navigateToPreviousDate} 
                    />
                }
                <DatePicker
                    format={format}
                    value={value}
                    onChange={this.props.onChange}
                    // onChange={this.handleDateChange}
                    shouldDisableDate={date => disabledDate === null ? date : disabledDate(date)}
                    style={{textAlign: 'center'}}
                    TextFieldComponent={DateFields}
                    color={color}
                    disableFuture={disableFuture}
                    disabled={disabled}
                />
                {
                    !hideNavButtons &&
                    <ActionIcon 
                        disabled={disabled} 
                        size={22} 
                        color={color} 
                        type='chevron_right' 
                        onClick={this.navigateToNextDate} 
                    />
                }
            </div>
        );
    }

    renderNormalView = () => {
        const {color = '#fff', format = 'DD MMM', hideNavButtons = false} = this.props;
        const { selectedDate } = this.state;
        const disabled = _.get(this.props, 'type', 'daily') === 'overall' ? true : false;

        return (
            <Grid 
                    container 
                    style={{
                        backgroundColor: '#fff', 
                        width: '100%', 
                        padding: '0 30px', 
                        ...this.props.style
                    }}
            >
                {
                    !hideNavButtons &&
                    <Grid 
                            item xs={2} 
                            style={{...horizontalBox, justifyContent: 'flex-start'}}
                    >
                        <ActionIcon 
                            size={30} 
                            color={color} 
                            type='chevron_left' 
                            disabled={disabled} 
                            onClick={this.navigateToPreviousDate}
                        />
                    </Grid>
                }
                <Grid 
                        item 
                        xs={hideNavButtons ? 12 : 8} 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'center'
                        }}
                >
                    <DatePicker
                        format={format}
                        value={selectedDate}
                        onChange={this.handleDateChange}
                        shouldDisableDate={this.disabledDate}
                        style={{textAlign: 'center'}}
                        TextFieldComponent={DateFields}
                        color={color}
                        disableFuture={true}
                        disabled={disabled}
                    />
                </Grid>
                {
                    !hideNavButtons &&
                    <Grid 
                            item 
                            xs={2} 
                            style={{...horizontalBox, justifyContent: 'flex-end'}}
                    > 
                        <ActionIcon 
                            size={30} 
                            color={color} 
                            type='chevron_right' 
                            disabled={disabled}
                            onClick={this.navigateToNextDate}
                        />
                    </Grid>
                }
            </Grid>
        );
    }

    render() {
        const {compact = false} = this.props;

        return compact ? this.renderCompactView() : this.renderNormalView();
    }
}

export default withRouter(DateComponent);

const DateFields = props => {
    return (
        <div 
                style={{
                    ...horizontalBox,
                    justifyContent: 'center',
                    border: `2px solid #ced4da`,
                    borderRadius: '4px',
                    padding: '4px 4px',
                    cursor: 'pointer',
                    width: '90px'
                }}
                onClick={props.onClick}
        >
            <DateText color={props.color}>{props.value}</DateText>
        </div>
    );
}

const DateText = styled.span`
    font-size: 14px;
    color: ${props => props.color || '#fff'};
    margin-top: 1px;
`;