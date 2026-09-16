import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ChangePasswordPanel from "../../components/ChangePasswordPanel";

import apiClient from "../../services/apiClient";
import { fetchCurrentUser } from "../../features/auth/authSlice";
import { INDIAN_STATES } from "../../utils/indianStates";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      fullName: "",
      phone: "",
      state: "",
      district: "",
      city: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName,
        phone: user.phone,
        state: user.state,
        district: user.district,
        city: user.city,
      });
    }
  }, [user, reset]);

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      await apiClient.put("/users/profile", values);
      await dispatch(fetchCurrentUser());
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

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: { xs: 2.5, sm: 3.5 },
          color: "common.white",
          background:
            "linear-gradient(125deg, #1F2D50 0%, #3B517F 70%, #B0812A 170%)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 180,
            height: 180,
            border: "1px solid",
            borderColor: "rgba(255,255,255,.18)",
            borderRadius: "50%",
            right: -55,
            top: -80,
          }}
        />
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ position: "relative" }}
        >
          <Avatar
            sx={{
              width: 58,
              height: 58,
              bgcolor: "secondary.main",
              color: "secondary.contrastText",
            }}
          >
            <PersonOutlineOutlinedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4">Your profile</Typography>
            <Typography sx={{ opacity: 0.82 }}>{user?.email}</Typography>
          </Box>
          <Chip
            label={user?.role}
            sx={{
              ml: "auto",
              color: "common.white",
              borderColor: "rgba(255,255,255,.45)",
            }}
            variant="outlined"
          />
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, maxWidth: 560 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.5}>
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Full name" fullWidth />
              )}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Phone number" fullWidth />
              )}
            />
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="State" fullWidth>
                  {INDIAN_STATES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="district"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="District" fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="City" fullWidth />
                  )}
                />
              </Grid>
            </Grid>
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

      <Divider sx={{ maxWidth: 760, mt: 4 }} />
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
