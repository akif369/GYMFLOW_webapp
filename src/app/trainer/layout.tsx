'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Avatar, Divider, IconButton,
  useTheme, useMediaQuery, Tooltip,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import SportsRoundedIcon from '@mui/icons-material/SportsRounded';
import AuthGuard from '@/components/AuthGuard';
import RoleGuard from '@/components/RoleGuard';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { usePresignedUrl } from '@/hooks/usePresignedUrl';

const DRAWER_WIDTH = 232;

const NAV_ITEMS = [
  { name: 'Dashboard',   icon: <DashboardRoundedIcon sx={{ fontSize: 18 }} />,    href: '/trainer/dashboard' },
  { name: 'My Clients',  icon: <PeopleRoundedIcon sx={{ fontSize: 18 }} />,        href: '/trainer/clients' },
  { name: 'Sessions',    icon: <EventNoteRoundedIcon sx={{ fontSize: 18 }} />,     href: '/trainer/sessions' },
  { name: 'Workouts',    icon: <FitnessCenterRoundedIcon sx={{ fontSize: 18 }} />, href: '/trainer/workouts' },
  { name: 'My Profile',  icon: <AccountCircleRoundedIcon sx={{ fontSize: 18 }} />, href: '/trainer/profile' },
];

function TrainerSidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Trainer';
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : 'TR';
  const { url: resolvedPhotoUrl } = usePresignedUrl(user?.photoUrl ?? null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* best effort */ }
    logout();
    router.replace('/login');
  };

  const drawerContent = (
    <>
      {/* Brand header */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: 1.5,
            background: 'linear-gradient(135deg, #ec4899, #be185d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <SportsRoundedIcon sx={{ fontSize: 20, color: '#fff' }} />
          </Box>
          <Box>
            <Typography fontWeight={800} sx={{ color: '#f0f6fc', fontSize: '0.95rem', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              GYMatrix
            </Typography>
            <Typography sx={{ color: '#ec4899', fontSize: '0.64rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Trainer Portal
            </Typography>
          </Box>
        </Box>
        {!isMdUp && (
          <IconButton onClick={onClose} size="small" sx={{ color: '#7d8590' }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ mx: 2, mb: 1, borderColor: 'rgba(236,72,153,0.15)' }} />

      {/* Nav */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: 1.5, py: 1 }}>
        <List dense disablePadding>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <ListItem key={item.name} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  component={Link} href={item.href}
                  onClick={!isMdUp ? onClose : undefined}
                  sx={{
                    borderRadius: 1.5, py: 0.85, px: 1.25,
                    bgcolor: active ? 'rgba(236,72,153,0.14)' : 'transparent',
                    color: active ? '#ec4899' : '#7d8590',
                    '&:hover': {
                      bgcolor: active ? 'rgba(236,72,153,0.18)' : 'rgba(255,255,255,0.04)',
                      color: active ? '#ec4899' : '#c9d1d9',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 30 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: active ? 600 : 500, color: 'inherit', lineHeight: 1.4 }}>
                      {item.name}
                    </Typography>
                  } />
                  {active && (
                    <Box sx={{ width: 3, height: 20, borderRadius: 4, bgcolor: '#ec4899', flexShrink: 0 }} />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />

      {/* Profile footer */}
      <Box sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, borderRadius: 2 }}>
          <Avatar sx={{
            width: 34, height: 34, fontSize: '0.78rem', fontWeight: 700,
            background: 'linear-gradient(135deg, #ec4899, #be185d)',
            color: '#fff', flexShrink: 0,
          }}>
            {!resolvedPhotoUrl && initials}
            {resolvedPhotoUrl && <Box component="img" src={resolvedPhotoUrl} alt={displayName} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: '#f0f6fc', display: 'block', fontSize: '0.78rem', lineHeight: 1.2 }}>
              {displayName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#ec4899', fontSize: '0.68rem' }}>
              Fitness Trainer
            </Typography>
          </Box>
          <Tooltip title="Sign out" placement="top">
            <IconButton size="small" onClick={handleLogout}
              sx={{ color: '#7d8590', '&:hover': { color: '#f43f5e', bgcolor: 'rgba(244,63,94,0.1)' } }}>
              <LogoutRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      <Drawer variant="temporary" open={mobileOpen} onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: 'background.default', backgroundImage: 'none' },
        }}>
        {drawerContent}
      </Drawer>
      <Drawer variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH, bgcolor: 'background.default', backgroundImage: 'none',
            borderRight: '1px solid rgba(236,72,153,0.1)',
          },
        }} open>
        {drawerContent}
      </Drawer>
    </Box>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────────

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <AuthGuard>
      <RoleGuard allowedPortals={['trainer', 'org-owner']}>
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
          <TrainerSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Top bar */}
            <Box sx={{
              height: 52, display: 'flex', alignItems: 'center',
              px: { xs: 2, md: 3 }, gap: 2,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              bgcolor: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(12px)',
              position: 'sticky', top: 0, zIndex: 100,
            }}>
              {!isMdUp && (
                <IconButton size="small" onClick={() => setMobileOpen(true)} sx={{ color: '#7d8590' }}>
                  <MenuRoundedIcon />
                </IconButton>
              )}
              <Box sx={{
                width: 3, height: 20, borderRadius: 4,
                background: 'linear-gradient(180deg, #ec4899, #be185d)',
                flexShrink: 0,
              }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#ec4899', letterSpacing: '-0.01em' }}>
                Trainer Portal
              </Typography>
              <Box sx={{ flex: 1 }} />
              <Tooltip title="Notifications">
                <IconButton size="small" sx={{ color: '#7d8590', '&:hover': { color: '#f0f6fc' } }}>
                  <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Main content */}
            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, overflow: 'auto', minHeight: 0 }}>
              {children}
            </Box>
          </Box>
        </Box>
      </RoleGuard>
    </AuthGuard>
  );
}
