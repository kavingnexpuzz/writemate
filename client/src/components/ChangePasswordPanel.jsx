import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import apiClient from "../services/apiClient";

const initialValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ChangePasswordPanel() {
  const [values, setValues] = useState(initialValues);
  const [visible, setVisible] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const setValue = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));
  const toggleVisible = (field) =>
    setVisible((current) => ({ ...current, [field]: !current[field] }));

  const submit = async (event) => {
    event.preventDefault();
    if (values.newPassword !== values.confirmPassword) {
      setToast({ severity: "error", message: "New passwords do not match" });
      return;
    }
    setSaving(true);
    try {
      await apiClient.put("/users/password", values);
      setValues(initialValues);
      setToast({
        severity: "success",
        message: "Password changed successfully",
      });
    } catch (error) {
      setToast({
        severity: "error",
        message: error.response?.data?.message || "Could not change password",
      });
    } finally {
      setSaving(false);
    }
  };

  const passwordField = (name, label) => (
    <TextField
      type={visible[name] ? "text" : "password"}
      label={label}
      value={values[name]}
      onChange={setValue(name)}
      required
      fullWidth
      autoComplete={
        name === "currentPassword" ? "current-password" : "new-password"
      }
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={`Show ${label.toLowerCase()}`}
              onClick={() => toggleVisible(name)}
              edge="end"
            >
              {visible[name] ? (
                <VisibilityOffOutlinedIcon />
              ) : (
                <VisibilityOutlinedIcon />
              )}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          mt: 3,
          maxWidth: 760,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 7,
            height: "100%",
            bgcolor: "secondary.main",
          }}
        />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ sm: "center" }}
          sx={{ mb: 2.5, pl: 1 }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              bgcolor: "secondary.light",
              color: "secondary.dark",
            }}
          >
            <LockResetOutlinedIcon />
          </Box>
          <Box>
            <Typography variant="h6">Keep your account secure</Typography>
            <Typography variant="body2" color="text.secondary">
              Refresh your password whenever you need a little extra peace of
              mind.
            </Typography>
          </Box>
        </Stack>
        <Box component="form" onSubmit={submit} sx={{ pl: 1 }}>
          <Stack spacing={2}>
            {passwordField("currentPassword", "Current password")}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {passwordField("newPassword", "New password")}
              {passwordField("confirmPassword", "Confirm new password")}
            </Stack>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={saving}
              sx={{ alignSelf: "flex-start" }}
            >
              {saving ? "Updating..." : "Update password"}
            </Button>
          </Stack>
        </Box>
      </Paper>
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4500}
        onClose={() => setToast(null)}
      >
        {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
      </Snackbar>
    </>
  );
}
