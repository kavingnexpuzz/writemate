import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Chip from '@mui/material/Chip';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import requestService from '../../services/requestService';
import { newRequestSchema } from '../../utils/validationSchemas';
import { WORK_TYPES } from '../../utils/workTypes';
import { INDIAN_STATES } from '../../utils/indianStates';

const STEPS = ['Work details', 'Scope & timing', 'Location', 'Budget & extras'];

const STEP_FIELDS = [
  ['workType', 'title', 'description'],
  ['numberOfPages', 'numberOfDiagrams', 'requiredDate', 'urgency'],
  ['state', 'district', 'city'],
  ['budget', 'additionalInstructions'],
];

export default function NewRequestPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [activeStep, setActiveStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(newRequestSchema),
    defaultValues: {
      workType: '',
      title: '',
      description: '',
      numberOfPages: '',
      numberOfDiagrams: 0,
      requiredDate: '',
      urgency: 'STANDARD',
      state: user?.state || '',
      district: user?.district || '',
      city: user?.city || '',
      budget: '',
      additionalInstructions: '',
    },
  });

  const handleNext = async () => {
    const valid = await trigger(STEP_FIELDS[activeStep]);
    if (valid) setActiveStep((s) => s + 1);
  };
  const handleBack = () => setActiveStep((s) => s - 1);

  const onSubmit = async (values) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => formData.append(key, value));
      files.forEach((file) => formData.append('referenceFiles', file));

      const res = await requestService.create(formData);
      navigate('/customer/requests', { state: { flashMessage: res.message } });
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to create request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        New request
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Tell us what you need written or copied — we'll match you with nearby writers.
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, maxWidth: 720 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          {activeStep === 0 && (
            <Stack spacing={2.5}>
              <Controller
                name="workType"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Work type" fullWidth error={!!errors.workType} helperText={errors.workType?.message}>
                    {WORK_TYPES.map((t) => (
                      <MenuItem key={t.value} value={t.value}>
                        {t.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Subject / title"
                    placeholder="e.g. Physics Chapter 4–6 notes"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    multiline
                    minRows={4}
                    fullWidth
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Stack>
          )}

          {activeStep === 1 && (
            <Stack spacing={2.5}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="numberOfPages"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="number"
                        label="Number of pages"
                        fullWidth
                        error={!!errors.numberOfPages}
                        helperText={errors.numberOfPages?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="numberOfDiagrams"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="number"
                        label="Number of diagrams"
                        fullWidth
                        error={!!errors.numberOfDiagrams}
                        helperText={errors.numberOfDiagrams?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Controller
                name="requiredDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Required by"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    error={!!errors.requiredDate}
                    helperText={errors.requiredDate?.message}
                  />
                )}
              />

              <Controller
                name="urgency"
                control={control}
                render={({ field }) => (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Urgency
                    </Typography>
                    <ToggleButtonGroup
                      exclusive
                      value={field.value}
                      onChange={(_, val) => val && field.onChange(val)}
                      color="primary"
                    >
                      <ToggleButton value="STANDARD">Standard</ToggleButton>
                      <ToggleButton value="URGENT">Urgent</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                )}
              />
            </Stack>
          )}

          {activeStep === 2 && (
            <Stack spacing={2.5}>
              <Typography variant="body2" color="text.secondary">
                Defaults to your account location — change it if the work needs to happen elsewhere.
              </Typography>
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
            </Stack>
          )}

          {activeStep === 3 && (
            <Stack spacing={2.5}>
              <Controller
                name="budget"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Budget"
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                    error={!!errors.budget}
                    helperText={errors.budget?.message}
                  />
                )}
              />
              <Controller
                name="additionalInstructions"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Additional instructions (optional)"
                    multiline
                    minRows={3}
                    fullWidth
                    error={!!errors.additionalInstructions}
                    helperText={errors.additionalInstructions?.message}
                  />
                )}
              />

              <Box>
                <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
                  Attach reference files
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))}
                  />
                </Button>
                {files.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                    {files.map((f) => (
                      <Chip key={f.name} label={f.name} size="small" onDelete={() => setFiles((prev) => prev.filter((x) => x !== f))} />
                    ))}
                  </Stack>
                )}
              </Box>
            </Stack>
          )}

          <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
            <Button onClick={handleBack} disabled={activeStep === 0}>
              Back
            </Button>
            {activeStep < STEPS.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit request'}
              </Button>
            )}
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
