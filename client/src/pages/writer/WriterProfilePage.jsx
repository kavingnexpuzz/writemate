import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Chip from "@mui/material/Chip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import apiClient from "../../services/apiClient";
import ChangePasswordPanel from "../../components/ChangePasswordPanel";

export default function WriterProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [status, setStatus] = useState(null);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      pricePerPage: 0,
      pricePerDiagram: 0,
      upiId: "",
      bio: "",
      serviceDescription: "",
      isAvailable: true,
    },
  });

  useEffect(() => {
    apiClient
      .get("/writers/profile/me")
      .then((res) => {
        const p = res.data.data.writerProfile;
        setStatus(p.status);
        reset({
          pricePerPage: p.pricePerPage,
          pricePerDiagram: p.pricePerDiagram,
          upiId: p.upiId,
          bio: p.bio,
          serviceDescription: p.serviceDescription,
          isAvailable: p.isAvailable,
        });
      })
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      await apiClient.put("/writers/profile/me", values);
      setToast({ severity: "success", message: "Profile updated" });
    } catch (err) {
      setToast({
        severity: "error",
        message: err.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h4">Writer profile</Typography>
        {status && (
          <Chip
            size="small"
            label={status}
            color={status === "APPROVED" ? "success" : "default"}
          />
        )}
      </Stack>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Pricing, bio, and availability shown to customers.
      </Typography>

      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, maxWidth: 640 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.5}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="pricePerPage"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Price per page"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">₹</InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="pricePerDiagram"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Price per diagram"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">₹</InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Controller
              name="upiId"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="UPI ID" fullWidth />
              )}
            />
            <Controller
              name="bio"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Short bio"
                  multiline
                  minRows={2}
                  fullWidth
                />
              )}
            />
            <Controller
              name="serviceDescription"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Services offered"
                  multiline
                  minRows={3}
                  fullWidth
                />
              )}
            />
            <Controller
              name="isAvailable"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Available for new requests"
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={saving}
              sx={{ alignSelf: "flex-start" }}
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </Stack>
        </form>
      </Paper>

      <ChangePasswordPanel />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
      >
        {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
      </Snackbar>
    </Box>
  );
}
