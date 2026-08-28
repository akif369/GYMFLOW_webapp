'use client';
import { useState, useEffect, type FormEvent } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, Alert, CircularProgress, Box, Chip, Grid, InputAdornment
} from '@mui/material';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

interface MyProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MyProfileDialog({ open, onClose, onSuccess }: MyProfileDialogProps) {
  const { user, setUser } = useAuthStore();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hydrate form when dialog opens or user state changes
  useEffect(() => {
    if (open && user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      
      let p = user.phone || '';
      if (p.startsWith('+91')) {
        p = p.substring(3).trim();
      } else if (p.length === 12 && p.startsWith('91')) {
        p = p.substring(2).trim();
      }
      setPhone(p);
      
      setError('');
    }
  }, [open, user]);

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }

    if (!user?.id) return;

    setLoading(true);
    try {
      const res = await api.patch<{ staff: any }>(
        `/staff/${user.id}`, 
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() ? `+91 ${phone.trim().replace(/^(\+91\s*|91\s*)/, '')}` : null
        }
      );
      
      // Update global auth store with new user data
      setUser(res.data.staff);
      
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(message || 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" sx={{ '& .MuiDialog-paper': { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
      <DialogTitle sx={{ fontWeight: 'bold' }}>My Profile</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1, pb: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block' }}>
              Account Information
            </Typography>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ color: '#8b949e' }}>Email address</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.email}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={{ color: '#8b949e' }}>Role</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip 
                    label={user.role} 
                    size="small" 
                    sx={{ 
                      height: 20, 
                      fontSize: '0.7rem', 
                      fontWeight: 600,
                      bgcolor: 'rgba(16,185,129,0.12)',
                      color: '#10b981',
                      border: '1px solid rgba(16,185,129,0.25)',
                    }} 
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Personal Details</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="First Name"
                fullWidth
                size="small"
                required
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Last Name"
                fullWidth
                size="small"
                required
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Phone Number"
                fullWidth
                size="small"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={loading}
                placeholder="10-digit number"
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">🇮🇳 +91</InputAdornment>,
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Button onClick={handleClose} disabled={loading} color="inherit">Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
