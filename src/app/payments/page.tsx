'use client';
import { Suspense, useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useSearchParams } from 'next/navigation';
import {
  Box, Card, CardContent, Typography, Button, Chip, Tabs, Tab,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Divider, CircularProgress, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { mockPayments } from '@/lib/mockData';
import { api } from '@/lib/api';

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const statusColor: Record<string, ChipColor> = {
  PAID: 'success', PENDING: 'warning', PARTIALLY_PAID: 'warning',
  FAILED: 'error', REFUNDED: 'default', CANCELLED: 'default', PROCESSING: 'info',
};

function PaymentsPageContent() {
  const searchParams = useSearchParams();
  const memberIdParam = searchParams.get('memberId') ?? '';
  const [tab, setTab] = useState(0);
  const [addOpen, setAddOpen] = useState(() => Boolean(memberIdParam));
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form state
  const [memberIdInput, setMemberIdInput] = useState(memberIdParam);
  const [amountInput, setAmountInput] = useState('');
  const [methodInput, setMethodInput] = useState('Cash');
  const [refIdInput, setRefIdInput] = useState('');
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState('');

  // ── API payments ────────────────────────────────────────────────────────────────
  const [apiPayments, setApiPayments] = useState<typeof mockPayments | null>(null);
  const [apiTotal, setApiTotal] = useState(0);

  const fetchPayments = () => {
    const params: Record<string, string> = { pageSize: '50' };
    if (statusFilter !== 'ALL') params.status = statusFilter;
    if (memberIdParam) params.memberId = memberIdParam;
    api.get('/payments', { params })
      .then(res => {
        const items = res.data?.items ?? [];
        setApiPayments(items.map((p: Record<string, unknown>) => ({
          id: String(p.id),
          member: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || String(p.memberName ?? ''),
          memberId: String(p.memberId ?? ''),
          amount: Number(p.amount ?? 0),
          method: String(p.method ?? p.paymentMethod ?? ''),
          status: String(p.status ?? ''),
          date: String(p.date ?? p.createdAt ?? '').split('T')[0],
          refId: String(p.referenceId ?? p.refId ?? ''),
          plan: String(p.plan ?? p.membershipPlan ?? ''),
        })));
        setApiTotal(res.data?.total ?? items.length);
      })
      .catch(() => setApiPayments(null));
  };

  useEffect(() => {
    fetchPayments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, memberIdParam]);

  const payments = apiPayments ?? mockPayments;
  const filtered = payments.filter(p => statusFilter === 'ALL' || p.status === statusFilter);
  const totalRevenue = filtered.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = filtered.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);
  const memberName = payments.find(p => p.memberId === memberIdParam)?.member ?? '';

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', mb: 3, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Payments & Billing</Typography>
          <Typography variant="body2" color="text.secondary">Manage member payments and invoices</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<ReceiptIcon />} size="small" fullWidth sx={{ width: { xs: '100%', sm: 'auto' } }}>Generate Invoice</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)} fullWidth sx={{ width: { xs: '100%', sm: 'auto' } }}>Record Payment</Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Collected', value: `₹${totalRevenue.toLocaleString()}`, color: '#10b981' },
          { label: 'Pending Amount', value: `₹${totalPending.toLocaleString()}`, color: '#f59e0b' },
          { label: 'Total Transactions', value: filtered.length, color: '#06b6d4' },
          { label: 'Refunds', value: '₹0', color: '#ef4444' },
        ].map(s => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={s.label}>
            <Card elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>{s.label}</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5, color: s.color }}>{s.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
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
                  <Box sx={{ display: "flex", gap: 0.5 }}>
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
          {addError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{addError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}><TextField label="Member ID" fullWidth size="small" placeholder="e.g. mbr-001" value={memberIdInput} onChange={e => setMemberIdInput(e.target.value)} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Amount (₹)" type="number" fullWidth size="small" value={amountInput} onChange={e => setAmountInput(e.target.value)} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Payment Method" select fullWidth size="small" value={methodInput} onChange={e => setMethodInput(e.target.value)}>
                {['Cash', 'UPI', 'Card', 'Online'].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={12}><TextField label="Reference ID" fullWidth size="small" placeholder="Optional" value={refIdInput} onChange={e => setRefIdInput(e.target.value)} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => { setAddOpen(false); setAddError(''); }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={addSubmitting || !memberIdInput || !amountInput}
            onClick={async () => {
              setAddSubmitting(true);
              setAddError('');
              try {
                await api.post('/payments', {
                  memberId: memberIdInput,
                  amount: Number(amountInput),
                  method: methodInput,
                  referenceId: refIdInput || undefined,
                });
                setAddOpen(false);
                setAmountInput('');
                setRefIdInput('');
                fetchPayments();
              } catch (err: unknown) {
                const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
                setAddError(msg ?? 'Failed to record payment.');
              } finally {
                setAddSubmitting(false);
              }
            }}
            startIcon={addSubmitting ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            {addSubmitting ? 'Saving...' : 'Record Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}

function PaymentsPageFallback() {
  return (
    <AppLayout>
      <Box sx={{ py: 3 }}>
        <Typography variant="h5" fontWeight="bold">Payments & Billing</Typography>
        <Typography variant="body2" color="text.secondary">Loading payments...</Typography>
      </Box>
    </AppLayout>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<PaymentsPageFallback />}>
      <PaymentsPageContent />
    </Suspense>
  );
}
