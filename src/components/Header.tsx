'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppBar, Toolbar, InputBase, Badge, Avatar, Typography, Box,
  IconButton, Divider, Chip, Menu, MenuItem, ListItemIcon, Paper, Popper,
  ClickAwayListener, CircularProgress, List, ListItemButton, ListItemText,
  Snackbar, Alert,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import { useColorMode } from './ThemeRegistry';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import ChangePasswordDialog from './profile/ChangePasswordDialog';
import MyProfileDialog from './profile/MyProfileDialog';
import { useGlobalSearch } from '@/hooks/queries/search';
import { useDebounce } from '@/hooks/useDebounce';

function getInitials(firstName?: string, lastName?: string) {
  if (!firstName && !lastName) return '??';
  return `${(firstName?.[0] ?? '').toUpperCase()}${(lastName?.[0] ?? '').toUpperCase()}`;
}

function formatPhone(phone: string | null | undefined) {
  if (!phone) return '';
  const clean = phone.replace(/[^\d+]/g, '');
  if (clean.startsWith('+')) return phone;
  if (clean.length === 10) return `+91 ${phone}`;
  if (clean.startsWith('91') && clean.length === 12) return `+${clean}`;
  return phone;
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Owner',
  MANAGER: 'Manager',
  RECEPTIONIST: 'Receptionist',
  TRAINER: 'Trainer',
  SUPER_ADMIN: 'Super Admin',
};

