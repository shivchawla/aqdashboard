import React from 'react';
import Chip from '@material-ui/core/Chip';
import {withStyles} from '@material-ui/core/styles';

const style = theme => ({
    root: {
        height: '24px'
    },
    label: {
        fontSize: '12px'
    }
})

class CustomChip extends React.Component {
    render() {
        const {classes} = this.props;

        return (
            <Chip 
                {...this.props} 
                classes={{
                    root: classes.root,
                    label: classes.label
                }}
            />
        );
    }
}

export default withStyles(style)(CustomChip);