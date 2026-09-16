import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { hasStoredSession } from '../features/auth/authSlice';

export default function ProtectedRoute() {
  const { user, bootstrapped } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!bootstrapped && hasStoredSession()) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
