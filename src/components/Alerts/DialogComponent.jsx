import React from 'react';
import _ from 'lodash';
import ButtonBase from '@material-ui/core/ButtonBase';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import Slide from '@material-ui/core/Slide';
import {withStyles} from '@material-ui/core/styles';
import ActionIcon from '../Buttons/ActionIcon';
import { horizontalBox, primaryColor } from '../../constants';

const dialogStyles = theme => ({
    root: {
        '&:first-child': {
            padding: 0,
            backgroundColor: 'red',
        },
    },
    dialogActionRoot: {
        borderTop: '2px solid #e1e1e1',
        margin: '8px 0',
        position: 'relative'
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
            okText = null,
            classes,
            extraActionContent = null
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
                    <DialogActions 
                            classes={{
                                root: classes.dialogActionRoot
                            }}
                    >
                        {extraActionContent}
                        <ButtonBase 
                                onClick={this.onCancel} 
                                color="secondary"
                                style={{
                                    ...defaultButtonStyle,
                                    ...cancelDefaultButtonStyle,
                                    ...cancelButtonStyle
                                }}
                                variant='outlined'
                        >
                            CANCEL
                        </ButtonBase>
                        <ButtonBase 
                                onClick={this.onOk} 
                                color="primary"
                                style={{
                                    ...defaultButtonStyle,
                                    ...okDefaultButtonStyle,
                                    ...okButtonStyle
                                }}
                                variant='outlined'
                        >
                            {
                                okText ? okText : 'OK'
                            }
                        </ButtonBase>
                    </DialogActions>
                }
            </Dialog>
        );
    }
}

export default withStyles(dialogStyles)(DialogComponent);

const defaultButtonStyle = {
    fontSize: '12px',
    fontWeight: 700,
    borderRadius: '4px',
    padding: '8px',
    margin: '0 10px',
    marginTop: '8px',
    fontFamily: 'Lato, sans-serif',
    textTransform: 'uppercase',
    minWidth: '63px'
};

const cancelDefaultButtonStyle = {
    backgroundColor: '#a5a5a5',
    color: '#fff'
};

const okDefaultButtonStyle = {
    backgroundColor: primaryColor,
    color: '#fff'
}

const Transition = props => {
    return <Slide direction="up" {...props} />;
}