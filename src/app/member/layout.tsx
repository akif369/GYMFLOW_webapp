'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Avatar, Divider, IconButton,
  useTheme, useMediaQuery, Tooltip, LinearProgress,
} from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import CardMembershipRoundedIcon from '@mui/icons-material/CardMembershipRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import AuthGuard from '@/components/AuthGuard';
import RoleGuard from '@/components/RoleGuard';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { name: 'Home',        icon: <HomeRoundedIcon sx={{ fontSize: 18 }} />,             href: '/member/dashboard' },
  { name: 'Membership',  icon: <CardMembershipRoundedIcon sx={{ fontSize: 18 }} />,   href: '/member/membership' },
  { name: 'My Visits',   icon: <AccessTimeRoundedIcon sx={{ fontSize: 18 }} />,       href: '/member/attendance' },
  { name: 'PT Sessions', icon: <EventNoteRoundedIcon sx={{ fontSize: 18 }} />,        href: '/member/sessions' },
  { name: 'Invoices',    icon: <ReceiptRoundedIcon sx={{ fontSize: 18 }} />,          href: '/member/invoices' },
  { name: 'My Profile',  icon: <AccountCircleRoundedIcon sx={{ fontSize: 18 }} />,   href: '/member/profile' },
];

// Removed MOCK_MEMBERSHIP

function MemberSidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Member';
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : 'ME';
  const [membershipStatus, setMembershipStatus] = useState({ planName: 'Loading...', daysLeft: 0, totalDays: 30, status: 'INACTIVE' });

  useEffect(() => {
    if (user?.memberId) {
      api.get('/members/me/membership-status').then(res => setMembershipStatus(res.data)).catch(console.error);
    }
  }, [user?.memberId]);

  const membershipPct = Math.round((membershipStatus.daysLeft / membershipStatus.totalDays) * 100);
  const expiryColor = membershipPct > 30 ? '#10b981' : membershipPct > 10 ? '#f59e0b' : '#f43f5e';

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
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <FitnessCenterRoundedIcon sx={{ fontSize: 20, color: '#fff' }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: '#f0f6fc', fontSize: '0.95rem', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              GYMatrix
            </Typography>
            <Typography sx={{ color: '#10b981', fontSize: '0.64rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Member Portal
            </Typography>
          </Box>
        </Box>
        {!isMdUp && (
          <IconButton onClick={onClose} size="small" sx={{ color: '#7d8590' }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Membership status widget */}
      <Box sx={{ mx: 2, mb: 1, p: 1.5, borderRadius: 2, bgcolor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#34d399' }}>
            {membershipStatus.planName}
          </Typography>
          <Typography sx={{ fontSize: '0.68rem', color: expiryColor, fontWeight: 700 }}>
            {membershipStatus.daysLeft}d left
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={membershipPct}
          sx={{
            height: 4, borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.08)',
            '& .MuiLinearProgress-bar': { bgcolor: expiryColor, borderRadius: 4 },
          }}
        />
      </Box>

      <Divider sx={{ mx: 2, mb: 1, borderColor: 'rgba(16,185,129,0.12)' }} />

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
                    bgcolor: active ? 'rgba(16,185,129,0.14)' : 'transparent',
                    color: active ? '#34d399' : '#7d8590',
                    '&:hover': {
                      bgcolor: active ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.04)',
                      color: active ? '#34d399' : '#c9d1d9',
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
                    <Box sx={{ width: 3, height: 20, borderRadius: 4, bgcolor: '#10b981', flexShrink: 0 }} />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* QR Check-in shortcut */}
        <Box sx={{ mt: 2, mx: 0.5 }}>
          <Box sx={{
            p: 1.5, borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))',
            border: '1px solid rgba(16,185,129,0.2)',
            cursor: 'pointer',
            '&:hover': { borderColor: 'rgba(16,185,129,0.4)' },
            transition: 'border-color 0.15s',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <QrCode2RoundedIcon sx={{ fontSize: 28, color: '#10b981' }} />
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399' }}>QR Check-in</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#7d8590' }}>Show at front desk</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />

      {/* Profile footer */}
      <Box sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, borderRadius: 2 }}>
          <Avatar sx={{
            width: 34, height: 34, fontSize: '0.78rem', fontWeight: 700,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff', flexShrink: 0,
          }}>
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#f0f6fc', display: 'block', lineHeight: 1.2 }}>
              {displayName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#10b981', fontSize: '0.68rem' }}>
              Member
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
            borderRight: '1px solid rgba(16,185,129,0.1)',
          },
        }} open>
        {drawerContent}
      </Drawer>
    </Box>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────────

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <AuthGuard>
      <RoleGuard allowedPortals={['member']}>
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
          <MemberSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

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
              <Box sx={{ width: 3, height: 20, borderRadius: 4, background: 'linear-gradient(180deg, #10b981, #059669)', flexShrink: 0 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#10b981', letterSpacing: '-0.01em' }}>
                Member Portal
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
