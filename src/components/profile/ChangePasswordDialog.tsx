'use client';
import { useState, type FormEvent } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, Alert, CircularProgress, IconButton, InputAdornment, Box
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { api } from '@/lib/api';

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChangePasswordDialog({ open, onClose, onSuccess }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    if (loading) return;
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setShowCurrent(false);
    setShowNew(false);
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(message || 'Could not change password. Please verify your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" PaperProps={{ sx: { bgcolor: '#161b22', backgroundImage: 'none' } }}>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Change Password</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Enter your current password, and choose a new, secure password.
          </Typography>

          <TextField
            label="Current Password"
            type={showCurrent ? 'text' : 'password'}
            fullWidth
            size="small"
            required
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            disabled={loading}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowCurrent(!showCurrent)}>
                      {showCurrent ? <VisibilityOffRoundedIcon sx={{ fontSize: 18 }} /> : <VisibilityRoundedIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />

          <Box sx={{ my: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }} />

          <TextField
            label="New Password"
            type={showNew ? 'text' : 'password'}
            fullWidth
            size="small"
            required
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            disabled={loading}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowNew(!showNew)}>
                      {showNew ? <VisibilityOffRoundedIcon sx={{ fontSize: 18 }} /> : <VisibilityRoundedIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />

          <TextField
            label="Confirm New Password"
            type={showNew ? 'text' : 'password'}
            fullWidth
            size="small"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleClose} disabled={loading} color="inherit">Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Update Password
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
