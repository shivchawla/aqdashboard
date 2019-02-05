import React, { Component } from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { withRouter } from 'react-router-dom';
import { verticalBox } from '../../constants';

class CommunityTabs extends Component {
    render() {
        return (
            <div style={{...verticalBox, alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                <Tabs 
                        className="height_width_full community-tabs" 
                        animated={false} 
                        onChange={this.props.onTabChanged}
                        activeKey={this.props.selectedTabValue}
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
