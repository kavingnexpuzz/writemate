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
import { statusMeta } from '../../utils/requestStatus';

const TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Matched', value: 'MATCHED' },
  { label: 'In progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function AdminRequestsPage() {
  const [tab, setTab] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminService
      .listRequests({ status: tab || undefined, limit: 50 })
      .then((res) => setRequests(res.data.requests))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Requests
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Every request on the platform.
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable">
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
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
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
              {!loading && requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No requests found.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {requests.map((r) => {
                const meta = statusMeta(r.status);
                return (
                  <TableRow key={r._id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {r.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{r.customer?.fullName}</TableCell>
                    <TableCell>{r.writer?.fullName || '—'}</TableCell>
                    <TableCell>{r.city}</TableCell>
                    <TableCell>
                      <Chip size="small" label={meta.label} color={meta.color} variant="outlined" />
                    </TableCell>
                    <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
