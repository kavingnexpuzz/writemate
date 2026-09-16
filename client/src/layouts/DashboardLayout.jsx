import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import MenuIcon from '@mui/icons-material/Menu';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';

import { layout as layoutTokens } from '../theme/tokens';
import { toggleThemeMode } from '../store/uiSlice';
import { logoutUser } from '../features/auth/authSlice';

export default function DashboardLayout({ navItems, roleLabel }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const mode = useSelector((state) => state.ui.mode);
  const user = useSelector((state) => state.auth.user);

  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2.5, py: 2.5 }}>
        <EditNoteIcon sx={{ color: 'secondary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'inherit' }}>
          WriteMate
        </Typography>
      </Stack>
      <Divider sx={{ borderColor: 'rgba(241,234,217,0.12)' }} />
      <List sx={{ flex: 1, px: 1, py: 1.5 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const selected = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => {
                navigate(item.path);
                if (!isDesktop) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                color: 'inherit',
                '&.Mui-selected': {
                  bgcolor: 'rgba(224,185,92,0.16)',
                  '&:hover': { bgcolor: 'rgba(224,185,92,0.22)' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: selected ? 'secondary.main' : 'inherit', opacity: selected ? 1 : 0.75 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: selected ? 600 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>
      <Divider sx={{ borderColor: 'rgba(241,234,217,0.12)' }} />
      <ListItemButton onClick={() => dispatch(logoutUser())} sx={{ m: 1, borderRadius: 1, color: 'inherit' }}>
        <ListItemIcon sx={{ minWidth: 38, color: 'inherit', opacity: 0.75 }}>
          <LogoutOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
      </ListItemButton>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100%' }}>
      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width: layoutTokens.sidebarWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: layoutTokens.sidebarWidth, boxSizing: 'border-box' },
          }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: layoutTokens.sidebarWidth, boxSizing: 'border-box' } }}
        >
          {sidebarContent}
        </Drawer>
      )}

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              {!isDesktop && (
                <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {roleLabel}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton onClick={() => dispatch(toggleThemeMode())} aria-label="Toggle color mode">
                {mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
              </IconButton>
              <IconButton aria-label="Notifications">
                <NotificationsNoneOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Account menu">
                <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                  {user?.fullName?.[0]?.toUpperCase() || '?'}
                </Avatar>
              </IconButton>
              <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                <MenuItem disabled sx={{ opacity: '1 !important' }}>
                  <Stack>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user?.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Stack>
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null);
                    dispatch(logoutUser());
                  }}
                >
                  Log out
                </MenuItem>
              </Menu>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1280, width: '100%', mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
