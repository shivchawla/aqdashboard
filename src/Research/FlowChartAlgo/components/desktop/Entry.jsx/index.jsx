import React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import {horizontalBox} from '../../../../../constants';
import ActionIcon from '../../../../../components/Buttons/ActionIcon';
import FirstRow from './CustomRows/FirstRow';
import OtherRow from './CustomRows/OtherRow';
import {comparators, conditionalOperators} from '../../../constants';

export default class Entry extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(_.get(this.props, 'algo.entry', {}), _.get(nextProps, 'algo.entry', {})) 
                || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    onComparatorChage = (value, index) => {
        const {algo} = this.props;
        const entryConditions = _.map(_.get(algo, 'entry', []), _.cloneDeep);
        entryConditions[index]['comparator'] = value;
        const modifiedScript = {
            ...algo,
            entry: entryConditions
        };
        this.props.updateAlgo(modifiedScript);
    }

    onFirstValueChange = (value, index) => {
        const {algo} = this.props;
        const entryConditions = _.map(_.get(algo, 'entry', []), _.cloneDeep);
        entryConditions[index]['firstValue'] = value;
        const modifiedScript = {
            ...algo,
            entry: entryConditions
        };
        this.props.updateAlgo(modifiedScript);
    }

    onSecondValueChange = (value, index) => {
        const {algo} = this.props;
        const entryConditions = _.map(_.get(algo, 'entry', []), _.cloneDeep);
        entryConditions[index]['secondaValue'] = value;
        const modifiedScript = {
            ...algo,
            entry: entryConditions
        };
        this.props.updateAlgo(modifiedScript);
    }

    onConditionChange = (value, index) => {
        const {algo} = this.props;
        const entryConditions = _.map(_.get(algo, 'entry', []), _.cloneDeep);
        entryConditions[index]['condition'] = value;
        const modifiedScript = {
            ...algo,
            entry: entryConditions
        };
        this.props.updateAlgo(modifiedScript);
    }

    addCondition = () => {
        const {algo} = this.props;
        const entryConditions = _.map(_.get(algo, 'entry', []), _.cloneDeep);
        if (entryConditions.length >= 5) {
            return;
        }
        entryConditions.push({
            condition: conditionalOperators[0], 
            firstValue: 0, 
            comparator: comparators[0], 
            secondaValue: 0
        });
        const modifiedScript = {
            ...algo,
            entry: entryConditions
        };
        console.log(modifiedScript);
        this.props.updateAlgo(modifiedScript);
    }

    render() {
        const {algo} = this.props;
        const conditions = _.get(algo, 'entry', []);

        return (
            <Grid container>
                {
                    conditions.map((condition, index) => {
                        if (index === 0) {
                            return (
                                <FirstRow 
                                    condition={condition} 
                                    onComparatorChage={this.onComparatorChage}
                                    onFirstValueChange={this.onFirstValueChange}
                                    onSecondValueChange={this.onSecondValueChange}
                                    onConditionChange={this.onConditionChange}
                                />
                            );
                        } else {
                            return (
                                <OtherRow 
                                    condition={condition} 
                                    onComparatorChage={this.onComparatorChage}
                                    onFirstValueChange={this.onFirstValueChange}
                                    onSecondValueChange={this.onSecondValueChange}
                                    onConditionChange={this.onConditionChange}
                                />
                            );
                        }
                    })
                }
                <Grid 
                        item 
                        xs={12} 
                        style={{
                            ...horizontalBox,
                            justifyContent: 'flex-start'
                        }}
                >
                    <ActionIcon type='add_circle' onClick={this.addCondition} />
                    <h3>Add Exit Condition</h3>
                </Grid>
            </Grid>
        );
    }
}