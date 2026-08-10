'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { api } from '@/lib/api';

type TrainerRow = {
  id: string; name: string; phone: string; specialization: string; certifications: string[];
  joiningDate: string; shift: string; status: string; membersAssigned: number; ptClients: number;
  sessionsThisMonth: number; sessionsCompleted: number; sessionsCancelled: number;
};

const statusColor: Record<string, 'success' | 'warning' | 'error'> = {
  ACTIVE: 'success',
  ON_LEAVE: 'warning',
  INACTIVE: 'error',
};

export default function TrainersPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [apiTrainers, setApiTrainers] = useState<TrainerRow[] | null>(null);

  useEffect(() => {
    api.get('/trainers')
      .then(res => {
        const items = res.data?.items ?? res.data?.trainers ?? [];
        setApiTrainers(items.map((t: Record<string, unknown>) => ({
          id: String(t.id),
          name: `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim() || String(t.name ?? ''),
          specialization: String(t.specialization ?? ''),
          email: String(t.email ?? ''),
          phone: String(t.phone ?? ''),
          status: String(t.status ?? 'ACTIVE'),
          membersAssigned: Number(t.membersAssigned ?? t.memberCount ?? 0),
          ptClients: Number(t.ptClients ?? t.ptClientCount ?? 0),
          sessionsThisMonth: Number(t.sessionsThisMonth ?? 0),
          sessionsCompleted: Number(t.sessionsCompleted ?? 0),
          sessionsCancelled: Number(t.sessionsCancelled ?? 0),
          rating: Number(t.rating ?? 0),
          bio: String(t.bio ?? ''),
          certifications: Array.isArray(t.certifications) ? t.certifications.map(String) : [],
          joiningDate: String(t.joiningDate ?? t.joinDate ?? '').split('T')[0],
          shift: String(t.shift ?? ''),
          salary: Number(t.salary ?? 0),
        })));
      })
      .catch(() => setApiTrainers([]));
  }, []);

  const trainers = apiTrainers ?? [];

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', mb: 3, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Trainer Management</Typography>
          <Typography variant="body2" color="text.secondary">{trainers.length} trainers registered</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>Add Trainer</Button>
      </Box>

      <Grid container spacing={2}>
        {trainers.map(trainer => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={trainer.id}>
            <Card elevation={0} sx={{ height: '100%' }}>
              <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.dark', fontSize: '1.2rem' }}>
                    {trainer.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{trainer.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{trainer.specialization}</Typography>
                    <Box sx={{ mt: 0.5 }}><Chip label={trainer.status} size="small" color={statusColor[trainer.status]} /></Box>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {/* Stats */}
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  {[
                    ['Members', trainer.membersAssigned],
                    ['PT Clients', trainer.ptClients],
                    ['Sessions', trainer.sessionsThisMonth],
                    ['Completed', trainer.sessionsCompleted],
                    ['Cancelled', trainer.sessionsCancelled],
                  ].map(([k, v]) => (
                    <Grid size={4} key={k}>
                      <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{v}</Typography>
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
                    <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">{k}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>{v}</Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button size="small" variant="outlined" fullWidth>View Profile</Button>
                  <Button size="small" variant="outlined" fullWidth>Assign Members</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Trainer Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <DialogTitle>Add Trainer</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="First Name" fullWidth size="small" /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Last Name" fullWidth size="small" /></Grid>
            <Grid size={12}><TextField label="Phone" fullWidth size="small" /></Grid>
            <Grid size={12}><TextField label="Email" fullWidth size="small" /></Grid>
            <Grid size={12}><TextField label="Specialization" fullWidth size="small" /></Grid>
            <Grid size={12}><TextField label="Certifications" fullWidth size="small" /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Shift" select fullWidth size="small">
                <MenuItem value="morning">Morning (6AM - 2PM)</MenuItem>
                <MenuItem value="evening">Evening (2PM - 10PM)</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Joining Date"
                type="date"
                fullWidth
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
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
