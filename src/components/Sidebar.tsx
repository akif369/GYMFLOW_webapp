'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Box, Divider, Tooltip } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaymentIcon from '@mui/icons-material/Payment';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import SportsIcon from '@mui/icons-material/Sports';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 240;

const navSections = [
  {
    label: 'Core',
    items: [
      { name: 'Dashboard', icon: <DashboardIcon fontSize="small" />, href: '/' },
      { name: 'Members', icon: <PeopleIcon fontSize="small" />, href: '/members' },
      { name: 'Attendance', icon: <AccessTimeIcon fontSize="small" />, href: '/attendance' },
      { name: 'Payments', icon: <PaymentIcon fontSize="small" />, href: '/payments' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Memberships', icon: <CardMembershipIcon fontSize="small" />, href: '/memberships' },
      { name: 'Trainers', icon: <SportsIcon fontSize="small" />, href: '/trainers' },
      { name: 'PT Sessions', icon: <EventNoteIcon fontSize="small" />, href: '/pt-sessions' },
      { name: 'Workouts', icon: <FitnessCenterIcon fontSize="small" />, href: '/workouts' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { name: 'Leads & CRM', icon: <TrendingUpIcon fontSize="small" />, href: '/leads' },
      { name: 'Reports', icon: <AssessmentIcon fontSize="small" />, href: '/reports' },
      { name: 'Staff', icon: <GroupIcon fontSize="small" />, href: '/staff' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', overflowX: 'hidden' },
      }}
    >
      <Box sx={{ p: 2.5, pb: 2 }}>
        <Typography variant="h6" fontWeight="bold" color="primary" letterSpacing="-0.5px">
          GymFlow
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          IronZone Fitness · Admin
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', px: 1 }}>
        {navSections.map((section) => (
          <Box key={section.label} mb={1}>
            <Typography variant="caption" color="text.secondary" sx={{ px: 1.5, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {section.label}
            </Typography>
            <List dense disablePadding sx={{ mt: 0.5 }}>
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <ListItem key={item.name} disablePadding sx={{ mb: 0.25 }}>
                    <ListItemButton
                      component={Link}
                      href={item.href}
                      sx={{
                        borderRadius: 2, py: 0.8, px: 1.5,
                        bgcolor: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                        color: isActive ? 'primary.main' : 'text.secondary',
                        '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.08)', color: 'primary.main' },
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isActive ? 600 : 500, color: 'inherit' }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
            <Divider sx={{ my: 1.5 }} />
          </Box>
        ))}

        <List dense disablePadding>
          <ListItem disablePadding sx={{ mb: 0.25 }}>
            <ListItemButton
              component={Link}
              href="/settings"
              sx={{
                borderRadius: 2, py: 0.8, px: 1.5,
                color: pathname === '/settings' ? 'primary.main' : 'text.secondary',
                bgcolor: pathname === '/settings' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.08)', color: 'primary.main' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}><SettingsIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Settings" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500, color: 'inherit' }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      <Divider />
      <Box sx={{ p: 1 }}>
        <ListItemButton sx={{ borderRadius: 2, py: 0.8, px: 1.5, color: 'text.secondary', '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' } }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500, color: 'inherit' }} />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}

