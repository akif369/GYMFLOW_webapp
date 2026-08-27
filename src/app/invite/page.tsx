'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { api } from '@/lib/api';

function InviteForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(true);
  const [verifyError, setVerifyError] = useState('');
  const [inviteeName, setInviteeName] = useState('');

  useEffect(() => {
    if (!token) {
      setVerifyLoading(false);
      return;
    }
    api.get(`/auth/invite/verify?token=${token}`)
      .then(res => {
        setInviteeName(res.data.name);
      })
      .catch(err => {
        setVerifyError(err.response?.data?.message || err.message || 'Invalid invite link');
      })
      .finally(() => {
        setVerifyLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid or missing invite token.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await api.post('/auth/invite/accept', { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to accept invite.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Invalid or missing invite link. Please ask your administrator to send a new invite.
      </Alert>
    );
  }

  if (success) {
    return (
      <Alert severity="success" sx={{ mt: 2 }}>
        Your account has been successfully set up! Redirecting you to the login page...
      </Alert>
    );
  }

  if (verifyLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, gap: 2 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">Verifying your invite link...</Typography>
      </Box>
    );
  }

  if (verifyError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {verifyError} Please ask your administrator to send a new invite link.
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Welcome{inviteeName ? `, ${inviteeName}` : ''}! Please set a password for your account to accept the invitation and continue.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TextField
        label="New Password"
        type="password"
        fullWidth
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        label="Confirm New Password"
        type="password"
        fullWidth
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={loading || !password || !confirmPassword}
        sx={{ py: 1.5, fontWeight: 'bold' }}
      >
        {loading ? <CircularProgress size={24} /> : 'Set Password & Accept Invite'}
      </Button>
    </Box>
  );
}

export default function InvitePage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%', p: { xs: 2, sm: 3 }, boxShadow: 6, borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Complete Your Setup
            </Typography>
          </Box>
          <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}>
            <InviteForm />
          </Suspense>
        </CardContent>
      </Card>
    </Box>
  );
}
