'use client';
import { Suspense, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  TextField, MenuItem, InputAdornment, Stack, alpha, IconButton, Menu, ListItemIcon, ListItemText,
  Tooltip,
} from '@mui/material';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';

import PersonOffRoundedIcon from '@mui/icons-material/PersonOffRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import { usePresignedUrl } from '@/hooks/usePresignedUrl';
import RenewMembershipDialog from '@/components/RenewMembershipDialog';
import AddMemberDialog from '@/components/AddMemberDialog';
import { useResponsivePageSize } from '@/hooks/useResponsivePageSize';
import { useMembers, useMembershipPlans } from '@/hooks/queries/members';
import { useBranches } from '@/hooks/queries/branches';
import { formatDateOnly } from '@/lib/date';
import { usePersistedDataGridState } from '@/hooks/usePersistedDataGridState';

// ── MemberAvatar — resolves an S3 key to a presigned URL and renders avatar ──
function MemberAvatar({ photoKey, firstName, lastName }: { photoKey: unknown; firstName: string; lastName: string }) {
  const key = typeof photoKey === 'string' && photoKey ? photoKey : null;
  const { url } = usePresignedUrl(key);
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`;
  return (
    <Avatar
      src={url ?? undefined}
      sx={{
        width: 34, height: 34,
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: '#000', fontSize: '0.7rem', fontWeight: 800,
        mt: 1.2,
      }}
    >
      {!url && initials}
    </Avatar>
  );
}



const statusColor: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  ACTIVE: 'success', EXPIRING: 'warning', EXPIRED: 'error',
  PAYMENT_PENDING: 'warning',
  PAID: 'success', PENDING: 'warning', PARTIALLY_PAID: 'warning', INACTIVE: 'default',
};

const FILTERS = [
  { label: 'All Members', value: 'ALL', icon: '👥' },
  { label: 'Active', value: 'ACTIVE', icon: '✅' },
  { label: 'Expiring Soon', value: 'EXPIRING', icon: '⏳' },
  { label: 'Expired', value: 'EXPIRED', icon: '❌' },
  { label: 'Inactive', value: 'INACTIVE', icon: '😴' },
  { label: 'Payment Pending', value: 'PAYMENT_PENDING', icon: '💳' },
  { label: 'No Trainer', value: 'NO_TRAINER', icon: '🏃' },
];



function MembersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();


  const defaultPageSize = useResponsivePageSize();
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
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: defaultPageSize });
  const tableState = usePersistedDataGridState('gymflow.members.table.v1');

  const { data: plansData } = useMembershipPlans();
  const renewPlans = plansData ?? [];

  const { data: branchesData } = useBranches();
  const branches = branchesData?.branches || [];

  const queryParams: Record<string, string> = {
    page: String(paginationModel.page + 1),
    pageSize: String(paginationModel.pageSize),
  };
  if (search) queryParams.search = search;
  if (activeFilter !== 'ALL') {
    if (activeFilter === 'PAYMENT_PENDING') {
      queryParams.paymentStatus = 'PENDING';
    } else if (activeFilter === 'ACTIVE' || activeFilter === 'EXPIRED') {
      queryParams.membershipStatus = activeFilter;
    }
  }

  const { data: membersData, isLoading: apiLoading, refetch: refetchMembers } = useMembers(queryParams);
  const members = membersData?.items ?? [];
  const totalCount = membersData?.total ?? 0;
  const strictPaymentPolicy = membersData?.strictPaymentPolicy ?? false;

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
    const member = members.find((item: any) => item.id === actionMemberId);
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

  // Always apply local filter because the backend doesn't natively support all compound statuses yet (like EXPIRING)
  const filtered = members.filter((m: any) => {
    const matchSearch = `${m.firstName} ${m.lastName} ${m.phone} ${m.memberId}`.toLowerCase().includes(search.toLowerCase());
    let matchFilter = true;
    if (activeFilter === 'ACTIVE') matchFilter = m.membershipStatus === 'ACTIVE';
    if (activeFilter === 'EXPIRING') matchFilter = m.membershipStatus === 'EXPIRING';
    if (activeFilter === 'EXPIRED') matchFilter = m.membershipStatus === 'EXPIRED';
    if (activeFilter === 'INACTIVE') matchFilter = m.membershipStatus === 'INACTIVE';
    if (activeFilter === 'PAYMENT_PENDING') matchFilter = m.membershipStatus === 'PAYMENT_PENDING';
    if (activeFilter === 'NO_TRAINER') matchFilter = !m.trainer;
    return matchSearch && matchFilter;
  });

  const counts = {
    ALL: totalCount,
    ACTIVE: members.filter((m: any) => m.membershipStatus === 'ACTIVE').length,
    EXPIRING: members.filter((m: any) => m.membershipStatus === 'EXPIRING').length,
    EXPIRED: members.filter((m: any) => m.membershipStatus === 'EXPIRED').length,
    INACTIVE: members.filter((m: any) => m.membershipStatus === 'INACTIVE').length,
    PAYMENT_PENDING: members.filter((m: any) => m.membershipStatus === 'PAYMENT_PENDING').length,
    NO_TRAINER: members.filter((m: any) => !m.trainer).length,
  };

  const paymentColumn: GridColDef = {
    field: 'paymentStatus',
    headerName: 'Payment',
    width: 120,
    renderCell: p => <Chip label={p.value} size="small" color={statusColor[p.value] || 'default'} />,
  };

  const columns: GridColDef[] = [
    {
      field: '__avatar',
      headerName: '',
      width: 52,
      sortable: false,
      disableColumnMenu: true,
      hideable: false,
      renderCell: (params) => (
        <MemberAvatar
          photoKey={params.row.photoUrl}
          firstName={params.row.firstName}
          lastName={params.row.lastName}
        />
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
          <Typography sx={{ fontWeight: 600, fontSize: '0.83rem', color: 'text.primary' }}>
            {params.row.firstName} {params.row.lastName}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            #{params.row.memberId} · {params.row.phone}
          </Typography>
        </Box>
      ),
    },
    { field: 'plan', headerName: 'Plan', width: 150, renderCell: p => <Typography sx={{ fontSize: '0.8rem', color: 'text.primary' }}>{p.value}</Typography> },
    { field: 'startDate', headerName: 'Start', width: 116, renderCell: p => <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>{formatDateOnly(p.value)}</Typography> },
    {
      field: 'expiryDate',
      headerName: 'Expiry',
      width: 116,
      renderCell: (p) => {
        const isExpired = p.row.membershipStatus === 'EXPIRED';
        const isActive = p.row.membershipStatus === 'ACTIVE';
        const isExpiring = p.row.membershipStatus === 'EXPIRING';
        return (
          <Typography sx={{
            fontSize: '0.78rem',
            color: isExpired ? 'error.main' : isActive ? 'success.main' : isExpiring ? 'warning.main' : 'text.secondary',
            fontWeight: isExpired || isActive || isExpiring ? 600 : 400,
            whiteSpace: 'nowrap',
          }}>
            {formatDateOnly(p.value)}
          </Typography>
        );
      },
    },
    {
      field: 'trainer',
      headerName: 'Trainer',
      width: 130,
      renderCell: p => p.value
        ? <Typography sx={{ fontSize: '0.78rem', color: 'text.primary' }}>{p.value}</Typography>
        : <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontStyle: 'italic' }}>Unassigned</Typography>,
    },
    { field: 'lastVisit', headerName: 'Last Visit', width: 116, renderCell: p => <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>{formatDateOnly(p.value)}</Typography> },
    ...(strictPaymentPolicy ? [paymentColumn] : []),
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
      hideable: false,
      renderCell: params => (
        <Tooltip title="Member actions">
          <IconButton
            size="small"
            aria-label={`Actions for ${params.row.firstName} ${params.row.lastName}`}
            onClick={event => openActions(event, params.row.id)}
            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'rgba(255,255,255,0.08)' } }}
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
          <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800 }}>Members</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
            {totalCount} total members across all branches
          </Typography>
        </Box>
        <Stack direction="row" sx={{ gap: 1 }}>
          <Tooltip title="Refresh members">
            <IconButton onClick={() => refetchMembers()} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <RefreshRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setAddOpen(true)}>
            Add Member
          </Button>
        </Stack>
      </Stack>

      {/* Summary strip */}
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        {[
          { label: 'Active', value: counts.ACTIVE, filter: 'ACTIVE', color: '#10b981', icon: PeopleRoundedIcon },
          { label: 'Expiring (7d)', value: counts.EXPIRING, filter: 'EXPIRING', color: '#f59e0b', icon: AutorenewRoundedIcon },
          { label: 'Expired', value: counts.EXPIRED, filter: 'EXPIRED', color: '#f43f5e', icon: PersonOffRoundedIcon },
          { label: 'Inactive', value: counts.INACTIVE, filter: 'INACTIVE', color: '#64748b', icon: PersonOffRoundedIcon },
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
                    <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</Typography>
                    <Typography variant="h6" sx={{ color: 'text.primary', lineHeight: 1.2, fontSize: '1.2rem', fontWeight: 800 }}>{s.value}</Typography>
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
                  <SearchRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
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
            rowCount={totalCount}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: defaultPageSize } } }}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            paginationMode="server"
            columnVisibilityModel={tableState.columnVisibilityModel}
            onColumnVisibilityModelChange={tableState.onColumnVisibilityModelChange}
            sortModel={tableState.sortModel}
            onSortModelChange={tableState.onSortModelChange}
            filterModel={tableState.filterModel}
            onFilterModelChange={tableState.onFilterModelChange}
            loading={apiLoading}
            disableRowSelectionOnClick
            sx={{
              border: 0,
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid', borderBottomColor: 'divider',
              },
              '& .MuiDataGrid-columnHeaderTitle': { fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' },
              '& .MuiDataGrid-cell': { borderBottom: '1px solid', borderBottomColor: 'divider', alignItems: 'center' },
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
        slotProps={{ paper: { sx: { minWidth: 220, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' } } }}
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
        memberName={renewMemberId ? `${members.find((member: any) => member.id === renewMemberId)?.firstName ?? ''} ${members.find((member: any) => member.id === renewMemberId)?.lastName ?? ''}`.trim() : undefined}
        plans={renewPlans}
        onClose={() => {
          setRenewOpen(false);
          setRenewMemberId(null);
        }}
        onSuccess={() => {}}
      />

      <AddMemberDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => refetchMembers()}
        branches={branches}
      />
    </AppLayout>
  );
}

function MembersPageFallback() {
  return (
    <AppLayout>
      <Box sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800 }}>Members</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
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
