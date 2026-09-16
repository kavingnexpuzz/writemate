import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import RequestsList from '../../components/RequestsList';
import requestService from '../../services/requestService';

const CANCELLABLE = ['PENDING', 'MATCHED', 'QUOTATION_SENT', 'QUOTATION_ACCEPTED', 'PAYMENT_PENDING'];

export default function MyRequestsPage() {
  const [cancelTarget, setCancelTarget] = useState(null);
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState(null);

  const handleCancel = async (reload) => {
    try {
      await requestService.cancel(cancelTarget._id, reason);
      setToast({ severity: 'success', message: 'Request cancelled' });
      reload();
    } catch (err) {
      setToast({ severity: 'error', message: err.response?.data?.message || 'Failed to cancel request' });
    } finally {
      setCancelTarget(null);
      setReason('');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My requests
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Everything you've submitted, in one place.
      </Typography>

      <RequestsList
        personColumn="writer"
        emptyText="You haven't submitted any requests yet."
        renderActions={(r, reload) =>
          CANCELLABLE.includes(r.status) && (
            <Button size="small" color="error" variant="outlined" onClick={() => setCancelTarget({ ...r, _reload: reload })}>
              Cancel
            </Button>
          )
        }
      />

      <Dialog open={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Cancel "{cancelTarget?.title}"?</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={2}
            label="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelTarget(null)}>Keep request</Button>
          <Button color="error" variant="contained" onClick={() => handleCancel(cancelTarget._reload)}>
            Cancel request
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={4000} onClose={() => setToast(null)}>
        {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
      </Snackbar>
    </Box>
  );
}
