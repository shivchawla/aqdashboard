import React from 'react';
import _ from 'lodash';
import InputBase from '@material-ui/core/InputBase';
import Paper from '@material-ui/core/Paper';
import {withStyles} from '@material-ui/core/styles';

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