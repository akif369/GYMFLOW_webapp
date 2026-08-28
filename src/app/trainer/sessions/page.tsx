'use client';
import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Chip, Stack, Avatar,
  Button, Grid, IconButton, alpha,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Get week dates relative to today
function getWeekDates(offsetWeeks = 0) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + offsetWeeks * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const ALL_SESSIONS = [
  { id: '1',  client: 'Arjun Mehta',  avatar: 'AM', time: '07:00', duration: 60, type: 'Strength', day: 0, status: 'COMPLETED', notes: 'Great progress on bench press' },
  { id: '2',  client: 'Priya Sharma', avatar: 'PS', time: '08:00', duration: 45, type: 'Cardio',   day: 0, status: 'COMPLETED', notes: 'Hit target HR zone' },
  { id: '3',  client: 'Rahul Gupta',  avatar: 'RG', time: '10:30', duration: 60, type: 'Yoga',     day: 0, status: 'UPCOMING',  notes: '' },
  { id: '4',  client: 'Neha Joshi',   avatar: 'NJ', time: '12:00', duration: 60, type: 'HIIT',     day: 0, status: 'UPCOMING',  notes: '' },
  { id: '5',  client: 'Vikram Singh', avatar: 'VS', time: '17:30', duration: 45, type: 'Strength', day: 0, status: 'UPCOMING',  notes: '' },
  { id: '6',  client: 'Anjali Rao',   avatar: 'AR', time: '19:00', duration: 60, type: 'Pilates',  day: 0, status: 'UPCOMING',  notes: '' },
  { id: '7',  client: 'Arjun Mehta',  avatar: 'AM', time: '07:00', duration: 60, type: 'Strength', day: 1, status: 'UPCOMING',  notes: '' },
  { id: '8',  client: 'Meena Iyer',   avatar: 'MI', time: '09:00', duration: 45, type: 'Rehab',    day: 1, status: 'UPCOMING',  notes: '' },
  { id: '9',  client: 'Ravi Kumar',   avatar: 'RK', time: '18:00', duration: 60, type: 'Athletic', day: 2, status: 'UPCOMING',  notes: '' },
  { id: '10', client: 'Priya Sharma', avatar: 'PS', time: '08:00', duration: 45, type: 'Cardio',   day: 3, status: 'UPCOMING',  notes: '' },
  { id: '11', client: 'Neha Joshi',   avatar: 'NJ', time: '12:00', duration: 60, type: 'HIIT',     day: 4, status: 'UPCOMING',  notes: '' },
  { id: '12', client: 'Vikram Singh', avatar: 'VS', time: '17:30', duration: 45, type: 'Strength', day: 5, status: 'UPCOMING',  notes: '' },
];

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  COMPLETED: { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', label: 'Done' },
  UPCOMING:  { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa', label: 'Upcoming' },
  CANCELLED: { bg: 'rgba(244,63,94,0.12)',   color: '#f87171', label: 'Cancelled' },
  MISSED:    { bg: 'rgba(107,114,128,0.12)', color: '#9ca3af', label: 'Missed' },
};

const TYPE_COLORS: Record<string, string> = {
  Strength: '#f59e0b', Cardio: '#10b981', Yoga: '#8b5cf6',
  HIIT: '#f43f5e', Pilates: '#ec4899', Rehab: '#06b6d4', Athletic: '#f97316',
};

export default function TrainerSessionsPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const weekDates = getWeekDates(weekOffset);

  const daySessions = ALL_SESSIONS.filter((s) => s.day === selectedDay);
  const today = new Date();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
            Schedule
          </Typography>
          <Typography component="h1" sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: 'text.primary' }}>
            PT Sessions
          </Typography>
        </Box>
        <Button startIcon={<AddRoundedIcon />} variant="contained" size="small"
          sx={{ bgcolor: '#ec4899', '&:hover': { bgcolor: '#be185d' } }}>
          Book Session
        </Button>
      </Box>

      {/* Week navigator */}
      <Card elevation={0} sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <IconButton size="small" onClick={() => setWeekOffset((w) => w - 1)} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
              <ChevronLeftRoundedIcon />
            </IconButton>
            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: 'text.primary' }}>
              {weekOffset === 0 ? 'This Week' : weekOffset === -1 ? 'Last Week' : weekOffset === 1 ? 'Next Week' : `Week of ${weekDates[0]?.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`}
            </Typography>
            <IconButton size="small" onClick={() => setWeekOffset((w) => w + 1)} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
              <ChevronRightRoundedIcon />
            </IconButton>
          </Box>

          {/* Day selector */}
          <Grid container spacing={1}>
            {weekDates.map((date, idx) => {
              const isToday = weekOffset === 0 && date.getDate() === today.getDate();
              const isSelected = selectedDay === idx;
              const sessionCount = ALL_SESSIONS.filter((s) => s.day === idx).length;
              return (
                <Grid size="grow" key={idx}>
                  <Box
                    onClick={() => setSelectedDay(idx)}
                    sx={{
                      textAlign: 'center', p: 1, borderRadius: 2, cursor: 'pointer',
                      bgcolor: isSelected ? 'rgba(236,72,153,0.15)' : isToday ? 'divider' : 'transparent',
                      border: `1px solid ${isSelected ? 'rgba(236,72,153,0.35)' : isToday ? 'rgba(255,255,255,0.12)' : 'transparent'}`,
                      transition: 'all 0.15s',
                      '&:hover': { bgcolor: 'rgba(236,72,153,0.1)' },
                    }}
                  >
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: isSelected ? '#ec4899' : 'text.disabled', textTransform: 'uppercase', mb: 0.5 }}>
                      {WEEK_DAYS[idx]}
                    </Typography>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: isSelected ? '#ec4899' : isToday ? 'text.primary' : 'text.secondary' }}>
                      {date.getDate()}
                    </Typography>
                    {sessionCount > 0 && (
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: isSelected ? '#ec4899' : '#6b7280', mx: 'auto', mt: 0.5 }} />
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Sessions for selected day */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
          {WEEK_DAYS[selectedDay]} · {weekDates[selectedDay]?.toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}
        </Typography>
        <Chip label={`${daySessions.length} sessions`} size="small"
          sx={{ bgcolor: 'rgba(236,72,153,0.1)', color: '#ec4899', fontWeight: 700 }} />
      </Box>

      {daySessions.length === 0 ? (
        <Card elevation={0}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <AccessTimeRoundedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>No sessions scheduled for this day.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {daySessions.map((session) => {
            const sc = STATUS_STYLES[session.status] ?? STATUS_STYLES.UPCOMING;
            const typeColor = TYPE_COLORS[session.type] ?? '#6b7280';
            return (
              <Card key={session.id} elevation={0} sx={{
                transition: 'border-color 0.18s',
                '&:hover': { borderColor: alpha(typeColor, 0.3) },
              }}>
                <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, '&:last-child': { pb: 2 } }}>
                  {/* Time */}
                  <Box sx={{ textAlign: 'center', minWidth: 50, flexShrink: 0 }}>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: 'text.primary' }}>{session.time}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>{session.duration}m</Typography>
                  </Box>
                  {/* Divider line */}
                  <Box sx={{ width: 1, bgcolor: alpha(typeColor, 0.3), alignSelf: 'stretch', borderRadius: 4, flexShrink: 0 }} />
                  {/* Client */}
                  <Avatar sx={{ width: 34, height: 34, fontSize: '0.75rem', fontWeight: 700, bgcolor: alpha(typeColor, 0.14), color: typeColor, flexShrink: 0 }}>
                    {session.avatar}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: 'text.primary' }}>{session.client}</Typography>
                    <Chip label={session.type} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: alpha(typeColor, 0.12), color: typeColor }} />
                    {session.notes && (
                      <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', mt: 0.25 }}>{session.notes}</Typography>
                    )}
                  </Box>
                  {/* Status + Actions */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                    <Chip label={sc?.label} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: sc?.bg, color: sc?.color }} />
                    {session.status === 'UPCOMING' && (
                      <>
                        <IconButton size="small" sx={{ color: '#10b981', '&:hover': { bgcolor: 'rgba(16,185,129,0.1)' } }}>
                          <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#f43f5e', '&:hover': { bgcolor: 'rgba(244,63,94,0.1)' } }}>
                          <CancelRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
