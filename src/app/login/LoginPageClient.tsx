'use client';

import {
  startTransition,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
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
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { api } from '@/lib/api';

const REMEMBERED_EMAIL_STORAGE_KEY = 'gymflow:remembered-email';
const USER_STORAGE_KEY = 'gymflow:user';
const DEFAULT_REDIRECT = '/';

interface LoginPageClientProps {
  redirectTo: string | null;
}

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

interface FieldErrors {
  email?: string;
  password?: string;
}

function sanitizeRedirectPath(candidate: string | null) {
  if (!candidate) return DEFAULT_REDIRECT;

  try {
    const decodedCandidate = decodeURIComponent(candidate).trim();
    if (!decodedCandidate.startsWith('/')) return DEFAULT_REDIRECT;
    if (decodedCandidate.startsWith('//')) return DEFAULT_REDIRECT;
    if (decodedCandidate.startsWith('/login')) return DEFAULT_REDIRECT;
    return decodedCandidate;
  } catch {
    return DEFAULT_REDIRECT;
  }
}

function validateEmail(email: string) {
  const normalizedEmail = email.trim();
  if (!normalizedEmail) return 'Email is required.';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(normalizedEmail)) return 'Enter a valid email address.';
  return undefined;
}

function validatePassword(password: string) {
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return undefined;
}

function getLoginErrors(email: string, password: string): FieldErrors {
  return {
    email: validateEmail(email),
    password: validatePassword(password),
  };
}

function getLoginErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'Incorrect email or password. Please try again.';
    }

    if (!error.response) {
      return 'We could not reach the server. Check your connection and try again.';
    }

    const message = error.response.data?.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message) && typeof message[0] === 'string') return message[0];
  }

  return 'Sign in failed. Please try again in a moment.';
}

