import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import AsyncSelect from 'react-select/lib/Async';
import Select from 'react-select';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import NoSsr from '@material-ui/core/NoSsr';
import MenuItem from '@material-ui/core/MenuItem';
import styles from './styles';
import { verticalBox } from '../../../constants';

class AutoComplete extends React.Component {
    state = {
        single: null,
        multi: null,
        inputValue: '',
        selectedValue: ''
    };

    handleChange = value => {
        this.setState({
            selectedValue: value
        }, () => {
            this.props.onClick && this.props.onClick(value);
        });
    };

    render() {
        const {
            classes,
            theme,
            async = true,
            options = [],
            defaultMenuIsOpen = true,
            placeholder = 'Search Stocks',
            value = null
        } = this.props;
        const selectStyles = {
            input: base => ({
                ...base,
                color: theme.palette.text.primary,
                '& input': {
                    font: 'inherit',
                },
                position: 'relative',
                width: '100%',
                textAlign: 'start'
            }),
            control: base => ({
                ...base,
                // borderRadius: '4px',
                borderColor: '#EBEBEB',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                textAlign: 'start',
                paddingLeft: '4px',
            }),
            indicatorsContainer: base => ({
                ...base,
                display: 'none'
            }),
            placeholder: base => ({
                ...base,
                paddingLeft: '10px'
            }),
        };

        return (
            <div className={classes.root}>
                <NoSsr>
                    {
                        async &&
                        <AsyncSelect
                            classes={classes}
                            styles={selectStyles}
                            loadOptions={this.props.handleSearch}
                            cacheOptions
                            defaultOptions
                            components={components}
                            onChange={this.handleChange}
                            placeholder={placeholder}
                            defaultMenuIsOpen={defaultMenuIsOpen}
                        />
                    }
                    {
                        !async &&
                        <Select
                            value={value}
                            // value={this.state.selectedValue}
                            classes={classes}
                            styles={selectStyles}
                            options={options}
                            components={components}
                            onChange={this.handleChange}
                            placeholder={placeholder}
                            autoFocus={false}
                            defaultMenuIsOpen={defaultMenuIsOpen}
                        />
                    }
                </NoSsr>
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(AutoComplete);

function NoOptionsMessage(props) {
    return (
        <Typography
            color="textSecondary"
            className={props.selectProps.classes.noOptionsMessage}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

function inputComponent({ inputRef, ...props }) {
    return <div ref={inputRef} {...props} />;
}

function Option(props) {
    const label = _.get(props, 'data.label', null);
    const value = _.get(props, 'data.value', null);
    console.log(props);
    return (
        <MenuItem
            buttonRef={props.innerRef}
            selected={props.isFocused}
            component="div"
            style={{
                fontWeight: props.isSelected ? 500 : 400,
                zIndex: 20
            }}
            {...props.innerProps}
        >
            <div 
                    style={{
                        ...verticalBox,
                        alignItems: 'flex-start'
                    }}
            >
                <Value>{value.toUpperCase()}</Value>
                <Label>{label}</Label>
            </div>
        </MenuItem>
    );
}

function Placeholder(props) {
    return (
        <Typography
            color="textSecondary"
            className={props.selectProps.classes.placeholder}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}


const components = {
    NoOptionsMessage,
    Option,
    Placeholder,
};

const Value = styled.h3`
    font-size: 14px;
    font-family: 'Lato', sans-serif;
    font-weight: 700;
    color: #222;
`;

const Label = styled.h3`
    font-size: 13px;
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    color: #444;
    margin-top: -3px;
`;
