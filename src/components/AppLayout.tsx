'use client';
import { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import AuthGuard from './AuthGuard';
import RoleGuard from './RoleGuard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <AuthGuard>
      <RoleGuard allowedPortals={['branch']}>
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Sidebar 
          mobileOpen={mobileOpen} 
          onClose={() => setMobileOpen(false)} 
          drawerWidth={220} 
        />
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}
        >
          <Header onMenuClick={handleDrawerToggle} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 2, md: 3 },
              overflow: 'auto',
              minHeight: 0,
            }}
          >
            {children}
          </Box>
        </Box>
        </Box>
      </RoleGuard>
    </AuthGuard>
  );
}
