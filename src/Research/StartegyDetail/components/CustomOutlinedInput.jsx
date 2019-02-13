import React from 'react';
import InputBase from '@material-ui/core/InputBase';
import {withStyles} from '@material-ui/core/styles';
import { primaryColor } from '../../../constants';

export default withStyles(theme => ({
    // root: {
    //   'label + &': {
    //     marginTop: theme.spacing.unit * 3,
    //   },
    // },
    input: {
      borderRadius: 4,
      position: 'relative',
      backgroundColor: theme.palette.background.paper,
      border: `2px solid #ced4da`,
      fontSize: 14,
      width: '100%',
      padding: '6px',
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      // Use the system font instead of the default Roboto font.
      fontFamily: '"Lato", sans-serif',
      '&:focus': {
        borderRadius: 4,
        borderColor: primaryColor,
        // boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    },
  }))(InputBase);