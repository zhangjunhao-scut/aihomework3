import { useState } from 'react';
import { Box, Button, Card, CardContent, Link, Stack, TextField, Typography } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../stores/auth';
import { errMsg } from '../api/client';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('密码至少 6 位');
    if (password !== confirm) return setError('两次密码不一致');
    setLoading(true);
    try {
      await register(email, password);
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
            注册
          </Typography>
          <Box component="form" onSubmit={submit} sx={{ mt: 1 }}>
            <Stack spacing={2}>
              <TextField label="邮箱" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
              <TextField label="密码" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
              <TextField label="确认密码" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} fullWidth />
              {error && <Typography color="error" variant="body2">{error}</Typography>}
              <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                {loading ? '注册中...' : '注册'}
              </Button>
              <Link component={RouterLink} to="/login" align="center">
                已有账号？去登录
              </Link>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
