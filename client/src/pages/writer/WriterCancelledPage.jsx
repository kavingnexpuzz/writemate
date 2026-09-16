import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import RequestsList from '../../components/RequestsList';

export default function WriterCancelledPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Cancelled
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Requests that were cancelled after you accepted them.
      </Typography>

      <RequestsList bucket="cancelled" personColumn="customer" emptyText="No cancelled requests." />
    </Box>
  );
}
