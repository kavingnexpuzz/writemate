import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';

import paymentService from '../../services/paymentService';

const statusColor = { PENDING_VERIFICATION: 'warning', VERIFIED: 'success', REJECTED: 'error' };

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService
      .list({ limit: 50 })
      .then((res) => setPayments(res.data.payments))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Payments
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Everything you've paid or submitted for verification.
      </Typography>

      <Paper elevation={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Request</TableCell>
                <TableCell>Writer</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No payments yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {payments.map((p) => (
                <TableRow key={p._id} hover>
                  <TableCell>{p.request?.title}</TableCell>
                  <TableCell>{p.writer?.fullName}</TableCell>
                  <TableCell>₹{p.amount}</TableCell>
                  <TableCell>{p.transactionId}</TableCell>
                  <TableCell>
                    <Chip size="small" label={p.status} color={statusColor[p.status]} variant="outlined" />
                  </TableCell>
                  <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
