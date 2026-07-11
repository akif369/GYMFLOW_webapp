'use client';
import { createTheme, alpha } from '@mui/material/styles';

const BRAND = {
  green: '#10b981',
  greenLight: '#34d399',
  greenDark: '#059669',
  teal: '#06b6d4',
  purple: '#8b5cf6',
  amber: '#f59e0b',
  rose: '#f43f5e',
  bg: '#080c10',
  surface: '#0d1117',
  surfaceElevated: '#161b22',
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.12)',
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: BRAND.green, light: BRAND.greenLight, dark: BRAND.greenDark, contrastText: '#000' },
    secondary: { main: BRAND.teal },
    error: { main: BRAND.rose },
    warning: { main: BRAND.amber },
    success: { main: '#22c55e' },
    info: { main: BRAND.purple },
    background: { default: BRAND.bg, paper: BRAND.surface },
    divider: BRAND.border,
    text: { primary: '#f0f6fc', secondary: '#7d8590' },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-1px' },
    h2: { fontWeight: 700, letterSpacing: '-0.5px' },
    h3: { fontWeight: 600, letterSpacing: '-0.5px' },
    h4: { fontWeight: 700, letterSpacing: '-0.5px' },
    h5: { fontWeight: 700, letterSpacing: '-0.25px' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, color: '#7d8590' },
    body1: { fontSize: '0.9rem' },
    body2: { fontSize: '0.8rem', color: '#7d8590' },
    caption: { fontSize: '0.72rem', color: '#7d8590' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box' },
        body: { backgroundColor: BRAND.bg, scrollbarWidth: 'thin', scrollbarColor: `${BRAND.borderStrong} transparent` },
        '::-webkit-scrollbar': { width: '5px', height: '5px' },
        '::-webkit-scrollbar-track': { background: 'transparent' },
        '::-webkit-scrollbar-thumb': { background: BRAND.borderStrong, borderRadius: '4px' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.8125rem',
          lineHeight: 1.5,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: `0 0 20px ${alpha(BRAND.green, 0.3)}` },
        },
        outlined: {
          borderColor: BRAND.border,
          '&:hover': { borderColor: BRAND.green, backgroundColor: alpha(BRAND.green, 0.06) },
        },
        sizeLarge: { padding: '10px 22px', fontSize: '0.9rem' },
        sizeSmall: { padding: '4px 10px', fontSize: '0.75rem' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
          border: `1px solid ${BRAND.border}`,
          backgroundColor: BRAND.surface,
          transition: 'border-color 0.2s, box-shadow 0.2s',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '20px',
          '&:last-child': { paddingBottom: '20px' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none', backgroundColor: BRAND.surface },
        elevation1: { boxShadow: `0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px ${BRAND.border}` },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: BRAND.bg,
          borderRight: `1px solid ${BRAND.border}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(BRAND.bg, 0.85),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${BRAND.border}`,
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.7rem',
          height: 22,
        },
        colorSuccess: { backgroundColor: alpha('#22c55e', 0.12), color: '#4ade80' },
        colorWarning: { backgroundColor: alpha(BRAND.amber, 0.12), color: '#fbbf24' },
        colorError: { backgroundColor: alpha(BRAND.rose, 0.12), color: '#fb7185' },
        colorInfo: { backgroundColor: alpha(BRAND.purple, 0.12), color: '#a78bfa' },
        colorPrimary: { backgroundColor: alpha(BRAND.green, 0.12), color: BRAND.greenLight },
        colorSecondary: { backgroundColor: alpha(BRAND.teal, 0.12), color: '#22d3ee' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.85rem',
          minWidth: 'auto',
          padding: '8px 16px',
          color: '#7d8590',
          '&.Mui-selected': { color: '#f0f6fc', fontWeight: 600 },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 2, borderRadius: 2, backgroundColor: BRAND.green },
        root: { minHeight: 44 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: { '& .MuiTableCell-head': { backgroundColor: BRAND.surfaceElevated, fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7d8590' } },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${BRAND.border}`, padding: '10px 16px', fontSize: '0.82rem' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: { '&:hover': { backgroundColor: alpha(BRAND.green, 0.04) } },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': { borderColor: BRAND.border },
            '&:hover fieldset': { borderColor: BRAND.borderStrong },
            '&.Mui-focused fieldset': { borderColor: BRAND.green },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: BRAND.surfaceElevated,
          backgroundImage: 'none',
          border: `1px solid ${BRAND.border}`,
          borderRadius: 14,
        },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: BRAND.border } },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.15s ease',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, height: 6, backgroundColor: 'rgba(255,255,255,0.06)' },
        bar: { borderRadius: 4 },
      },
    },
  },
});
