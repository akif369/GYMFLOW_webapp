'use client';
import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Avatar, Chip, Grid,
  TextField, InputAdornment, LinearProgress, Divider, Button,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';

const CLIENTS = [
  { id: '1', name: 'Arjun Mehta',   avatar: 'AM', goal: 'Muscle Gain',  sessions: 28, attendance: 96, plan: 'Strength Pro',    status: 'ACTIVE',  lastSession: 'Today',        nextSession: 'Tomorrow 7 AM',  progressPct: 82 },
  { id: '2', name: 'Priya Sharma',  avatar: 'PS', goal: 'Weight Loss',  sessions: 24, attendance: 91, plan: 'Cardio Blast',   status: 'ACTIVE',  lastSession: 'Today',        nextSession: 'Wed 8 AM',       progressPct: 70 },
  { id: '3', name: 'Rahul Gupta',   avatar: 'RG', goal: 'Flexibility',  sessions: 20, attendance: 82, plan: 'Yoga + Stretch', status: 'ACTIVE',  lastSession: 'Yesterday',    nextSession: 'Today 10:30 AM', progressPct: 58 },
  { id: '4', name: 'Neha Joshi',    avatar: 'NJ', goal: 'Core Strength',sessions: 18, attendance: 78, plan: 'HIIT Core',      status: 'ACTIVE',  lastSession: 'Mon',          nextSession: 'Today 12 PM',    progressPct: 55 },
  { id: '5', name: 'Vikram Singh',  avatar: 'VS', goal: 'Endurance',    sessions: 15, attendance: 73, plan: 'Cardio+Power',   status: 'ACTIVE',  lastSession: '3 days ago',   nextSession: 'Today 5:30 PM',  progressPct: 44 },
  { id: '6', name: 'Anjali Rao',    avatar: 'AR', goal: 'Toning',       sessions: 12, attendance: 67, plan: 'Pilates Tone',   status: 'ACTIVE',  lastSession: '5 days ago',   nextSession: 'Today 7 PM',     progressPct: 38 },
  { id: '7', name: 'Ravi Kumar',    avatar: 'RK', goal: 'Sports Perf.', sessions: 8,  attendance: 50, plan: 'Athletic Perf.', status: 'INACTIVE',lastSession: '2 weeks ago',  nextSession: '—',              progressPct: 22 },
  { id: '8', name: 'Meena Iyer',    avatar: 'MI', goal: 'Post-Rehab',   sessions: 6,  attendance: 45, plan: 'Rehab & Flex',   status: 'INACTIVE',lastSession: '3 weeks ago',  nextSession: '—',              progressPct: 18 },
];

export default function TrainerClientsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const filtered = CLIENTS.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.goal.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || c.status === filter;
    return matchSearch && matchFilter;
  });

  const active = CLIENTS.filter((c) => c.status === 'ACTIVE').length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
            Client Management
          </Typography>
          <Typography component="h1" sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: 'text.primary' }}>
            My Clients
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: '0.85rem', color: 'text.secondary' }}>
            {active} active · {CLIENTS.length - active} inactive
          </Typography>
        </Box>
        <Button
          startIcon={<PersonAddRoundedIcon />}
          variant="contained"
          size="small"
          sx={{ bgcolor: '#ec4899', '&:hover': { bgcolor: '#be185d' } }}
        >
          Request Client
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search clients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 240 }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} /></InputAdornment>,
            },
          }}
        />
        {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((f) => (
          <Chip
            key={f}
            label={f}
            size="small"
            onClick={() => setFilter(f)}
            sx={{
              fontWeight: 700, cursor: 'pointer',
              bgcolor: filter === f ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.05)',
              color: filter === f ? '#ec4899' : 'text.secondary',
              border: `1px solid ${filter === f ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}
          />
        ))}
      </Box>

      {/* Client cards */}
      <Grid container spacing={2}>
        {filtered.map((client) => {
          const attColor = client.attendance >= 85 ? '#10b981' : client.attendance >= 70 ? '#f59e0b' : '#f87171';
          const isActive = client.status === 'ACTIVE';
          return (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={client.id}>
              <Card elevation={0} sx={{
                height: '100%', transition: 'transform 0.18s, border-color 0.18s',
                '&:hover': { transform: 'translateY(-2px)', borderColor: 'rgba(236,72,153,0.25)' },
                opacity: isActive ? 1 : 0.6,
              }}>
                <Box sx={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, #ec4899 0%, transparent 100%)`,
                }} />
                <CardContent sx={{ p: 2.5 }}>
                  {/* Client header */}
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                    <Avatar sx={{
                      width: 44, height: 44, fontWeight: 700, fontSize: '0.88rem',
                      bgcolor: 'rgba(236,72,153,0.12)', color: '#ec4899', flexShrink: 0,
                    }}>
                      {client.avatar}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: 'text.primary' }}>
                        {client.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {client.goal}
                      </Typography>
                      <Chip label={client.plan} size="small" sx={{ mt: 0.5, height: 18, fontSize: '0.62rem', fontWeight: 600, bgcolor: 'rgba(139,92,246,0.12)', color: '#a78bfa' }} />
                    </Box>
                    <Chip
                      label={client.status}
                      size="small"
                      sx={{
                        height: 20, fontSize: '0.65rem', fontWeight: 700, alignSelf: 'flex-start',
                        bgcolor: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                        color: isActive ? '#10b981' : '#9ca3af',
                      }}
                    />
                  </Box>

                  {/* Progress bar */}
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>Goal Progress</Typography>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#ec4899' }}>{client.progressPct}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={client.progressPct} sx={{
                      height: 4, borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.06)',
                      '& .MuiLinearProgress-bar': { bgcolor: '#ec4899', borderRadius: 4 },
                    }} />
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 1.5 }} />

                  {/* Stats */}
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: 'text.primary' }}>{client.sessions}</Typography>
                        <Typography sx={{ fontSize: '0.62rem', color: 'text.disabled' }}>Sessions</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: attColor }}>{client.attendance}%</Typography>
                        <Typography sx={{ fontSize: '0.62rem', color: 'text.disabled' }}>Attendance</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <CheckCircleRoundedIcon sx={{ fontSize: 16, color: isActive ? '#10b981' : '#6b7280', display: 'block', mx: 'auto', mb: 0.25 }} />
                        <Typography sx={{ fontSize: '0.62rem', color: 'text.disabled' }}>Status</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1.5 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'text.disabled' }}>
                    <span>Last: {client.lastSession}</span>
                    {isActive && <span style={{ color: '#a78bfa' }}>Next: {client.nextSession}</span>}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
