import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/material/CloseIcon';
import {withStyles} from '@mui/styles';
import {horizontalBox} from '../../constants';

const styles = theme => ({
    dialogContentRoot: {
        overflow: 'hidden',
        overflowY: 'scroll',
        padding: 0,
        '&:first-child': {
            paddingTop: 0
        },
        position: 'relative'        
    }
});

class BottomSheet extends React.Component {
    render() {
        const {classes, header = 'Header', open = false, customHeader = null} = this.props;

        return (
            <Dialog
                fullScreen
                open={open}
                onClose={this.props.onClose}
                TransitionComponent={Transition}
                style={{overflow: 'hidden'}}
            >
                <DialogContent
                        classes={{
                            root: classes.dialogContentRoot
                        }}
                >
                    <div 
                        style={{
                            ...horizontalBox,
                            width: '100%',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        {
                            customHeader === null
                            ?   <Header>{header}</Header>
                            :   customHeader()
                        }
                        {
                            customHeader === null &&
                            <IconButton 
                                    color="inherit" 
                                    onClick={this.props.onClose} 
                                    aria-label="Close"
                            >
                                <CloseIcon />
                            </IconButton>
                        }
                    </div>
                    {this.props.children}
                </DialogContent>
            </Dialog>
        );
    }
}

export default withStyles(styles)(BottomSheet);

const Transition = (props) => {
    return <Slide direction="up" {...props} />;
}

const Header = styled.h3`
    color: #0D0D0D;
    font-weight: 500;
    font-family: 'Lato', sans-serif;
    font-size: 18px;
    margin-left: 20px;
`;