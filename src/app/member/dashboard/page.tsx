'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Stack,
  LinearProgress, Button, Avatar, alpha, Divider, Skeleton,
} from '@mui/material';
import CardMembershipRoundedIcon from '@mui/icons-material/CardMembershipRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import { useAuthStore } from '@/store/useAuthStore';

// ── Mock data (replace with /member/me/dashboard API call) ───────────────────

const MEMBER_DATA = {
  memberNumber: 'GYM-1024',
  membership: {
    planName: 'Premium Monthly',
    status: 'ACTIVE',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    daysLeft: 12,
    totalDays: 30,
    fee: 2999,
  },
  attendance: {
    thisMonth: 18,
    streak: 7,
    longestStreak: 14,
    totalVisits: 147,
    lastVisit: 'Today, 7:15 AM',
  },
  ptSessions: {
    total: 20,
    completed: 14,
    remaining: 6,
    nextSession: {
      trainer: 'Arjun Mehta',
      date: 'Tomorrow',
      time: '8:00 AM',
      type: 'Strength',
    },
  },
  recentVisits: [
    { date: 'Mon 18 Aug', checkIn: '07:05 AM', checkOut: '08:45 AM', duration: '1h 40m' },
    { date: 'Sat 16 Aug', checkIn: '06:55 AM', checkOut: '08:30 AM', duration: '1h 35m' },
    { date: 'Fri 15 Aug', checkIn: '07:10 AM', checkOut: '08:20 AM', duration: '1h 10m' },
    { date: 'Thu 14 Aug', checkIn: '06:50 AM', checkOut: '08:00 AM', duration: '1h 10m' },
    { date: 'Wed 13 Aug', checkIn: '07:00 AM', checkOut: '08:40 AM', duration: '1h 40m' },
  ],
  invoices: [
    { id: 'INV-2240', amount: 2999, status: 'PAID', date: '01 Aug 2026', plan: 'Premium Monthly' },
    { id: 'INV-2180', amount: 2999, status: 'PAID', date: '01 Jul 2026', plan: 'Premium Monthly' },
  ],
};

// ── Attendance calendar strip ─────────────────────────────────────────────────
// Simple last-14-days indicator

const VISIT_DAYS_14 = [true, false, true, true, true, false, true, true, true, false, false, true, true, true];

