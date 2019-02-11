import React from 'react';
import axios from 'axios';
import _ from 'lodash';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import {withRouter} from 'react-router-dom';
import AutoComplete from '../../../../components/input/AutoComplete';
import SectionHeader from './common/SectionHeader';
import Utils from '../../../../Utils';
import {intervals} from '../../constants';
import {updateScript} from '../../utils';
import { verticalBox, horizontalBox } from '../../../../constants';

const {requestUrl} = require('../../../../localConfig');

class Script extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(_.get(this.props, 'algo.script', {}), _.get(nextProps, 'algo.script', {})) 
                || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    handleSearch = (query) => new Promise((resolve, reject) => {
        const url = `${requestUrl}/stock?search=${query}`;

        return axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            resolve(this.processSearchResponseData(response.data));
        })
        .catch(error => {
            reject(error);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
    })

    processSearchResponseData = data => {
        return data.map((item, index) => {
            return {
                id: index,
                label: item.ticker,
                value: item.detail !== undefined ? item.detail.Nse_Name : item.ticker
            }
        })
    }

    onSelect = (stock) => {
        this.addStock(stock);
    }

    onIntervalChange = event => {
        const {algo = {}} = this.props;
        const modifiedAlgo = updateScript(algo, 'script', {interval: event.target.value});
        this.props.updateAlgo(modifiedAlgo);
    }

    addStock = stock => {
        const {algo = {}} = this.props;
        const instruments = _.map(_.get(algo, 'script.instruments', []), _.cloneDeep);
        instruments.push(stock);
        const modifiedAlgo = updateScript(algo, 'script', {instruments: _.uniq(instruments)})
        this.props.updateAlgo(modifiedAlgo);
    }

    removeStock = stock => {
        const {algo = {}} = this.props;
        const instruments = _.map(_.get(algo, 'script.instruments', []), _.cloneDeep);
        const toBeDeletedStocksIndex = _.findIndex(instruments, stockItem => stockItem === stock);
        if (toBeDeletedStocksIndex > -1) {
            instruments.splice(toBeDeletedStocksIndex, toBeDeletedStocksIndex + 1);
            const modifiedAlgo = updateScript(algo, 'script', {instruments: instruments});
            this.props.updateAlgo(modifiedAlgo);
        }
    }

    render() {
        const {algo} = this.props;
        const instruments = _.get(algo, 'script.instruments', []);
        const selectedInterval = _.get(algo, 'script.interval', intervals[0].value);
        
        return (
            <Grid 
                    container 
                    spacing={24}
                    style={{
                        padding: '10px 5px',
                        boxSizing: 'border-box',
                    }}
            >
                <Grid 
                        item xs={12} 
                        style={{
                            ...verticalBox,
                             alignItems: 'flex-start',
                             width: '100%',
                             padding: '6px'
                        }}
                >
                    <AutoComplete 
                        handleSearch={this.handleSearch}
                        onClick={stock => this.onSelect(stock.label)}
                        defaultMenuIsOpen={false}
                    />
                    <div 
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'flex-start',
                                marginTop: '10px'
                            }}
                    >
                        {
                            instruments.map((stock, index) => (
                                <SChip 
                                    key={index}
                                    label={stock}
                                    onDelete={() => this.removeStock(stock)}
                                />
                            ))
                        }
                    </div>
                </Grid>
                <Grid 
                        item 
                        xs={12}
                        style={{
                            padding: '6px'
                        }}
                >
                    <Select 
                            value={selectedInterval} 
                            placeholder='Interval'
                            onChange={this.onIntervalChange}
                            style={{width: '100%'}}
                    >
                        {
                            intervals.map((interval, index) => {
                                return (
                                    <MenuItem 
                                            key={index} 
                                            value={interval.value}
                                    >
                                        {interval.label}
                                    </MenuItem>
                                );
                            })
                        }
                    </Select>
                </Grid>
            </Grid>
        );
    }
}

export default withRouter(Script);

const SChip = styled(Chip)`
    margin: 0 3px;
`;