export default function LoginPageClient({ redirectTo }: LoginPageClientProps) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });
  const destination = useMemo(() => sanitizeRedirectPath(redirectTo), [redirectTo]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fieldTouched, setFieldTouched] = useState({ email: false, password: false });

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotTouched, setForgotTouched] = useState(false);
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  useEffect(() => {
    const rememberedEmail = window.localStorage.getItem(REMEMBERED_EMAIL_STORAGE_KEY);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setForgotEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const loginErrors = getLoginErrors(email, password);
  const isFormValid = !loginErrors.email && !loginErrors.password;
  const forgotEmailError = forgotTouched ? validateEmail(forgotEmail) : undefined;
  const featureItems = [
    {
      icon: BoltRoundedIcon,
      title: 'Fast check-in recovery',
      copy: 'Staff can get back into the system quickly without breaking the front-desk flow.',
      accent: '#10b981',
    },
    {
      icon: SecurityRoundedIcon,
      title: 'API-backed session entry',
      copy: 'The form connects to the existing auth API and stores the returned access token.',
      accent: '#06b6d4',
    },
    {
      icon: SupportAgentRoundedIcon,
      title: 'Operational guardrails',
      copy: 'Redirects stay internal, validation matches backend rules, and recovery states are clear.',
      accent: '#f59e0b',
    },
  ];

  const handlePasswordKeyboardState = (event: KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(event.getModifierState('CapsLock'));
  };

  const handleForgotOpen = () => {
    setForgotEmail(email.trim());
    setForgotTouched(false);
    setForgotError('');
    setForgotSuccess('');
    setForgotOpen(true);
  };

  const handleForgotClose = () => {
    setForgotOpen(false);
    setForgotSubmitting(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldTouched({ email: true, password: true });
    setSubmitError('');

    if (!isFormValid) return;

    setIsSubmitting(true);

    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email: email.trim(),
        password,
      });

      window.localStorage.setItem('token', response.data.access_token);
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user));

      if (rememberMe) {
        window.localStorage.setItem(REMEMBERED_EMAIL_STORAGE_KEY, email.trim());
      } else {
        window.localStorage.removeItem(REMEMBERED_EMAIL_STORAGE_KEY);
      }

      startTransition(() => {
        router.replace(destination);
      });
    } catch (error) {
      setSubmitError(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setForgotTouched(true);
    setForgotError('');
    setForgotSuccess('');

    const emailError = validateEmail(forgotEmail);
    if (emailError) return;

    setForgotSubmitting(true);

    try {
      await api.post('/auth/forgot-password', { email: forgotEmail.trim() });
      setForgotSuccess('If that account exists, we have sent password reset instructions to the registered email.');
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        setForgotError('Password reset is not enabled in this environment yet. Contact your administrator to restore access.');
      } else if (isAxiosError(error) && !error.response) {
        setForgotError('We could not reach the server. Try again when the network is stable.');
      } else {
        setForgotError('We could not start password recovery right now. Please try again shortly.');
      }
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top left, rgba(16,185,129,0.18), transparent 34%), radial-gradient(circle at bottom right, rgba(6,182,212,0.16), transparent 30%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 1280,
          px: { xs: 1.5, sm: 2.5, md: 4 },
          py: {
            xs: 'max(12px, env(safe-area-inset-top))',
            sm: 3,
            md: 5,
          },
          pb: {
            xs: 'max(20px, env(safe-area-inset-bottom))',
            sm: 3,
            md: 5,
          },
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.05fr 0.95fr' },
          gap: { xs: 3, lg: 4 },
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            pr: { lg: 2 },
            order: { xs: 2, lg: 1 },
          }}
        >
          <Chip
            icon={<SecurityRoundedIcon />}
            label="Secure staff access"
            color="primary"
            variant="outlined"
            sx={{ mb: 2, px: 0.75, display: { xs: 'none', sm: 'inline-flex' } }}
          />
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: '1.8rem', sm: '2.6rem', md: '3.6rem' },
              lineHeight: { xs: 1, md: 0.96 },
              letterSpacing: '-0.07em',
              fontWeight: 800,
              maxWidth: 620,
            }}
          >
            GymFlow keeps front desk, trainers, and billing in sync.
          </Typography>
          <Typography
            sx={{
              mt: 2,
              maxWidth: 580,
              color: 'text.secondary',
              fontSize: { xs: '0.9rem', sm: '0.98rem', md: '1.05rem' },
            }}
          >
            Sign in to manage attendance, memberships, payments, and staff activity from one secure control room.
          </Typography>

          <Stack
            direction="row"
            sx={{
              mt: { xs: 2.25, sm: 3 },
              gap: 1,
              flexWrap: 'wrap',
              display: { xs: 'none', md: 'flex' },
            }}
          >
            {['Email sign-in', 'Password recovery', 'Remembered device email'].map(label => (
              <Chip key={label} label={label} variant="outlined" />
            ))}
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ mt: { xs: 2.5, sm: 4 }, gap: { xs: 1.25, sm: 2 } }}
          >
            {featureItems.map(item => (
              <Card
                key={item.title}
                elevation={0}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  bgcolor: alpha('#141414', 0.84),
                  borderColor: alpha(item.accent, 0.22),
                }}
              >
                <CardContent sx={{ p: { xs: 1.75, sm: 2.25 } }}>
                  <Box
                    sx={{
                      width: { xs: 36, sm: 42 },
                      height: { xs: 36, sm: 42 },
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(item.accent, 0.12),
                      color: item.accent,
                      mb: 1.5,
                    }}
                  >
                    <item.icon fontSize="small" />
                  </Box>
                  <Typography sx={{ fontSize: { xs: '0.86rem', sm: '0.92rem' }, fontWeight: 700, color: 'text.primary' }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ mt: 0.75, fontSize: { xs: '0.75rem', sm: '0.78rem' }, color: 'text.secondary' }}>
                    {item.copy}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>

        <Card
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', sm: 520 },
            justifySelf: { xs: 'stretch', lg: 'end' },
            bgcolor: alpha('#111111', 0.92),
            borderColor: 'rgba(255,255,255,0.1)',
            boxShadow: '0 30px 70px rgba(0,0,0,0.35)',
            backdropFilter: 'blur(20px)',
            order: { xs: 1, lg: 2 },
            borderRadius: { xs: 3, md: 3.5 },
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 2.75, md: 3.5 } }}>
            <Stack
              direction="row"
              sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5, gap: 1.5 }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Chip
                  label="GymFlow Admin"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 1.25, display: { xs: 'inline-flex', md: 'none' } }}
                />
                <Typography variant="h4" sx={{ fontSize: { xs: '1.7rem', md: '2rem' }, letterSpacing: '-0.05em' }}>
                  Welcome back
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.75 }}>
                  Use your staff email and password to continue to the admin workspace.
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 3,
                  bgcolor: alpha('#10b981', 0.12),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main',
                }}
              >
                <LockRoundedIcon />
              </Box>
            </Stack>

            <Stack
              direction="row"
              sx={{
                mb: 2,
                gap: 1,
                flexWrap: 'wrap',
                display: { xs: 'flex', md: 'none' },
              }}
            >
              {['Email sign-in', 'Recovery support', 'Safe redirect'].map(label => (
                <Chip key={label} label={label} variant="outlined" size="small" />
              ))}
            </Stack>

            {destination !== DEFAULT_REDIRECT && (
              <Alert severity="info" sx={{ mb: 2 }}>
                After sign-in, you will be returned to <strong>{destination}</strong>.
              </Alert>
            )}

            {submitError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {submitError}
              </Alert>
            )}

            <Box component="form" noValidate onSubmit={handleSubmit}>
              <Stack sx={{ gap: 2 }}>
                <TextField
                  label="Work email"
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  onBlur={() => setFieldTouched(previous => ({ ...previous, email: true }))}
                  error={fieldTouched.email && Boolean(loginErrors.email)}
                  helperText={fieldTouched.email ? loginErrors.email : ' '}
                  autoComplete="email"
                  inputMode="email"
                  required
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <MailOutlineRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
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
                    onChange={event => setPassword(event.target.value)}
                    onBlur={() => {
                      setFieldTouched(previous => ({ ...previous, password: true }));
                      setCapsLockOn(false);
                    }}
                    onKeyDown={handlePasswordKeyboardState}
                    onKeyUp={handlePasswordKeyboardState}
                    error={fieldTouched.password && Boolean(loginErrors.password)}
                    helperText={fieldTouched.password ? loginErrors.password : ' '}
                    autoComplete="current-password"
                    required
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                              onClick={() => setShowPassword(previous => !previous)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  {capsLockOn && (
                    <Typography sx={{ mt: -0.25, color: 'warning.main', fontSize: '0.74rem' }}>
                      Caps Lock is on.
                    </Typography>
                  )}
                </Box>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 1 }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={event => setRememberMe(event.target.checked)}
                      />
                    }
                    label="Remember my email on this device"
                    sx={{
                      m: 0,
                      alignItems: 'flex-start',
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.84rem',
                        lineHeight: 1.35,
                      },
                    }}
                  />
                  <Link
                    component="button"
                    type="button"
                    onClick={handleForgotOpen}
                    underline="hover"
                    sx={{
                      fontWeight: 700,
                      color: 'primary.main',
                      alignSelf: { xs: 'flex-start', sm: 'center' },
                    }}
                  >
                    Forgot password?
                  </Link>
                </Stack>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  endIcon={
                    isSubmitting
                      ? <CircularProgress size={16} color="inherit" />
                      : <ArrowForwardRoundedIcon />
                  }
                  sx={{ mt: 0.5 }}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ my: { xs: 2.5, md: 3 } }} />

            <Stack
              direction="row"
              sx={{
                gap: 1,
                flexWrap: 'wrap',
                display: { xs: 'none', sm: 'flex' },
              }}
            >
              {[
                'Validation aligned with backend rules',
                'Safe post-login redirect',
                'Clear recovery entry point',
              ].map(label => (
                <Chip
                  key={label}
                  icon={<CheckCircleRoundedIcon />}
                  label={label}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Stack>

            <Box
              sx={{
                mt: { xs: 0, sm: 2.5 },
                p: { xs: 1.5, sm: 0 },
                borderRadius: 2,
                bgcolor: { xs: 'rgba(255,255,255,0.03)', sm: 'transparent' },
                border: { xs: '1px solid rgba(255,255,255,0.06)', sm: 'none' },
              }}
            >
              <Typography sx={{ fontSize: '0.76rem', color: 'text.secondary' }}>
                Trouble signing in? Use password recovery first. If access is still blocked, ask an administrator to reset your account.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Dialog open={forgotOpen} onClose={handleForgotClose} maxWidth="xs" fullWidth fullScreen={isMobile}>
        <DialogTitle>Reset password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter the staff email tied to your account. If password recovery is configured, we will send reset instructions.
          </Typography>

          {forgotSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {forgotSuccess}
            </Alert>
          )}

          {forgotError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {forgotError}
            </Alert>
          )}

          <Box component="form" id="forgot-password-form" noValidate onSubmit={handleForgotSubmit}>
            <TextField
              label="Staff email"
              type="email"
              value={forgotEmail}
              onChange={event => setForgotEmail(event.target.value)}
              onBlur={() => setForgotTouched(true)}
              error={Boolean(forgotEmailError)}
              helperText={forgotEmailError ?? ' '}
              autoComplete="email"
              inputMode="email"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleForgotClose} variant="outlined" disabled={forgotSubmitting}>
            Close
          </Button>
          <Button
            form="forgot-password-form"
            type="submit"
            variant="contained"
            disabled={forgotSubmitting}
            endIcon={forgotSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {forgotSubmitting ? 'Sending...' : 'Send reset link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
