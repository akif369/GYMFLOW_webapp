'use client';

import { Snackbar, Alert } from '@mui/material';
import { useNetworkStore } from '@/store/useNetworkStore';
import WifiOffRoundedIcon from '@mui/icons-material/WifiOffRounded';

export default function GlobalNetworkError() {
  const { isServerDown, setServerDown } = useNetworkStore();

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setServerDown(false);
  };

  return (
    <Snackbar 
      open={isServerDown} 
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        width: { xs: 'calc(100% - 32px)', sm: 'auto' },
        maxWidth: { sm: 480 },
        bottom: { 
          xs: 'calc(16px + env(safe-area-inset-bottom))', 
          sm: 24 
        },
      }}
    >
      <Alert 
        onClose={handleClose} 
        severity="error" 
        icon={<WifiOffRoundedIcon />}
        sx={{ 
          width: '100%', 
          boxShadow: 4, 
          fontWeight: 500,
          fontSize: { xs: '0.85rem', sm: '0.9rem' },
          alignItems: 'center',
          '& .MuiAlert-icon': {
            opacity: 0.9,
          }
        }}
      >
        Cannot connect to the server. Please try again later.
      </Alert>
    </Snackbar>
  );
}
