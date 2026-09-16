import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import StatCard from "../../components/StatCard";
import paymentService from "../../services/paymentService";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";

const statusColor = {
  PENDING_VERIFICATION: "warning",
  VERIFIED: "success",
  REJECTED: "error",
};

export default function EarningsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const loadPayments = () => {
    setLoading(true);
    paymentService
      .list({ limit: 50 })
      .then((res) => setPayments(res.data.payments))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleVerification = async (payment, action) => {
    const reason =
      action === "reject"
        ? window.prompt("Why could this payment not be verified?")
        : "";
    if (action === "reject" && reason === null) return;
    setBusyId(payment._id);
    try {
      await paymentService.verify(payment._id, action, reason || undefined);
      setToast({
        severity: action === "verify" ? "success" : "warning",
        message: action === "verify" ? "Payment verified" : "Payment rejected",
      });
      loadPayments();
    } catch (err) {
      setToast({
        severity: "error",
        message: err.response?.data?.message || "Payment verification failed",
      });
    } finally {
      setBusyId(null);
    }
  };

  const verifiedTotal = payments
    .filter((p) => p.status === "VERIFIED")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingTotal = payments
    .filter((p) => p.status === "PENDING_VERIFICATION")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Earnings
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Payments customers have made for your completed quotations.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <StatCard
            label="Verified earnings"
            value={`₹${verifiedTotal}`}
            icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />}
            accent
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            label="Awaiting verification"
            value={`₹${pendingTotal}`}
            icon={<HourglassEmptyOutlinedIcon fontSize="small" />}
          />
        </Grid>
      </Grid>

      <Paper elevation={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Request</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No payments yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {payments.map((p) => (
                <TableRow key={p._id} hover>
                  <TableCell>{p.request?.title}</TableCell>
                  <TableCell>{p.customer?.fullName}</TableCell>
                  <TableCell>₹{p.amount}</TableCell>
                  <TableCell>{p.transactionId || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={p.status}
                      color={statusColor[p.status]}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    {p.status === "PENDING_VERIFICATION" && (
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          disabled={busyId === p._id}
                          onClick={() => handleVerification(p, "verify")}
                        >
                          Verify
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          disabled={busyId === p._id}
                          onClick={() => handleVerification(p, "reject")}
                        >
                          Reject
                        </Button>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

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
