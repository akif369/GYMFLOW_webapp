'use client';
import { Suspense, useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { useSearchParams } from 'next/navigation';
import {
  Box, Card, CardContent, Typography, Button, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, CircularProgress, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import RefreshIcon from '@mui/icons-material/Refresh';
import { api } from '@/lib/api';

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const statusColor: Record<string, ChipColor> = {
  PAID: 'success', PENDING: 'warning', PARTIALLY_PAID: 'warning',
  FAILED: 'error', REFUNDED: 'default', CANCELLED: 'default', PROCESSING: 'info',
};

type Payment = {
  id: string;
  member: string;
  memberId: string;
  amount: number;
  method: string;
  status: string;
  date: string;
  refId: string;
  description: string;
};

function PaymentsPageContent() {
  const searchParams = useSearchParams();
  const memberIdParam = searchParams.get('memberId') ?? '';
  const [addOpen, setAddOpen] = useState(() => Boolean(memberIdParam));
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Form state
  const [memberIdInput, setMemberIdInput] = useState(memberIdParam);
  const [amountInput, setAmountInput] = useState('');
  const [methodInput, setMethodInput] = useState('CASH');
  const [refIdInput, setRefIdInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState('');

  // Refund state
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundPayment, setRefundPayment] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundError, setRefundError] = useState('');

  // ── API payments ─────────────────────────────────────────────────────────────
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPayments = useCallback((reset = true) => {
    setLoading(true);
    const params: Record<string, string> = { pageSize: '50', page: String(reset ? 1 : page) };
    if (statusFilter !== 'ALL') params.status = statusFilter;
    if (memberIdParam) params.memberId = memberIdParam;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    api.get('/payments', { params })
      .then(res => {
        const items = res.data?.items ?? [];
        const mapped: Payment[] = items.map((p: Record<string, unknown>) => ({
          id: String(p.id),
          member: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || String(p.memberName ?? ''),
          memberId: String(p.memberId ?? ''),
          amount: Number(p.totalAmount ?? p.amount ?? 0),
          method: String(p.paymentMethod ?? p.method ?? ''),
          status: String(p.status ?? ''),
          date: String(p.createdAt ?? p.date ?? '').split('T')[0],
          refId: String(p.referenceId ?? p.refId ?? ''),
          description: String(p.description ?? ''),
        }));
        if (reset) {
          setPayments(mapped);
          setPage(2);
        } else {
          setPayments(prev => [...prev, ...mapped]);
          setPage(p => p + 1);
        }
        setTotal(res.data?.total ?? (reset ? mapped.length : total + mapped.length));
        setHasMore(items.length === 50);
      })
      .catch(() => { if (reset) setPayments([]); })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, memberIdParam, dateFrom, dateTo, page]);

  useEffect(() => {
    fetchPayments(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, memberIdParam, dateFrom, dateTo]);

  const filtered = payments.filter(p => statusFilter === 'ALL' || p.status === statusFilter);
  const totalRevenue = filtered.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = filtered.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = filtered.filter(p => p.status === 'REFUNDED').reduce((sum, p) => sum + p.amount, 0);

  const memberName = payments.find(p => p.memberId === memberIdParam)?.member ?? '';

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', mb: 3, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Payments & Billing</Typography>
          {memberIdParam && memberName && (
            <Typography variant="body2" color="text.secondary">Showing payments for: <strong>{memberName}</strong></Typography>
          )}
          {!memberIdParam && (
            <Typography variant="body2" color="text.secondary">Manage member payments and invoices</Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} size="small" onClick={() => fetchPayments(true)}>Refresh</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setAddOpen(true); setAddError(''); }} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            Record Payment
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Collected', value: `₹${totalRevenue.toLocaleString()}`, color: '#10b981' },
          { label: 'Pending Amount', value: `₹${totalPending.toLocaleString()}`, color: '#f59e0b' },
          { label: 'Total Transactions', value: total, color: '#06b6d4' },
          { label: 'Refunded', value: `₹${totalRefunded.toLocaleString()}`, color: '#ef4444' },
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
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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
        <Box sx={{ flex: 1 }} />
        <TextField
          size="small" label="From" type="date" value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 140 }}
        />
        <TextField
          size="small" label="To" type="date" value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 140 }}
        />
        {(dateFrom || dateTo) && (
          <Button size="small" variant="text" onClick={() => { setDateFrom(''); setDateTo(''); }}>Clear dates</Button>
        )}
      </Box>

      {/* Payments Table */}
      <Card elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Member</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Ref ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="caption" color="text.secondary">No payments found</Typography>
                </TableCell>
              </TableRow>
            ) : filtered.map(p => (
              <TableRow key={p.id} sx={{ '&:hover': { bgcolor: 'rgba(16,185,129,0.04)' } }}>
                <TableCell><Typography variant="caption">{p.date}</Typography></TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{p.member || '—'}</Typography>
                </TableCell>
                <TableCell><Typography variant="caption" color="text.secondary">{p.description || '—'}</Typography></TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">₹{p.amount.toLocaleString()}</Typography>
                </TableCell>
                <TableCell><Chip label={p.method || 'CASH'} size="small" variant="outlined" /></TableCell>
                <TableCell><Typography variant="caption" color="text.secondary">{p.refId || '—'}</Typography></TableCell>
                <TableCell>
                  <Chip label={p.status} size="small" color={statusColor[p.status] || 'default'} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {p.status === 'PAID' && (
                      <Button
                        size="small" variant="text" color="error"
                        onClick={() => { setRefundPayment(p); setRefundReason(''); setRefundError(''); setRefundOpen(true); }}
                      >
                        Refund
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {hasMore && payments.length > 0 && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Button size="small" onClick={() => fetchPayments(false)} disabled={loading}>
              {loading ? <CircularProgress size={16} /> : 'Load more'}
            </Button>
          </Box>
        )}
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          {addError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{addError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField
                label="Member ID (UUID)"
                fullWidth size="small"
                placeholder="e.g. d738f360-d6d3-47c8-bc46-ce197ed53bce"
                value={memberIdInput}
                onChange={e => setMemberIdInput(e.target.value)}
                helperText="Member's UUID from their profile URL"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Amount (₹)" type="number" fullWidth size="small" value={amountInput} onChange={e => setAmountInput(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Payment Method" select fullWidth size="small" value={methodInput} onChange={e => setMethodInput(e.target.value)}>
                {['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE'].map(m => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField label="Description" fullWidth size="small" placeholder="e.g. Monthly membership renewal" value={descInput} onChange={e => setDescInput(e.target.value)} />
            </Grid>
            <Grid size={12}>
              <TextField label="Reference ID (Optional)" fullWidth size="small" placeholder="UPI transaction ID, cheque no., etc." value={refIdInput} onChange={e => setRefIdInput(e.target.value)} />
            </Grid>
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
                  paymentMethod: methodInput,
                  description: descInput || undefined,
                  referenceId: refIdInput || undefined,
                });
                setAddOpen(false);
                setAmountInput('');
                setRefIdInput('');
                setDescInput('');
                fetchPayments(true);
              } catch (err: unknown) {
                const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
                setAddError(msg ?? 'Failed to record payment.');
              } finally {
                setAddSubmitting(false);
              }
            }}
            startIcon={addSubmitting ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            {addSubmitting ? 'Saving…' : 'Record Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundOpen} onClose={() => setRefundOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <DialogTitle>Refund Payment</DialogTitle>
        <DialogContent>
          {refundError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{refundError}</Alert>}
          {refundPayment && (
            <Alert severity="warning" sx={{ mb: 2, mt: 1 }}>
              Refunding <strong>₹{refundPayment.amount.toLocaleString()}</strong> for {refundPayment.member || 'member'}
            </Alert>
          )}
          <TextField
            label="Reason for Refund"
            fullWidth size="small"
            multiline rows={2}
            value={refundReason}
            onChange={e => setRefundReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setRefundOpen(false)}>Cancel</Button>
          <Button
            variant="contained" color="error"
            disabled={refundSubmitting}
            onClick={async () => {
              if (!refundPayment) return;
              setRefundSubmitting(true); setRefundError('');
              try {
                await api.post(`/payments/${refundPayment.id}/refund`, { reason: refundReason });
                setRefundOpen(false);
                fetchPayments(true);
              } catch (err: unknown) {
                const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
                setRefundError(msg ?? 'Failed to process refund.');
              } finally {
                setRefundSubmitting(false);
              }
            }}
            startIcon={refundSubmitting ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            {refundSubmitting ? 'Processing…' : 'Confirm Refund'}
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
        <Typography variant="body2" color="text.secondary">Loading payments…</Typography>
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
