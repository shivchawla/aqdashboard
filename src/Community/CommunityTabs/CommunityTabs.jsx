import React, { Component } from 'react';
import _ from 'lodash';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { withRouter } from 'react-router-dom';
import {communityTabsArray} from './constants';
import { verticalBox } from '../../constants';

class CommunityTabs extends Component {
    render() {
        const selectedTabIndex = _.findIndex(communityTabsArray, tab => tab === this.props.selectedTabValue);

        return (
            <div style={{...verticalBox, alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                <Tabs 
                        onChange={this.props.onTabChanged}
                        value={selectedTabIndex}
                        indicatorColor='primary'
                >
                    <Tab label='Popular' />
                    <Tab label='Newest' />
                    <Tab label='Following' />
                    <Tab label='Personal' />
                </Tabs>
                <div style={{ 'height': 'calc(100% - 60px)' }}></div>
            </div>
        );
    }
}

export default withRouter(CommunityTabs);
