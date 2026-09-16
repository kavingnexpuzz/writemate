import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';

import StatCard from '../../components/StatCard';
import dashboardService from '../../services/dashboardService';

const statusCopy = {
  PENDING: { severity: 'info', text: "Your application is pending admin review. We'll email you once it's approved." },
  APPROVED: { severity: 'success', text: 'Your account is approved — you can accept requests as they come in.' },
  REJECTED: { severity: 'error', text: 'Your application was not approved. Check your email for details.' },
  BLOCKED: { severity: 'error', text: 'Your account has been blocked. Contact support for help.' },
};

export default function WriterDashboardPage() {
  const user = useSelector((state) => state.auth.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .getMyStats()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'New Requests', value: stats?.newRequests ?? 0, icon: <InboxOutlinedIcon fontSize="small" /> },
    { label: 'Accepted Jobs', value: stats?.acceptedJobs ?? 0, icon: <HourglassEmptyOutlinedIcon fontSize="small" /> },
    { label: 'In Progress', value: stats?.inProgress ?? 0, icon: <PendingActionsOutlinedIcon fontSize="small" />, accent: true },
    { label: 'Completed', value: stats?.completed ?? 0, icon: <DoneAllOutlinedIcon fontSize="small" /> },
    { label: 'Cancelled', value: stats?.cancelled ?? 0, icon: <CancelOutlinedIcon fontSize="small" /> },
    { label: 'Earnings', value: `₹${stats?.earnings ?? 0}`, icon: <AccountBalanceWalletOutlinedIcon fontSize="small" /> },
    {
      label: 'Rating',
      value: stats?.reviewCount ? `${stats.ratingAverage.toFixed(1)} ★ (${stats.reviewCount})` : 'No reviews yet',
      icon: <StarBorderOutlinedIcon fontSize="small" />,
    },
  ];

  const banner = stats?.writerStatus ? statusCopy[stats.writerStatus] : null;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.fullName?.split(' ')[0]}
      </Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        {loading ? <Skeleton variant="rounded" height={48} /> : banner && <Alert severity={banner.severity}>{banner.text}</Alert>}
      </Stack>

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
