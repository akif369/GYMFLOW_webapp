'use client';
import { Box, Typography, Card, CardContent, Grid, Button, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';

export default function ReportsPage() {
  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
          Business Intelligence
        </Typography>
        <Typography component="h1" sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: 'text.primary' }}>
          Data Exports & Reports
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <ReceiptLongRoundedIcon sx={{ color: '#10b981' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Sales & Tax</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Export GST reports, detailed transaction logs, and revenue breakdowns by branch.
              </Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <Button fullWidth variant="outlined" endIcon={<FileDownloadRoundedIcon />} sx={{ justifyContent: 'space-between' }}>
                    Monthly GST Report
                  </Button>
                </ListItem>
                <ListItem disablePadding>
                  <Button fullWidth variant="outlined" endIcon={<FileDownloadRoundedIcon />} sx={{ justifyContent: 'space-between' }}>
                    Transaction History
                  </Button>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <PeopleOutlineRoundedIcon sx={{ color: '#3b82f6' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Members & Staff</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Download active member rosters, expiring memberships, and staff attendance logs.
              </Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <Button fullWidth variant="outlined" endIcon={<FileDownloadRoundedIcon />} sx={{ justifyContent: 'space-between' }}>
                    Expiring Memberships
                  </Button>
                </ListItem>
                <ListItem disablePadding>
                  <Button fullWidth variant="outlined" endIcon={<FileDownloadRoundedIcon />} sx={{ justifyContent: 'space-between' }}>
                    Active Member Roster
                  </Button>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <AssessmentRoundedIcon sx={{ fontSize: 40, color: '#f59e0b', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Custom Reports</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                Need a specific data export? Custom report builder is coming in the next update.
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
