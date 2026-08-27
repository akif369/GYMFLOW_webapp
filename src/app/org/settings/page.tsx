'use client';
import { toast } from 'react-hot-toast';
import { Box, Typography, Card, CardContent, Grid, Button, TextField } from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

export default function SettingsPage() {
  return (
    <Box sx={{ pb: 6, maxWidth: 800 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
          Configuration
        </Typography>
        <Typography component="h1" sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: 'text.primary' }}>
          Organization Settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Organization Profile */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={0}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Organization Profile</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField label="Organization Name" fullWidth defaultValue="Iron Zone Fitness" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField label="Support Email" fullWidth defaultValue="support@ironzone.com" />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Registered Address" fullWidth multiline rows={2} defaultValue="123 Fitness Ave, Bangalore" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Financial & Tax Settings */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={0}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Financial & Billing</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Configure global taxation and invoice formatting rules.
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField label="GSTIN Number" fullWidth defaultValue="29AAACF1234A1Z5" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField label="Default Tax Rate (%)" fullWidth type="number" defaultValue="18" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField label="Invoice Prefix" fullWidth defaultValue="INV-2026-" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField label="Currency" fullWidth defaultValue="INR (₹)" disabled />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="contained" startIcon={<SaveRoundedIcon />}
            onClick={() => toast.success('Settings saved successfully.')}
            sx={{ bgcolor: '#f59e0b', color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#d97706' }, px: 4 }}>
            Save Changes
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
