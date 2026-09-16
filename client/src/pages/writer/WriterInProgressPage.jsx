import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import RequestsList from "../../components/RequestsList";

export default function WriterInProgressPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        In progress
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Jobs that are currently being worked on.
      </Typography>
      <RequestsList
        bucket="in_progress"
        personColumn="customer"
        emptyText="No jobs are in progress."
      />
    </Box>
  );
}
