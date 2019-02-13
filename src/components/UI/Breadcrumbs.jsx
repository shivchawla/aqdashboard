import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Breadcrumbs from '@material-ui/lab/Breadcrumbs';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import {Link as RouterLink} from 'react-router-dom';

export default class CustomBreadcrumbs extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.state, nextState) || !_.isEqual(this.props, nextProps)) {
            return true;
        }

        return false;
    }
    
    render() {
        const {breadcrumbs = []} = this.props;
        const linkStyle = {fontSize: '12px'};

        if (breadcrumbs.length > 0) {
            return (
                <BreadCrumbContainer>
                    <Breadcrumbs arial-label="Breadcrumb">
                        {
                            breadcrumbs.map((breadcrumb, index) => {
                                const label = _.get(breadcrumb, 'label', 'N/A');
                                const url = _.get(breadcrumb, 'url', null);
                                const lastItem = index === breadcrumbs.length - 1;

                                if (lastItem || url === null) {
                                    return (
                                        <Typography 
                                                style={{...linkStyle, color: lastItem ? '#c66' : 'inherit'}}
                                        >
                                            {label}
                                        </Typography>
                                    );
                                } else {
                                    return (
                                        <Link 
                                                style={linkStyle} 
                                                color="inherit" 
                                                component={RouterLink} 
                                                to={url}
                                        >
                                            {label}
                                        </Link>
                                    );
                                }
                            })
                        }
                    </Breadcrumbs>  
                </BreadCrumbContainer>
            );
        } else {
            return <h3>Breadcrumb</h3>
        }
    }
}

const BreadCrumbContainer = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-top: 3px;
    margin-bottom: 4px;
`;