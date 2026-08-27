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
  bg: '#000000',
  surface: '#0a0a0a',
  surfaceElevated: '#141414',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',
};

const LIGHT_BRAND = {
  ...BRAND,
  bg: '#f8fafc',
  surface: '#ffffff',
  surfaceElevated: '#f1f5f9',
  border: 'rgba(0,0,0,0.1)',
  borderStrong: 'rgba(0,0,0,0.15)',
};

export const getTheme = (mode: 'light' | 'dark') => {
  const brand = mode === 'light' ? LIGHT_BRAND : BRAND;
  
  return createTheme({
    palette: {
      mode,
      primary: { main: brand.green, light: brand.greenLight, dark: brand.greenDark, contrastText: '#000' },
      secondary: { main: brand.teal },
      error: { main: brand.rose },
      warning: { main: brand.amber },
      success: { main: '#22c55e' },
      info: { main: brand.purple },
      background: { default: brand.bg, paper: brand.surface },
      divider: brand.border,
      text: mode === 'dark' 
        ? { primary: '#f0f6fc', secondary: '#7d8590' }
        : { primary: '#0f172a', secondary: '#475569' },
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
      subtitle2: { fontWeight: 600, color: mode === 'dark' ? '#7d8590' : '#475569' },
      body1: { fontSize: '0.9rem' },
      body2: { fontSize: '0.8rem', color: mode === 'dark' ? '#7d8590' : '#475569' },
      caption: { fontSize: '0.72rem', color: mode === 'dark' ? '#7d8590' : '#475569' },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': { boxSizing: 'border-box' },
          body: { backgroundColor: brand.bg, scrollbarWidth: 'thin', scrollbarColor: `${brand.borderStrong} transparent` },
          '::-webkit-scrollbar': { width: '5px', height: '5px' },
          '::-webkit-scrollbar-track': { background: 'transparent' },
          '::-webkit-scrollbar-thumb': { background: brand.borderStrong, borderRadius: '4px' },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 16,
            fontWeight: 700,
            fontSize: '0.88rem',
            lineHeight: 1.5,
            minHeight: 36,
          },
          contained: {
            color: '#000',
            boxShadow: 'none',
            '&:hover': { boxShadow: `0 0 20px ${alpha(brand.green, 0.3)}`, backgroundColor: brand.greenLight },
          },
          outlined: {
            backgroundColor: brand.surface,
            boxShadow: 'none',
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '16px',
            '&:last-child': { paddingBottom: '16px' },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none', backgroundColor: brand.surface },
          elevation1: { boxShadow: `0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px ${brand.border}` },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: brand.bg,
            borderRight: `1px solid ${brand.border}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(brand.bg, 0.85),
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${brand.border}`,
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
          colorSuccess: { backgroundColor: alpha('#22c55e', 0.12), color: mode === 'dark' ? '#4ade80' : '#16a34a' },
          colorWarning: { backgroundColor: alpha(brand.amber, 0.12), color: mode === 'dark' ? '#fbbf24' : '#d97706' },
          colorError: { backgroundColor: alpha(brand.rose, 0.12), color: mode === 'dark' ? '#fb7185' : '#e11d48' },
          colorInfo: { backgroundColor: alpha(brand.purple, 0.12), color: mode === 'dark' ? '#a78bfa' : '#7c3aed' },
          colorPrimary: { backgroundColor: alpha(brand.green, 0.12), color: mode === 'dark' ? brand.greenLight : brand.greenDark },
          colorSecondary: { backgroundColor: alpha(brand.teal, 0.12), color: mode === 'dark' ? '#22d3ee' : '#0891b2' },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { height: 2, borderRadius: 2, backgroundColor: brand.green },
          root: { minHeight: 44 },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: { '& .MuiTableCell-head': { backgroundColor: brand.surfaceElevated, fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: mode === 'dark' ? '#7d8590' : '#475569' } },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            '@media (max-width: 600px)': {
              display: 'block',
              width: 'max-content',
              minWidth: '100%',
              overflowX: 'auto',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottom: `1px solid ${brand.border}`, padding: '10px 16px', fontSize: '0.82rem' },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: { '&:hover': { backgroundColor: alpha(brand.green, 0.04) } },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              '& fieldset': { borderColor: brand.borderStrong },
              '&:hover fieldset': { borderColor: mode === 'dark' ? 'rgba(255,255,255,0.24)' : 'rgba(0,0,0,0.24)' },
              '&.Mui-focused fieldset': { borderColor: brand.green },
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            '@media (max-width: 768px)': {
              fontSize: '16px',
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: brand.surfaceElevated,
            backgroundImage: 'none',
            border: `1px solid ${brand.border}`,
            borderRadius: 24,
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            '@media (max-width: 600px)': {
              flexDirection: 'column-reverse',
              alignItems: 'stretch',
              gap: 8,
              '& > *': { width: '100%' },
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: { root: { borderColor: brand.border } },
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
          root: { borderRadius: 4, height: 6, backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
          bar: { borderRadius: 4 },
        },
      },
    },
  });
};
