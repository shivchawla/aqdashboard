import React, { Component } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import Utils from './../../Utils';
import axios from 'axios';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import {Form, Formik} from 'formik';
import {useNavigate} from 'react-router-dom';
import InputComponent from '../../components/input/Form/components/InputComponent';
import {getFormProps, validateSchema} from '../../utils/form';
import {getValidationSchema} from './utils';
import {verticalBox, primaryColor, horizontalBox} from '../../constants';


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
            loading: false,
            strategy: strategy,
            error: null
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
                    'type': "GUI"
                },
                'headers': Utils.getAuthTokenHeader()
            })
            .then((response) => {
                this.updateState({
                    loading: false,
                    error: null
                });
                console.log(response.data._id);
                console.log('Done');
                window.location.href = ('/research/strategy/' + response.data._id);
            })
            .catch((error) => {
                this.updateState({
                    loading: false,
                    error: 'Error occured !!'
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
                    {
                        this.state.error &&
                        <div 
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'center', 
                                marginTop: '5px'
                            }}
                    >
                        <Error>{this.state.error}</Error>
                    </div>
                    }
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
            <div className="new-strategy-div" style={{ 'padding': '20px 0' }}>
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

export default NewStartegy;

const submitButtonStyle = {
    width: '100%',
    boxShadow: 'none',
    background: primaryColor,
    marginTop: '5px'
};

const Error = styled.h3`
    font-size: 14px;
    color: #e06666;
    font-family: 'Lato', sans-serif;
`;