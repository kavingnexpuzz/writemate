import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

import AuthLayout from '../../layouts/AuthLayout';
import { loginUser, clearAuthError } from '../../features/auth/authSlice';
import { loginSchema } from '../../utils/validationSchemas';
import { dashboardPathForRole } from '../../routes/roleRedirect';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, user } = useSelector((state) => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (user) navigate(dashboardPathForRole(user.role), { replace: true });
  }, [user, navigate]);

  const onSubmit = (values) => dispatch(loginUser(values));

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to manage your requests or your writing work.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Email" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
            )}
          />
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

          <Button type="submit" variant="contained" color="primary" size="large" disabled={status === 'loading'}>
            {status === 'loading' ? 'Logging in…' : 'Log in'}
          </Button>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            New to WriteMate?{' '}
            <Link component={RouterLink} to="/register">
              Create a customer account
            </Link>{' '}
            or{' '}
            <Link component={RouterLink} to="/writer/register">
              apply as a writer
            </Link>
            .
          </Typography>
        </Stack>
      </form>
    </AuthLayout>
  );
}
