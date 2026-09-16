import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import paymentService from '../services/paymentService';

const PAYMENT_VISIBLE_STATUSES = ['PAYMENT_PENDING', 'PAID', 'IN_PROGRESS', 'COMPLETED'];

const paymentStatusColor = { PENDING_VERIFICATION: 'warning', VERIFIED: 'success', REJECTED: 'error' };

export default function PaymentPanel({ request, onRequestUpdated }) {
  const user = useSelector((state) => state.auth.user);
  const [info, setInfo] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactionId, setTransactionId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectFor, setShowRejectFor] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const isCustomer = user?.role === 'CUSTOMER' && request.customer?._id === user._id;
  const isAssignedWriter = user?.role === 'WRITER' && request.writer?._id === user._id;
  const isAdmin = user?.role === 'ADMIN';

  const load = () => {
    setLoading(true);
    setError(null);
    const fetcher = isCustomer ? paymentService.getPaymentInfo(request._id) : paymentService.getByRequest(request._id);
    fetcher
      .then((res) => {
        if (isCustomer) {
          setInfo(res.data);
          setPayment(res.data.existingPayment);
        } else {
          setPayment(res.data.payment);
        }
      })
      .catch((err) => {
        // No payment yet is expected for writer/admin before customer pays.
        if (err.response?.status !== 404) setError(err.response?.data?.message || 'Failed to load payment');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request._id, request.status]);

  if (!PAYMENT_VISIBLE_STATUSES.includes(request.status)) return null;
  if (!isCustomer && !isAssignedWriter && !isAdmin) return null;

  const handleSubmitPayment = async () => {
    if (!transactionId.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await paymentService.create({ requestId: request._id, transactionId: transactionId.trim() });
      setTransactionId('');
      load();
      onRequestUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit payment');
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (action) => {
    setBusy(true);
    setError(null);
    try {
      await paymentService.verify(payment._id, action, rejectReason);
      setShowRejectFor(false);
      setRejectReason('');
      load();
      onRequestUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, mt: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Payment
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
          {isCustomer && info && (
            <>
              <Typography variant="body2" color="text.secondary">
                Amount due: <strong>₹{info.amount}</strong>
              </Typography>

              {(!payment || payment.status === 'REJECTED') && (
                <>
                  {payment?.status === 'REJECTED' && (
                    <Alert severity="warning">Your last payment couldn't be verified: {payment.rejectionReason}. Please resubmit.</Alert>
                  )}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                    <Box
                      component="img"
                      src={info.upiQrCodeUrl}
                      alt="UPI QR code"
                      sx={{ width: 160, height: 160, borderRadius: 1, border: '1px solid', borderColor: 'divider', objectFit: 'contain' }}
                    />
                    <Stack spacing={1} sx={{ flex: 1 }}>
                      <Typography variant="body2">
                        UPI ID: <strong>{info.upiId}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Scan the QR or pay to the UPI ID above, then enter the transaction ID below.
                      </Typography>
                      <TextField
                        size="small"
                        label="Transaction ID"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        fullWidth
                      />
                      <Button
                        variant="contained"
                        disabled={busy || !transactionId.trim()}
                        onClick={handleSubmitPayment}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        {busy ? 'Submitting…' : "I've paid"}
                      </Button>
                    </Stack>
                  </Stack>
                </>
              )}

              {payment?.status === 'PENDING_VERIFICATION' && (
                <Alert severity="info">
                  Payment submitted (transaction ID: {payment.transactionId}) — waiting for the writer to verify it.
                </Alert>
              )}
              {payment?.status === 'VERIFIED' && <Alert severity="success">Payment verified. Work can begin.</Alert>}
            </>
          )}

          {(isAssignedWriter || isAdmin) && (
            <>
              {!payment && <Typography color="text.secondary">No payment submitted yet.</Typography>}
              {payment && (
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      ₹{payment.amount} · Transaction ID: <strong>{payment.transactionId}</strong>
                    </Typography>
                    <Chip size="small" label={payment.status} color={paymentStatusColor[payment.status]} />
                  </Stack>

                  {payment.status === 'PENDING_VERIFICATION' && (
                    <Box sx={{ mt: 1.5 }}>
                      {!showRejectFor ? (
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="contained" color="success" disabled={busy} onClick={() => handleVerify('verify')}>
                            Verify payment
                          </Button>
                          <Button size="small" variant="outlined" color="error" disabled={busy} onClick={() => setShowRejectFor(true)}>
                            Dispute
                          </Button>
                        </Stack>
                      ) : (
                        <Stack spacing={1}>
                          <TextField
                            size="small"
                            label="Reason"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            fullWidth
                          />
                          <Stack direction="row" spacing={1}>
                            <Button size="small" color="error" variant="contained" disabled={busy} onClick={() => handleVerify('reject')}>
                              Confirm dispute
                            </Button>
                            <Button size="small" onClick={() => setShowRejectFor(false)}>
                              Cancel
                            </Button>
                          </Stack>
                        </Stack>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </>
          )}
        </Stack>
      )}
    </Paper>
  );
}
