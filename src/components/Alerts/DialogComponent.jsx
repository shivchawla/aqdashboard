import React from 'react';
import _ from 'lodash';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import Slide from '@material-ui/core/Slide';
import {withStyles} from '@material-ui/core/styles';
import ActionIcon from '../Buttons/ActionIcon';
import { horizontalBox } from '../../constants';

const dialogStyles = theme => ({
    root: {
        '&:first-child': {
            padding: 0,
            backgroundColor: 'red',
        },
    }
})

class DialogComponent extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || (!_.isEqual(this.state, nextState))) {
            return true;
        }

        return false;
    }

    onOk = () => {
        this.props.onOk && this.props.onOk();
    }

    onCancel = () => {
        console.log('On cancel pressed');
        this.props.onCancel && this.props.onCancel();
    }

    render() {
        const {
            open = false, 
            title = null, 
            action = false, 
            maxWidth = 'md',
            cancelButtonStyle = {},
            okButtonStyle = {},
            hideClose = false,
            titleStyle = {},
            okText = null
        } = this.props;

        return (
            <Dialog 
                    open={open}
                    TransitionComponent={Transition}
                    onBackdropClick={this.props.onClose}
                    onEscapeKeyDown={this.props.onClose}
                    maxWidth={maxWidth}
            >
                <div 
                        style={{
                            ...horizontalBox,
                            justifyContent: 'space-between',
                        }}
                >
                    {
                        title &&
                        <DialogTitle style={titleStyle}>{title}</DialogTitle>
                    }
                    {
                        !hideClose &&
                        <ActionIcon size={24} onClick={this.props.onClose} type='close'/>
                    }
                </div>
                <DialogContent style={this.props.style}>
                    {this.props.children}
                </DialogContent>
                {
                    action &&
                    <DialogActions>
                        <Button 
                                onClick={this.onCancel} 
                                color="secondary"
                                style={cancelButtonStyle}
                        >
                            CANCEL
                        </Button>
                        <Button 
                                onClick={this.onOk} 
                                color="primary"
                                style={okButtonStyle}
                        >
                            {
                                okText ? okText : 'OK'
                            }
                        </Button>
                    </DialogActions>
                }
            </Dialog>
        );
    }
}

export default withStyles(dialogStyles)(DialogComponent);

const Transition = props => {
    return <Slide direction="up" {...props} />;
}