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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';

import adminService from '../../services/adminService';

const TABS = [
  { label: 'All', value: '' },
  { label: 'Pending verification', value: 'PENDING_VERIFICATION' },
  { label: 'Verified', value: 'VERIFIED' },
  { label: 'Rejected', value: 'REJECTED' },
];

const statusColor = { PENDING_VERIFICATION: 'warning', VERIFIED: 'success', REJECTED: 'error' };

export default function AdminPaymentsPage() {
  const [tab, setTab] = useState('');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminService
      .listPayments({ status: tab || undefined, limit: 50 })
      .then((res) => setPayments(res.data.payments))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Payments
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Every payment submitted on the platform.
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        {TABS.map((t) => (
          <Tab key={t.value} label={t.label} value={t.value} />
        ))}
      </Tabs>

      <Paper elevation={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Request</TableCell>
                <TableCell>Customer</TableCell>
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
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No payments found.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {payments.map((p) => (
                <TableRow key={p._id} hover>
                  <TableCell>{p.request?.title}</TableCell>
                  <TableCell>{p.customer?.fullName}</TableCell>
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
