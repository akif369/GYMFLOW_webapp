'use client';
import { useState } from 'react';
import {
  AppBar, Toolbar, InputBase, Badge, Avatar, Typography, Box,
  IconButton, Divider, Chip, Menu, MenuItem, ListItemIcon,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

const NOTIFICATIONS = [
  { icon: <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#4ade80' }} />, text: 'Rahul Sharma checked in', time: '2 min ago' },
  { icon: <WarningAmberRoundedIcon sx={{ fontSize: 16, color: '#fbbf24' }} />, text: 'Priya Mehta membership expiring', time: '1h ago' },
  { icon: <PaymentRoundedIcon sx={{ fontSize: 16, color: '#a78bfa' }} />, text: 'Payment ₹2,500 received', time: '2h ago' },
];

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);

  return (
    <AppBar
      position="sticky"
      sx={{ width: '100%', zIndex: (theme) => theme.zIndex.drawer - 1 }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          px: { xs: 1.5, md: 2.5 },
          minHeight: '52px !important',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
          {/* Hamburger Menu for Mobile */}
          <IconButton
            onClick={onMenuClick}
            sx={{ display: { xs: 'block', md: 'none' }, color: '#f0f6fc' }}
          >
            <MenuRoundedIcon />
          </IconButton>
          
          {/* Search */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: 2,
            px: 1.5,
            py: 0.6,
            width: 320,
            border: '1px solid rgba(255,255,255,0.07)',
            transition: 'all 0.2s',
            '&:focus-within': {
              borderColor: '#10b981',
              backgroundColor: 'rgba(16,185,129,0.05)',
              boxShadow: '0 0 0 3px rgba(16,185,129,0.1)',
            },
          }}
        >
          <SearchRoundedIcon sx={{ color: '#7d8590', mr: 1, fontSize: 18 }} />
          <InputBase
            placeholder="Search members, payments..."
            sx={{ flex: 1, color: '#f0f6fc', fontSize: '0.82rem' }}
          />
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1, px: 0.6, py: 0.1 }}>
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#7d8590' }}>⌘K</Typography>
          </Box>
        </Box>
        </Box>

        {/* Right side */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Notification Bell */}
          <IconButton
            size="small"
            onClick={e => setNotifAnchor(e.currentTarget)}
            sx={{
              color: '#7d8590',
              '&:hover': { color: '#f0f6fc', bgcolor: 'rgba(255,255,255,0.06)' },
            }}
          >
            <Badge
              badgeContent={3}
              sx={{
                '& .MuiBadge-badge': {
                  bgcolor: '#10b981',
                  color: '#000',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  minWidth: 16,
                  height: 16,
                  top: 2,
                  right: 2,
                },
              }}
            >
              <NotificationsRoundedIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />

          {/* Branch Chip */}
          <Chip
            label="Koramangala"
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.06)',
              color: '#7d8590',
              fontSize: '0.72rem',
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.07)',
              height: 26,
            }}
          />

          {/* User Profile */}
          <Box
            onClick={e => setUserAnchor(e.currentTarget)}
            sx={{
              display: "flex", alignItems: "center", gap: 1,
              cursor: 'pointer', borderRadius: 2, px: 1, py: 0.5,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
              transition: 'background 0.15s',
            }}
          >
            <Avatar
              sx={{
                width: 28, height: 28,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#000', fontSize: '0.68rem', fontWeight: 700,
              }}
            >
              SO
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: '#f0f6fc', display: 'block', fontSize: '0.78rem', lineHeight: 1.2 }}>
                Sarah Owner
              </Typography>
              <Typography variant="caption" sx={{ color: '#7d8590', fontSize: '0.67rem' }}>
                Super Admin
              </Typography>
            </Box>
            <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16, color: '#7d8590' }} />
          </Box>
        </Box>
      </Toolbar>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={() => setNotifAnchor(null)}
        PaperProps={{
          sx: {
            width: 320, bgcolor: '#161b22',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 2, mt: 1,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#f0f6fc' }}>Notifications</Typography>
        </Box>
        <Divider />
        {NOTIFICATIONS.map((n, i) => (
          <MenuItem
            key={i}
            onClick={() => setNotifAnchor(null)}
            sx={{ py: 1.25, px: 2, gap: 1.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' } }}
          >
            <ListItemIcon sx={{ minWidth: 'auto' }}>{n.icon}</ListItemIcon>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ color: '#f0f6fc', fontSize: '0.8rem' }}>{n.text}</Typography>
              <Typography variant="caption" sx={{ color: '#7d8590', fontSize: '0.7rem' }}>{n.time}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </AppBar>
  );
}
