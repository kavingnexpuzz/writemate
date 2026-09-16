import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { Link as RouterLink } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children, maxWidth = 480 }) {
  return (
    <Box
      sx={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 2,
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth,
          p: { xs: 3, sm: 5 },
        }}
      >
        <Stack spacing={0.5} alignItems="flex-start" sx={{ mb: 4 }}>
          <Stack
            component={RouterLink}
            to="/"
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ textDecoration: 'none', color: 'text.primary', mb: 2 }}
          >
            <EditNoteIcon sx={{ color: 'secondary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              WriteMate
            </Typography>
          </Stack>
          <Typography variant="h4">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Stack>
        {children}
      </Paper>
    </Box>
  );
}
