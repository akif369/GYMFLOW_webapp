'use client';
import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageSkeleton from '@/components/PageSkeleton';
import AppLayout from '@/components/AppLayout';
import {
  Box, Card, CardContent, Typography, Button, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, CircularProgress, Alert, TablePagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { api } from '@/lib/api';
import MemberSearchField from '@/components/MemberSearchField';
import { useResponsivePageSize } from '@/hooks/useResponsivePageSize';

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

type Invoice = {
  id: string;
  invoiceNumber: string;
  memberId: string;
  memberName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  dueDate: string;
  publicViewUrl: string;
};

function PaymentsPageContent() {
  const searchParams = useSearchParams();
  const defaultPageSize = useResponsivePageSize();
  const memberIdParam = searchParams.get('memberId') ?? '';
  const searchParam = searchParams.get('search') ?? '';
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

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceLoading, setInvoiceLoading] = useState(true);
  const [invoiceTotal, setInvoiceTotal] = useState(-1);
  const [invoicePage, setInvoicePage] = useState(0);
  const [invoiceRowsPerPage, setInvoiceRowsPerPage] = useState(defaultPageSize);
  const [invoiceCursors, setInvoiceCursors] = useState<string[]>(['']);
  const [invoiceSendingId, setInvoiceSendingId] = useState<string | null>(null);
  const [invoiceNotice, setInvoiceNotice] = useState('');
  const [invoiceError, setInvoiceError] = useState('');
  const [generateInvoiceOpen, setGenerateInvoiceOpen] = useState(false);
  const [generateInvoiceSubmitting, setGenerateInvoiceSubmitting] = useState(false);
  const [generateInvoiceForm, setGenerateInvoiceForm] = useState({ memberId: memberIdParam, description: 'Membership fee', amount: '', gstPercent: '18', dueDate: '' });
  const [taxSettings, setTaxSettings] = useState({ taxRate: 18, taxIncluded: true });

  // ── API payments ─────────────────────────────────────────────────────────────
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(-1);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);
  const [paymentCursors, setPaymentCursors] = useState<string[]>(['']);

  const fetchPayments = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = { pageSize: String(rowsPerPage) };
    const currentCursor = paymentCursors[page];
    if (currentCursor) params.cursor = currentCursor;
    if (statusFilter !== 'ALL') params.status = statusFilter;
    if (memberIdParam) params.memberId = memberIdParam;
    if (searchParam) params.search = searchParam;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    api.get('/payments', { params })
      .then(res => {
        const items = (res.data?.data ?? res.data?.items) ?? [];
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
        setPayments(mapped);
        setTotal(res.data?.pagination?.hasMore ? -1 : page * rowsPerPage + mapped.length);
        if (res.data?.pagination?.nextCursor) {
          setPaymentCursors(prev => {
            const next = [...prev];
            next[page + 1] = res.data.pagination.nextCursor;
            return next;
          });
        }
      })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, [statusFilter, memberIdParam, searchParam, dateFrom, dateTo, page, rowsPerPage, paymentCursors]);

  useEffect(() => {
    const timer = window.setTimeout(fetchPayments, 0);
    return () => window.clearTimeout(timer);
  }, [fetchPayments]);

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        const tax = res.data?.settings?.tax;
        if (tax && typeof tax === 'object') {
          const taxRate = Number((tax as Record<string, unknown>).taxRate);
          const taxIncluded = (tax as Record<string, unknown>).taxIncluded !== false;
          setTaxSettings({ taxRate: Number.isFinite(taxRate) ? taxRate : 18, taxIncluded });
          setGenerateInvoiceForm(form => ({ ...form, gstPercent: String(Number.isFinite(taxRate) ? taxRate : 18) }));
        }
      })
      .catch(() => undefined);

    setInvoiceLoading(true);
    const invParams: Record<string, string> = { pageSize: String(invoiceRowsPerPage) };
    const invCursor = invoiceCursors[invoicePage];
    if (invCursor) invParams.cursor = invCursor;
    
    api.get('/invoices', { params: invParams })
      .then(res => {
        const items = (res.data?.data ?? res.data?.items) ?? [];
        setInvoiceTotal(res.data?.pagination?.hasMore ? -1 : invoicePage * invoiceRowsPerPage + items.length);
        if (res.data?.pagination?.nextCursor) {
          setInvoiceCursors(prev => {
            const next = [...prev];
            next[invoicePage + 1] = res.data.pagination.nextCursor;
            return next;
          });
        }
        setInvoices(items.map((invoice: Record<string, unknown>) => ({
          id: String(invoice.id),
          invoiceNumber: String(invoice.invoiceNumber ?? ''),
          memberId: String(invoice.memberId ?? ''),
          memberName: String(invoice.memberName ?? ''),
          totalAmount: Number(invoice.totalAmount ?? 0),
          status: String(invoice.status ?? ''),
          createdAt: String(invoice.createdAt ?? '').split('T')[0],
          dueDate: invoice.dueDate ? String(invoice.dueDate).split('T')[0] : '',
          publicViewUrl: String(invoice.publicViewUrl ?? ''),
        })));
      })
      .catch(() => setInvoices([]))
      .finally(() => setInvoiceLoading(false));
  }, [invoicePage, invoiceRowsPerPage, invoiceCursors]);

  const filtered = payments.filter(p => statusFilter === 'ALL' || p.status === statusFilter);
  const totalRevenue = filtered.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = filtered.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = filtered.filter(p => p.status === 'REFUNDED').reduce((sum, p) => sum + p.amount, 0);

  const memberName = payments.find(p => p.memberId === memberIdParam)?.member ?? '';
  const visibleInvoices = memberIdParam
    ? invoices.filter(invoice => invoice.memberId === memberIdParam)
    : invoices;

  if (loading) {
    return (
      <AppLayout>
        <PageSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', mb: 3, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Payments & Billing</Typography>
          {memberIdParam && memberName && (
            <Typography variant="body2" color="text.secondary">Showing payments for: <strong>{memberName}</strong></Typography>
          )}
          {!memberIdParam && (
            <Typography variant="body2" color="text.secondary">Manage member payments and invoices</Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} size="small" onClick={fetchPayments}>Refresh</Button>
          <Button variant="outlined" startIcon={<ReceiptIcon />} onClick={() => { setGenerateInvoiceForm(form => ({ ...form, memberId: memberIdParam || form.memberId })); setGenerateInvoiceOpen(true); setInvoiceError(''); }}>
            Generate Invoice
          </Button>
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
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600 }}>{s.label}</Typography>
                <Typography variant="h5" sx={{ mt: 0.5, color: s.color, fontWeight: 'bold' }}>{s.value}</Typography>
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
            onClick={() => { setStatusFilter(f); setPage(0); setPaymentCursors(['']); }}
          />
        ))}
        <Box sx={{ flex: 1 }} />
        <TextField
          size="small" label="From" type="date" value={dateFrom}
          onChange={e => { setDateFrom(e.target.value); setPage(0); setPaymentCursors(['']); }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 140 }}
        />
        <TextField
          size="small" label="To" type="date" value={dateTo}
          onChange={e => { setDateTo(e.target.value); setPage(0); setPaymentCursors(['']); }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 140 }}
        />
        {(dateFrom || dateTo) && (
          <Button size="small" variant="text" onClick={() => { setDateFrom(''); setDateTo(''); setPage(0); setPaymentCursors(['']); }}>Clear dates</Button>
        )}
      </Box>

      {/* Payments Table */}
      <Card elevation={0}>
        <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain' }}>
        <Table size="small" sx={{ minWidth: 900 }}>
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
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.member || '—'}</Typography>
                </TableCell>
                <TableCell><Typography variant="caption" color="text.secondary">{p.description || '—'}</Typography></TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>₹{p.amount.toLocaleString()}</Typography>
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
        </Box>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={event => { setRowsPerPage(Number(event.target.value)); setPage(0); setPaymentCursors(['']); }}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Rows per page:"
          sx={{ borderTop: 1, borderColor: 'divider', '.MuiTablePagination-toolbar': { px: { xs: 1, sm: 2 } } }}
        />
      </Card>

      <Card elevation={0} sx={{ mt: 3 }}>
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ReceiptIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Invoices</Typography>
          </Box>
          {invoiceNotice && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setInvoiceNotice('')}>{invoiceNotice}</Alert>}
          {invoiceError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setInvoiceError('')}>{invoiceError}</Alert>}
        </CardContent>
        <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain' }}>
        <Table size="small" sx={{ minWidth: 760 }}>
          <TableHead>
            <TableRow>
              <TableCell>Invoice</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Member</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoiceLoading ? (
              <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={22} /></TableCell></TableRow>
            ) : visibleInvoices.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center"><Typography variant="caption" color="text.secondary">No invoices found</Typography></TableCell></TableRow>
            ) : visibleInvoices.map(invoice => (
              <TableRow key={invoice.id}>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{invoice.invoiceNumber}</Typography></TableCell>
                <TableCell><Typography variant="caption">{invoice.createdAt || '—'}</Typography></TableCell>
                <TableCell><Typography variant="body2">{invoice.memberName || '—'}</Typography></TableCell>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 700 }}>₹{invoice.totalAmount.toLocaleString()}</Typography></TableCell>
                <TableCell><Chip label={invoice.status || 'DRAFT'} size="small" color={statusColor[invoice.status] || 'default'} /></TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button size="small" variant="text" startIcon={<OpenInNewIcon />} disabled={!invoice.publicViewUrl} onClick={() => window.open(invoice.publicViewUrl, '_blank', 'noopener,noreferrer')}>View</Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={invoiceSendingId === invoice.id ? <CircularProgress size={14} /> : <SendIcon />}
                      disabled={invoiceSendingId !== null || !invoice.memberId}
                      title={!invoice.memberId ? 'Link this invoice to a member first' : undefined}
                      onClick={async () => {
                        setInvoiceSendingId(invoice.id);
                        setInvoiceNotice('');
                        setInvoiceError('');
                        try {
                          const response = await api.post(`/invoices/${invoice.id}/whatsapp`);
                          const delivery = response.data?.delivery;
                          if (delivery?.status === 'SENT') setInvoiceNotice(`Invoice ${delivery?.invoiceNumber ?? invoice.invoiceNumber} was sent through Evolution Go.`);
                          else setInvoiceError(`Invoice message was not sent (${delivery?.status ?? 'FAILED'}). Check Evolution Go configuration and delivery logs.`);
                        } catch (error: unknown) {
                          const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
                          setInvoiceError(message ?? 'Could not send the invoice message.');
                        } finally {
                          setInvoiceSendingId(null);
                        }
                      }}
                    >
                      Send WhatsApp
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </Box>
        <TablePagination
          component="div"
          count={invoiceTotal}
          page={invoicePage}
          onPageChange={(_, nextPage) => setInvoicePage(nextPage)}
          rowsPerPage={invoiceRowsPerPage}
          onRowsPerPageChange={event => { setInvoiceRowsPerPage(Number(event.target.value)); setInvoicePage(0); setInvoiceCursors(['']); }}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Rows per page:"
          sx={{ borderTop: 1, borderColor: 'divider', '.MuiTablePagination-toolbar': { px: { xs: 1, sm: 2 } } }}
        />
      </Card>

      <Dialog open={generateInvoiceOpen} onClose={() => setGenerateInvoiceOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <DialogTitle>Generate Invoice</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>A secure backend view link is created for every invoice and can be sent to the member.</Typography>
          <Grid container spacing={2}>
            <Grid size={12}>
              <MemberSearchField
                label="Find member"
                helperText="Search by name or member number, then select the member"
                autoFocus={generateInvoiceOpen}
                onSelect={member => setGenerateInvoiceForm({ ...generateInvoiceForm, memberId: member?.id ?? '' })}
              />
            </Grid>
            <Grid size={12}><TextField label="Description" fullWidth size="small" value={generateInvoiceForm.description} onChange={e => setGenerateInvoiceForm({ ...generateInvoiceForm, description: e.target.value })} required /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Amount (Rs.)" type="number" fullWidth size="small" value={generateInvoiceForm.amount} onChange={e => setGenerateInvoiceForm({ ...generateInvoiceForm, amount: e.target.value })} required /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="GST (%)" type="number" fullWidth size="small" value={generateInvoiceForm.gstPercent} disabled helperText="Managed from Settings → Tax / GST" /></Grid>
            <Grid size={12}><Alert severity="info">{taxSettings.taxIncluded ? 'Tax Included in Price is ON: the entered amount is the final amount; GST is shown as an included component.' : 'Tax Included in Price is OFF: GST is added to the entered amount.'}</Alert></Grid>
            <Grid size={12}><TextField label="Due Date (Optional)" type="date" fullWidth size="small" value={generateInvoiceForm.dueDate} onChange={e => setGenerateInvoiceForm({ ...generateInvoiceForm, dueDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setGenerateInvoiceOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={generateInvoiceSubmitting || !generateInvoiceForm.memberId || !generateInvoiceForm.description || Number(generateInvoiceForm.amount) <= 0} onClick={async () => {
            setGenerateInvoiceSubmitting(true);
            setInvoiceError('');
            try {
              const response = await api.post('/invoices/generate', {
                memberId: generateInvoiceForm.memberId,
                lineItems: [{ description: generateInvoiceForm.description, quantity: 1, unitPrice: Number(generateInvoiceForm.amount), gstPercent: Number(generateInvoiceForm.gstPercent) || 0 }],
                dueDate: generateInvoiceForm.dueDate || undefined,
              });
              const invoice = response.data?.invoice;
              if (invoice) setInvoices(current => [{ id: String(invoice.id), invoiceNumber: String(invoice.invoiceNumber), memberId: String(invoice.memberId ?? ''), memberName: String(invoice.memberName ?? ''), totalAmount: Number(invoice.totalAmount ?? 0), status: String(invoice.status ?? 'DRAFT'), createdAt: String(invoice.createdAt ?? '').split('T')[0], dueDate: invoice.dueDate ? String(invoice.dueDate).split('T')[0] : '', publicViewUrl: String(invoice.publicViewUrl ?? '') }, ...current]);
              setGenerateInvoiceOpen(false);
              setGenerateInvoiceForm({ memberId: memberIdParam, description: 'Membership fee', amount: '', gstPercent: '18', dueDate: '' });
              setInvoiceNotice('Invoice generated with a secure view link.');
            } catch (error: unknown) {
              const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
              setInvoiceError(message ?? 'Could not generate the invoice.');
            } finally {
              setGenerateInvoiceSubmitting(false);
            }
          }}>{generateInvoiceSubmitting ? 'Generating...' : 'Generate Invoice'}</Button>
        </DialogActions>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          {addError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{addError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <MemberSearchField
                label="Find member"
                helperText="Search by name or member number, then select the member"
                autoFocus={addOpen}
                onSelect={member => { setMemberIdInput(member?.id ?? ''); setAddError(''); }}
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
                setPage(0);
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
                fetchPayments();
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
      <PageSkeleton />
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
