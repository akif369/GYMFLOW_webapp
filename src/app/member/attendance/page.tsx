'use client';
import {
  Box, Card, CardContent, Typography, Chip, Stack, Divider, Grid,
} from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';

const VISITS = [
  { date: 'Mon, 18 Aug 2026', checkIn: '07:05 AM', checkOut: '08:45 AM', duration: '1h 40m', branch: 'Koramangala' },
  { date: 'Sat, 16 Aug 2026', checkIn: '06:55 AM', checkOut: '08:30 AM', duration: '1h 35m', branch: 'Koramangala' },
  { date: 'Fri, 15 Aug 2026', checkIn: '07:10 AM', checkOut: '08:20 AM', duration: '1h 10m', branch: 'Koramangala' },
  { date: 'Thu, 14 Aug 2026', checkIn: '06:50 AM', checkOut: '08:00 AM', duration: '1h 10m', branch: 'Koramangala' },
  { date: 'Wed, 13 Aug 2026', checkIn: '07:00 AM', checkOut: '08:40 AM', duration: '1h 40m', branch: 'Koramangala' },
  { date: 'Tue, 12 Aug 2026', checkIn: '07:15 AM', checkOut: '08:45 AM', duration: '1h 30m', branch: 'Koramangala' },
  { date: 'Mon, 11 Aug 2026', checkIn: '07:00 AM', checkOut: '08:30 AM', duration: '1h 30m', branch: 'Koramangala' },
  { date: 'Sat,  9 Aug 2026', checkIn: '08:00 AM', checkOut: '09:30 AM', duration: '1h 30m', branch: 'Indiranagar' },
  { date: 'Fri,  8 Aug 2026', checkIn: '07:10 AM', checkOut: '08:25 AM', duration: '1h 15m', branch: 'Koramangala' },
  { date: 'Thu,  7 Aug 2026', checkIn: '07:00 AM', checkOut: '08:45 AM', duration: '1h 45m', branch: 'Koramangala' },
];

// 14-day grid
const DAYS_14 = [true, false, true, true, true, false, true, true, true, false, false, true, true, true];
const DAY_LABELS = ['5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'];

export default function MemberAttendancePage() {
  const totalHours = Math.round(VISITS.reduce((acc, v) => {
    const [h, m] = v.duration.replace('h ', ':').replace('m', '').split(':').map(Number);
    return acc + h + (m ?? 0) / 60;
  }, 0));

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
          Attendance History
        </Typography>
        <Typography component="h1" sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: 'text.primary' }}>
          My Visits
        </Typography>
      </Box>

      {/* Stats row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Visits This Month', value: 18, icon: CalendarMonthRoundedIcon, color: '#10b981' },
          { label: 'Current Streak', value: '7 🔥', icon: LocalFireDepartmentRoundedIcon, color: '#f97316' },
          { label: 'Total Hours', value: `${totalHours}h`, icon: AccessTimeRoundedIcon, color: '#8b5cf6' },
          { label: 'Total Visits', value: 147, icon: EmojiEventsRoundedIcon, color: '#f59e0b' },
        ].map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Card elevation={0}>
              <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                <s.icon sx={{ fontSize: 22, color: s.color, mb: 0.5 }} />
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: 'text.primary', letterSpacing: '-0.05em' }}>
                  {s.value}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 14-day heatmap */}
      <Card elevation={0} sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary', mb: 0.5 }}>
            Activity — Last 14 Days
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 2 }}>
            Aug 5 – Aug 18, 2026
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {DAYS_14.map((visited, i) => (
              <Box key={i} sx={{ flex: 1, textAlign: 'center' }}>
                <Box sx={{
                  height: 32, borderRadius: 1, mb: 0.5,
                  bgcolor: visited ? '#10b981' : 'rgba(255,255,255,0.07)',
                  boxShadow: visited ? '0 0 8px rgba(16,185,129,0.4)' : 'none',
                  transition: 'background 0.15s',
                }} />
                <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled' }}>{DAY_LABELS[i]}</Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: '#10b981' }} />
            <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>Visited</Typography>
            <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: 'rgba(255,255,255,0.07)' }} />
            <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>No visit</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Visit list */}
      <Card elevation={0}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary', mb: 2 }}>
            Visit History
          </Typography>
          <Stack divider={<Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}>
            {VISITS.map((visit, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.25 }}>
                <AccessTimeRoundedIcon sx={{ fontSize: 18, color: '#10b981', flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary' }}>
                    {visit.date}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                    {visit.checkIn} – {visit.checkOut} · {visit.branch}
                  </Typography>
                </Box>
                <Chip label={visit.duration} size="small"
                  sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700, fontSize: '0.72rem' }} />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
