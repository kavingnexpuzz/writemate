import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ConstructionIcon from '@mui/icons-material/ConstructionOutlined';

export default function ComingSoonPage({ title, phase, description }) {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      <Paper
        elevation={0}
        sx={{
          p: 5,
          mt: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 1.5,
          maxWidth: 560,
        }}
      >
        <ConstructionIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6">{title}</Typography>
          {phase && <Chip size="small" label={`Phase ${phase}`} />}
        </Stack>
        <Typography color="text.secondary">
          {description || `This section is built out in Phase ${phase} of the WriteMate roadmap.`}
        </Typography>
      </Paper>
    </Box>
  );
}
