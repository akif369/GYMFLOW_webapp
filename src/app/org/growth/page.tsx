'use client';
import { Box, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';

export default function GrowthPage() {
  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
            Business Intelligence
          </Typography>
          <Typography component="h1" sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: 'text.primary' }}>
            Growth & Retention
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<AutorenewRoundedIcon />} size="small"
          sx={{ borderColor: 'rgba(255,255,255,0.12)', color: '#c9d1d9', '&:hover': { borderColor: '#f59e0b', color: '#f59e0b' } }}>
          Refresh Data
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'New Signups (MTD)', value: '142', change: '+24%', color: '#10b981' },
          { label: 'Member Retention Rate', value: '88.5%', change: '+1.2%', color: '#10b981' },
          { label: 'Churn Rate', value: '3.4%', change: '-0.5%', color: '#10b981' },
        ].map((kpi, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <Card elevation={0} sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
                  {kpi.label}
                </Typography>
                <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                  {kpi.value}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: kpi.color }}>
                  {kpi.change} vs last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Area */}
      <Card elevation={0} sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <TrendingUpRoundedIcon sx={{ fontSize: 32, color: '#f59e0b' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Advanced Analytics Coming Soon</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            We are building cohort analysis, lead conversion funnels, and predictive retention modeling to help you scale your business faster.
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
