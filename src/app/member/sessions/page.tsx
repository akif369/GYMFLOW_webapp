'use client';
import {
  Box, Card, CardContent, Typography, Chip, Stack, Divider, Button, Avatar,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

const SESSIONS = [
  { id: '1', trainer: 'Arjun Mehta', avatar: 'AM', date: 'Tomorrow', time: '08:00 AM', duration: '60 min', type: 'Strength Training', status: 'UPCOMING', notes: '' },
  { id: '2', trainer: 'Arjun Mehta', avatar: 'AM', date: 'Mon, 25 Aug', time: '08:00 AM', duration: '60 min', type: 'Strength Training', status: 'UPCOMING', notes: '' },
  { id: '3', trainer: 'Arjun Mehta', avatar: 'AM', date: 'Mon, 18 Aug', time: '07:00 AM', duration: '60 min', type: 'Strength Training', status: 'COMPLETED', notes: 'Great session! Hit new PR on bench.' },
  { id: '4', trainer: 'Arjun Mehta', avatar: 'AM', date: 'Thu, 14 Aug', time: '07:00 AM', duration: '60 min', type: 'Cardio + Core',    status: 'COMPLETED', notes: 'Improved endurance by 15%' },
  { id: '5', trainer: 'Arjun Mehta', avatar: 'AM', date: 'Mon, 11 Aug', time: '07:00 AM', duration: '60 min', type: 'Leg Day',          status: 'COMPLETED', notes: '' },
  { id: '6', trainer: 'Arjun Mehta', avatar: 'AM', date: 'Thu,  7 Aug', time: '07:00 AM', duration: '60 min', type: 'Upper Body',       status: 'COMPLETED', notes: 'Focused on form correction' },
  { id: '7', trainer: 'Arjun Mehta', avatar: 'AM', date: 'Mon,  4 Aug', time: '07:00 AM', duration: '60 min', type: 'Strength Training', status: 'MISSED', notes: '' },
];

const STATUS_STYLES = {
  COMPLETED: { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', icon: CheckCircleRoundedIcon },
  UPCOMING:  { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa', icon: AccessTimeRoundedIcon },
  MISSED:    { bg: 'rgba(244,63,94,0.12)',   color: '#f87171', icon: CancelRoundedIcon },
};

export default function MemberSessionsPage() {
  const completed = SESSIONS.filter((s) => s.status === 'COMPLETED').length;
  const remaining = SESSIONS.filter((s) => s.status === 'UPCOMING').length;
  const missed    = SESSIONS.filter((s) => s.status === 'MISSED').length;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
          Personal Training
        </Typography>
        <Typography component="h1" sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: 'text.primary' }}>
          My PT Sessions
        </Typography>
      </Box>

      {/* Summary row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Completed', value: completed, color: '#10b981' },
          { label: 'Remaining', value: remaining, color: '#60a5fa' },
          { label: 'Missed',    value: missed,    color: '#f87171' },
        ].map((s) => (
          <Card elevation={0} key={s.label} sx={{ flex: 1, minWidth: 100 }}>
            <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
              <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: s.color, letterSpacing: '-0.06em' }}>{s.value}</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{s.label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card elevation={0}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary', mb: 2 }}>
            Session History
          </Typography>
          <Stack divider={<Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}>
            {SESSIONS.map((session) => {
              const sc = STATUS_STYLES[session.status as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.UPCOMING;
              return (
                <Box key={session.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 1.5 }}>
                  <Avatar sx={{
                    width: 38, height: 38, flexShrink: 0, fontWeight: 700, fontSize: '0.78rem',
                    bgcolor: 'rgba(236,72,153,0.12)', color: '#ec4899',
                  }}>
                    {session.avatar}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: 'text.primary' }}>
                        {session.type}
                      </Typography>
                      <Chip label={session.status} size="small"
                        sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: sc.bg, color: sc.color }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                      {session.trainer} · {session.date} at {session.time} · {session.duration}
                    </Typography>
                    {session.notes && (
                      <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', mt: 0.5, fontStyle: 'italic' }}>
                        "{session.notes}"
                      </Typography>
                    )}
                  </Box>
                  {session.status === 'UPCOMING' && (
                    <Button size="small" color="error" variant="text"
                      sx={{ fontSize: '0.72rem', color: '#f87171', '&:hover': { bgcolor: 'rgba(244,63,94,0.08)' }, flexShrink: 0 }}>
                      Cancel
                    </Button>
                  )}
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
