'use client';
import { Suspense, useRef, useState, useEffect, type MouseEvent, type PointerEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  TextField, MenuItem, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Stack, alpha, IconButton, Menu, ListItemIcon, ListItemText,
  Tooltip, CircularProgress, Alert,
} from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import PersonOffRoundedIcon from '@mui/icons-material/PersonOffRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import { api } from '@/lib/api';
import RenewMembershipDialog, { type RenewPlan } from '@/components/RenewMembershipDialog';

type MemberRow = {
  id: string; memberId: string; firstName: string; lastName: string; email: string; phone: string;
  photoUrl: unknown; joinDate: string; gender: string; dob: string; plan: string; startDate: string;
  expiryDate: string; trainer: string | null; lastVisit: string; paymentStatus: string;
  membershipStatus: string; goal: string; experience: string; branch: string; address: string;
  emergency: { name: string; phone: string; relation: string }; medicalConditions: string;
  allergies: string; injuries: string;
};

const statusColor: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  ACTIVE: 'success', EXPIRING: 'warning', EXPIRED: 'error',
  PAID: 'success', PENDING: 'warning', PARTIALLY_PAID: 'warning',
};

const FILTERS = [
  { label: 'All Members', value: 'ALL', icon: '👥' },
  { label: 'Active', value: 'ACTIVE', icon: '✅' },
  { label: 'Expiring Soon', value: 'EXPIRING', icon: '⏳' },
  { label: 'Expired', value: 'EXPIRED', icon: '❌' },
  { label: 'Payment Pending', value: 'PAYMENT_PENDING', icon: '💳' },
  { label: 'No Trainer', value: 'NO_TRAINER', icon: '🏃' },
];

function MembersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState(() => {
    const filter = searchParams.get('filter');
    return filter && FILTERS.some(option => option.value === filter) ? filter : 'ALL';
  });
  const [addOpen, setAddOpen] = useState(false);
  const [actionAnchor, setActionAnchor] = useState<null | HTMLElement>(null);
  const [actionPosition, setActionPosition] = useState<{ top: number; left: number } | null>(null);
  const [actionMemberId, setActionMemberId] = useState<string | null>(null);
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewMemberId, setRenewMemberId] = useState<string | null>(null);
  const [renewPlans, setRenewPlans] = useState<RenewPlan[]>([]);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  // ── API state ────────────────────────────────────────────────────────────────
  const [apiMembers, setApiMembers] = useState<MemberRow[] | null>(null);
  const [apiTotal, setApiTotal] = useState(0);
  const [apiLoading, setApiLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 100 });
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Add Member State
  const [addForm, setAddForm] = useState({
    firstName: '', lastName: '', phone: '', email: '', gender: 'MALE',
    dob: '', address: '', goal: '', joinDate: new Date().toISOString().split('T')[0],
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    api.get('/membership-plans', { params: { pageSize: '50' } })
      .then(res => {
        const items = res.data?.plans ?? res.data?.items ?? [];
        setRenewPlans(items.map((plan: Record<string, unknown>) => ({
          id: String(plan.id),
          name: String(plan.name ?? ''),
          price: Number(plan.price ?? 0),
          durationDays: Number(plan.durationDays ?? 30),
        })));
      })
      .catch(() => setRenewPlans([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setApiLoading(true);
    const params: Record<string, string> = {
      page: String(paginationModel.page + 1),
      pageSize: String(paginationModel.pageSize),
    };
    if (search) params.search = search;
    if (activeFilter !== 'ALL') {
      if (activeFilter === 'PAYMENT_PENDING') {
        params.paymentStatus = 'PENDING';
      } else if (activeFilter === 'ACTIVE' || activeFilter === 'EXPIRED') {
        params.status = activeFilter;
      }
    }
    api.get('/members', { params })
      .then(res => {
        if (cancelled) return;
        const items = res.data?.items ?? [];
        // Normalize the API response for the table row shape.
        setApiMembers(items.map((m: Record<string, any>) => {
          const latestMembership = (m.latestMembership ?? {}) as Record<string, any>;
          const membershipPlan = m.membershipPlan ?? latestMembership.planName ?? m.plan;
          const membershipStart = m.membershipStart ?? latestMembership.startDate;
          const membershipExpiry = m.membershipExpiry ?? latestMembership.endDate;
          const membershipStatus = m.membershipStatus ?? latestMembership.status ?? m.status;

          const planName = membershipPlan ? String(membershipPlan) : '-';
          const startDate = membershipStart ? String(membershipStart).split('T')[0] : '-';
          const expiryDate = membershipExpiry ? String(membershipExpiry).split('T')[0] : '-';
          const lastVisit = (m.lastVisit ?? m.lastCheckIn) ? String(m.lastVisit ?? m.lastCheckIn).split('T')[0] : '-';

          let calculatedMembershipStatus = membershipStatus ? String(membershipStatus) : null;
          let calculatedPaymentStatus = m.paymentStatus ? String(m.paymentStatus) : null;

          if (!membershipPlan || planName === '-') {
            if (!calculatedMembershipStatus) calculatedMembershipStatus = 'INACTIVE';
            if (!calculatedPaymentStatus) calculatedPaymentStatus = '-';
          } else {
            if (!calculatedMembershipStatus && expiryDate !== '-') {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const exp = new Date(expiryDate);
              if (exp < today) calculatedMembershipStatus = 'EXPIRED';
              else {
                const diffTime = exp.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                calculatedMembershipStatus = diffDays <= 7 ? 'EXPIRING' : 'ACTIVE';
              }
            } else if (!calculatedMembershipStatus) {
              calculatedMembershipStatus = 'ACTIVE';
            }
            if (!calculatedPaymentStatus) calculatedPaymentStatus = 'PENDING';
          }

          return {
            id: String(m.id),
            memberId: String(m.memberNumber ?? m.memberId ?? ''),
            firstName: String(m.firstName ?? ''),
            lastName: String(m.lastName ?? ''),
            email: String(m.email ?? ''),
            phone: String(m.phone ?? ''),
            photoUrl: m.photoUrl ?? null,
            joinDate: String(m.joinDate ?? m.createdAt ?? '').split('T')[0],
            gender: String(m.gender ?? ''),
            dob: String(m.dob ?? ''),
            plan: planName,
            startDate,
            expiryDate,
            trainer: m.trainerName ? String(m.trainerName) : null,
            lastVisit,
            paymentStatus: calculatedPaymentStatus,
            membershipStatus: calculatedMembershipStatus,
            goal: String(m.goal ?? ''),
            experience: String(m.experience ?? ''),
            branch: String(m.branch ?? ''),
            address: String(m.address ?? ''),
            emergency: m.emergency ?? { name: '', phone: '', relation: '' },
            medicalConditions: String(m.medicalConditions ?? 'None'),
            allergies: String(m.allergies ?? 'None'),
            injuries: String(m.injuries ?? 'None'),
          };
        }));
        setApiTotal(res.data?.total ?? items.length);
      })
      .catch(() => {
        // Keep the directory empty when the API is unavailable.
        if (!cancelled) setApiMembers(null);
      })
      .finally(() => { if (!cancelled) setApiLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeFilter, paginationModel.page, paginationModel.pageSize, fetchTrigger]);
  const members = apiMembers ?? [];
  const totalCount = apiMembers ? apiTotal : 0;

  const openActions = (event: MouseEvent<HTMLElement>, memberId: string) => {
    event.stopPropagation();
    setActionAnchor(event.currentTarget);
    setActionPosition(null);
    setActionMemberId(memberId);
  };

  const closeActions = () => {
    setActionAnchor(null);
    setActionPosition(null);
    setActionMemberId(null);
    longPressTriggered.current = false;
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleRowPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const target = event.target as HTMLElement;
    if (target.closest('[aria-label^="Actions for"]')) return;

    const row = target.closest<HTMLElement>('[role="row"][data-id]');
    const memberId = row?.dataset.id;
    if (!row || !memberId) return;

    const position = { top: event.clientY, left: event.clientX };

    cancelLongPress();
    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null;
      longPressTriggered.current = true;
      setActionAnchor(null);
      setActionPosition(position);
      setActionMemberId(memberId);
    }, 550);
  };

  const handleRowContextMenu = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    cancelLongPress();

    const target = event.target as HTMLElement;
    const row = target.closest<HTMLElement>('[role="row"][data-id]');
    const memberId = row?.dataset.id;
    if (!memberId) return;

    longPressTriggered.current = true;
    setActionAnchor(null);
    setActionPosition({ top: event.clientY, left: event.clientX });
    setActionMemberId(memberId);
  };

  const runMemberAction = (action: 'view' | 'renew' | 'attendance' | 'payment') => {
    if (!actionMemberId) return;
    const member = members.find(item => item.id === actionMemberId);
    closeActions();
    if (!member) return;

    if (action === 'renew') {
      setRenewMemberId(member.id);
      setRenewOpen(true);
    } else if (action === 'view') {
      router.push(`/members/${member.id}`);
    } else if (action === 'attendance') {
      router.push(`/attendance?member=${encodeURIComponent(`${member.firstName} ${member.lastName}`)}`);
      } else {
      router.push(`/payments?memberId=${member.id}`);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.firstName || !addForm.lastName || !addForm.phone || !addForm.dob || !addForm.joinDate) {
      setAddError('First Name, Last Name, Phone, Date of Birth, and Join Date are required.');
      return;
    }
    setAddLoading(true);
    setAddError('');
    try {
      await api.post('/members', addForm);
      setAddOpen(false);
      setAddForm({ firstName: '', lastName: '', phone: '', email: '', gender: 'MALE', dob: '', address: '', goal: '', joinDate: new Date().toISOString().split('T')[0] });
      setFetchTrigger(t => t + 1);
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'Failed to create member');
    } finally {
      setAddLoading(false);
    }
  };

  // Always apply local filter because the backend doesn't natively support all compound statuses yet (like EXPIRING)
  const filtered = members.filter(m => {
    const matchSearch = `${m.firstName} ${m.lastName} ${m.phone} ${m.memberId}`.toLowerCase().includes(search.toLowerCase());
    let matchFilter = true;
    if (activeFilter === 'ACTIVE') matchFilter = m.membershipStatus === 'ACTIVE';
    if (activeFilter === 'EXPIRING') matchFilter = m.membershipStatus === 'EXPIRING';
    if (activeFilter === 'EXPIRED') matchFilter = m.membershipStatus === 'EXPIRED';
    if (activeFilter === 'PAYMENT_PENDING') matchFilter = m.paymentStatus !== 'PAID';
    if (activeFilter === 'NO_TRAINER') matchFilter = !m.trainer;
    return matchSearch && matchFilter;
  });

  const counts = {
    ALL: totalCount,
    ACTIVE: members.filter(m => m.membershipStatus === 'ACTIVE').length,
    EXPIRING: members.filter(m => m.membershipStatus === 'EXPIRING').length,
    EXPIRED: members.filter(m => m.membershipStatus === 'EXPIRED').length,
    PAYMENT_PENDING: members.filter(m => m.paymentStatus !== 'PAID').length,
    NO_TRAINER: members.filter(m => !m.trainer).length,
  };

  const columns: GridColDef[] = [
    {
      field: '__avatar',
      headerName: '',
      width: 52,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Avatar
          sx={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#000', fontSize: '0.7rem', fontWeight: 800,
            mt: 1.2,
          }}
        >
          {params.row.firstName[0]}{params.row.lastName[0]}
        </Avatar>
      ),
    },
    {
      field: 'name',
      headerName: 'Member',
      flex: 1.2,
      minWidth: 160,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ mt: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.83rem', color: '#f0f6fc' }}>
            {params.row.firstName} {params.row.lastName}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: '#7d8590' }}>
            #{params.row.memberId} · {params.row.phone}
          </Typography>
        </Box>
      ),
    },
    { field: 'plan', headerName: 'Plan', width: 150, renderCell: p => <Typography sx={{ fontSize: '0.8rem', color: '#f0f6fc' }}>{p.value}</Typography> },
    { field: 'startDate', headerName: 'Start', width: 100, renderCell: p => <Typography sx={{ fontSize: '0.78rem', color: '#7d8590' }}>{p.value}</Typography> },
    {
      field: 'expiryDate',
      headerName: 'Expiry',
      width: 100,
      renderCell: (p) => {
        const isExpiring = p.row.membershipStatus === 'EXPIRING';
        return (
          <Typography sx={{ fontSize: '0.78rem', color: isExpiring ? '#fbbf24' : '#7d8590', fontWeight: isExpiring ? 600 : 400 }}>
            {p.value}
          </Typography>
        );
      },
    },
    {
      field: 'trainer',
      headerName: 'Trainer',
      width: 130,
      renderCell: p => p.value
        ? <Typography sx={{ fontSize: '0.78rem', color: '#f0f6fc' }}>{p.value}</Typography>
        : <Typography sx={{ fontSize: '0.75rem', color: '#7d8590', fontStyle: 'italic' }}>Unassigned</Typography>,
    },
    { field: 'lastVisit', headerName: 'Last Visit', width: 100, renderCell: p => <Typography sx={{ fontSize: '0.78rem', color: '#7d8590' }}>{p.value}</Typography> },
    {
      field: 'paymentStatus',
      headerName: 'Payment',
      width: 120,
      renderCell: p => <Chip label={p.value} size="small" color={statusColor[p.value] || 'default'} />,
    },
    {
      field: 'membershipStatus',
      headerName: 'Status',
      width: 110,
      renderCell: p => <Chip label={p.value} size="small" color={statusColor[p.value] || 'default'} />,
    },
    {
      field: 'actions',
      headerName: '',
      width: 58,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: params => (
        <Tooltip title="Member actions">
          <IconButton
            size="small"
            aria-label={`Actions for ${params.row.firstName} ${params.row.lastName}`}
            onClick={event => openActions(event, params.row.id)}
            sx={{ color: '#7d8590', '&:hover': { color: '#f0f6fc', bgcolor: 'rgba(255,255,255,0.08)' } }}
          >
            <MoreVertRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <Stack direction="row" sx={{ mb: 3, gap: 2, alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#f0f6fc', fontWeight: 800 }}>Members</Typography>
          <Typography variant="body2" sx={{ color: '#7d8590', mt: 0.25 }}>
            {totalCount} total members across all branches
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setAddOpen(true)}>
          Add Member
        </Button>
      </Stack>

      {/* Summary strip */}
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        {[
          { label: 'Active', value: counts.ACTIVE, filter: 'ACTIVE', color: '#10b981', icon: PeopleRoundedIcon },
          { label: 'Expiring (7d)', value: counts.EXPIRING, filter: 'EXPIRING', color: '#f59e0b', icon: AutorenewRoundedIcon },
          { label: 'Expired', value: counts.EXPIRED, filter: 'EXPIRED', color: '#f43f5e', icon: PersonOffRoundedIcon },
          { label: 'Pending Payment', value: counts.PAYMENT_PENDING, filter: 'PAYMENT_PENDING', color: '#f59e0b', icon: WarningAmberRoundedIcon },
        ].map(s => (
          <Grid size={{ xs: 6, sm: 3 }} key={s.label}>
            <Card
              elevation={0}
              onClick={() => setActiveFilter(activeFilter === s.filter ? 'ALL' : s.filter)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActiveFilter(activeFilter === s.filter ? 'ALL' : s.filter);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Show ${s.label} members`}
              sx={{
                cursor: 'pointer',
                border: '1px solid',
                borderColor: activeFilter === s.filter ? s.color : 'transparent',
                transition: 'border-color 0.2s, transform 0.18s',
                '&:hover': { borderColor: activeFilter === s.filter ? s.color : alpha(s.color, 0.55), transform: 'translateY(-2px)' }
              }}
            >
              <CardContent sx={{ py: '12px !important', px: '16px !important' }}>
                <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: alpha(s.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <s.icon sx={{ fontSize: 16, color: s.color }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.65rem', color: '#7d8590', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</Typography>
                    <Typography variant="h6" sx={{ color: '#f0f6fc', lineHeight: 1.2, fontSize: '1.2rem', fontWeight: 800 }}>{s.value}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters & Search */}
      <Stack direction="row" sx={{ gap: 1.5, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search name, ID, phone..."
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 260 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 18, color: '#7d8590' }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <Chip
              key={f.value}
              label={`${f.label} ${counts[f.value as keyof typeof counts] > 0 ? `(${counts[f.value as keyof typeof counts]})` : ''}`}
              clickable
              size="small"
              color={activeFilter === f.value ? 'primary' : 'default'}
              variant={activeFilter === f.value ? 'filled' : 'outlined'}
              onClick={() => setActiveFilter(activeFilter === f.value ? 'ALL' : f.value)}
              sx={{ fontWeight: 600, height: 26 }}
            />
          ))}
        </Stack>
      </Stack>

      {/* DataGrid */}
      <Card elevation={0}>
        <Box
          onContextMenuCapture={handleRowContextMenu}
          onPointerDownCapture={handleRowPointerDown}
          onPointerUpCapture={cancelLongPress}
          onPointerMoveCapture={cancelLongPress}
          onPointerCancelCapture={cancelLongPress}
          sx={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'pan-y',
          }}
        >
          <DataGrid
          rows={filtered}
          columns={columns}
          rowHeight={60}
          onRowClick={params => {
            if (longPressTriggered.current) {
              longPressTriggered.current = false;
              return;
            }
            router.push(`/members/${params.row.id}`);
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            },
            '& .MuiDataGrid-columnHeaderTitle': { fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7d8590' },
            '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' },
            '& .MuiDataGrid-row:hover': { bgcolor: 'rgba(16,185,129,0.04)', cursor: 'pointer' },
            '& .MuiDataGrid-footerContainer': { borderTop: '1px solid rgba(255,255,255,0.06)' },
          }}
          />
        </Box>
      </Card>

      <Menu
        anchorEl={actionAnchor}
        anchorReference={actionPosition ? 'anchorPosition' : 'anchorEl'}
        anchorPosition={actionPosition || undefined}
        open={Boolean(actionAnchor || actionPosition)}
        onClose={closeActions}
        slotProps={{ paper: { sx: { minWidth: 220, bgcolor: '#161b22', border: '1px solid rgba(255,255,255,0.08)' } } }}
      >
        <MenuItem onClick={() => runMemberAction('view')}>
          <ListItemIcon><VisibilityRoundedIcon fontSize="small" sx={{ color: '#a78bfa' }} /></ListItemIcon>
          <ListItemText primary="View profile" secondary="Open full member details" />
        </MenuItem>
        <MenuItem onClick={() => runMemberAction('renew')}>
          <ListItemIcon><AutorenewRoundedIcon fontSize="small" sx={{ color: '#10b981' }} /></ListItemIcon>
          <ListItemText primary="Renew plan" secondary="Review membership options" />
        </MenuItem>
        <MenuItem onClick={() => runMemberAction('attendance')}>
          <ListItemIcon><HowToRegRoundedIcon fontSize="small" sx={{ color: '#06b6d4' }} /></ListItemIcon>
          <ListItemText primary="Mark attendance" secondary="Open manual check-in" />
        </MenuItem>
        <MenuItem onClick={() => runMemberAction('payment')}>
          <ListItemIcon><PaymentsRoundedIcon fontSize="small" sx={{ color: '#f59e0b' }} /></ListItemIcon>
          <ListItemText primary="Record payment" secondary="Open payment entry" />
        </MenuItem>
      </Menu>

      <RenewMembershipDialog
        open={renewOpen}
        memberId={renewMemberId ?? ''}
        memberName={renewMemberId ? `${members.find(member => member.id === renewMemberId)?.firstName ?? ''} ${members.find(member => member.id === renewMemberId)?.lastName ?? ''}`.trim() : undefined}
        plans={renewPlans}
        onClose={() => {
          setRenewOpen(false);
          setRenewMemberId(null);
        }}
        onSuccess={() => setFetchTrigger(trigger => trigger + 1)}
      />

      {/* Add Member Dialog */}
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: {
              backgroundImage: 'none',
              maxHeight: { xs: '100%', sm: 'calc(100% - 64px)' },
            },
          },
        }}
      >
        <Box component="form" onSubmit={handleAddSubmit}>
          <DialogTitle sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 }, pb: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>Add New Member</Typography>
            <Typography variant="body2" sx={{ color: '#7d8590', mt: 0.5 }}>
              Create a member profile to start tracking their fitness journey.
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 2, sm: 3 }, pb: 1 }}>
            {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}

            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.08em' }}>
              Personal details
            </Typography>
            <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: 0.25 }}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="First Name" required autoComplete="given-name" value={addForm.firstName} onChange={e => setAddForm({ ...addForm, firstName: e.target.value })} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Last Name" required autoComplete="family-name" value={addForm.lastName} onChange={e => setAddForm({ ...addForm, lastName: e.target.value })} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Phone" required type="tel" autoComplete="tel" value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Email" type="email" autoComplete="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Date of Birth"
                  type="date"
                  required
                  value={addForm.dob}
                  onChange={e => setAddForm({ ...addForm, dob: e.target.value })}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: new Date().toISOString().split('T')[0] } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Gender" select value={addForm.gender} onChange={e => setAddForm({ ...addForm, gender: e.target.value })} fullWidth>
                  <MenuItem value=""><em>Prefer not to say</em></MenuItem>
                  {['MALE', 'FEMALE', 'OTHER'].map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>

            <Typography variant="overline" sx={{ display: 'block', color: 'primary.main', fontWeight: 800, letterSpacing: '0.08em', mt: 2.5 }}>
              Membership details
            </Typography>
            <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: 0.25 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Join Date"
                  type="date"
                  required
                  value={addForm.joinDate} onChange={e => setAddForm({ ...addForm, joinDate: e.target.value })}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Fitness Goal" value={addForm.goal} onChange={e => setAddForm({ ...addForm, goal: e.target.value })} fullWidth placeholder="e.g. Weight Loss" /></Grid>
            </Grid>

            <Typography variant="overline" sx={{ display: 'block', color: 'primary.main', fontWeight: 800, letterSpacing: '0.08em', mt: 2.5 }}>
              Additional information
            </Typography>
            <TextField label="Address" value={addForm.address} onChange={e => setAddForm({ ...addForm, address: e.target.value })} fullWidth multiline minRows={2} sx={{ mt: 0.25 }} />
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 }, gap: 1, flexDirection: { xs: 'column-reverse', sm: 'row' }, '& > button': { width: { xs: '100%', sm: 'auto' }, minHeight: 44 } }}>
            <Button onClick={() => setAddOpen(false)} variant="outlined" disabled={addLoading}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={addLoading}>
              {addLoading ? <CircularProgress size={24} /> : 'Create Member'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </AppLayout>
  );
}

function MembersPageFallback() {
  return (
    <AppLayout>
      <Box sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ color: '#f0f6fc', fontWeight: 800 }}>Members</Typography>
        <Typography variant="body2" sx={{ color: '#7d8590', mt: 0.25 }}>
          Loading member directory...
        </Typography>
      </Box>
    </AppLayout>
  );
}

export default function MembersPage() {
  return (
    <Suspense fallback={<MembersPageFallback />}>
      <MembersPageContent />
    </Suspense>
  );
}
