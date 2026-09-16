import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { dashboardPathForRole } from './roleRedirect';

export default function RoleRoute({ allowedRoles }) {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }

  return <Outlet />;
}
