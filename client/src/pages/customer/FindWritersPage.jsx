import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';

import writerService from '../../services/writerService';
import { INDIAN_STATES } from '../../utils/indianStates';

export default function FindWritersPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ state: '', district: '', city: '', minPrice: '', maxPrice: '' });
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      writerService
        .search(params)
        .then((res) => setWriters(res.data.writers))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [filters]);

  const setFilter = (key) => (e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Find writers
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Browse approved writers near you.
      </Typography>

      <Paper elevation={0} sx={{ p: 2.5, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField select fullWidth size="small" label="State" value={filters.state} onChange={setFilter('state')}>
              <MenuItem value="">Any state</MenuItem>
              {INDIAN_STATES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth size="small" label="District" value={filters.district} onChange={setFilter('district')} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth size="small" label="City" value={filters.city} onChange={setFilter('city')} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Min ₹/page"
                value={filters.minPrice}
                onChange={setFilter('minPrice')}
              />
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Max ₹/page"
                value={filters.maxPrice}
                onChange={setFilter('maxPrice')}
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : writers.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No writers match these filters yet.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {writers.map((w) => (
            <Grid item xs={12} sm={6} md={4} key={w._id}>
              <Paper elevation={0} sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ width: 44, height: 44 }}>{w.user?.fullName?.[0]}</Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="subtitle2" noWrap>
                        {w.user?.fullName}
                      </Typography>
                      <VerifiedIcon sx={{ fontSize: 15, color: 'success.main' }} titleAccess="Verified writer" />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {w.user?.city}, {w.user?.district}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip size="small" label={`₹${w.pricePerPage}/page`} />
                  <Chip size="small" label={`₹${w.pricePerDiagram}/diagram`} />
                  <Chip
                    size="small"
                    icon={<StarIcon sx={{ fontSize: 14 }} />}
                    label={w.ratingCount ? w.ratingAverage.toFixed(1) : 'New'}
                    color={w.ratingCount ? 'default' : 'default'}
                  />
                  <Chip size="small" label={w.isAvailable ? 'Available' : 'Unavailable'} color={w.isAvailable ? 'success' : 'default'} />
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                  {w.bio?.slice(0, 100)}
                  {w.bio?.length > 100 ? '…' : ''}
                </Typography>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    {w.completedJobs} completed jobs
                  </Typography>
                  <Button size="small" onClick={() => navigate(`/customer/writers/${w.user?._id}`)}>
                    View profile
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
