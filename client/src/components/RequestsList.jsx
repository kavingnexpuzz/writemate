import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import requestService from '../services/requestService';
import { statusMeta } from '../utils/requestStatus';
import { WORK_TYPES } from '../utils/workTypes';

const workTypeLabel = (value) => WORK_TYPES.find((t) => t.value === value)?.label || value;

/**
 * `bucket` maps to the backend's ?bucket= query param (see requestController
 * listRequests). `personColumn` chooses whether to show the customer or the
 * writer as the counterparty column. `renderActions` receives (request, reload).
 */
export default function RequestsList({ bucket, personColumn = 'customer', renderActions, emptyText = 'Nothing here yet.' }) {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    requestService
      .list(bucket ? { bucket } : {})
      .then((res) => setRequests(res.data.requests))
      .finally(() => setLoading(false));
  }, [bucket]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Paper elevation={0}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Request</TableCell>
              <TableCell>{personColumn === 'customer' ? 'Customer' : 'Writer'}</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              {renderActions && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            )}
            {!loading && requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">{emptyText}</Typography>
                </TableCell>
              </TableRow>
            )}
            {requests.map((r) => {
              const meta = statusMeta(r.status);
              const person = personColumn === 'customer' ? r.customer : r.writer;
              return (
                <TableRow key={r._id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/requests/${r._id}`)}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {r.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {workTypeLabel(r.workType)} · {r.numberOfPages} pages
                      {r.numberOfDiagrams ? `, ${r.numberOfDiagrams} diagrams` : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>{person?.fullName || '—'}</TableCell>
                  <TableCell>{r.city}</TableCell>
                  <TableCell>
                    <Chip size="small" label={meta.label} color={meta.color} variant="outlined" />
                  </TableCell>
                  <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                  {renderActions && (
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Box>{renderActions(r, load)}</Box>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
