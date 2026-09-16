import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import adminService from "../../services/adminService";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .listReviews({ limit: 50 })
      .then((res) => setReviews(res.data.reviews))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reviews
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Customer feedback across completed jobs.
      </Typography>
      <Paper elevation={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Request</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Writer</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Review</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && reviews.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">
                      No reviews yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {reviews.map((review) => (
                <TableRow key={review._id} hover>
                  <TableCell>{review.request?.title || "—"}</TableCell>
                  <TableCell>{review.customer?.fullName || "—"}</TableCell>
                  <TableCell>{review.writer?.fullName || "—"}</TableCell>
                  <TableCell>
                    <Chip size="small" label={`${review.rating} / 5`} />
                  </TableCell>
                  <TableCell>{review.review || "—"}</TableCell>
                  <TableCell>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
