import React from 'react';
import _ from 'lodash';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

export default class Message extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            autoHideDuration: props.autoHideDuration || 1500,
            position: props.position || 'bottom',
            openStatus: false
        };
    }

    handleClose = () => {
        this.setState({openStatus: false});
    }   

    show = () => {
        this.setState({openStatus: true});
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    componentWillReceiveProps(nextProps) {
        const nextOpenStatus = _.get(nextProps, 'openStatus', false);
        const previousOpenStatus = _.get(this.props, 'openStatus', false);
        if (nextOpenStatus !== previousOpenStatus) {
            this.setState({openStatus: nextOpenStatus});
        }
    }

    render() {
        const {
            message = 'Snackbar Data', 
            renderAction = null
        } = this.props;
        const {autoHideDuration, position, openStatus} = this.state;

        return (
            <Snackbar
                anchorOrigin={{
                    vertical: position,
                    horizontal: 'center',
                }}
                open={openStatus}
                autoHideDuration={autoHideDuration}
                ContentProps={{
                    'aria-describedby': 'message-id'
                }}
                onClose={this.handleClose}
                message={<span id="message-id">{message}</span>} 
                action={
                    renderAction !== null
                        ?   renderAction()
                        :   [
                                <IconButton
                                key="close"
                                aria-label="Close"
                                color="inherit"
                                onClick={this.handleClose}
                                >
                                <CloseIcon />
                                </IconButton>,
                            ]
                }             
            />
        );
    }
}
