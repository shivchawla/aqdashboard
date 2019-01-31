import _ from 'lodash';
import * as Yup from 'yup';

export const getValidationSchema = values => Yup.object().shape({
    startegyName: Yup.string()
        .min(2, 'Too Short!')
        .max(30, 'Name cannot be longer than 30 characters')
        .required('Please input startegy name!')
        .default(''),
    shortDescription: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Description cannot be longer than 60 characters')
        .required('Please input short description!')
        .default(''),
});
