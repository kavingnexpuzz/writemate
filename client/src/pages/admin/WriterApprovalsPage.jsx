import { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import adminService from '../../services/adminService';

export default function WriterApprovalsPage() {
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    adminService
      .listWriters({ status: 'PENDING', limit: 50 })
      .then((res) => setWriters(res.data.writers))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (id) => {
    setBusyId(id);
    try {
      await adminService.approveWriter(id);
      setToast({ severity: 'success', message: 'Writer approved' });
      setWriters((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      setToast({ severity: 'error', message: err.response?.data?.message || 'Failed to approve writer' });
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setBusyId(rejectTarget._id);
    try {
      await adminService.rejectWriter(rejectTarget._id, rejectReason);
      setToast({ severity: 'success', message: 'Writer application rejected' });
      setWriters((prev) => prev.filter((w) => w._id !== rejectTarget._id));
    } catch (err) {
      setToast({ severity: 'error', message: err.response?.data?.message || 'Failed to reject writer' });
    } finally {
      setBusyId(null);
      setRejectTarget(null);
      setRejectReason('');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Writer approvals
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        New writer applications waiting for review. Writers can't accept requests until approved.
      </Typography>

      <Paper elevation={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Writer</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Pricing</TableCell>
                <TableCell>UPI QR</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && writers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No pending applications.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {writers.map((w) => (
                <TableRow key={w._id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ width: 32, height: 32, fontSize: 13 }}>{w.user?.fullName?.[0]}</Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {w.user?.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {w.user?.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{w.city}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {w.district}, {w.state}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">₹{w.pricePerPage}/page</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ₹{w.pricePerDiagram}/diagram
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Link href={w.upiQrCodeUrl} target="_blank" rel="noopener">
                      View
                    </Link>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        disabled={busyId === w._id}
                        onClick={() => handleApprove(w._id)}
                      >
                        Approve
                      </Button>
                      <Button size="small" variant="outlined" color="error" disabled={busyId === w._id} onClick={() => setRejectTarget(w)}>
                        Reject
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Reject {rejectTarget?.user?.fullName}'s application</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={2}
            label="Reason (sent to the applicant)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleReject}>
            Reject application
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={4000} onClose={() => setToast(null)}>
        {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
      </Snackbar>
    </Box>
  );
}
