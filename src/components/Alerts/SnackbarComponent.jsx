import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close'

export default ({openStatus = true, message = 'Snackbar Data', handleClose = () => {}, position = 'bottom', autoHideDuration = 1500, renderAction = null, style = {}}) => {
    return (
        <Snackbar
            anchorOrigin={{
                vertical: position,
                horizontal: 'center',
            }}
            style={style}
            open={openStatus}
            autoHideDuration={autoHideDuration}
            ContentProps={{
                'aria-describedby': 'message-id'
            }}
            onClose={handleClose}
            message={<span id="message-id">{message}</span>} 
            action={
                renderAction !== null
                    ?   renderAction()
                    :   [
                            <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            onClick={() => handleClose && handleClose()}
                            >
                                <CloseIcon />
                            </IconButton>,
                        ]
            }             
        />
    );
}