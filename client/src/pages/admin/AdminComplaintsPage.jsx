import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import adminService from "../../services/adminService";

const statuses = ["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"];

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const load = () => {
    setLoading(true);
    adminService
      .listComplaints({ limit: 50 })
      .then((res) => setComplaints(res.data.complaints))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const update = async (complaint, status, adminResponse) => {
    setSaving(complaint._id);
    try {
      await adminService.updateComplaint(complaint._id, {
        status,
        adminResponse,
      });
      load();
    } finally {
      setSaving(null);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Complaints
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Review and resolve customer and writer complaints.
      </Typography>
      <Stack spacing={2}>
        {loading && <CircularProgress size={24} />}
        {!loading && complaints.length === 0 && (
          <Typography color="text.secondary">No complaints found.</Typography>
        )}
        {complaints.map((complaint) => (
          <Paper key={complaint._id} elevation={0} sx={{ p: 2.5 }}>
            <Stack spacing={1.5}>
              <Stack
                direction="row"
                justifyContent="space-between"
                gap={2}
                flexWrap="wrap"
              >
                <Box>
                  <Typography variant="subtitle1">
                    {complaint.reason}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {complaint.request?.title || "Request"} · raised by{" "}
                    {complaint.raisedBy?.fullName || "Unknown"}
                  </Typography>
                </Box>
                <Chip label={complaint.status} />
              </Stack>
              <Typography variant="body2">{complaint.description}</Typography>
              <TextField
                size="small"
                fullWidth
                multiline
                minRows={2}
                label="Admin response"
                defaultValue={complaint.adminResponse}
                id={`response-${complaint._id}`}
              />
              <Stack direction="row" spacing={1} alignItems="center">
                <Select
                  size="small"
                  defaultValue={complaint.status}
                  id={`status-${complaint._id}`}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
                <Button
                  variant="contained"
                  disabled={saving === complaint._id}
                  onClick={() =>
                    update(
                      complaint,
                      document.getElementById(`status-${complaint._id}`).value,
                      document.getElementById(`response-${complaint._id}`)
                        .value,
                    )
                  }
                >
                  Save
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
