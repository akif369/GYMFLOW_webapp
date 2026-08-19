'use client';
import { useState, useEffect } from 'react';
import type { ElementType } from 'react';
import Link from 'next/link';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Stack,
  Avatar, LinearProgress, alpha, Button, Divider, Skeleton,
} from '@mui/material';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import PersonOffRoundedIcon from '@mui/icons-material/PersonOffRounded';
import { SparkLineChart } from '@mui/x-charts';
import { useAuthStore } from '@/store/useAuthStore';
import PageSkeleton from '@/components/PageSkeleton';

// ── Mock data (replace with /trainer/me/stats API call) ──────────────────────

const TRAINER_STATS = {
  totalClients: 24,
  activeClients: 21,
  sessionsToday: 6,
  sessionsThisWeek: 28,
  sessionsThisMonth: 112,
  completedSessions: 108,
  cancelledSessions: 4,
  clientAttendanceRate: 87,
  weeklySessionData: [6, 7, 8, 5, 9, 8, 6],
};

const TODAY_SESSIONS = [
  { id: '1', client: 'Arjun Mehta',   time: '07:00 AM', duration: '60 min', type: 'Strength', status: 'COMPLETED', avatar: 'AM' },
  { id: '2', client: 'Priya Sharma',  time: '08:00 AM', duration: '45 min', type: 'Cardio',   status: 'COMPLETED', avatar: 'PS' },
  { id: '3', client: 'Rahul Gupta',   time: '10:30 AM', duration: '60 min', type: 'Yoga',     status: 'UPCOMING',  avatar: 'RG' },
  { id: '4', client: 'Neha Joshi',    time: '12:00 PM', duration: '60 min', type: 'HIIT',     status: 'UPCOMING',  avatar: 'NJ' },
  { id: '5', client: 'Vikram Singh',  time: '05:30 PM', duration: '45 min', type: 'Strength', status: 'UPCOMING',  avatar: 'VS' },
  { id: '6', client: 'Anjali Rao',    time: '07:00 PM', duration: '60 min', type: 'Pilates',  status: 'UPCOMING',  avatar: 'AR' },
];

const TOP_CLIENTS = [
  { id: '1', name: 'Arjun Mehta',  sessions: 28, attendance: 96, goal: 'Muscle gain', avatar: 'AM', trend: 'up' },
  { id: '2', name: 'Priya Sharma', sessions: 24, attendance: 91, goal: 'Weight loss', avatar: 'PS', trend: 'up' },
  { id: '3', name: 'Rahul Gupta',  sessions: 20, attendance: 82, goal: 'Flexibility', avatar: 'RG', trend: 'down' },
  { id: '4', name: 'Neha Joshi',   sessions: 18, attendance: 78, goal: 'Strength',    avatar: 'NJ', trend: 'up' },
];

// ── Sub-components ────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: ElementType;
  color?: string;
  sparkData?: number[];
}

