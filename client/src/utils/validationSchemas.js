import * as yup from 'yup';

const phoneRule = yup
  .string()
  .required('Phone number is required')
  .matches(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number');

const passwordRule = yup
  .string()
  .required('Password is required')
  .min(8, 'Password must be at least 8 characters');

export const loginSchema = yup.object({
  email: yup.string().required('Email is required').email('Enter a valid email address'),
  password: yup.string().required('Password is required'),
});

export const customerRegisterSchema = yup.object({
  fullName: yup.string().required('Full name is required').min(2, 'Name is too short'),
  email: yup.string().required('Email is required').email('Enter a valid email address'),
  phone: phoneRule,
  password: passwordRule,
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
  state: yup.string().required('State is required'),
  district: yup.string().required('District is required'),
  city: yup.string().required('City is required'),
});

export const writerRegisterSchema = yup.object({
  fullName: yup.string().required('Full name is required').min(2, 'Name is too short'),
  email: yup.string().required('Email is required').email('Enter a valid email address'),
  phone: phoneRule,
  password: passwordRule,
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
  state: yup.string().required('State is required'),
  district: yup.string().required('District is required'),
  city: yup.string().required('City is required'),
  pricePerPage: yup
    .number()
    .typeError('Enter a valid price')
    .required('Price per page is required')
    .min(0, 'Price cannot be negative'),
  pricePerDiagram: yup
    .number()
    .typeError('Enter a valid price')
    .required('Price per diagram is required')
    .min(0, 'Price cannot be negative'),
  upiId: yup
    .string()
    .required('UPI ID is required')
    .matches(/^[\w.\-]{2,256}@[a-zA-Z][\w]{2,64}$/, 'Enter a valid UPI ID (e.g. name@bank)'),
  bio: yup.string().required('A short bio helps customers trust you').max(1000, 'Keep bio under 1000 characters'),
  serviceDescription: yup
    .string()
    .required('Describe the services you offer')
    .max(2000, 'Keep this under 2000 characters'),
  upiQrCode: yup.mixed().required('Upload your UPI QR code'),
});

export const newRequestSchema = yup.object({
  workType: yup.string().required('Select a work type'),
  title: yup.string().required('Give this request a short title').max(150, 'Keep the title under 150 characters'),
  description: yup.string().required('Describe what you need done').max(3000, 'Keep the description under 3000 characters'),
  numberOfPages: yup
    .number()
    .typeError('Enter a valid number of pages')
    .required('Number of pages is required')
    .min(1, 'At least 1 page is required'),
  numberOfDiagrams: yup.number().typeError('Enter a valid number').min(0, 'Cannot be negative').default(0),
  requiredDate: yup.string().required('Pick the date you need this by'),
  urgency: yup.string().oneOf(['STANDARD', 'URGENT']).required(),
  state: yup.string().required('State is required'),
  district: yup.string().required('District is required'),
  city: yup.string().required('City is required'),
  budget: yup.number().typeError('Enter a valid budget').required('Budget is required').min(0, 'Budget cannot be negative'),
  additionalInstructions: yup.string().max(1000, 'Keep this under 1000 characters'),
});

export default { loginSchema, customerRegisterSchema, writerRegisterSchema, newRequestSchema };
