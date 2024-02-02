import * as React from 'react';
import Grid from '@mui/material/Grid';
import { verticalBox } from '../constants';

export default class PageNotFound extends React.Component {
    render() {
        return (
            <Grid 
                    container
            >
                <Grid
                        item
                        xs={12}
                        style={{...verticalBox, height: '100vh'}}
                >
                    <h1 
                            style={{
                                color: 'teal', 
                                fontSize: '40px', 
                                fontWeight: '700'
                            }}
                    >
                        Coming Soon
                    </h1>
                    <span 
                            style={{
                                color: '#000', 
                                fontSize: '20px', 
                                fontWeight: '400', 
                                marginLeft: '5px',
                                textAlign: 'center'
                            }}
                    >
                        Please use our desktop version in the meantime.
                    </span>
                </Grid>
            </Grid>
        );
    }
}