import React, { useState } from 'react';
import {
  Box, Grid, Typography, Button, TextField, MenuItem, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Alert, IconButton, Collapse, alpha
} from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { api } from '@/lib/api';

function indianMobileDigits(value: string) {
  const digits = value.replace(/\D/g, '');
  const localNumber = digits.length > 10 && digits.startsWith('91') ? digits.slice(2) : digits;
  return localNumber.slice(0, 10);
}

export default function AddMemberDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [addForm, setAddForm] = useState({
    firstName: '', lastName: '', phone: '', email: '', gender: 'MALE',
    dob: '', address: '', goal: '', joinDate: new Date().toISOString().split('T')[0],
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  const [membershipExpanded, setMembershipExpanded] = useState(true);
  const [additionalExpanded, setAdditionalExpanded] = useState(false);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.firstName || !addForm.lastName || !addForm.phone || !addForm.dob || !addForm.joinDate) {
      setAddError('First Name, Last Name, Phone, Date of Birth, and Join Date are required.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(addForm.phone)) {
      setAddError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setAddLoading(true);
    setAddError('');
    try {
      await api.post('/members', { ...addForm, phone: `+91${addForm.phone}` });
      setAddForm({ firstName: '', lastName: '', phone: '', email: '', gender: 'MALE', dob: '', address: '', goal: '', joinDate: new Date().toISOString().split('T')[0] });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'Failed to create member');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            <Grid item xs={12} sm={6}><TextField label="First Name" required autoComplete="given-name" value={addForm.firstName} onChange={e => setAddForm({ ...addForm, firstName: e.target.value })} fullWidth /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Last Name" required autoComplete="family-name" value={addForm.lastName} onChange={e => setAddForm({ ...addForm, lastName: e.target.value })} fullWidth /></Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Mobile Number"
                required
                type="tel"
                autoComplete="tel-national"
                value={addForm.phone}
                onChange={e => setAddForm({ ...addForm, phone: indianMobileDigits(e.target.value) })}
                placeholder="9876543210"
                helperText="Enter the 10-digit mobile number"
                fullWidth
                slotProps={{
                  input: { startAdornment: <InputAdornment position="start">🇮🇳 +91</InputAdornment> },
                  htmlInput: { inputMode: 'numeric', maxLength: 10, pattern: '[6-9][0-9]{9}' },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}><TextField label="Email" type="email" autoComplete="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} fullWidth /></Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField label="Gender" select value={addForm.gender} onChange={e => setAddForm({ ...addForm, gender: e.target.value })} fullWidth>
                <MenuItem value=""><em>Prefer not to say</em></MenuItem>
                {['MALE', 'FEMALE', 'OTHER'].map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>

          <Box 
            onClick={() => setMembershipExpanded(!membershipExpanded)}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2.5, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
          >
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.08em' }}>
              Membership details
            </Typography>
            <IconButton size="small" sx={{ transform: membershipExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
              <ExpandMoreRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
          <Collapse in={membershipExpanded}>
            <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: 0.25 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Join Date"
                  type="date"
                  required
                  value={addForm.joinDate} onChange={e => setAddForm({ ...addForm, joinDate: e.target.value })}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}><TextField label="Fitness Goal" value={addForm.goal} onChange={e => setAddForm({ ...addForm, goal: e.target.value })} fullWidth placeholder="e.g. Weight Loss" /></Grid>
            </Grid>
          </Collapse>

          <Box 
            onClick={() => setAdditionalExpanded(!additionalExpanded)}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
          >
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.08em' }}>
              Additional information
            </Typography>
            <IconButton size="small" sx={{ transform: additionalExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
              <ExpandMoreRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
          <Collapse in={additionalExpanded}>
            <TextField label="Address" value={addForm.address} onChange={e => setAddForm({ ...addForm, address: e.target.value })} fullWidth multiline minRows={2} sx={{ mt: 1.25 }} />
          </Collapse>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 }, gap: 1, flexDirection: { xs: 'column-reverse', sm: 'row' }, '& > button': { width: { xs: '100%', sm: 'auto' }, minHeight: 44 } }}>
          <Button onClick={onClose} variant="outlined" disabled={addLoading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={addLoading}>
            {addLoading ? <CircularProgress size={24} /> : 'Create Member'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
