import { createTheme } from '@mui/material/styles';
import { palette, typography, radii } from './tokens';

/**
 * buildTheme('light' | 'dark') -> MUI theme
 * Kept as a factory (not a static object) so ThemeProvider can rebuild it
 * whenever the user toggles the mode from the navbar.
 */
export function buildTheme(mode = 'light') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? palette.paper[100] : palette.ink[800],
        contrastText: isDark ? palette.ink[900] : palette.paper[50],
      },
      secondary: {
        main: palette.brass[500],
        contrastText: palette.ink[900],
      },
      success: { main: palette.forest[500] },
      error: { main: palette.clay[500] },
      warning: { main: palette.brass[400] },
      background: {
        default: isDark ? palette.ink[900] : palette.paper[100],
        paper: isDark ? palette.ink[800] : palette.paper[50],
      },
      text: {
        primary: isDark ? palette.paper[100] : palette.slate[900],
        secondary: isDark ? palette.slate[300] : palette.slate[700],
      },
      divider: isDark ? 'rgba(241,234,217,0.12)' : palette.slate[100],
    },
    shape: { borderRadius: radii.md },
    typography: {
      fontFamily: typography.body,
      h1: { fontFamily: typography.display, fontWeight: 600, letterSpacing: '-0.01em' },
      h2: { fontFamily: typography.display, fontWeight: 600, letterSpacing: '-0.01em' },
      h3: { fontFamily: typography.display, fontWeight: 600 },
      h4: { fontFamily: typography.display, fontWeight: 600 },
      h5: { fontFamily: typography.display, fontWeight: 600 },
      h6: { fontFamily: typography.display, fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: radii.sm, paddingInline: 18 },
          containedPrimary: {
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: radii.md,
            border: `1px solid ${isDark ? 'rgba(241,234,217,0.10)' : palette.slate[100]}`,
            boxShadow: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: radii.sm, fontWeight: 600 },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? palette.ink[900] : palette.paper[50],
            color: isDark ? palette.paper[100] : palette.ink[800],
            boxShadow: 'none',
            borderBottom: `1px solid ${isDark ? 'rgba(241,234,217,0.10)' : palette.slate[100]}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? palette.ink[900] : palette.ink[800],
            color: palette.paper[100],
            borderRight: 'none',
          },
        },
      },
    },
  });
}

export default buildTheme;
