'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Avatar, Divider, IconButton,
  useTheme, useMediaQuery, Tooltip, Chip,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import AuthGuard from '@/components/AuthGuard';
import RoleGuard from '@/components/RoleGuard';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

const DRAWER_WIDTH = 248;

type OrgMode = 'SINGLE_GYM' | 'MULTI_GYM';

interface NavItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  /** When true, this item is only rendered in MULTI_GYM mode */
  multiGymOnly?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Command Center',
    items: [
      { name: 'Overview', icon: <DashboardRoundedIcon sx={{ fontSize: 18 }} />, href: '/org/dashboard' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Branches', icon: <StorefrontRoundedIcon sx={{ fontSize: 18 }} />, href: '/org/branches', multiGymOnly: true },
      { name: 'Members', icon: <PeopleRoundedIcon sx={{ fontSize: 18 }} />, href: '/org/members' },
      { name: 'Staff', icon: <GroupRoundedIcon sx={{ fontSize: 18 }} />, href: '/org/staff' },
    ],
  },
  {
    label: 'Business Intelligence',
    items: [
      { name: 'Financials', icon: <AccountBalanceRoundedIcon sx={{ fontSize: 18 }} />, href: '/org/financials' },
      { name: 'Growth', icon: <TrendingUpRoundedIcon sx={{ fontSize: 18 }} />, href: '/org/growth' },
      { name: 'Reports', icon: <AssessmentRoundedIcon sx={{ fontSize: 18 }} />, href: '/org/reports' },
    ],
  },
];

function OrgSidebar({
  mobileOpen,
  onClose,
  orgMode,
}: {
  mobileOpen: boolean;
  onClose: () => void;
  orgMode: OrgMode;
}) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Owner';
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : 'OW';

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* best effort */ }
    logout();
    router.replace('/login');
  };

  const filteredSections = NAV_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => !item.multiGymOnly || orgMode === 'MULTI_GYM'),
  })).filter(section => section.items.length > 0);

  const drawerContent = (
    <>
      {/* Brand header */}
      <Box sx={{
        px: 2.5, pt: 2.5, pb: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: 1.5,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <AccountBalanceRoundedIcon sx={{ fontSize: 20, color: '#fff' }} />
          </Box>
          <Box>
            <Typography fontWeight={800} sx={{ color: '#f0f6fc', fontSize: '0.95rem', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              GYMatrix
            </Typography>
            <Typography sx={{ color: '#f59e0b', fontSize: '0.64rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Owner Portal
            </Typography>
          </Box>
        </Box>
        {!isMdUp && (
          <IconButton onClick={onClose} size="small" sx={{ color: '#7d8590' }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Mode badge */}
      <Box sx={{ px: 2.5, pb: 1 }}>
        <Chip
          label={orgMode === 'MULTI_GYM' ? 'Multi-Gym' : 'Single Gym'}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            bgcolor: orgMode === 'MULTI_GYM' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)',
            color: orgMode === 'MULTI_GYM' ? '#60a5fa' : '#34d399',
            border: `1px solid ${orgMode === 'MULTI_GYM' ? 'rgba(59,130,246,0.3)' : 'rgba(16,185,129,0.3)'}`,
          }}
        />
      </Box>

      <Divider sx={{ mx: 2, mb: 1, borderColor: 'rgba(245,158,11,0.15)' }} />

      {/* Nav */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: 1.5, py: 1 }}>
        {filteredSections.map((section) => (
          <Box key={section.label} sx={{ mb: 0.5 }}>
            <Typography variant="caption" sx={{
              px: 1, mb: 0.5, display: 'block',
              fontWeight: 700, fontSize: '0.62rem',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)',
            }}>
              {section.label}
            </Typography>
            <List dense disablePadding>
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <ListItem key={item.name} disablePadding sx={{ mb: 0.25 }}>
                    <ListItemButton
                      component={Link} href={item.href}
                      onClick={!isMdUp ? onClose : undefined}
                      sx={{
                        borderRadius: 1.5, py: 0.85, px: 1.25,
                        bgcolor: active ? 'rgba(245,158,11,0.14)' : 'transparent',
                        color: active ? '#f59e0b' : '#7d8590',
                        '&:hover': {
                          bgcolor: active ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.04)',
                          color: active ? '#f59e0b' : '#c9d1d9',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: 30 }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: active ? 600 : 500, color: 'inherit', lineHeight: 1.4 }}>
                          {item.name}
                        </Typography>
                      } />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
            <Box sx={{ height: 10 }} />
          </Box>
        ))}

        {/* Settings */}
        <ListItem disablePadding>
          <ListItemButton
            component={Link} href="/org/settings"
            onClick={!isMdUp ? onClose : undefined}
            sx={{
              borderRadius: 1.5, py: 0.85, px: 1.25,
              color: isActive('/org/settings') ? '#f59e0b' : '#7d8590',
              bgcolor: isActive('/org/settings') ? 'rgba(245,158,11,0.14)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.04)', color: '#c9d1d9' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 30 }}>
              <SettingsRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: 'inherit' }}>Settings</Typography>} />
          </ListItemButton>
        </ListItem>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />

      {/* Profile footer */}
      <Box sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, borderRadius: 2 }}>
          <Avatar sx={{
            width: 34, height: 34, fontSize: '0.78rem', fontWeight: 700,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#000', flexShrink: 0,
          }}>
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: '#f0f6fc', display: 'block', fontSize: '0.78rem', lineHeight: 1.2 }}>
              {displayName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#f59e0b', fontSize: '0.68rem' }}>
              Organization Owner
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
            borderRight: '1px solid rgba(245,158,11,0.1)',
          },
        }} open>
        {drawerContent}
      </Drawer>
    </Box>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────────

export default function OrgOwnerLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [orgMode, setOrgMode] = useState<OrgMode>('SINGLE_GYM');
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  // Fetch organization mode on mount so sidebar adapts
  useEffect(() => {
    api.get('/org')
      .then(res => {
        const mode = res.data?.org?.organizationMode ?? res.data?.organizationMode;
        if (mode === 'MULTI_GYM' || mode === 'SINGLE_GYM') {
          setOrgMode(mode);
        }
      })
      .catch(() => { /* default stays SINGLE_GYM */ });
  }, []);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* best effort */ }
    logout();
    router.replace('/login');
  };

  return (
    <AuthGuard>
      <RoleGuard allowedPortals={['org-owner']}>
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
          <OrgSidebar
            mobileOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
            orgMode={orgMode}
          />

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
              {/* Amber accent bar */}
              <Box sx={{
                width: 3, height: 20, borderRadius: 4,
                background: 'linear-gradient(180deg, #f59e0b, #d97706)',
                flexShrink: 0,
              }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#f59e0b', letterSpacing: '-0.01em' }}>
                Organization Dashboard
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
