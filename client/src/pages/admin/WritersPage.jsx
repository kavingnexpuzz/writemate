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
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import adminService from '../../services/adminService';

const TABS = [
  { label: 'All', value: '' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Blocked', value: 'BLOCKED' },
];

const statusColor = {
  APPROVED: 'success',
  PENDING: 'warning',
  REJECTED: 'error',
  BLOCKED: 'error',
};

export default function WritersPage() {
  const [tab, setTab] = useState('');
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback((status) => {
    setLoading(true);
    adminService
      .listWriters({ status: status || undefined, limit: 50 })
      .then((res) => setWriters(res.data.writers))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  const handleToggleBlock = async (writer) => {
    setBusyId(writer._id);
    try {
      if (writer.status === 'BLOCKED') {
        await adminService.unblockWriter(writer._id);
        setToast({ severity: 'success', message: 'Writer unblocked' });
      } else {
        await adminService.blockWriter(writer._id);
        setToast({ severity: 'success', message: 'Writer blocked' });
      }
      load(tab);
    } catch (err) {
      setToast({ severity: 'error', message: err.response?.data?.message || 'Action failed' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Writers
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        All writers on the platform.
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
                <TableCell>Writer</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Rating</TableCell>
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
                    <Typography color="text.secondary">No writers found.</Typography>
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
                    <Chip size="small" label={w.status} color={statusColor[w.status] || 'default'} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    {w.ratingCount ? `${w.ratingAverage.toFixed(1)} ★ (${w.ratingCount})` : '—'}
                  </TableCell>
                  <TableCell align="right">
                    {(w.status === 'APPROVED' || w.status === 'BLOCKED') && (
                      <Button
                        size="small"
                        variant="outlined"
                        color={w.status === 'BLOCKED' ? 'success' : 'error'}
                        disabled={busyId === w._id}
                        onClick={() => handleToggleBlock(w)}
                      >
                        {w.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Snackbar open={Boolean(toast)} autoHideDuration={4000} onClose={() => setToast(null)}>
        {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
      </Snackbar>
    </Box>
  );
}
