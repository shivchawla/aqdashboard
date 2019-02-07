import React, { Component } from 'react';
import _ from 'lodash';
import Utils from './../../Utils';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import {Form, Formik} from 'formik';
import {withRouter} from 'react-router-dom';
import InputComponent from '../../components/input/Form/components/InputComponent';
import {getFormProps, validateSchema} from '../../utils/form';
import {getValidationSchema} from './utils';
import {verticalBox, primaryColor} from '../../constants';


class NewStartegy extends Component {

    _mounted = false;

    constructor(props) {
        super();
        let strategy = {
            'name': '',
            'description': '',
            'code': '',
            'language': 'julia',
            'type': ''
        };
        if (props.startegyClone) {
            strategy = JSON.parse(JSON.stringify(props.startegyClone));
            strategy.name = strategy.name + "_C";
        }
        this.state = {
            'loading': false,
            'strategy': strategy
        };
        this.updateState = (data) => {
            if (this._mounted) {
                this.setState(data);
            }
        }

        this.handleSubmit = (values) => {
            this.updateState({ 'loading': true });
            axios({
                method: 'POST',
                url: Utils.getBaseUrl() + '/strategy',
                data: {
                    'name': _.get(values, 'startegyName', null),
                    'language': _.get(this.state, 'strategy.language', null),
                    'description': _.get(values, 'shortDescription', null),
                    'code': _.get(this.state, 'strategy.code', null),
                    'type': _.get(this.state, 'strategy.type', null)
                },
                'headers': Utils.getAuthTokenHeader()
            })
            .then((response) => {
                this.updateState({ 'loading': false });
                this.props.history.push('/research/strategy/' + response.data._id);
            })
            .catch((error) => {
                console.log('Error ', error);
                this.updateState({
                    'loading': false
                });
            });
        }

    }

    componentDidMount() {
        this._mounted = true;
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    renderForm = ({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
    }) => {
        const commonProps = {handleChange, handleBlur, width: '100%'};
        const formData = {values, errors, touched};
        
        return (
            <Form style={{width: '100%'}} autoComplete='off'>
                <div 
                        style={{
                            ...verticalBox,
                            width: '100%'
                        }}
                >
                    <InputComponent 
                        label='Strategy Name'
                        {...getFormProps('startegyName', formData)}
                        {...commonProps}
                    />
                    <InputComponent 
                        label='Strategy Description'
                        {...getFormProps('shortDescription', formData)}
                        {...commonProps}
                        style={{marginTop: '5px'}}
                        multiline={true}
                        rowsMax={8}
                    />
                    <Button 
                            type="submit"
                            color="primary"
                            variant="contained"
                            style={submitButtonStyle}
                    >
                        {
                            this.state.loading
                            ?   <CircularProgress 
                                    style={{marginLeft: '5px', color: '#fff'}} 
                                    size={18} 
                                />
                            :   'Create'
                        }
                    </Button>
                </div>
            </Form>
        );        
    }

    render() {
        const defaultValues = this.props.startegyClone
            ?   {
                    startegyName: _.get(this.state, 'strategy.name', ''), 
                    shortDescription: _.get(this.state, 'strategy.description', '')
                }
            :   {};
        return (
            <div className="new-strategy-div" style={{ 'padding': '20px' }}>
                <h2>CREATE STRATEGY</h2>
                <Formik 
                    initialValues={defaultValues}
                    onSubmit={this.handleSubmit}
                    render={this.renderForm}
                    validate={validateSchema(getValidationSchema, defaultValues)}
                />
            </div>
        );
    }
}

export default withRouter(NewStartegy);

const submitButtonStyle = {
    width: '100%',
    boxShadow: 'none',
    background: primaryColor,
    marginTop: '5px'
};