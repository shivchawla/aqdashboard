import React from 'react';
import _ from 'lodash';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import {withStyles} from '@mui/styles';

const styles = {
    root: {
        padding: '2px 4px'
    }
}

class TextInput extends React.Component {
    render() {
        const {classes} = this.props;

        return (
            <Paper elevation={1} className={classes.root}>
                <InputBase {...this.props} />
            </Paper>
        );
    }
}   

export default withStyles(styles)(TextInput);