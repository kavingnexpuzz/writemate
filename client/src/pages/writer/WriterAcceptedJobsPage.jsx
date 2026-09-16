import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import RequestsList from '../../components/RequestsList';

export default function WriterAcceptedJobsPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Accepted jobs
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Requests you've claimed. Open one to send a quotation.
      </Typography>

      <RequestsList bucket="accepted" personColumn="customer" emptyText="You haven't accepted any requests yet." />
    </Box>
  );
}
