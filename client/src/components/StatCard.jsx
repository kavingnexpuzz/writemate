import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function StatCard({ label, value, icon, accent = false }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        height: '100%',
      }}
    >
      {icon && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: 1,
            bgcolor: accent ? 'secondary.main' : 'action.hover',
            color: accent ? 'secondary.contrastText' : 'text.secondary',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}
      <Stack spacing={0}>
        <Typography variant="h4" sx={{ lineHeight: 1.1 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
    </Paper>
  );
}
