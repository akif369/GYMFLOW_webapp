'use client';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Box, Divider, Avatar, IconButton, useTheme, useMediaQuery,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import CardMembershipRoundedIcon from '@mui/icons-material/CardMembershipRounded';
import SportsRoundedIcon from '@mui/icons-material/SportsRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface NavItem {
  name: string;
  icon: ReactNode;
  href: string;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', icon: <DashboardRoundedIcon sx={{ fontSize: 18 }} />, href: '/' },
    ],
  },
  {
    label: 'Members',
    items: [
      { name: 'Members', icon: <PeopleRoundedIcon sx={{ fontSize: 18 }} />, href: '/members' },
      { name: 'Attendance', icon: <AccessTimeRoundedIcon sx={{ fontSize: 18 }} />, href: '/attendance' },
      { name: 'Memberships', icon: <CardMembershipRoundedIcon sx={{ fontSize: 18 }} />, href: '/memberships' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { name: 'Payments', icon: <PaymentRoundedIcon sx={{ fontSize: 18 }} />, href: '/payments' },
    ],
  },
  {
    label: 'Fitness',
    items: [
      { name: 'Trainers', icon: <SportsRoundedIcon sx={{ fontSize: 18 }} />, href: '/trainers' },
      { name: 'PT Sessions', icon: <EventNoteRoundedIcon sx={{ fontSize: 18 }} />, href: '/pt-sessions' },
      { name: 'Workouts', icon: <FitnessCenterRoundedIcon sx={{ fontSize: 18 }} />, href: '/workouts' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { name: 'Leads & CRM', icon: <TrendingUpRoundedIcon sx={{ fontSize: 18 }} />, href: '/leads', badge: '5' },
      { name: 'Reports', icon: <AssessmentRoundedIcon sx={{ fontSize: 18 }} />, href: '/reports' },
      { name: 'Staff', icon: <GroupRoundedIcon sx={{ fontSize: 18 }} />, href: '/staff' },
    ],
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
  drawerWidth?: number;
}

export default function Sidebar({ mobileOpen = false, onClose, drawerWidth = 236 }: SidebarProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  const drawerContent = (
    <>
      {/* Logo */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 34, height: 34, borderRadius: 2,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FitnessCenterRoundedIcon sx={{ fontSize: 18, color: '#000' }} />
          </Box>
          <Box>
            <Typography variant="body1" fontWeight={800} sx={{ color: '#f0f6fc', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              GymFlow
            </Typography>
            <Typography variant="caption" sx={{ color: '#7d8590', fontSize: '0.67rem' }}>
              Admin Portal
            </Typography>
          </Box>
        </Box>
        {!isMdUp && (
          <IconButton onClick={onClose} size="small" sx={{ color: '#7d8590' }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ mx: 2, mb: 1 }} />

      {/* Nav */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: 1.5, py: 1 }}>
        {navSections.map((section) => (
          <Box key={section.label} sx={{ mb: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                px: 1, mb: 0.5, display: 'block',
                fontWeight: 700, fontSize: '0.62rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)',
              }}
            >
              {section.label}
            </Typography>
            <List dense disablePadding>
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <ListItem key={item.name} disablePadding sx={{ mb: 0.25 }}>
                    <ListItemButton
                      component={Link}
                      href={item.href}
                      onClick={!isMdUp ? onClose : undefined}
                      sx={{
                        borderRadius: 1.5,
                        py: 0.85, px: 1.25,
                        bgcolor: active ? 'rgba(16,185,129,0.14)' : 'transparent',
                        color: active ? '#34d399' : '#7d8590',
                        '&:hover': {
                          bgcolor: active ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.04)',
                          color: active ? '#34d399' : '#c9d1d9',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: 30 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={<Typography sx={{
                          fontSize: '0.82rem',
                          fontWeight: active ? 600 : 500,
                          color: 'inherit',
                          lineHeight: 1.4,
                        }}>{item.name}</Typography>} />
                      {item.badge && (
                        <Box
                          sx={{
                            minWidth: 18, height: 18, borderRadius: 1,
                            bgcolor: 'rgba(16,185,129,0.2)', color: '#34d399',
                            fontSize: '0.65rem', fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            px: 0.5,
                          }}
                        >
                          {item.badge}
                        </Box>
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
            <Box sx={{ height: 10 }} />
          </Box>
        ))}

        {/* Settings */}
        <ListItem disablePadding sx={{ mb: 0.25 }}>
          <ListItemButton
            component={Link}
            href="/settings"
            onClick={!isMdUp ? onClose : undefined}
            sx={{
              borderRadius: 1.5, py: 0.85, px: 1.25,
              color: isActive('/settings') ? '#34d399' : '#7d8590',
              bgcolor: isActive('/settings') ? 'rgba(16,185,129,0.14)' : 'transparent',
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

      <Divider />

      {/* Profile Footer */}
      <Box sx={{ p: 1.5 }}>
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.25,
            p: 1.25, borderRadius: 2, cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
            transition: 'background 0.15s',
          }}
        >
          <Avatar
            sx={{
              width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#000', flexShrink: 0,
            }}
          >
            SO
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: '#f0f6fc', display: 'block', fontSize: '0.78rem', lineHeight: 1.2 }}>
              Sarah Owner
            </Typography>
            <Typography variant="caption" sx={{ color: '#7d8590', fontSize: '0.68rem' }}>
              Super Admin
            </Typography>
          </Box>
          <LogoutRoundedIcon sx={{ fontSize: 16, color: '#7d8590' }} />
        </Box>
      </Box>
    </>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: 'background.default',
            backgroundImage: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: 'background.default',
            backgroundImage: 'none',
            borderRight: '1px solid rgba(255,255,255,0.07)',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
