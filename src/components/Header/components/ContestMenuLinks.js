import React from 'react';
import Menu from '@mui/material/Menu';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import ButtonBase from '@mui/material/ButtonBase';
import {NavLink} from './NavLink';

export default class ContestMenuLinks extends React.Component {
    state = {
        open: false
    };

    handleToggle = () => {
        this.setState({open: !this.state.open});
    }

    handleClose = (event, differentProject) => {
        try {
            if (this.anchorEl.contains(event.target)) {
                return;
            }
            this.setState({ open: false });
            if (differentProject) {
                window.location.href = '/contest';
            }
        } catch(err) {

        }
    }

    render() {
        const {open} = this.state;
        const urls = [
            {name: 'Investment Idea', url: '/contest'},
            {name: 'Stock Prediction Contest', url: '/dailycontest'},
        ];

        return (
            <div>
                <ButtonBase
                    buttonRef={node => {
                        this.anchorEl = node;
                    }}
                    aria-owns={open ? 'menu-list-grow' : null}
                    aria-haspopup="true"
                    onClick={this.handleToggle}
                    disableRipple={true}
                >
                    <NavLink active={true}>Contest</NavLink>
                </ButtonBase>
                <Popper 
                        open={open} 
                        anchorEl={this.anchorEl} 
                        transition 
                        disablePortal
                        style={{
                            zIndex: 2000
                        }}
                >
                    {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        id="menu-list-grow"
                        style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={this.handleClose}>
                                <MenuList>
                                    {
                                        urls.map((item, index) => (
                                            <MenuItem
                                                    key={index} 
                                                    onClick={e => {
                                                        this.handleClose(e, index === 0)
                                                    }}
                                            >
                                                {item.name}
                                            </MenuItem>
                                        ))
                                    }
                                    
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                    )}
                </Popper>
            </div>
        );
    }
}
