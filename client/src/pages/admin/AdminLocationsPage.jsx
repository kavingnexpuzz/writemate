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
import CircularProgress from "@mui/material/CircularProgress";
import adminService from "../../services/adminService";

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    adminService
      .listLocations()
      .then((res) => setLocations(res.data.locations))
      .finally(() => setLoading(false));
  }, []);
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Locations
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Locations currently represented by customers and writers.
      </Typography>
      <Paper elevation={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>State</TableCell>
                <TableCell>District</TableCell>
                <TableCell>City</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && locations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No locations found.
                  </TableCell>
                </TableRow>
              )}
              {locations.map((location) => (
                <TableRow
                  key={`${location.state}-${location.district}-${location.city}`}
                >
                  <TableCell>{location.state}</TableCell>
                  <TableCell>{location.district || "—"}</TableCell>
                  <TableCell>{location.city || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
