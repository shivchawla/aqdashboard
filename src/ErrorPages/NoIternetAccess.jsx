import * as React from 'react';
import Grid from '@mui/material/Grid';
import { verticalBox } from '../constants';

export default class NoIternetAccess extends React.Component {
    render() {
        return (
            <Grid 
                    container
                    style={{height: '100%'}}
                    alignItems="center"
                    justify="center"
            >
                <Grid
                        item
                        xs={12} 
                        style={{...verticalBox, height: '100%'}}>
                    <h1 
                            style={{
                                color: 'teal', 
                                textAlign: 'left', 
                                position: 'absolute', 
                                top: '50%', 
                                fontSize: '40px', 
                                fontWeight: '700'
                            }}
                    >
                        Network Error
                        <span 
                                style={{
                                    color: '#000', 
                                    fontSize: '20px', 
                                    fontWeight: '400', 
                                    marginLeft: '5px'
                                }}
                        >
                            Something Went Wrong.
                        </span>
                    </h1>
                </Grid>
            </Grid>
        );
    }
}