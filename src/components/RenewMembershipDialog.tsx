'use client';

import { useState } from 'react';
import {
  Alert,
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
import { useMediaQuery, useTheme } from '@mui/material';
import { api } from '@/lib/api';

export type RenewPlan = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
};

type PaymentMethod = 'CASH' | 'UPI' | 'CARD';

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
  recordPayment: false,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [renewalCompleted, setRenewalCompleted] = useState(false);

  const selectedPlan = plans.find(plan => plan.id === form.planId);

  const resetAndClose = () => {
    if (loading) return;
    setForm(initialForm);
    setError('');
    setRenewalCompleted(false);
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

    setLoading(true);
    setError('');
    let renewalWasCompleted = renewalCompleted;
    try {
      if (!renewalCompleted) {
        await api.post(`/members/${memberId}/memberships/renew`, {
          planId: form.planId,
          notes: form.notes || undefined,
        });
        renewalWasCompleted = true;
        setRenewalCompleted(true);
      }

      if (form.recordPayment) {
        await api.post('/payments', {
          memberId,
          amount: Number(form.paymentAmount),
          paymentMethod: form.paymentMethod,
          referenceId: form.paymentReference || undefined,
          description: `Membership renewal - ${selectedPlan?.name ?? 'Plan'}`,
          notes: form.notes || undefined,
        });
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
      fullScreen={isMobile}
      slotProps={{ paper: { sx: { backgroundImage: 'none', maxHeight: { xs: '100%', sm: 'calc(100% - 64px)' } } } }}
    >
      <Box component="form" onSubmit={handleSubmit}>
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

          {!renewalCompleted && <Box sx={{ mt: 2, p: { xs: 1.5, sm: 2 }, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <FormControlLabel
              control={<Checkbox checked={form.recordPayment} onChange={event => setForm(current => ({ ...current, recordPayment: event.target.checked }))} />}
              label={<Typography sx={{ fontWeight: 700 }}>Record payment now <Typography component="span" variant="body2" sx={{ color: '#7d8590' }}>(Optional)</Typography></Typography>}
            />
            <Typography variant="caption" sx={{ display: 'block', color: '#7d8590', ml: 4.5, mt: -0.5 }}>
              Leave this off if payment will be collected later.
            </Typography>
          </Box>}

          {(form.recordPayment || renewalCompleted) && <Box sx={{ mt: 2 }}>
            <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mb: 1.5 }}>
              <PaymentsRoundedIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
              <Typography sx={{ fontWeight: 800 }}>Payment details</Typography>
            </Stack>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Amount (₹)" type="number" required value={form.paymentAmount} onChange={event => setForm(current => ({ ...current, paymentAmount: event.target.value }))} fullWidth slotProps={{ htmlInput: { min: 1, step: '0.01' } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Payment method" select required value={form.paymentMethod} onChange={event => setForm(current => ({ ...current, paymentMethod: event.target.value as PaymentMethod }))} fullWidth>
                  <MenuItem value="CASH">Cash</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="CARD">Card</MenuItem>
                </TextField>
              </Grid>
              <Grid size={12}><TextField label="Reference (Optional)" value={form.paymentReference} onChange={event => setForm(current => ({ ...current, paymentReference: event.target.value }))} fullWidth placeholder="UPI transaction ID or card reference" /></Grid>
            </Grid>
          </Box>}
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
