import { useState } from 'react';
import { Box, Button, Card, CardContent, Link, Stack, TextField, Typography } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../stores/auth';
import { errMsg } from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
      <Card sx={{ width: 400, maxWidth: '90vw' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom align="center" fontWeight={700}>
            登录
          </Typography>
          <Box component="form" onSubmit={submit} sx={{ mt: 1 }}>
            <Stack spacing={2}>
              <TextField
                label="邮箱"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
              <TextField
                label="密码"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
              {error && <Typography color="error" variant="body2">{error}</Typography>}
              <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                {loading ? '登录中...' : '登录'}
              </Button>
              <Link component={RouterLink} to="/register" align="center">
                没有账号？去注册
              </Link>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
