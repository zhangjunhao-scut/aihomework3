import { AppBar, Box, Button, IconButton, Toolbar, Typography } from '@mui/material';
import { AccountCircle, History as HistoryIcon, Science } from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './stores/auth';
import { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0} color="default" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Science sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ flexGrow: 0, mr: 4, fontWeight: 700 }}>
            大模型接口工具箱
          </Typography>
          <Button
            color={location.pathname === '/' ? 'primary' : 'inherit'}
            onClick={() => navigate('/')}
            startIcon={<Science />}
          >
            Playground
          </Button>
          <Button
            color={location.pathname === '/history' ? 'primary' : 'inherit'}
            onClick={() => navigate('/history')}
            startIcon={<HistoryIcon />}
          >
            历史
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={(e) => setAnchor(e.currentTarget)}>
            <AccountCircle />
          </IconButton>
          <Typography sx={{ ml: 1, cursor: 'pointer' }} onClick={(e) => setAnchor(e.currentTarget)}>
            {user?.email}
          </Typography>
          <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
            <MenuItem
              onClick={() => {
                setAnchor(null);
                logout();
                navigate('/login');
              }}
            >
              退出登录
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
