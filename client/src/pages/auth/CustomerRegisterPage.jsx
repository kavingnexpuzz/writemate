import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

import AuthLayout from '../../layouts/AuthLayout';
import { registerCustomer, clearAuthError } from '../../features/auth/authSlice';
import { customerRegisterSchema } from '../../utils/validationSchemas';
import { INDIAN_STATES } from '../../utils/indianStates';
import { dashboardPathForRole } from '../../routes/roleRedirect';

const defaultValues = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  state: '',
  district: '',
  city: '',
};

export default function CustomerRegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, user } = useSelector((state) => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(customerRegisterSchema), defaultValues });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (user) navigate(dashboardPathForRole(user.role), { replace: true });
  }, [user, navigate]);

  const onSubmit = (values) => dispatch(registerCustomer(values));

  return (
    <AuthLayout title="Create your account" subtitle="Find local writers for your notes, forms and documentation." maxWidth={560}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}

          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Full name" fullWidth error={!!errors.fullName} helperText={errors.fullName?.message} />
            )}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Email" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Phone number" fullWidth error={!!errors.phone} helperText={errors.phone?.message} />
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Password"
                    type="password"
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Confirm password"
                    type="password"
                    fullWidth
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="State" fullWidth error={!!errors.state} helperText={errors.state?.message}>
                {INDIAN_STATES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="district"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="District" fullWidth error={!!errors.district} helperText={errors.district?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="City" fullWidth error={!!errors.city} helperText={errors.city?.message} />
                )}
              />
            </Grid>
          </Grid>

          <Button type="submit" variant="contained" color="primary" size="large" disabled={status === 'loading'}>
            {status === 'loading' ? 'Creating account…' : 'Create account'}
          </Button>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Log in
            </Link>
            . Want to write for customers instead?{' '}
            <Link component={RouterLink} to="/writer/register">
              Apply as a writer
            </Link>
            .
          </Typography>
        </Stack>
      </form>
    </AuthLayout>
  );
}
