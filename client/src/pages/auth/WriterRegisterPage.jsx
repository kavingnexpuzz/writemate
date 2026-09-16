import { useEffect, useState } from 'react';
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
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import AuthLayout from '../../layouts/AuthLayout';
import { registerWriter, clearAuthError } from '../../features/auth/authSlice';
import { writerRegisterSchema } from '../../utils/validationSchemas';
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
  pricePerPage: '',
  pricePerDiagram: '',
  upiId: '',
  bio: '',
  serviceDescription: '',
  upiQrCode: null,
};

export default function WriterRegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, user } = useSelector((state) => state.auth);
  const [qrFileName, setQrFileName] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: yupResolver(writerRegisterSchema), defaultValues });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (user) navigate(dashboardPathForRole(user.role), { replace: true });
  }, [user, navigate]);

  const onSubmit = (values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'upiQrCode') {
        formData.append('upiQrCode', value);
      } else {
        formData.append(key, value);
      }
    });
    dispatch(registerWriter(formData));
  };

  return (
    <AuthLayout
      title="Apply to write on WriteMate"
      subtitle="Your account stays pending until an admin reviews and approves it."
      maxWidth={640}
    >
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

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="pricePerPage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Price per page"
                    type="number"
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                    error={!!errors.pricePerPage}
                    helperText={errors.pricePerPage?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="pricePerDiagram"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Price per diagram"
                    type="number"
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                    error={!!errors.pricePerDiagram}
                    helperText={errors.pricePerDiagram?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Controller
            name="upiId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="UPI ID"
                placeholder="yourname@bank"
                fullWidth
                error={!!errors.upiId}
                helperText={errors.upiId?.message}
              />
            )}
          />

          <Box>
            <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
              Upload UPI QR code
              <input
                type="file"
                hidden
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setValue('upiQrCode', file, { shouldValidate: true });
                  setQrFileName(file ? file.name : '');
                }}
              />
            </Button>
            {qrFileName && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                {qrFileName}
              </Typography>
            )}
            {errors.upiQrCode && (
              <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                {errors.upiQrCode.message}
              </Typography>
            )}
          </Box>

          <Controller
            name="bio"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Short bio"
                multiline
                minRows={2}
                fullWidth
                error={!!errors.bio}
                helperText={errors.bio?.message}
              />
            )}
          />

          <Controller
            name="serviceDescription"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Describe your handwriting/documentation services"
                multiline
                minRows={3}
                fullWidth
                error={!!errors.serviceDescription}
                helperText={errors.serviceDescription?.message}
              />
            )}
          />

          <Button type="submit" variant="contained" color="primary" size="large" disabled={status === 'loading'}>
            {status === 'loading' ? 'Submitting…' : 'Submit application'}
          </Button>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Already applied?{' '}
            <Link component={RouterLink} to="/login">
              Log in
            </Link>{' '}
            to check your status.
          </Typography>
        </Stack>
      </form>
    </AuthLayout>
  );
}
