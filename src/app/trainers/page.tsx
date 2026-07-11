'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { mockTrainers } from '@/lib/mockData';

const statusColor: Record<string, any> = { ACTIVE: 'success', ON_LEAVE: 'warning', INACTIVE: 'error' };

export default function TrainersPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <AppLayout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Trainer Management</Typography>
          <Typography variant="body2" color="text.secondary">{mockTrainers.length} trainers registered</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>Add Trainer</Button>
      </Box>

      <Grid container spacing={2}>
        {mockTrainers.map(trainer => (
          <Grid item xs={12} md={6} lg={4} key={trainer.id}>
            <Card elevation={0} sx={{ height: '100%' }}>
              <CardContent>
                {/* Header */}
                <Box display="flex" gap={2} alignItems="center" mb={2}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.dark', fontSize: '1.2rem' }}>
                    {trainer.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold">{trainer.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{trainer.specialization}</Typography>
                    <Box sx={{ mt: 0.5 }}><Chip label={trainer.status} size="small" color={statusColor[trainer.status]} /></Box>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {/* Stats */}
                <Grid container spacing={1} mb={2}>
                  {[
                    ['Members', trainer.membersAssigned],
                    ['PT Clients', trainer.ptClients],
                    ['Sessions', trainer.sessionsThisMonth],
                    ['Completed', trainer.sessionsCompleted],
                    ['Cancelled', trainer.sessionsCancelled],
                  ].map(([k, v]) => (
                    <Grid item xs={4} key={k}>
                      <Box textAlign="center" p={1} sx={{ bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="h6" fontWeight="bold">{v}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{k}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {/* Details */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                  {[
                    ['Phone', trainer.phone],
                    ['Certifications', trainer.certifications],
                    ['Shift', trainer.shift],
                    ['Joined', trainer.joiningDate],
                  ].map(([k, v]) => (
                    <Box key={k} display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">{k}</Typography>
                      <Typography variant="caption" fontWeight={500}>{v}</Typography>
                    </Box>
                  ))}
                </Box>

                <Box display="flex" gap={1} mt={2}>
                  <Button size="small" variant="outlined" fullWidth>View Profile</Button>
                  <Button size="small" variant="outlined" fullWidth>Assign Members</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Trainer Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper' } }}>
        <DialogTitle>Add Trainer</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={6}><TextField label="First Name" fullWidth size="small" /></Grid>
            <Grid item xs={6}><TextField label="Last Name" fullWidth size="small" /></Grid>
            <Grid item xs={12}><TextField label="Phone" fullWidth size="small" /></Grid>
            <Grid item xs={12}><TextField label="Email" fullWidth size="small" /></Grid>
            <Grid item xs={12}><TextField label="Specialization" fullWidth size="small" /></Grid>
            <Grid item xs={12}><TextField label="Certifications" fullWidth size="small" /></Grid>
            <Grid item xs={6}>
              <TextField label="Shift" select fullWidth size="small">
                <MenuItem value="morning">Morning (6AM - 2PM)</MenuItem>
                <MenuItem value="evening">Evening (2PM - 10PM)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}><TextField label="Joining Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddOpen(false)}>Add Trainer</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
