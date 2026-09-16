import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import RequestsList from "../../components/RequestsList";

export default function WriterCompletedPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Completed
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Jobs you have finished and handed back to customers.
      </Typography>
      <RequestsList
        bucket="completed"
        personColumn="customer"
        emptyText="No completed jobs yet."
      />
    </Box>
  );
}
