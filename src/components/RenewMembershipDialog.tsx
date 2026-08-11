'use client';

import { useState } from 'react';
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { api } from '@/lib/api';

export type RenewPlan = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
};

type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'NETBANKING' | 'CHEQUE' | 'OTHER';

type RenewMembershipDialogProps = {
  open: boolean;
  memberId: string;
  memberName?: string;
  plans: RenewPlan[];
  onClose: () => void;
  onSuccess: () => void;
};

const initialForm = {
  planId: '',
  notes: '',
  recordPayment: true,
  paymentAmount: '',
  paymentMethod: 'CASH' as PaymentMethod,
  paymentReference: '',
};

export default function RenewMembershipDialog({
  open,
  memberId,
  memberName,
  plans,
  onClose,
  onSuccess,
}: RenewMembershipDialogProps) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [renewalCompleted, setRenewalCompleted] = useState(false);
  const [paymentDetailsOpen, setPaymentDetailsOpen] = useState(false);
  const [renewalRequestKey, setRenewalRequestKey] = useState('');
  const [paymentRequestKey, setPaymentRequestKey] = useState('');

  const selectedPlan = plans.find(plan => plan.id === form.planId);

  const resetAndClose = () => {
    if (loading) return;
    setForm(initialForm);
    setError('');
    setRenewalCompleted(false);
    setPaymentDetailsOpen(false);
    setRenewalRequestKey('');
    setPaymentRequestKey('');
    onClose();
  };

  const handlePlanChange = (planId: string) => {
    const plan = plans.find(item => item.id === planId);
    setForm(current => ({
      ...current,
      planId,
      paymentAmount: plan ? String(plan.price) : '',
    }));
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.planId) {
      setError('Choose a membership plan to continue.');
      return;
    }
    if (form.recordPayment && (!form.paymentAmount || Number(form.paymentAmount) <= 0)) {
      setError('Enter a valid payment amount or turn off payment recording.');
      return;
    }
    if (form.recordPayment && !form.paymentMethod) {
      setError('Choose a payment method to record the received payment.');
      return;
    }

    setLoading(true);
    setError('');
    let renewalWasCompleted = renewalCompleted;
    try {
      if (!renewalCompleted) {
        const requestKey = renewalRequestKey || crypto.randomUUID();
        setRenewalRequestKey(requestKey);
        await api.post(`/members/${memberId}/memberships/renew`, {
          planId: form.planId,
          notes: form.notes || undefined,
          // The same final amount is used for the invoice and payment, so a
          // discount or additional charge is reflected on the invoice.
          invoiceAmount: Number(form.paymentAmount),
        }, { headers: { 'Idempotency-Key': requestKey } });
        renewalWasCompleted = true;
        setRenewalCompleted(true);
        setPaymentDetailsOpen(true);
      }

      if (form.recordPayment) {
        const requestKey = paymentRequestKey || crypto.randomUUID();
        setPaymentRequestKey(requestKey);
        await api.post('/payments', {
          memberId,
          amount: Number(form.paymentAmount),
          paymentMethod: form.paymentMethod,
          referenceId: form.paymentReference || undefined,
          description: `Membership renewal - ${selectedPlan?.name ?? 'Plan'}`,
          notes: form.notes || undefined,
        }, { headers: { 'Idempotency-Key': requestKey } });
      }

      onSuccess();
      resetAndClose();
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(renewalWasCompleted
        ? message || 'Membership renewed, but the payment could not be recorded. Try again to record only the payment.'
        : message || 'Unable to renew this membership. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            width: { xs: 'calc(100% - 32px)', sm: '100%' },
            m: { xs: 2, sm: 4 },
            maxHeight: { xs: 'calc(100dvh - 32px)', sm: 'calc(100% - 64px)' },
            height: 'auto',
            borderRadius: { xs: 3, sm: 2 },
            backgroundImage: 'none',
          },
        },
      }}
    >
      <Box component="form" sx={{}} onSubmit={handleSubmit}>
        <DialogTitle sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 }, pb: 1.5 }}>
          <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'grid', placeItems: 'center' }}>
              <AutorenewRoundedIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>{renewalCompleted ? 'Record Payment' : 'Renew Membership'}</Typography>
              <Typography variant="body2" sx={{ color: '#7d8590', mt: 0.25 }}>
                {memberName ? `${memberName} · ` : ''}{renewalCompleted ? 'finish recording the payment' : 'choose a plan and extend access'}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, pb: 1 }}>
          {error && <Alert severity={renewalCompleted ? 'warning' : 'error'} sx={{ mb: 2 }}>{error}</Alert>}

          {!renewalCompleted && (
            <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: 0.25 }}>
              <Grid size={12}>
                <TextField
                  label="Membership Plan"
                  select
                  required
                  value={form.planId}
                  onChange={event => handlePlanChange(event.target.value)}
                  fullWidth
                  helperText={selectedPlan ? `${selectedPlan.durationDays} days · ₹${selectedPlan.price.toLocaleString()}` : 'Select the plan to extend this member’s access'}
                >
                  <MenuItem value=""><em>Choose a plan</em></MenuItem>
                  {plans.map(plan => <MenuItem key={plan.id} value={plan.id}>{plan.name} · ₹{plan.price.toLocaleString()} · {plan.durationDays} days</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField label="Note (Optional)" value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} fullWidth multiline minRows={2} placeholder="Add a note about this renewal" />
              </Grid>
            </Grid>
          )}

      

          <Accordion expanded={paymentDetailsOpen} onChange={(_, expanded) => setPaymentDetailsOpen(expanded)} disableGutters sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px !important', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: { xs: 1.5, sm: 2 } }}>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <PaymentsRoundedIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>Payment details</Typography>
                  <Typography variant="caption" sx={{ color: '#7d8590' }}>
                    {form.recordPayment || renewalCompleted ? 'Plan amount and Cash method are used by default' : 'Open to review payment details'}
                  </Typography>
                </Box>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 1.5, sm: 2 }, pb: 2 }}>
           {(form.recordPayment || renewalCompleted) && <Box>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Amount (₹)" type="number" required value={form.paymentAmount} onChange={event => setForm(current => ({ ...current, paymentAmount: event.target.value }))} fullWidth slotProps={{ htmlInput: { min: 1, step: '0.01' } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Payment method" select value={form.paymentMethod} onChange={event => setForm(current => ({ ...current, paymentMethod: event.target.value as PaymentMethod }))} fullWidth>
                  <MenuItem value="CASH">Cash</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="CARD">Card</MenuItem>
                  <MenuItem value="NETBANKING">Net banking</MenuItem>
                  <MenuItem value="CHEQUE">Cheque</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid size={12}><TextField label="Reference (Optional)" value={form.paymentReference} onChange={event => setForm(current => ({ ...current, paymentReference: event.target.value }))} fullWidth placeholder="UPI transaction ID or card reference" /></Grid>
            </Grid>
           </Box>}
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 }, gap: 1, flexDirection: { xs: 'column-reverse', sm: 'row' }, '& > button': { width: { xs: '100%', sm: 'auto' }, minHeight: 44 } }}>
          <Button onClick={resetAndClose} variant="outlined" disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading || plans.length === 0}>
            {loading ? <CircularProgress size={24} /> : renewalCompleted ? 'Record Payment' : form.recordPayment ? 'Renew & Record Payment' : 'Renew Membership'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
