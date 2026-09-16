import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import quotationService from '../services/quotationService';

const quotationStatusColor = { PENDING: 'info', ACCEPTED: 'success', REJECTED: 'error' };

export default function QuotationPanel({ request, onRequestUpdated }) {
  const user = useSelector((state) => state.auth.user);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [respondingId, setRespondingId] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    quotationService
      .listForRequest(request._id)
      .then((res) => setQuotations(res.data.quotations))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request._id, request.status]);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: { pricePerPage: '', pricePerDiagram: '', additionalCharges: 0, estimatedCompletionDate: '', message: '' },
  });
  const watched = watch();

  const previewTotal = useMemo(() => {
    const perPage = Number(watched.pricePerPage) || 0;
    const perDiagram = Number(watched.pricePerDiagram) || 0;
    const extra = Number(watched.additionalCharges) || 0;
    return perPage * request.numberOfPages + perDiagram * request.numberOfDiagrams + extra;
  }, [watched, request.numberOfPages, request.numberOfDiagrams]);

  const isAssignedWriter = user?.role === 'WRITER' && request.writer?._id === user._id;
  const canSendQuotation = isAssignedWriter && request.status === 'MATCHED';
  const latestQuotation = quotations[0];
  const canRespond = user?.role === 'CUSTOMER' && latestQuotation?.status === 'PENDING' && request.status === 'QUOTATION_SENT';

  const onSubmit = async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      await quotationService.create({ requestId: request._id, ...values });
      load();
      onRequestUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send quotation');
    } finally {
      setSubmitting(false);
    }
  };

  const respond = async (id, action) => {
    setRespondingId(id);
    try {
      await quotationService.respond(id, action);
      load();
      onRequestUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to respond to quotation');
    } finally {
      setRespondingId(null);
    }
  };

  if (!canSendQuotation && quotations.length === 0 && !loading) {
    return null; // Nothing to show yet — no quotation exists and this viewer can't create one.
  }

  return (
    <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, mt: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Quotation
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={22} />
        </Box>
      ) : (
        <Stack spacing={2}>
          {quotations.map((q) => (
            <Box key={q._id}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ₹{q.estimatedTotal} total
                </Typography>
                <Chip size="small" label={q.status} color={quotationStatusColor[q.status]} />
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block">
                ₹{q.pricePerPage}/page × {request.numberOfPages} + ₹{q.pricePerDiagram}/diagram × {request.numberOfDiagrams}
                {q.additionalCharges ? ` + ₹${q.additionalCharges} extra` : ''}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Estimated completion: {new Date(q.estimatedCompletionDate).toLocaleDateString()}
              </Typography>
              {q.message && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  "{q.message}"
                </Typography>
              )}

              {canRespond && q._id === latestQuotation._id && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={respondingId === q._id}
                    onClick={() => respond(q._id, 'accept')}
                  >
                    Accept quotation
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    disabled={respondingId === q._id}
                    onClick={() => respond(q._id, 'reject')}
                  >
                    Reject
                  </Button>
                </Stack>
              )}
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}

          {canSendQuotation && (
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {quotations.length > 0 ? 'Send a revised quotation' : 'Send a quotation'}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="pricePerPage"
                    control={control}
                    rules={{ required: true, min: 0 }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="number"
                        label="Price/page"
                        fullWidth
                        size="small"
                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="pricePerDiagram"
                    control={control}
                    rules={{ required: true, min: 0 }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="number"
                        label="Price/diagram"
                        fullWidth
                        size="small"
                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="additionalCharges"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="number"
                        label="Extra charges"
                        fullWidth
                        size="small"
                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Controller
                name="estimatedCompletionDate"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Estimated completion"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                    sx={{ mt: 2 }}
                  />
                )}
              />
              <Controller
                name="message"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Message (optional)" multiline minRows={2} fullWidth size="small" sx={{ mt: 2 }} />
                )}
              />

              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Estimated total: <strong>₹{previewTotal}</strong>
                </Typography>
                <Button type="submit" variant="contained" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send quotation'}
                </Button>
              </Stack>
            </Box>
          )}
        </Stack>
      )}
    </Paper>
  );
}