type MemberResult = { id: string; memberNumber: string; firstName: string; lastName: string; phone: string; status: string };
type PaymentResult = { id: string; memberId: string | null; memberName: string | null; referenceId: string | null; amount: string; status: string; createdAt: string };

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const { user, logout: storeLogout } = useAuthStore();
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 250);
  const normalizedQuery = debouncedQuery.trim();
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeResult, setActiveResult] = useState(-1);
  const { data: searchData, isLoading: searchLoading, isError: searchError } = useGlobalSearch(normalizedQuery);
  const searchAnchorRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchAnchorWidth, setSearchAnchorWidth] = useState(320);
  const { mode, toggleColorMode } = useColorMode();

  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (searchOpen && searchAnchorRef.current) {
      setSearchAnchorWidth(searchAnchorRef.current.offsetWidth);
    }
  }, [searchOpen, searchQuery]);

  const initials = getInitials(user?.firstName, user?.lastName);
  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Staff User';
  const roleLabel = ROLE_LABELS[user?.role ?? ''] ?? (user?.role ?? 'Staff');
  const memberResults = (searchData?.members ?? []) as MemberResult[];
  const paymentResults = (searchData?.payments ?? []) as PaymentResult[];
  const results = [
    ...memberResults.map(item => ({ type: 'member' as const, item })),
    ...paymentResults.map(item => ({ type: 'payment' as const, item })),
  ];

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const openSearchResult = (result: typeof results[number]) => {
    setSearchOpen(false);
    setSearchQuery('');
    if (result.type === 'member') {
      router.push(`/members/${result.item.id}`);
      return;
    }
    const paymentSearch = result.item.referenceId || result.item.id;
    router.push(`/payments?search=${encodeURIComponent(paymentSearch)}`);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setSearchOpen(false);
      searchInputRef.current?.blur();
    } else if (event.key === 'ArrowDown' && results.length) {
      event.preventDefault();
      setActiveResult(index => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp' && results.length) {
      event.preventDefault();
      setActiveResult(index => (index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === 'Enter' && activeResult >= 0 && results[activeResult]) {
      event.preventDefault();
      openSearchResult(results[activeResult]);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setUserAnchor(null);
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if the server call fails, clear local state
    } finally {
      storeLogout();
      router.replace('/login');
    }
  };

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
          
          {/* Global search */}
        <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
        <Box ref={searchAnchorRef} sx={{ position: 'relative', width: { xs: '100%', md: 320 }, maxWidth: { xs: 'none', md: 320 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: 2,
            px: 1.5,
            py: 0.6,
            width: '100%',
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
            inputRef={searchInputRef}
            value={searchQuery}
            onChange={event => { setSearchQuery(event.target.value); setSearchOpen(true); }}
            onFocus={() => {
              setSearchOpen(true);
            }}
            onKeyDown={handleSearchKeyDown}
            inputProps={{ 'aria-label': 'Search members and payments', autoComplete: 'off' }}
            sx={{ flex: 1, color: '#f0f6fc', fontSize: '0.82rem' }}
          />
          <Box sx={{ display: { xs: 'none', sm: 'block' }, bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1, px: 0.6, py: 0.1 }}>
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#7d8590' }}>⌘K</Typography>
          </Box>
        </Box>
        <Popper
          open={searchOpen && normalizedQuery.length >= 2}
          anchorEl={searchAnchorRef.current}
          placement="bottom-start"
          disablePortal
          modifiers={[{ name: 'preventOverflow', options: { padding: 12 } }]}
          sx={{
            zIndex: theme => theme.zIndex.modal,
            width: { xs: 'calc(100vw - 24px)', sm: searchAnchorWidth },
          }}
        >
          <Paper elevation={8} sx={{ mt: 1, overflow: 'hidden', bgcolor: '#161b22', border: '1px solid rgba(255,255,255,0.09)', borderRadius: { xs: 3, sm: 2 }, maxHeight: 'min(420px, calc(100vh - 72px))', overflowY: 'auto' }}>
            {searchLoading && results.length === 0 && <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}><CircularProgress size={20} /></Box>}
            {searchLoading && results.length > 0 && <Box sx={{ height: 2, bgcolor: 'rgba(16,185,129,0.2)', '&::after': { content: '""', display: 'block', height: '100%', width: '45%', bgcolor: '#10b981', animation: 'search-loading 0.9s ease-in-out infinite alternate' }, '@keyframes search-loading': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(220%)' } } }} />}
            {!searchLoading && searchError && results.length === 0 && <Typography variant="body2" sx={{ p: 2, color: '#f87171' }}>Search is temporarily unavailable.</Typography>}
            {!searchLoading && !searchError && results.length === 0 && <Typography variant="body2" sx={{ p: 2, color: '#7d8590' }}>No members or payments found.</Typography>}
            {results.length > 0 && (
              <List disablePadding>
                {memberResults.length > 0 && <Typography variant="caption" sx={{ display: 'block', px: 2, pt: 1.5, pb: 0.5, color: '#7d8590', fontWeight: 700 }}>MEMBERS</Typography>}
                {memberResults.map(member => {
                  const index = results.findIndex(result => result.type === 'member' && result.item.id === member.id);
                  return <ListItemButton key={member.id} selected={activeResult === index} onMouseEnter={() => setActiveResult(index)} onClick={() => openSearchResult({ type: 'member', item: member })} sx={{ gap: 1.25, px: 2 }}>
                    <GroupsRoundedIcon sx={{ color: '#10b981', fontSize: 20 }} />
                    <ListItemText primary={`${member.firstName} ${member.lastName}`} secondary={`${member.memberNumber} · ${member.phone}`} slotProps={{ primary: { sx: { fontSize: '0.85rem', fontWeight: 700 } }, secondary: { sx: { fontSize: '0.72rem', color: '#7d8590' } } }} />
                    <Chip label="Member" size="small" sx={{ bgcolor: 'rgba(16,185,129,0.12)', color: '#10b981', fontWeight: 700, fontSize: '0.65rem' }} />
                  </ListItemButton>;
                })}
                {paymentResults.length > 0 && <Typography variant="caption" sx={{ display: 'block', px: 2, pt: 1.5, pb: 0.5, color: '#7d8590', fontWeight: 700 }}>PAYMENTS</Typography>}
                {paymentResults.map(payment => {
                  const index = results.findIndex(result => result.type === 'payment' && result.item.id === payment.id);
                  return <ListItemButton key={payment.id} selected={activeResult === index} onMouseEnter={() => setActiveResult(index)} onClick={() => openSearchResult({ type: 'payment', item: payment })} sx={{ gap: 1.25, px: 2 }}>
                    <ReceiptLongRoundedIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                    <ListItemText primary={payment.referenceId || payment.id} secondary={`${payment.memberName || 'Walk-in payment'} · ₹${Number(payment.amount).toLocaleString()} · ${payment.status}`} slotProps={{ primary: { sx: { fontSize: '0.85rem', fontWeight: 700 }, noWrap: true }, secondary: { sx: { fontSize: '0.72rem', color: '#7d8590' }, noWrap: true } }} />
                    <Chip label="Payment" size="small" sx={{ bgcolor: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 700, fontSize: '0.65rem' }} />
                  </ListItemButton>;
                })}
              </List>
            )}
          </Paper>
        </Popper>
        </Box>
        </ClickAwayListener>
        </Box>

        {/* Right side */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Theme Toggle */}
          <IconButton
            size="small"
            onClick={toggleColorMode}
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
            }}
          >
            {mode === 'dark' ? <LightModeRoundedIcon sx={{ fontSize: 20 }} /> : <DarkModeRoundedIcon sx={{ fontSize: 20 }} />}
          </IconButton>

          {/* Notification Bell */}
          <IconButton
            size="small"
            onClick={e => setNotifAnchor(e.currentTarget)}
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
            }}
          >
            <Badge
              badgeContent={0}
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

          {user?.phone && (
            <Chip
              label={formatPhone(user.phone)}
              size="small"
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                bgcolor: 'rgba(59,130,246,0.12)',
                color: '#3b82f6',
                fontSize: '0.72rem',
                fontWeight: 600,
                border: '1px solid rgba(59,130,246,0.25)',
                height: 26,
              }}
            />
          )}
          {/* Branch Chip */}
          <Chip
            label={user?.branchId ? 'Main Branch' : 'All Branches'}
            size="small"
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
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
              {initials}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="caption" sx={{ color: '#f0f6fc', display: 'block', fontSize: '0.78rem', lineHeight: 1.2, fontWeight: 700 }}>
                {displayName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#7d8590', fontSize: '0.67rem' }}>
                {roleLabel}
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
        slotProps={{
          paper: {
            sx: {
              width: { xs: 'calc(100vw - 32px)', sm: 320 },
              bgcolor: '#161b22',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 2,
              mt: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ color: '#f0f6fc', fontWeight: 700 }}>Notifications</Typography>
        </Box>
        <Divider />
        <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="body2" sx={{ color: '#7d8590' }}>No new notifications</Typography>
        </Box>
      </Menu>

      {/* User Profile Menu */}
      <Menu
        anchorEl={userAnchor}
        open={Boolean(userAnchor)}
        onClose={() => setUserAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              width: 220,
              bgcolor: '#161b22',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 2,
              mt: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="subtitle2" sx={{ color: '#f0f6fc', fontWeight: 700, fontSize: '0.82rem' }}>
            {displayName}
          </Typography>
          <Typography variant="caption" sx={{ color: '#7d8590', fontSize: '0.7rem' }}>
            {user?.email}
          </Typography>
          <Box sx={{ mt: 0.75, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={roleLabel}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.62rem',
                fontWeight: 700,
                bgcolor: 'rgba(16,185,129,0.12)',
                color: '#10b981',
                border: '1px solid rgba(16,185,129,0.25)',
              }}
            />
            {user?.phone && (
              <Chip
                label={formatPhone(user.phone)}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  bgcolor: 'rgba(59,130,246,0.12)',
                  color: '#3b82f6',
                  border: '1px solid rgba(59,130,246,0.25)',
                }}
              />
            )}
          </Box>
        </Box>

        <MenuItem
          onClick={() => { setUserAnchor(null); setProfileOpen(true); }}
          sx={{ py: 1, px: 2, gap: 1.5, mt: 0.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' } }}
        >
          <ListItemIcon sx={{ minWidth: 'auto' }}>
            <PersonRoundedIcon sx={{ fontSize: 16, color: '#7d8590' }} />
          </ListItemIcon>
          <Typography variant="body2" sx={{ color: '#f0f6fc', fontSize: '0.82rem' }}>My Profile</Typography>
        </MenuItem>

        <MenuItem
          onClick={() => { setUserAnchor(null); setPasswordOpen(true); }}
          sx={{ py: 1, px: 2, gap: 1.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' } }}
        >
          <ListItemIcon sx={{ minWidth: 'auto' }}>
            <LockResetRoundedIcon sx={{ fontSize: 16, color: '#7d8590' }} />
          </ListItemIcon>
          <Typography variant="body2" sx={{ color: '#f0f6fc', fontSize: '0.82rem' }}>Change Password</Typography>
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={handleLogout}
          disabled={loggingOut}
          sx={{ py: 1, px: 2, gap: 1.5, mb: 0.5, '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}
        >
          <ListItemIcon sx={{ minWidth: 'auto' }}>
            <LogoutRoundedIcon sx={{ fontSize: 16, color: '#f87171' }} />
          </ListItemIcon>
          <Typography variant="body2" sx={{ color: '#f87171', fontSize: '0.82rem', fontWeight: 600 }}>
            {loggingOut ? 'Signing out...' : 'Sign out'}
          </Typography>
        </MenuItem>
      </Menu>

      <MyProfileDialog 
        open={profileOpen} 
        onClose={() => setProfileOpen(false)} 
        onSuccess={() => setSuccessMessage('Profile updated successfully')} 
      />
      
      <ChangePasswordDialog 
        open={passwordOpen} 
        onClose={() => setPasswordOpen(false)} 
        onSuccess={() => setSuccessMessage('Password changed successfully')} 
      />

      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={4000} 
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ top: { xs: '70px !important', sm: '80px !important' } }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ boxShadow: 3 }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </AppBar>
  );
}
