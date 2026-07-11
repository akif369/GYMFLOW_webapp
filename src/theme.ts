'use client';
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#10b981', light: '#34d399', dark: '#059669', contrastText: '#000' },
    secondary: { main: '#06b6d4' },
    error: { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    success: { main: '#22c55e' },
    background: { default: '#0a0a0a', paper: '#111111' },
    divider: 'rgba(255,255,255,0.08)',
    text: { primary: '#f8fafc', secondary: '#94a3b8' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 }, h2: { fontWeight: 700 }, h3: { fontWeight: 600 },
    h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600 },
    body2: { color: '#94a3b8' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem' },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, backgroundImage: 'none',
          border: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: '#111111',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none', backgroundColor: '#111111' },
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.06)' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.06)', boxShadow: 'none', backgroundImage: 'none' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: '1px solid rgba(255,255,255,0.06)' },
      }
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, fontSize: '0.75rem' } }
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 500, minWidth: 'auto' } }
    },
  },
});
