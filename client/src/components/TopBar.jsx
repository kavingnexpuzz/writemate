import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { toggleThemeMode } from '../store/uiSlice';
import { logoutUser } from '../features/auth/authSlice';

export default function TopBar() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.ui.mode);
  const user = useSelector((state) => state.auth.user);

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <EditNoteIcon sx={{ color: 'secondary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            WriteMate
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {user && (
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              {user.fullName} · {user.role}
            </Typography>
          )}
          <IconButton onClick={() => dispatch(toggleThemeMode())} aria-label="Toggle color mode">
            {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </IconButton>
          <Button onClick={() => dispatch(logoutUser())}>Log out</Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
