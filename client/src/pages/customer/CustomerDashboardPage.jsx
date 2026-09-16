import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';

import StatCard from '../../components/StatCard';
import dashboardService from '../../services/dashboardService';

export default function CustomerDashboardPage() {
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
    { label: 'Total Requests', value: stats?.totalRequests ?? 0, icon: <ListAltOutlinedIcon fontSize="small" /> },
    { label: 'Pending Requests', value: stats?.pendingRequests ?? 0, icon: <HourglassEmptyOutlinedIcon fontSize="small" /> },
    { label: 'Active Jobs', value: stats?.activeJobs ?? 0, icon: <PendingActionsOutlinedIcon fontSize="small" />, accent: true },
    { label: 'Completed Jobs', value: stats?.completedJobs ?? 0, icon: <TaskAltOutlinedIcon fontSize="small" /> },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.fullName?.split(' ')[0]}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Here's an overview of your requests.
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
