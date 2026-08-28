import React, { useState } from 'react';
import {
  Box, Grid, Typography, Button, TextField, MenuItem, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Alert, IconButton, Collapse, Switch, FormControlLabel, Snackbar,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { api } from '@/lib/api';
import { useSettings } from '@/hooks/queries/settings';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore, UserRole } from '@/store/useAuthStore';

import AvatarUpload from './AvatarUpload';

function indianMobileDigits(value: string) {
  const digits = value.replace(/\D/g, '');
  const localNumber = digits.length > 10 && digits.startsWith('91') ? digits.slice(2) : digits;
  return localNumber.slice(0, 10);
}

const EMPTY_FORM = {
  firstName: '', lastName: '', phone: '', email: '', gender: 'MALE',
  dob: '', address: '', goal: '', joinDate: new Date().toISOString().split('T')[0],
  branchId: '', pin: '',
};

export default function AddMemberDialog({
  open,
  onClose,
  onSuccess,
  branches,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  branches?: { id: string; name: string }[];
}) {

  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [photoError, setPhotoError] = useState('');

  const { data: settings } = useSettings();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isOrgOwner = user?.role === UserRole.ORGANIZATION_OWNER;
  const [syncToDevice, setSyncToDevice] = useState(true);
  
  React.useEffect(() => {
    if (settings?.settings) {
      const settingMap = settings.settings;
      const bioSetting = settingMap.biometrics && typeof settingMap.biometrics === 'object' ? settingMap.biometrics as Record<string, unknown> : {};
      setSyncToDevice(bioSetting.autoSync !== false);
    }
  }, [settings]);

  const [membershipExpanded, setMembershipExpanded] = useState(true);
  const [additionalExpanded, setAdditionalExpanded] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [syncError, setSyncError] = useState('');

  const resetState = () => {
    setAddForm(EMPTY_FORM);
    setAvatarFile(null);
    setAddError('');
    setPhotoError('');
    setMembershipExpanded(true);
    setAdditionalExpanded(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhotoError('');
    if (
      !addForm.firstName || !addForm.lastName || !addForm.phone || !addForm.dob || !addForm.joinDate ||
      (isOrgOwner && branches && branches.length > 0 && !addForm.branchId)
    ) {
      setAddError('First Name, Last Name, Phone, Date of Birth, Join Date' + (isOrgOwner ? ', and Branch' : '') + ' are required.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(addForm.phone)) {
      setAddError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setAddLoading(true);
    setAddError('');
    try {
      const payload: any = { ...addForm, phone: `+91${addForm.phone}` };
      if (!isOrgOwner && user?.branchId) {
        payload.branchId = user.branchId;
      }
      if (!payload.branchId) delete payload.branchId;
      
      payload.syncToDevice = syncToDevice;
      if (syncToDevice) {
        payload.accessGroup = 1; // Default to allowed for new members
        if (!payload.pin) delete payload.pin; // allow backend to fallback to gym number
      } else {
        delete payload.pin;
      }

      const res = await api.post('/members', payload);
      const memberId = res.data?.member?.id;
      const syncErrorMsg = res.data?.member?.syncError;

      // Upload profile photo if one was selected
      if (memberId && avatarFile) {
        try {
          const formData = new FormData();
          formData.append('photo', avatarFile);
          await api.post(`/members/${memberId}/photo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch {
          // Member was created successfully; surface a non-blocking warning
          setPhotoError('Member created, but the profile photo could not be uploaded. You can upload it from the member\'s profile page.');
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['members'] });
      await queryClient.invalidateQueries({ queryKey: ['biometric-identities'] });

      if (syncErrorMsg) {
        setSyncError(`Device sync failed: ${syncErrorMsg}. Please change the member's PIN in Settings.`);
        setSnackbarOpen(true);
      }

      onSuccess?.();
      if (!syncErrorMsg) {
        resetState();
        onClose();
      } else {
        // We do not reset state completely so they can see the error, but we do trigger onClose to hide the modal.
        onClose();
        // Clear the form after a slight delay to allow the dialog to close smoothly, but keep snackbar
        setTimeout(() => setAddForm(EMPTY_FORM), 300);
      }
    } catch (err: any) {
      setAddError(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to create member');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            backgroundImage: 'none',
            m: { xs: 2, sm: 3 },
            width: { xs: 'calc(100% - 32px)', sm: '100%' },
            borderRadius: { xs: 3, sm: 2 },
          },
        },
      }}
    >
      <Box component="form" onSubmit={handleAddSubmit}>
        <DialogTitle sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 }, pb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>Add New Member</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Create a member profile to start tracking their fitness journey.
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, pb: 1 }}>
          {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}
          {photoError && <Alert severity="warning" sx={{ mb: 2 }}>{photoError}</Alert>}

          {/* Profile photo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <AvatarUpload onImageSelected={setAvatarFile} size={90} />
          </Box>

          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.08em' }}>
            Personal details
          </Typography>
          <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: 0.25 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="First Name" required autoComplete="given-name" value={addForm.firstName} onChange={e => setAddForm({ ...addForm, firstName: e.target.value })} fullWidth /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Last Name" required autoComplete="family-name" value={addForm.lastName} onChange={e => setAddForm({ ...addForm, lastName: e.target.value })} fullWidth /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Email" type="email" autoComplete="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} fullWidth /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Join Date"
                  type="date"
                  required
                  value={addForm.joinDate} onChange={e => setAddForm({ ...addForm, joinDate: e.target.value })}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              {isOrgOwner && branches && branches.length > 0 && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Branch"
                    select
                    required
                    value={addForm.branchId}
                    onChange={e => setAddForm({ ...addForm, branchId: e.target.value })}
                    fullWidth
                  >
                    <MenuItem value=""><em>Select a branch</em></MenuItem>
                    {branches.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                  </TextField>
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Fitness Goal" value={addForm.goal} onChange={e => setAddForm({ ...addForm, goal: e.target.value })} fullWidth placeholder="e.g. Weight Loss" /></Grid>
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
            <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: 0.25, mb: 2 }}>
              <Grid size={{ xs: 12 }}>
                <TextField label="Address" value={addForm.address} onChange={e => setAddForm({ ...addForm, address: e.target.value })} fullWidth multiline minRows={2} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                  <FormControlLabel
                    control={<Switch checked={syncToDevice} onChange={e => setSyncToDevice(e.target.checked)} color="primary" />}
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Add to biometric device</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Creates a PIN in Member Device Permissions & Identities and queues the user on the branch terminal</Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                  <Collapse in={syncToDevice}>
                    <TextField
                      label="Optional PIN"
                      value={addForm.pin}
                      onChange={e => setAddForm({ ...addForm, pin: e.target.value.replace(/\D/g, '') })}
                      fullWidth
                      size="small"
                      placeholder="Leave empty to auto-generate (e.g. 10001)"
                      sx={{ mt: 2 }}
                    />
                  </Collapse>
                </Box>
              </Grid>
            </Grid>
          </Collapse>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 2.5 }, gap: 1.5, flexDirection: { xs: 'column-reverse', sm: 'row' }, '& > button': { mx: '0 !important', width: { xs: '100%', sm: 'auto' }, minHeight: 44 } }}>
          <Button onClick={handleClose} variant="outlined" disabled={addLoading} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={addLoading} sx={{ borderRadius: 2 }}>
            {addLoading ? <CircularProgress size={24} /> : 'Create Member'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={8000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%', boxShadow: 3, border: '1px solid rgba(244,63,94,0.3)' }} onClose={() => setSnackbarOpen(false)}>
          {syncError}
        </Alert>
      </Snackbar>
    </>
  );
}
