import React from 'react';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import {horizontalBox, primaryColor} from '../../../../../constants';
import FirstRow from './CustomRows/FirstRow';
import OtherRow from './CustomRows/OtherRow';
import EditDialog from './EditDialog';
import SectionHeader from '../common/SectionHeader';
import {defaultFirstRowEntryCondition, defaultSecondRowEntryCondition} from '../../../constants';

export default class Entry extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editDialogOpen: false,
            selectedCondition: 0
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(_.get(this.props, 'algo.entry', {}), _.get(nextProps, 'algo.entry', {})) 
                || !_.isEqual(this.state, nextState)) {
            return true;
        }

        return false;
    }

    onComparatorChange = (value, index) => {
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
        entryConditions[index]['secondValue'] = value;
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
        const requiredCondition = entryConditions.length === 0
                ? defaultFirstRowEntryCondition
                : defaultSecondRowEntryCondition;
        entryConditions.push(requiredCondition);
        const modifiedScript = {
            ...algo,
            entry: entryConditions
        };
        this.props.updateAlgo(modifiedScript);
    }

    deleteCondition = (index = 0) => {
        const {algo} = this.props;
        const entryConditions = _.map(_.get(algo, 'entry', []), _.cloneDeep);

        if (entryConditions.lengt === 0 || index === 0) {
            return;
        }
        entryConditions.splice(index, 1);
        const modifiedScript = {
            ...algo,
            entry: entryConditions
        };
        this.props.updateAlgo(modifiedScript);
    }

    updateSelectedCondition = index => {
        this.setState({selectedCondition: index}, () => {
            this.toggleEditDialog();
        })
    }

    toggleEditDialog = () => {
        this.setState({editDialogOpen: !this.state.editDialogOpen});
    }

    render() {
        const {algo} = this.props;
        const conditions = _.get(algo, 'entry', []);
        const rowProps = {
            onComparatorChange: this.onComparatorChange,
            onFirstValueChange: this.onFirstValueChange,
            onSecondValueChange: this.onSecondValueChange,
            onConditionChange: this.onConditionChange,
            toggleEditDialog: this.updateSelectedCondition,
            deleteCondition: this.deleteCondition
        };

        return (
            <Grid 
                    container 
                    style={{
                        // padding: '0 20px',
                        boxSizing: 'border-box'
                    }}
            >
                <EditDialog 
                    open={this.state.editDialogOpen}
                    onClose={this.toggleEditDialog}
                    algo={algo}
                    updateAlgo={this.props.updateAlgo}
                    selectedIndex={this.state.selectedCondition}
                />
                <Grid 
                        item 
                        xs={12} 
                        style={{
                            ...horizontalBox,
                            justifyContent: 'flex-end',
                            marginBottom: '5px',
                            marginTop: '-34px'
                        }}
                >
                    {/* <SectionHeader>Entry Conditions</SectionHeader> */}
                    <Button
                            onClick={this.addCondition}
                            style={{
                                borderLeft: `2px solid ${primaryColor}`,
                                borderRadius: 0,
                                backgroundColor: '#00000012'
                            }}
                            size="small"
                    >
                        Add Condition
                        <Icon style={{marginLeft: '5px', color: primaryColor}}>add_circle</Icon>
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    {
                        conditions.map((condition, index) => {
                            if (index === 0) {
                                return (
                                    <FirstRow 
                                        index={index}
                                        condition={condition}
                                        {...rowProps}
                                    />
                                );
                            } else {
                                return (
                                    <OtherRow 
                                        index={index}
                                        condition={condition} 
                                        {...rowProps}
                                    />
                                );
                            }
                        })
                    }
                </Grid>
            </Grid>
        );
    }
}