function StatCard({ title, value, sub, icon: Icon, color = '#ec4899', sparkData }: StatCardProps) {
  return (
    <Card elevation={0} sx={{
      height: '100%', position: 'relative', overflow: 'hidden',
      transition: 'transform 0.18s', '&:hover': { transform: 'translateY(-2px)' },
    }}>
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`,
      }} />
      <CardContent sx={{ p: '14px !important', pb: '12px !important' }}>
        <Box sx={{
          width: 34, height: 34, borderRadius: 1.5, mb: 1.25,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: alpha(color, 0.14), border: `1px solid ${alpha(color, 0.22)}`,
        }}>
          <Icon sx={{ fontSize: 17, color }} />
        </Box>
        <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.05em', color: 'text.primary', lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: '0.73rem', color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
          {title}
        </Typography>
        {sub && <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled', mt: 0.25 }}>{sub}</Typography>}
        {sparkData && (
          <Box sx={{ mt: 1.5, height: 30 }}>
            <SparkLineChart data={sparkData} color={color} height={30} showTooltip showHighlight />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

const SESSION_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  COMPLETED: { bg: 'rgba(16,185,129,0.1)',  text: '#10b981' },
  UPCOMING:  { bg: 'rgba(59,130,246,0.1)',  text: '#60a5fa' },
  CANCELLED: { bg: 'rgba(244,63,94,0.1)',   text: '#f87171' },
  MISSED:    { bg: 'rgba(107,114,128,0.1)', text: '#9ca3af' },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TrainerDashboardPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const completedToday = TODAY_SESSIONS.filter((s) => s.status === 'COMPLETED').length;
  const remainingToday = TODAY_SESSIONS.filter((s) => s.status === 'UPCOMING').length;

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
          Trainer Dashboard
        </Typography>
        <Typography component="h1" sx={{ fontSize: { xs: '1.5rem', md: '1.9rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: 'text.primary', lineHeight: 1 }}>
          Good morning, {user?.firstName} 💪
        </Typography>
        <Typography sx={{ mt: 0.75, fontSize: '0.85rem', color: 'text.secondary' }}>
          You have <strong style={{ color: '#ec4899' }}>{remainingToday}</strong> sessions remaining today.
        </Typography>
      </Box>

      {/* Stats row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} md={3}>
                <StatCard title="My Clients" value={TRAINER_STATS.activeClients} sub={`${TRAINER_STATS.totalClients} total`} icon={PeopleRoundedIcon} color="#ec4899" />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard title="Sessions Today" value={TRAINER_STATS.sessionsToday} sub={`${completedToday} done`} icon={EventNoteRoundedIcon} color="#8b5cf6" />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard title="This Month" value={TRAINER_STATS.sessionsThisMonth} sub={`${TRAINER_STATS.completedSessions} completed`} icon={CheckCircleRoundedIcon} color="#10b981" sparkData={TRAINER_STATS.weeklySessionData} />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard title="Attendance Rate" value={`${TRAINER_STATS.clientAttendanceRate}%`} sub="Client avg" icon={TrendingUpRoundedIcon} color="#f59e0b" />
              </Grid>

      </Grid>

      {/* Today's schedule + Client list */}
      <Grid container spacing={2}>
        {/* Today's schedule */}
        <Grid item xs={12} md={7}>
          <Card elevation={0}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
                    Today&apos;s Schedule
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    {completedToday} of {TRAINER_STATS.sessionsToday} sessions complete
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(completedToday / TRAINER_STATS.sessionsToday) * 100}
                  sx={{
                    width: 80, height: 6, borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.06)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#ec4899', borderRadius: 4 },
                  }}
                />
              </Box>
              <Stack divider={<Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={60} sx={{ borderRadius: 1.5 }} />)
                  : TODAY_SESSIONS.map((session) => {
                    const sc = SESSION_STATUS_COLORS[session.status] ?? { bg: 'rgba(107,114,128,0.1)', text: '#9ca3af' };
                    return (
                      <Box key={session.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.25 }}>
                        <Avatar sx={{
                          width: 36, height: 36, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                          bgcolor: session.status === 'COMPLETED' ? 'rgba(16,185,129,0.15)' : 'rgba(236,72,153,0.12)',
                          color: session.status === 'COMPLETED' ? '#10b981' : '#ec4899',
                        }}>
                          {session.avatar}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary' }}>
                            {session.client}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                            <AccessTimeRoundedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                              {session.time} · {session.duration}
                            </Typography>
                            <Chip label={session.type} size="small" sx={{ height: 16, fontSize: '0.62rem', fontWeight: 600, bgcolor: 'rgba(139,92,246,0.12)', color: '#a78bfa' }} />
                          </Box>
                        </Box>
                        <Chip
                          label={session.status}
                          size="small"
                          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: sc.bg, color: sc.text }}
                        />
                      </Box>
                    );
                  })}
              </Stack>
              <Box sx={{ mt: 2 }}>
                <Button component={Link} href="/trainer/sessions" size="small" variant="outlined" fullWidth
                  sx={{ borderColor: 'rgba(236,72,153,0.25)', color: '#ec4899', '&:hover': { borderColor: '#ec4899', bgcolor: 'rgba(236,72,153,0.06)' } }}>
                  View Full Schedule
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top clients */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
                  Top Clients
                </Typography>
                <Button component={Link} href="/trainer/clients" size="small"
                  sx={{ fontSize: '0.75rem', color: '#ec4899', '&:hover': { bgcolor: 'rgba(236,72,153,0.08)' } }}>
                  All clients
                </Button>
              </Box>
              <Stack divider={<Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={58} sx={{ borderRadius: 1.5 }} />)
                  : TOP_CLIENTS.map((client) => (
                    <Box key={client.id} sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25,
                      cursor: 'pointer', borderRadius: 1.5,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                      transition: 'background 0.15s',
                    }}>
                      <Avatar sx={{
                        width: 36, height: 36, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                        bgcolor: 'rgba(236,72,153,0.12)', color: '#ec4899',
                      }}>
                        {client.avatar}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary' }}>
                          {client.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                          {client.goal} · {client.sessions} sessions
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: client.attendance >= 85 ? '#10b981' : client.attendance >= 70 ? '#f59e0b' : '#f87171' }}>
                          {client.attendance}%
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled' }}>
                          attendance
                        </Typography>
                      </Box>
                    </Box>
                  ))}
              </Stack>

              {/* Quick stats */}
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Grid container spacing={1.5}>
                  {[
                    { label: 'Missed this month', value: TRAINER_STATS.cancelledSessions, icon: PersonOffRoundedIcon, color: '#f43f5e' },
                    { label: 'Weekly sessions', value: TRAINER_STATS.sessionsThisWeek, icon: FitnessCenterRoundedIcon, color: '#8b5cf6' },
                  ].map((stat) => (
                    <Grid item xs={6} key={stat.label}>
                      <Box sx={{
                        p: 1.25, borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}>
                        <stat.icon sx={{ fontSize: 14, color: stat.color, mb: 0.5 }} />
                        <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: 'text.primary', letterSpacing: '-0.04em' }}>
                          {stat.value}
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
