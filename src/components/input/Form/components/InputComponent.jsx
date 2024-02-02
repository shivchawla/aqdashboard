import React from 'react';
import _ from 'lodash';
import FilledInput from '@mui/material/Input';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import {withStyles} from '@mui/styles';
import {metricColor} from '../../../../constants';

const styles = theme => ({
    container: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    formControl: {
        marginBottom: '6px'
    },
    inputLabel: {
        marginTop: '5px'
    },
});

class InputComponent extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    render() {
        const {
            name = null, 
            label = '',
            value='', 
            error,
            touched,
            handleChange,
            handleBlur,
            style={},
            type='text',
            multiline = false,
            rowsMax=1
        } = this.props;
        const { classes } = this.props;

        return (
            <FormControl 
                    error={touched && error} 
                    aria-describedby="component-error-text"
                    style={{width: '100%', ...style}}
                    className={classes.formControl}
            >
                <InputLabel className={classes.inputLabel} htmlFor={name}>{label}</InputLabel>
                <FilledInput 
                    value={value} 
                    onChange={handleChange} 
                    name={name}
                    onBlur={handleBlur}
                    type={type}
                    multiline={multiline}
                    rowsMax={rowsMax}
                />
                <FormHelperText style={{color: metricColor.negative}}>
                    {error && error}
                </FormHelperText>
            </FormControl>
        );
    }
}

export default withStyles(styles)(InputComponent);