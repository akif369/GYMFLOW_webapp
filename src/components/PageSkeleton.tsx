import React from 'react';
import { Box, Stack, Skeleton, Grid, alpha, useTheme } from '@mui/material';

export default function PageSkeleton() {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%', minHeight: '80vh', p: { xs: 2, md: 3 }, pt: { xs: 3, md: 4 } }}>
      {/* ─── Header Skeleton ────────────────────────────────────────────────── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 4 }}
      >
        <Box>
          <Skeleton variant="text" width={240} height={40} sx={{ bgcolor: alpha(theme.palette.text.primary, 0.08) }} />
          <Skeleton variant="text" width={160} height={20} sx={{ bgcolor: alpha(theme.palette.text.primary, 0.05), mt: 0.5 }} />
        </Box>
        <Stack direction="row" sx={{ gap: 1 }}>
          <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1.5, bgcolor: alpha(theme.palette.text.primary, 0.08) }} />
          <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1.5, bgcolor: alpha(theme.palette.text.primary, 0.05), display: { xs: 'none', sm: 'block' } }} />
        </Stack>
      </Stack>

      {/* ─── Live Strip Skeleton ────────────────────────────────────────────── */}
      <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 2, mb: 4, bgcolor: alpha(theme.palette.text.primary, 0.04) }} />

      {/* ─── KPI Cards Skeleton ─────────────────────────────────────────────── */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid size={{ xs: 6, sm: 4, md: 4, lg: 2 }} key={item}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                bgcolor: alpha(theme.palette.background.paper, 0.3)
              }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1.5 }}>
                  <Skeleton variant="rectangular" width={34} height={34} sx={{ borderRadius: 1.5, bgcolor: alpha(theme.palette.text.primary, 0.08) }} />
                </Stack>
                <Skeleton variant="text" width="60%" height={24} sx={{ bgcolor: alpha(theme.palette.text.primary, 0.08) }} />
                <Skeleton variant="text" width="80%" height={32} sx={{ bgcolor: alpha(theme.palette.text.primary, 0.1) }} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ─── Main Content Area Skeleton ─────────────────────────────────────── */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.3) }} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.3) }} />
        </Grid>
      </Grid>
    </Box>
  );
}
