import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { verticalBox } from '../constants';

export default class ForbiddenAccess extends React.Component {
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
                        403 Forbidden
                        <span style={{color: '#000', fontSize: '20px', fontWeight: '400', marginLeft: '5px'}}>Access Denied.</span>
                    </h1>
                </Grid>
            </Grid>
        );
    }
}