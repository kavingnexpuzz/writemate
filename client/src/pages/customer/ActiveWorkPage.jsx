import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import RequestsList from '../../components/RequestsList';

export default function ActiveWorkPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Active work
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Requests that are matched, quoted, paid for, or in progress.
      </Typography>

      <RequestsList bucket="active" personColumn="writer" emptyText="No active work right now." />
    </Box>
  );
}