function AttendanceStrip() {
  return (
    <Box>
      <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', mb: 1 }}>Last 14 days</Typography>
      <Box sx={{ display: 'flex', gap: 0.75 }}>
        {VISIT_DAYS_14.map((visited, i) => (
          <Box key={i} sx={{
            width: 18, height: 18, borderRadius: 0.75, flexShrink: 0,
            bgcolor: visited ? '#10b981' : 'rgba(255,255,255,0.07)',
            boxShadow: visited ? '0 0 6px rgba(16,185,129,0.35)' : 'none',
            transition: 'background 0.15s',
          }} />
        ))}
      </Box>
    </Box>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MemberDashboardPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const { membership, attendance, ptSessions, recentVisits } = MEMBER_DATA;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const membershipPct = Math.round((membership.daysLeft / membership.totalDays) * 100);
  const expiryColor = membershipPct > 30 ? '#10b981' : membershipPct > 10 ? '#f59e0b' : '#f43f5e';
  const ptPct = Math.round((ptSessions.completed / ptSessions.total) * 100);

  return (
    <Box>
      {/* Welcome */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
          Member Dashboard
        </Typography>
        <Typography component="h1" sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: 'text.primary', lineHeight: 1 }}>
          Welcome back, {user?.firstName}! 🏋️
        </Typography>
        <Typography sx={{ mt: 0.75, fontSize: '0.85rem', color: 'text.secondary' }}>
          Member #{MEMBER_DATA.memberNumber} · {attendance.streak}-day streak 🔥
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* ── Left column ── */}
        <Grid item xs={12} md={8}>
          <Stack spacing={2}>
            {/* Membership card */}
            {loading ? <Skeleton variant="rounded" height={180} sx={{ borderRadius: 2 }} /> : (
              <Card elevation={0} sx={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.06) 100%)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Chip label={membership.status} size="small" icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />}
                        sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700, mb: 1 }} />
                      <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: 'text.primary' }}>
                        {membership.planName}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.25 }}>
                        {membership.startDate} → {membership.endDate}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: expiryColor, letterSpacing: '-0.05em' }}>
                        {membership.daysLeft}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>days left</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>Membership validity</Typography>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: expiryColor }}>{membershipPct}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={membershipPct} sx={{
                      height: 6, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.08)',
                      '& .MuiLinearProgress-bar': { bgcolor: expiryColor, borderRadius: 4 },
                    }} />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button component={Link} href="/member/membership" size="small" variant="contained"
                      sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, flex: 1, fontWeight: 700, fontSize: '0.8rem' }}>
                      Renew Membership
                    </Button>
                    <Button component={Link} href="/member/invoices" size="small" variant="outlined"
                      sx={{ borderColor: 'rgba(16,185,129,0.3)', color: '#10b981', '&:hover': { borderColor: '#10b981', bgcolor: 'rgba(16,185,129,0.06)' } }}>
                      View Invoices
                    </Button>
                  </Box>

                  {membership.daysLeft <= 7 && (
                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 1.5, bgcolor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                      <WarningAmberRoundedIcon sx={{ fontSize: 16, color: '#f59e0b', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.75rem', color: '#f59e0b' }}>
                        Your membership expires in {membership.daysLeft} days. Renew now to avoid a break.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Attendance stats */}
            {loading ? <Skeleton variant="rounded" height={160} sx={{ borderRadius: 2 }} /> : (
              <Card elevation={0}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
                      My Attendance
                    </Typography>
                    <Button component={Link} href="/member/attendance" size="small"
                      sx={{ fontSize: '0.75rem', color: '#10b981', '&:hover': { bgcolor: 'rgba(16,185,129,0.08)' } }}>
                      Full history
                    </Button>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    {[
                      { label: 'This Month', value: attendance.thisMonth, icon: CalendarMonthRoundedIcon, color: '#10b981' },
                      { label: 'Current Streak', value: `${attendance.streak}🔥`, icon: LocalFireDepartmentRoundedIcon, color: '#f97316' },
                      { label: 'Best Streak', value: attendance.longestStreak, icon: FitnessCenterRoundedIcon, color: '#8b5cf6' },
                      { label: 'All Time', value: attendance.totalVisits, icon: CheckCircleRoundedIcon, color: '#06b6d4' },
                    ].map((stat) => (
                      <Grid item xs={6} sm={3} key={stat.label}>
                        <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: alpha(stat.color, 0.06), border: `1px solid ${alpha(stat.color, 0.12)}` }}>
                          <stat.icon sx={{ fontSize: 18, color: stat.color, mb: 0.5 }} />
                          <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: 'text.primary', letterSpacing: '-0.04em' }}>
                            {stat.value}
                          </Typography>
                          <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>{stat.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <AttendanceStrip />
                </CardContent>
              </Card>
            )}

            {/* PT Sessions card */}
            {loading ? <Skeleton variant="rounded" height={150} sx={{ borderRadius: 2 }} /> : (
              <Card elevation={0}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
                      Personal Training
                    </Typography>
                    <Button component={Link} href="/member/sessions" size="small"
                      sx={{ fontSize: '0.75rem', color: '#ec4899', '&:hover': { bgcolor: 'rgba(236,72,153,0.08)' } }}>
                      View all
                    </Button>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    {[
                      { label: 'Total Package', value: ptSessions.total },
                      { label: 'Completed', value: ptSessions.completed, color: '#10b981' },
                      { label: 'Remaining', value: ptSessions.remaining, color: '#ec4899' },
                    ].map((s) => (
                      <Grid item xs={4} key={s.label}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: s.color ?? 'text.primary', letterSpacing: '-0.05em' }}>
                            {s.value}
                          </Typography>
                          <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>{s.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Box sx={{ mb: 2 }}>
                    <LinearProgress variant="determinate" value={ptPct} sx={{
                      height: 6, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.07)',
                      '& .MuiLinearProgress-bar': { bgcolor: '#ec4899', borderRadius: 4 },
                    }} />
                  </Box>

                  {/* Next session */}
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.15)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <EventNoteRoundedIcon sx={{ fontSize: 22, color: '#ec4899', flexShrink: 0 }} />
                    <Box>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#ec4899' }}>
                        Next session: {ptSessions.nextSession.date}, {ptSessions.nextSession.time}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                        with {ptSessions.nextSession.trainer} · {ptSessions.nextSession.type}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>

        {/* ── Right column ── */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            {/* QR Check-in card */}
            {loading ? <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} /> : (
              <Card elevation={0} sx={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.04) 100%)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: 'text.primary', mb: 1.5 }}>
                    Quick Check-in
                  </Typography>
                  {/* QR code placeholder */}
                  <Box sx={{
                    width: 120, height: 120, mx: 'auto', mb: 1.5,
                    borderRadius: 2, bgcolor: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <QrCode2RoundedIcon sx={{ fontSize: 80, color: '#0a0a0a' }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mb: 1 }}>
                    Show this code at the front desk
                  </Typography>
                  <Chip label={MEMBER_DATA.memberNumber} size="small"
                    sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700, letterSpacing: '0.05em' }} />
                </CardContent>
              </Card>
            )}

            {/* Recent visits */}
            {loading ? <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2 }} /> : (
              <Card elevation={0}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
                      Recent Visits
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>
                      Last: {attendance.lastVisit}
                    </Typography>
                  </Box>
                  <Stack divider={<Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}>
                    {recentVisits.map((visit, i) => (
                      <Box key={i} sx={{ py: 1.25 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'text.primary' }}>
                            {visit.date}
                          </Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                            {visit.duration}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled' }}>
                          {visit.checkIn} – {visit.checkOut}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
