'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  TextField, MenuItem, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Stack, alpha, IconButton, Menu, ListItemIcon, ListItemText,
  Tooltip,
} from '@mui/material';
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
import { mockMembers } from '@/lib/mockData';

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
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState(() => {
    const filter = searchParams.get('filter');
    return filter && FILTERS.some(option => option.value === filter) ? filter : 'ALL';
  });
  const [addOpen, setAddOpen] = useState(false);
  const [actionAnchor, setActionAnchor] = useState<null | HTMLElement>(null);
  const [actionMemberId, setActionMemberId] = useState<string | null>(null);

  const openActions = (event: React.MouseEvent<HTMLElement>, memberId: string) => {
    event.stopPropagation();
    setActionAnchor(event.currentTarget);
    setActionMemberId(memberId);
  };

  const closeActions = () => {
    setActionAnchor(null);
    setActionMemberId(null);
  };

  const runMemberAction = (action: 'view' | 'renew' | 'attendance' | 'payment') => {
    if (!actionMemberId) return;
    const member = mockMembers.find(item => item.id === actionMemberId);
    closeActions();
    if (!member) return;

    if (action === 'view' || action === 'renew') {
      router.push(`/members/${member.id}${action === 'renew' ? '?action=renew' : ''}`);
    } else if (action === 'attendance') {
      router.push(`/attendance?member=${encodeURIComponent(`${member.firstName} ${member.lastName}`)}`);
    } else {
      router.push(`/payments?memberId=${member.id}`);
    }
  };

  const filtered = mockMembers.filter(m => {
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
    ALL: mockMembers.length,
    ACTIVE: mockMembers.filter(m => m.membershipStatus === 'ACTIVE').length,
    EXPIRING: mockMembers.filter(m => m.membershipStatus === 'EXPIRING').length,
    EXPIRED: mockMembers.filter(m => m.membershipStatus === 'EXPIRED').length,
    PAYMENT_PENDING: mockMembers.filter(m => m.paymentStatus !== 'PAID').length,
    NO_TRAINER: mockMembers.filter(m => !m.trainer).length,
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
            {mockMembers.length} total members across all branches
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
              onClick={() => setActiveFilter(s.filter)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActiveFilter(s.filter);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Show ${s.label} members`}
              sx={{ cursor: 'pointer', transition: 'border-color 0.2s, transform 0.18s', '&:hover': { borderColor: alpha(s.color, 0.55), transform: 'translateY(-2px)' } }}
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
              onClick={() => setActiveFilter(f.value)}
              sx={{ fontWeight: 600, height: 26 }}
            />
          ))}
        </Stack>
      </Stack>

      {/* DataGrid */}
      <Card elevation={0}>
        <DataGrid
          rows={filtered}
          columns={columns}
          rowHeight={60}
          onRowClick={params => router.push(`/members/${params.row.id}`)}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
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
      </Card>

      <Menu
        anchorEl={actionAnchor}
        open={Boolean(actionAnchor)}
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

      {/* Add Member Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Add New Member</Typography>
          <Typography variant="caption" sx={{ color: '#7d8590' }}>Fill in the member details below</Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="First Name" fullWidth size="small" /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Last Name" fullWidth size="small" /></Grid>
            <Grid size={12}><TextField label="Email" type="email" fullWidth size="small" /></Grid>
            <Grid size={12}><TextField label="Phone" fullWidth size="small" /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Gender" select fullWidth size="small">
                {['Male', 'Female', 'Other'].map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Date of Birth"
                type="date"
                fullWidth
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={12}><TextField label="Address" fullWidth size="small" multiline rows={2} /></Grid>
            <Grid size={12}>
              <TextField label="Membership Plan" select fullWidth size="small">
                {['Monthly Basic', 'Monthly Pro', 'Quarterly Gold', 'Half-Yearly Elite', 'Yearly Platinum'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Assigned Trainer" select fullWidth size="small">
                {['Amit Singh', 'Neha Gupta', 'Ravi Kumar', 'None'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField label="Fitness Goal" fullWidth size="small" placeholder="e.g. Weight Loss, Muscle Gain" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setAddOpen(false)} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={() => setAddOpen(false)}>Create Member</Button>
        </DialogActions>
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
