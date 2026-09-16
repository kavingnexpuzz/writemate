import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import RequestsList from '../../components/RequestsList';
import requestService from '../../services/requestService';

export default function WriterNewRequestsPage() {
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const handleAccept = async (request, reload) => {
    setBusyId(request._id);
    try {
      await requestService.writerAccept(request._id);
      setToast({ severity: 'success', message: 'Request accepted — open it to send a quotation.' });
      reload();
    } catch (err) {
      setToast({ severity: 'error', message: err.response?.data?.message || 'Failed to accept request' });
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (request, reload) => {
    setBusyId(request._id);
    try {
      await requestService.writerReject(request._id);
      setToast({ severity: 'success', message: 'Request declined' });
      reload();
    } catch (err) {
      setToast({ severity: 'error', message: err.response?.data?.message || 'Failed to decline request' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        New requests
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Requests matched to your location that no other writer has claimed yet.
      </Typography>

      <RequestsList
        bucket="new"
        personColumn="customer"
        emptyText="No new requests right now — check back soon."
        renderActions={(r, reload) => (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" variant="contained" disabled={busyId === r._id} onClick={() => handleAccept(r, reload)}>
              Accept
            </Button>
            <Button size="small" variant="outlined" color="error" disabled={busyId === r._id} onClick={() => handleReject(r, reload)}>
              Reject
            </Button>
          </Stack>
        )}
      />

      <Snackbar open={Boolean(toast)} autoHideDuration={4000} onClose={() => setToast(null)}>
        {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
      </Snackbar>
    </Box>
  );
}
