'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Card, CardContent, Typography, Button, Chip, Tabs, Tab,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { mockPayments } from '@/lib/mockData';

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

const statusColor: Record<string, any> = {
  PAID: 'success', PENDING: 'warning', PARTIALLY_PAID: 'warning',
  FAILED: 'error', REFUNDED: 'default', CANCELLED: 'default', PROCESSING: 'info',
};

export default function PaymentsPage() {
  const [tab, setTab] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = mockPayments.filter(p =>
    statusFilter === 'ALL' || p.status === statusFilter
  );

  const totalRevenue = mockPayments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = mockPayments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);

  return (
    <AppLayout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Payments & Billing</Typography>
          <Typography variant="body2" color="text.secondary">Manage member payments and invoices</Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<ReceiptIcon />} size="small">Generate Invoice</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>Record Payment</Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Total Collected', value: `₹${totalRevenue.toLocaleString()}`, color: '#10b981' },
          { label: 'Pending Amount', value: `₹${totalPending.toLocaleString()}`, color: '#f59e0b' },
          { label: 'Total Transactions', value: mockPayments.length, color: '#06b6d4' },
          { label: 'Refunds', value: '₹0', color: '#ef4444' },
        ].map(s => (
          <Grid item xs={6} md={3} key={s.label}>
            <Card elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>{s.label}</Typography>
                <Typography variant="h5" fontWeight="bold" mt={0.5} sx={{ color: s.color }}>{s.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
        {['ALL', 'PAID', 'PENDING', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED'].map(f => (
          <Chip
            key={f}
            label={f}
            clickable
            size="small"
            color={statusFilter === f ? 'primary' : 'default'}
            variant={statusFilter === f ? 'filled' : 'outlined'}
            onClick={() => setStatusFilter(f)}
          />
        ))}
      </Box>

      {/* Payments Table */}
      <Card elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Member</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Ref ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(p => (
              <TableRow key={p.id} sx={{ '&:hover': { bgcolor: 'rgba(16,185,129,0.04)' } }}>
                <TableCell><Typography variant="caption" color="text.secondary">{p.id}</Typography></TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{p.member}</Typography>
                  <Typography variant="caption" color="text.secondary">{p.memberId}</Typography>
                </TableCell>
                <TableCell><Typography variant="caption">{p.plan}</Typography></TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">₹{p.amount.toLocaleString()}</Typography>
                </TableCell>
                <TableCell><Chip label={p.method} size="small" variant="outlined" /></TableCell>
                <TableCell><Typography variant="caption" color="text.secondary">{p.refId || '—'}</Typography></TableCell>
                <TableCell><Typography variant="caption">{p.date}</Typography></TableCell>
                <TableCell>
                  <Chip label={p.status} size="small" color={statusColor[p.status] || 'default'} />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5}>
                    <Button size="small" variant="text">Receipt</Button>
                    {p.status === 'PAID' && <Button size="small" variant="text" color="error">Refund</Button>}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add Payment Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper' } }}>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12}><TextField label="Member" fullWidth size="small" placeholder="Search member..." /></Grid>
            <Grid item xs={6}><TextField label="Amount (₹)" type="number" fullWidth size="small" /></Grid>
            <Grid item xs={6}>
              <TextField label="Payment Method" select fullWidth size="small">
                {['Cash', 'UPI', 'Card', 'Online'].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}><TextField label="UPI/Card Reference ID" fullWidth size="small" placeholder="Optional" /></Grid>
            <Grid item xs={6}><TextField label="Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}>
              <TextField label="Plan" select fullWidth size="small">
                {['Monthly Pro', 'Quarterly Gold', 'Half-Yearly Elite', 'Yearly Platinum'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Apply Discount (%)" type="number" fullWidth size="small" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddOpen(false)}>Record Payment</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
