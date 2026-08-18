'use client';
import {
  Box, Card, CardContent, Typography, Chip, Grid, Button,
  LinearProgress, Avatar, Stack, Divider,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import Link from 'next/link';

const BRANCHES = [
  { id: '1', name: 'Koramangala',  city: 'Bangalore', address: '80 Feet Rd, Koramangala 4th Block',   members: 820, capacity: 1000, revenue: 284000, growth: 15.2,  staff: 12, trainers: 5, status: 'ACTIVE', isMain: true },
  { id: '2', name: 'Indiranagar',  city: 'Bangalore', address: '100 Feet Rd, Indiranagar',             members: 710, capacity: 900,  revenue: 241000, growth: 9.8,   staff: 10, trainers: 4, status: 'ACTIVE', isMain: false },
  { id: '3', name: 'HSR Layout',   city: 'Bangalore', address: '27th Main, HSR Layout Sector 2',       members: 648, capacity: 800,  revenue: 218000, growth: 6.4,   staff: 9,  trainers: 3, status: 'ACTIVE', isMain: false },
  { id: '4', name: 'Whitefield',   city: 'Bangalore', address: 'ITPL Main Rd, Whitefield',             members: 669, capacity: 1200, revenue: 200000, growth: -1.2,  staff: 11, trainers: 4, status: 'ACTIVE', isMain: false },
];

export default function OrgBranchesPage() {
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
            Network
          </Typography>
          <Typography component="h1" sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: 'text.primary' }}>
            All Branches
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: '0.85rem', color: 'text.secondary' }}>
            {BRANCHES.length} branches · All operational
          </Typography>
        </Box>
        <Button startIcon={<AddRoundedIcon />} variant="contained" size="small"
          sx={{ bgcolor: '#f59e0b', color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#d97706' } }}>
          Add Branch
        </Button>
      </Box>

      <Grid container spacing={2}>
        {BRANCHES.map((branch) => {
          const occupancy = Math.round((branch.members / branch.capacity) * 100);
          const growthUp = branch.growth >= 0;
          return (
            <Grid item xs={12} md={6} key={branch.id}>
              <Card elevation={0} sx={{
                height: '100%', transition: 'transform 0.18s, border-color 0.18s',
                '&:hover': { transform: 'translateY(-2px)', borderColor: 'rgba(245,158,11,0.25)' },
                position: 'relative', overflow: 'hidden',
              }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #f59e0b 0%, transparent 100%)' }} />
                <CardContent sx={{ p: 2.5 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                    <Avatar sx={{ width: 44, height: 44, bgcolor: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                      {branch.name[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>{branch.name}</Typography>
                        {branch.isMain && <Chip label="Main" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(245,158,11,0.15)', color: '#f59e0b' }} />}
                        <Chip label={branch.status} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981' }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{branch.address}, {branch.city}</Typography>
                    </Box>
                  </Box>

                  {/* Revenue + Growth */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', mb: 0.25 }}>Monthly Revenue</Typography>
                      <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: 'text.primary', letterSpacing: '-0.04em' }}>
                        ₹{(branch.revenue / 1000).toFixed(0)}K
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, alignSelf: 'center', px: 1, py: 0.5, borderRadius: 1.5, bgcolor: growthUp ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)' }}>
                      {growthUp ? <ArrowUpwardRoundedIcon sx={{ fontSize: 13, color: '#4ade80' }} /> : <ArrowDownwardRoundedIcon sx={{ fontSize: 13, color: '#f87171' }} />}
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: growthUp ? '#4ade80' : '#f87171' }}>{Math.abs(branch.growth)}%</Typography>
                    </Box>
                  </Box>

                  {/* Capacity */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>Capacity: {branch.members}/{branch.capacity} members</Typography>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: occupancy >= 70 ? '#10b981' : occupancy >= 50 ? '#f59e0b' : '#f87171' }}>{occupancy}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={occupancy} sx={{
                      height: 6, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.07)',
                      '& .MuiLinearProgress-bar': { bgcolor: occupancy >= 70 ? '#10b981' : occupancy >= 50 ? '#f59e0b' : '#f87171', borderRadius: 4 },
                    }} />
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 1.5 }} />

                  {/* Staff stats */}
                  <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: 'text.primary' }}>{branch.staff}</Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>Staff</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: 'text.primary' }}>{branch.trainers}</Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>Trainers</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: 'text.primary' }}>{branch.members}</Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>Members</Typography>
                    </Box>
                  </Box>

                  <Button variant="outlined" size="small" fullWidth
                    sx={{ borderColor: 'rgba(245,158,11,0.25)', color: '#f59e0b', '&:hover': { borderColor: '#f59e0b', bgcolor: 'rgba(245,158,11,0.06)' } }}>
                    Manage Branch
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
