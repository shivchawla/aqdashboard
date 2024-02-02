import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import {primaryColor} from '../../constants';

export default class ActionIcons extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }
    
    render() {
        const {
            type = 'chevron_left', 
            onClick = null, 
            style = {}, 
            iconButtonProps = {}, 
            disabled = false,
            toolTipTitle = ''
        } = this.props;

        return (
            <Tooltip title={toolTipTitle}>
                <IconButton 
                        aria-label="Delete" 
                        onClick={(e) => onClick && onClick(e)}
                        style={style}
                        disabled={disabled}
                        {...iconButtonProps}
                >
                    <SIcon 
                            style={{
                                color: disabled ? '#9b9b9b' : (this.props.color || primaryColor), 
                                fontSize: this.props.size || 20
                            }} 
                            fontSize='inherit'
                    >
                        {type}
                    </SIcon>
                </IconButton>
            </Tooltip>
        );
    }
}

const SIcon = styled(Icon)`
    color: ${primaryColor};
    font-size: 20px;
`;