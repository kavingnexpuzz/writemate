import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

import StatCard from '../../components/StatCard';
import adminService from '../../services/adminService';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getDashboardStats()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Customers', value: stats?.totalCustomers ?? 0, icon: <GroupOutlinedIcon fontSize="small" /> },
    { label: 'Total Writers', value: stats?.totalWriters ?? 0, icon: <EditNoteOutlinedIcon fontSize="small" /> },
    {
      label: 'Pending Approvals',
      value: stats?.pendingWriterApprovals ?? 0,
      icon: <HowToRegOutlinedIcon fontSize="small" />,
      accent: true,
    },
    { label: 'Active Requests', value: stats?.activeRequests ?? 0, icon: <PendingActionsOutlinedIcon fontSize="small" /> },
    { label: 'Completed Requests', value: stats?.completedRequests ?? 0, icon: <TaskAltOutlinedIcon fontSize="small" /> },
    { label: 'Cancelled Requests', value: stats?.cancelledRequests ?? 0, icon: <CancelOutlinedIcon fontSize="small" /> },
    { label: 'Total Payments', value: stats?.totalPayments ?? 0, icon: <PaymentsOutlinedIcon fontSize="small" /> },
    {
      label: 'Platform Revenue',
      value: `₹${stats?.platformRevenue ?? 0}`,
      icon: <AccountBalanceWalletOutlinedIcon fontSize="small" />,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin overview
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Platform-wide activity at a glance.
      </Typography>

      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            {loading ? <Skeleton variant="rounded" height={92} /> : <StatCard {...card} />}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
