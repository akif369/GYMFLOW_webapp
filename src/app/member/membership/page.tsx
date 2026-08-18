'use client';
import {
  Box, Card, CardContent, Typography, Chip, Stack,
  LinearProgress, Button, Grid, Divider,
} from '@mui/material';
import CardMembershipRoundedIcon from '@mui/icons-material/CardMembershipRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import PauseCircleRoundedIcon from '@mui/icons-material/PauseCircleRounded';

const MEMBERSHIP = {
  current: {
    planName: 'Premium Monthly',
    fee: 2999,
    status: 'ACTIVE',
    startDate: '01 Aug 2026',
    endDate: '31 Aug 2026',
    daysLeft: 12,
    totalDays: 30,
    autoRenew: true,
    features: ['Unlimited gym access', 'Locker access', '1 Free PT session/month', 'Group classes included'],
  },
  history: [
    { id: 'MEM-048', plan: 'Premium Monthly', start: '01 Jul 2026', end: '31 Jul 2026', fee: 2999, status: 'EXPIRED' },
    { id: 'MEM-036', plan: 'Standard Monthly', start: '01 Jun 2026', end: '30 Jun 2026', fee: 1999, status: 'EXPIRED' },
    { id: 'MEM-024', plan: 'Standard Monthly', start: '01 May 2026', end: '31 May 2026', fee: 1999, status: 'EXPIRED' },
  ],
  availablePlans: [
    { name: 'Standard Monthly', fee: 1999, duration: '1 Month', features: ['Unlimited gym access', 'Locker access'], popular: false },
    { name: 'Premium Monthly', fee: 2999, duration: '1 Month', features: ['Unlimited access', 'Locker', '1 PT session', 'Group classes'], popular: true },
    { name: 'Premium Quarterly', fee: 7999, duration: '3 Months', features: ['Unlimited access', 'Locker', '3 PT sessions', 'Group classes', 'Save ₹1000'], popular: false },
  ],
};

export default function MemberMembershipPage() {
  const pct = Math.round((MEMBERSHIP.current.daysLeft / MEMBERSHIP.current.totalDays) * 100);
  const expiryColor = pct > 30 ? '#10b981' : pct > 10 ? '#f59e0b' : '#f43f5e';

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
          My Membership
        </Typography>
        <Typography component="h1" sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: 'text.primary' }}>
          Membership Details
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Current plan */}
        <Grid item xs={12} md={8}>
          <Stack spacing={2}>
            {/* Active card */}
            <Card elevation={0} sx={{ border: '1px solid rgba(16,185,129,0.25)', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.03))' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Chip label="ACTIVE" size="small" icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />}
                      sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700, mb: 1 }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: 'text.primary' }}>{MEMBERSHIP.current.planName}</Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.25 }}>
                      {MEMBERSHIP.current.startDate} → {MEMBERSHIP.current.endDate}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: expiryColor, letterSpacing: '-0.06em' }}>
                      {MEMBERSHIP.current.daysLeft}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>days left</Typography>
                  </Box>
                </Box>

                <LinearProgress variant="determinate" value={pct} sx={{
                  height: 8, borderRadius: 4, mb: 2, bgcolor: 'rgba(255,255,255,0.08)',
                  '& .MuiLinearProgress-bar': { bgcolor: expiryColor, borderRadius: 4 },
                }} />

                <Box sx={{ mb: 2 }}>
                  {MEMBERSHIP.current.features.map((f) => (
                    <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <CheckCircleRoundedIcon sx={{ fontSize: 14, color: '#10b981' }} />
                      <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{f}</Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Button variant="contained" size="small"
                    sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, fontWeight: 700 }}
                    startIcon={<AutorenewRoundedIcon />}>
                    Renew Now
                  </Button>
                  <Button variant="outlined" size="small" color="warning"
                    sx={{ borderColor: 'rgba(245,158,11,0.3)', color: '#f59e0b', '&:hover': { borderColor: '#f59e0b', bgcolor: 'rgba(245,158,11,0.06)' } }}
                    startIcon={<PauseCircleRoundedIcon />}>
                    Freeze Membership
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Membership history */}
            <Card elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary', mb: 2 }}>
                  Membership History
                </Typography>
                <Stack divider={<Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}>
                  {MEMBERSHIP.history.map((h) => (
                    <Box key={h.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.25 }}>
                      <CardMembershipRoundedIcon sx={{ fontSize: 18, color: 'text.disabled', flexShrink: 0 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary' }}>{h.plan}</Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{h.start} → {h.end}</Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'text.primary' }}>₹{h.fee.toLocaleString()}</Typography>
                      <Chip label="Expired" size="small" sx={{ height: 18, fontSize: '0.62rem', bgcolor: 'rgba(107,114,128,0.12)', color: '#9ca3af' }} />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Available plans */}
        <Grid item xs={12} md={4}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: 'text.secondary', mb: 1.5 }}>
            Available Plans
          </Typography>
          <Stack spacing={1.5}>
            {MEMBERSHIP.availablePlans.map((plan) => (
              <Card key={plan.name} elevation={0} sx={{
                border: plan.popular ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.06)',
                background: plan.popular ? 'linear-gradient(135deg, rgba(16,185,129,0.08), transparent)' : undefined,
                position: 'relative', overflow: 'hidden',
              }}>
                {plan.popular && (
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #10b981, transparent)' }} />
                )}
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: 'text.primary' }}>{plan.name}</Typography>
                    {plan.popular && <Chip label="Popular" size="small" sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700, height: 18, fontSize: '0.62rem' }} />}
                  </Box>
                  <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981', letterSpacing: '-0.04em', mb: 0.5 }}>
                    ₹{plan.fee.toLocaleString()}
                    <Typography component="span" sx={{ fontSize: '0.72rem', color: 'text.disabled', ml: 0.5 }}>/ {plan.duration}</Typography>
                  </Typography>
                  {plan.features.map((f) => (
                    <Typography key={f} sx={{ fontSize: '0.72rem', color: 'text.secondary', mb: 0.25 }}>• {f}</Typography>
                  ))}
                  <Button variant={plan.popular ? 'contained' : 'outlined'} size="small" fullWidth sx={{ mt: 1.5,
                    ...(plan.popular ? { bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } } : { borderColor: 'rgba(255,255,255,0.1)', color: 'text.secondary' }),
                  }}>
                    {plan.name === MEMBERSHIP.current.planName ? 'Renew' : 'Switch Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
