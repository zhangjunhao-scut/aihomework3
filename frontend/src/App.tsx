import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './stores/auth';
import Login from './pages/Login';
import Register from './pages/Register';
import Playground from './pages/Playground';
import HistoryPage from './pages/History';
import { useEffect, type JSX } from 'react';
import { Box, CircularProgress } from '@mui/material';
import AppLayout from './AppLayout';

function Protected({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const fetchMe = useAuth((s) => s.fetchMe);
  useEffect(() => {
    if (localStorage.getItem('token')) fetchMe();
    else useAuth.setState({ loading: false });
  }, [fetchMe]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route index element={<Playground />} />
        <Route path="history" element={<HistoryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
