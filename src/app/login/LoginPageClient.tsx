'use client';

import {
  startTransition,
  useEffect,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
// import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MailOutlineIcon from '@mui/icons-material/MailOutlineOutlined';
import { api } from '@/lib/api';
import { useAuthStore, getPortalHome } from '@/store/useAuthStore';
import type { PortalType } from '@/store/useAuthStore';

const REMEMBERED_EMAIL_KEY = 'gymatrix:remembered-email';


interface LoginPageClientProps {
  redirectTo: string | null;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    orgId: string;
    branchId: string | null;
    memberId: string | null;
    permissions: string[];
    portalType: PortalType;
  };
}


function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const code = error.response?.data?.error?.code ?? error.response?.data?.code;
    if (code === 'ACCOUNT_LOCKED') {
      return error.response?.data?.error?.message ?? 'Account locked due to too many failed attempts.';
    }
    if (code === 'ACCOUNT_INACTIVE') return 'Your account has been suspended. Contact your administrator.';
    if (error.response?.status === 401) return 'Incorrect email or password.';
    if (!error.response) return 'Cannot reach the server. Check your connection.';
    const msg = error.response.data?.message;
    if (typeof msg === 'string') return msg;
  }
  return 'Sign in failed. Please try again.';
}

export default function LoginPageClient(_props: LoginPageClientProps) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });

  const { setAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect authenticated users to their portal home
      const home = getPortalHome(user.portalType);
      router.replace(home);
    }
  }, [isAuthenticated, user, router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  // Forgot password
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Load remembered email
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (saved) { setEmail(saved); setForgotEmail(saved); }
  }, []);

  const emailError = touched.email && !email.trim() ? 'Email is required.' :
    touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? 'Enter a valid email.' : '';
  const passwordError = touched.password && !password ? 'Password is required.' : '';


  const handleCapsLock = (e: KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState('CapsLock'));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setError('');
    if (!email.trim() || !password) return;

    setSubmitting(true);
    try {
      const res = await api.post<LoginResponse>('/auth/login', {
        email: email.trim(),
        password,
      });
      const { accessToken, refreshToken, user } = res.data;

      setAuth(
        {
          id: user.id, email: user.email, firstName: user.firstName,
          lastName: user.lastName, role: user.role, orgId: user.orgId,
          branchId: user.branchId, memberId: user.memberId,
          permissions: user.permissions, portalType: user.portalType,
        },
        accessToken,
        refreshToken,
      );

      localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());

      // Route to the correct portal based on role
      const home = getPortalHome(user.portalType);
      startTransition(() => { router.replace(home); });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!forgotEmail.trim()) return;
    setForgotSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail.trim() });
      setForgotSuccess('If that account exists, reset instructions have been sent.');
    } catch (err) {
      setForgotError(isAxiosError(err) && !err.response
        ? 'Cannot reach the server. Try again.'
        : 'Password reset unavailable. Contact your administrator.');
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: { xs: 2, sm: 3 },
        py: 4,
        // Subtle radial glow matching admin theme
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.08) 0%, transparent 60%), #0a0a0a',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {/* Logo + Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src="/logo/icon.png"
            alt="GymFlow"
            sx={{ width: 36, height: 36, borderRadius: 1.5, objectFit: 'contain' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <Typography
            sx={{
              fontSize: '1.1rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'text.primary',
            }}
          >
            GymFlow
          </Typography>
        </Box>

        {/* Heading */}
        <Box>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: '1.6rem', sm: '1.9rem' },
              fontWeight: 800,
              letterSpacing: '-0.05em',
              lineHeight: 1.1,
              color: 'text.primary',
            }}
          >
            Sign in
          </Typography>
          <Typography
            sx={{ mt: 0.75, fontSize: '0.875rem', color: 'text.secondary' }}
          >
            Admin &amp; staff portal
          </Typography>
        </Box>

        {/* Form Card */}
        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 3,
            p: { xs: 2.5, sm: 3 },
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, fontSize: '0.82rem' }}>
              {error}
            </Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                error={Boolean(emailError)}
                helperText={emailError || ' '}
                autoComplete="email"
                inputMode="email"
                required
                fullWidth
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Box>
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => { setTouched((p) => ({ ...p, password: true })); setCapsLock(false); }}
                  onKeyDown={handleCapsLock}
                  onKeyUp={handleCapsLock}
                  error={Boolean(passwordError)}
                  helperText={passwordError || ' '}
                  autoComplete="current-password"
                  required
                  fullWidth
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword((p) => !p)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            edge="end"
                          >
                            {showPassword
                              ? <VisibilityOffRoundedIcon sx={{ fontSize: 18 }} />
                              : <VisibilityRoundedIcon sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                {capsLock && (
                  <Typography sx={{ fontSize: '0.75rem', color: 'warning.main', mt: -0.5 }}>
                    Caps Lock is on
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -0.5 }}>
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() => { setForgotEmail(email.trim()); setForgotError(''); setForgotSuccess(''); setForgotOpen(true); }}
                  sx={{ fontSize: '0.8rem', color: 'text.secondary' }}
                >
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={submitting}
                sx={{
                  mt: 0.5,
                  py: 1.25,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  fontSize: '0.92rem',
                }}
                startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : undefined}
              >
                {submitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Footer note */}
        <Typography sx={{ textAlign: 'center', fontSize: '0.75rem', color: 'text.disabled' }}>
          This portal is for authorised gym staff only.
        </Typography>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobile}
        slotProps={{ paper: { sx: { bgcolor: 'background.paper', backgroundImage: 'none' } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
          Reset password
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your staff email. If the account exists, we'll send reset instructions.
          </Typography>
          {forgotSuccess && <Alert severity="success" sx={{ mb: 2 }}>{forgotSuccess}</Alert>}
          {forgotError && <Alert severity="error" sx={{ mb: 2 }}>{forgotError}</Alert>}
          <Box component="form" id="forgot-form" noValidate onSubmit={handleForgotSubmit}>
            <TextField
              label="Staff email"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              fullWidth
              size="small"
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button variant="text" onClick={() => setForgotOpen(false)} disabled={forgotSubmitting}>
            Cancel
          </Button>
          <Button
            form="forgot-form"
            type="submit"
            variant="contained"
            disabled={forgotSubmitting || !forgotEmail.trim()}
            startIcon={forgotSubmitting ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            {forgotSubmitting ? 'Sending…' : 'Send link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
