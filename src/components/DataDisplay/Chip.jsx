import React from 'react';
import Chip from '@mui/material/Chip';
import {withStyles} from '@mui/styles';
import CancelIcon from '@mui/icons-material/Cancel';

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
                deleteIcon={<CancelIcon style={{fontSize: '20px'}}/>}
            />
        );
    }
}

export default withStyles(style)(CustomChip);