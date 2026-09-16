import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import writerService from '../../services/writerService';

export default function WriterPublicProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    writerService
      .getPublicProfile(id)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Writer not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="text.secondary">{error}</Typography>;
  }

  const { writerProfile: w, reviews } = data;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, maxWidth: 720 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Avatar sx={{ width: 64, height: 64, fontSize: 24 }}>{w.user?.fullName?.[0]}</Avatar>
          <Box>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="h5">{w.user?.fullName}</Typography>
              <VerifiedIcon sx={{ fontSize: 20, color: 'success.main' }} titleAccess="Verified writer" />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {w.user?.city}, {w.user?.district}, {w.user?.state}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
          <Chip label={`₹${w.pricePerPage}/page`} />
          <Chip label={`₹${w.pricePerDiagram}/diagram`} />
          <Chip icon={<StarIcon sx={{ fontSize: 14 }} />} label={w.ratingCount ? `${w.ratingAverage.toFixed(1)} (${w.ratingCount})` : 'No reviews yet'} />
          <Chip label={`${w.completedJobs} completed jobs`} variant="outlined" />
          <Chip label={w.isAvailable ? 'Available' : 'Unavailable'} color={w.isAvailable ? 'success' : 'default'} />
        </Stack>

        <Typography variant="subtitle2" gutterBottom>
          About
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {w.bio}
        </Typography>

        <Typography variant="subtitle2" gutterBottom>
          Services offered
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {w.serviceDescription}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Reviews
        </Typography>
        {reviews.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No reviews yet.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {reviews.map((r) => (
              <Box key={r._id}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {r.customer?.fullName}
                  </Typography>
                  <Chip size="small" icon={<StarIcon sx={{ fontSize: 12 }} />} label={r.rating} />
                </Stack>
                {r.review && (
                  <Typography variant="body2" color="text.secondary">
                    {r.review}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
