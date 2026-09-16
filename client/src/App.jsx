import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import { fetchCurrentUser, hasStoredSession } from './features/auth/authSlice';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (hasStoredSession()) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return <AppRoutes />;
}
