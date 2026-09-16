import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import TopBar from "../components/TopBar";
import QuotationPanel from "../components/QuotationPanel";
import PaymentPanel from "../components/PaymentPanel";
import requestService from "../services/requestService";
import { statusMeta } from "../utils/requestStatus";
import { WORK_TYPES } from "../utils/workTypes";

const workTypeLabel = (value) =>
  WORK_TYPES.find((t) => t.value === value)?.label || value;

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    requestService
      .getById(id)
      .then((res) => setRequest(res.data.request))
      .catch((err) =>
        setError(err.response?.data?.message || "Request not found"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAccept = async () => {
    setBusy(true);
    try {
      await requestService.writerAccept(id);
      load();
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    setBusy(true);
    try {
      await requestService.writerReject(id);
      navigate(-1);
    } finally {
      setBusy(false);
    }
  };

  const handleWriterTransition = async (action) => {
    setBusy(true);
    try {
      if (action === "start") await requestService.writerStart(id);
      else await requestService.writerComplete(id);
      load();
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    setBusy(true);
    try {
      await requestService.cancel(id);
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box>
      <TopBar />
      <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 800, mx: "auto" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Typography color="text.secondary">{error}</Typography>}

        {request && (
          <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              sx={{ mb: 1 }}
            >
              <Typography variant="h5">{request.title}</Typography>
              <Chip
                label={statusMeta(request.status).label}
                color={statusMeta(request.status).color}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {workTypeLabel(request.workType)} · Created{" "}
              {new Date(request.createdAt).toLocaleString()}
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              Description
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, whiteSpace: "pre-wrap" }}
            >
              {request.description}
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Pages
                </Typography>
                <Typography variant="body1">{request.numberOfPages}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Diagrams
                </Typography>
                <Typography variant="body1">
                  {request.numberOfDiagrams}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Required by
                </Typography>
                <Typography variant="body1">
                  {new Date(request.requiredDate).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Budget
                </Typography>
                <Typography variant="body1">₹{request.budget}</Typography>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" gutterBottom>
              Location
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {request.city}, {request.district}, {request.state}
            </Typography>

            {request.additionalInstructions && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Additional instructions
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3, whiteSpace: "pre-wrap" }}
                >
                  {request.additionalInstructions}
                </Typography>
              </>
            )}

            {request.referenceFiles?.length > 0 && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Reference files
                </Typography>
                <Stack spacing={0.5} sx={{ mb: 3 }}>
                  {request.referenceFiles.map((f) => (
                    <Link
                      key={f.publicId}
                      href={f.url}
                      target="_blank"
                      rel="noopener"
                      variant="body2"
                    >
                      {f.originalName}
                    </Link>
                  ))}
                </Stack>
              </>
            )}

            <Divider sx={{ mb: 3 }} />

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              {user?.role === "WRITER" &&
                !request.writer &&
                request.status === "MATCHED" && (
                  <>
                    <Button
                      variant="outlined"
                      color="error"
                      disabled={busy}
                      onClick={handleReject}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="contained"
                      disabled={busy}
                      onClick={handleAccept}
                    >
                      Accept
                    </Button>
                  </>
                )}
              {user?.role === "WRITER" &&
                request.writer?._id === user._id &&
                request.status === "PAID" && (
                  <Button
                    variant="contained"
                    disabled={busy}
                    onClick={() => handleWriterTransition("start")}
                  >
                    Start work
                  </Button>
                )}
              {user?.role === "WRITER" &&
                request.writer?._id === user._id &&
                request.status === "IN_PROGRESS" && (
                  <Button
                    variant="contained"
                    color="success"
                    disabled={busy}
                    onClick={() => handleWriterTransition("complete")}
                  >
                    Mark completed
                  </Button>
                )}
              {user?.role === "CUSTOMER" &&
                !["COMPLETED", "CANCELLED"].includes(request.status) && (
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={busy}
                    onClick={handleCancel}
                  >
                    Cancel request
                  </Button>
                )}
            </Stack>
          </Paper>
        )}

        {request && (
          <QuotationPanel request={request} onRequestUpdated={load} />
        )}
        {request && <PaymentPanel request={request} onRequestUpdated={load} />}
      </Box>
    </Box>
  );
}
