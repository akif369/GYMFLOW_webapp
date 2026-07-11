'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  TextField, MenuItem, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Drawer, Tabs, Tab, Divider
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { mockMembers } from '@/lib/mockData';

const statusColor: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  ACTIVE: 'success', EXPIRING: 'warning', EXPIRED: 'error',
  PAID: 'success', PENDING: 'warning', PARTIALLY_PAID: 'warning',
};

const FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Expiring Soon', value: 'EXPIRING' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Payment Pending', value: 'PAYMENT_PENDING' },
  { label: 'No Trainer', value: 'NO_TRAINER' },
];

export default function MembersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [addOpen, setAddOpen] = useState(false);

  const filtered = mockMembers.filter(m => {
    const matchSearch = `${m.firstName} ${m.lastName} ${m.phone} ${m.memberId}`.toLowerCase().includes(search.toLowerCase());
    let matchFilter = true;
    if (activeFilter === 'ACTIVE') matchFilter = m.membershipStatus === 'ACTIVE';
    if (activeFilter === 'EXPIRING') matchFilter = m.membershipStatus === 'EXPIRING';
    if (activeFilter === 'EXPIRED') matchFilter = m.membershipStatus === 'EXPIRED';
    if (activeFilter === 'PAYMENT_PENDING') matchFilter = m.paymentStatus === 'PENDING' || m.paymentStatus === 'PARTIALLY_PAID';
    if (activeFilter === 'NO_TRAINER') matchFilter = !m.trainer;
    return matchSearch && matchFilter;
  });

  const columns: GridColDef[] = [
    {
      field: 'photo',
      headerName: '',
      width: 56,
      sortable: false,
      renderCell: (params) => (
        <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.dark', fontSize: '0.8rem', mt: 0.75 }}>
          {params.row.firstName[0]}{params.row.lastName[0]}
        </Avatar>
      ),
    },
    { field: 'memberId', headerName: 'ID', width: 80 },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => (
        <Box mt={1}>
          <Typography variant="body2" fontWeight={600}>{params.row.firstName} {params.row.lastName}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.phone}</Typography>
        </Box>
      ),
    },
    { 
      field: 'planName', 
      headerName: 'Plan', 
      width: 150,
      valueGetter: (_value: any, row: any) => row.memberProfile?.membership?.planName || 'N/A'
    },
    { field: 'startDate', headerName: 'Start', width: 100 },
    { field: 'expiryDate', headerName: 'Expiry', width: 100 },
    {
      field: 'trainer',
      headerName: 'Trainer',
      width: 130,
      renderCell: (params) => params.value || <Typography variant="caption" color="text.secondary">—</Typography>,
    },
    { field: 'lastVisit', headerName: 'Last Visit', width: 100 },
    {
      field: 'paymentStatus',
      headerName: 'Payment',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={statusColor[params.value] || 'default'} sx={{ fontSize: '0.7rem' }} />
      ),
    },
    {
      field: 'membershipStatus',
      headerName: 'Membership',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={statusColor[params.value] || 'default'} sx={{ fontSize: '0.7rem' }} />
      ),
    },
  ];

  return (
    <AppLayout>
      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Members</Typography>
          <Typography variant="body2" color="text.secondary">{mockMembers.length} total members</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
          Add Member
        </Button>
      </Box>

      {/* Filters & Search */}
      <Box display="flex" gap={1.5} mb={2} flexWrap="wrap" alignItems="center">
        <TextField
          placeholder="Search by name, ID, phone..."
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 280 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        {FILTERS.map(f => (
          <Chip
            key={f.value}
            label={f.label}
            clickable
            color={activeFilter === f.value ? 'primary' : 'default'}
            variant={activeFilter === f.value ? 'filled' : 'outlined'}
            onClick={() => setActiveFilter(f.value)}
            sx={{ fontWeight: 600 }}
          />
        ))}
      </Box>

      {/* Data Grid */}
      <Card elevation={0} sx={{ height: 560 }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          rowHeight={58}
          onRowClick={params => router.push(`/members/${params.row.id}`)}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{ border: 0 }}
        />
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper' } }}>
        <DialogTitle>Add New Member</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={6}><TextField label="First Name" fullWidth size="small" /></Grid>
            <Grid item xs={6}><TextField label="Last Name" fullWidth size="small" /></Grid>
            <Grid item xs={12}><TextField label="Email" fullWidth size="small" /></Grid>
            <Grid item xs={12}><TextField label="Phone" fullWidth size="small" /></Grid>
            <Grid item xs={6}>
              <TextField label="Gender" select fullWidth size="small">
                {['Male', 'Female', 'Other'].map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}><TextField label="Date of Birth" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}>
              <TextField label="Membership Plan" select fullWidth size="small">
                {['Monthly Basic', 'Monthly Pro', 'Quarterly Gold', 'Half-Yearly Elite', 'Yearly Platinum'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}><TextField label="Start Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}><TextField label="Goal" fullWidth size="small" placeholder="e.g. Weight Loss" /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddOpen(false)}>Create Member</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
