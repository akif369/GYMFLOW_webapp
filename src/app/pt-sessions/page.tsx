'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Tabs, Tab,
  Table, TableBody, TableCell, TableHead, TableRow, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { api } from '@/lib/api';

type PtSessionRow = {
  id: string; member: string; memberId: string; trainer: string; trainerId: string; date: string;
  time: string; duration: number; type: string; status: string; notes: string; package: string; sessionsRemaining: number;
};
type PtPackageRow = { id: string; name: string; sessions: number; validityDays: number; price: number; description: string; gst?: number };

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const statusColor: Record<string, ChipColor> = { COMPLETED: 'success', UPCOMING: 'default', MISSED: 'error', CANCELLED: 'warning' };

export default function PtSessionsPage() {
  const [tab, setTab] = useState(0);
  const [bookOpen, setBookOpen] = useState(false);
  const [apiSessions, setApiSessions] = useState<PtSessionRow[] | null>(null);
  const [apiPackages, setApiPackages] = useState<PtPackageRow[] | null>(null);

  useEffect(() => {
    api.get('/pt/sessions', { params: { pageSize: '50' } })
      .then(res => {
        const items = res.data?.items ?? [];
        setApiSessions(items.map((s: Record<string, unknown>) => ({
          id: String(s.id),
          member: `${s.memberFirstName ?? ''} ${s.memberLastName ?? ''}`.trim() || String(s.memberName ?? ''),
          memberId: String(s.memberId ?? ''),
          trainer: `${s.trainerFirstName ?? ''} ${s.trainerLastName ?? ''}`.trim() || String(s.trainerName ?? ''),
          trainerId: String(s.trainerId ?? ''),
          date: String(s.scheduledAt ?? s.date ?? '').split('T')[0],
          time: String(s.scheduledAt ?? '').substring(11, 16),
          duration: Number(s.durationMinutes ?? 60),
          type: String(s.sessionType ?? s.type ?? 'General'),
          status: String(s.status ?? 'UPCOMING'),
          notes: String(s.notes ?? ''),
          package: String(s.packageName ?? s.package ?? ''),
          sessionsRemaining: Number(s.sessionsRemaining ?? 0),
        })));
      })
      .catch(() => setApiSessions([]));

    api.get('/pt/packages', { params: { pageSize: '50' } })
      .then(res => {
        const items = res.data?.items ?? [];
        setApiPackages(items.map((p: Record<string, unknown>) => ({
          id: String(p.id),
          name: String(p.name ?? ''),
          sessions: Number(p.sessions ?? p.totalSessions ?? 0),
          validityDays: Number(p.validityDays ?? 30),
          price: Number(p.price ?? 0),
          description: String(p.description ?? ''),
        })));
      })
      .catch(() => setApiPackages([]));
  }, []);

  const sessions = apiSessions ?? [];
  const packages = apiPackages ?? [];
  const today = new Date().toISOString().split('T')[0];

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', mb: 3, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Personal Training</Typography>
          <Typography variant="body2" color="text.secondary">PT packages, schedules, and session tracking</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setBookOpen(true)}>Book Session</Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab label="Today's Schedule" />
          <Tab label="All Sessions" />
          <Tab label="Packages" />
        </Tabs>
      </Box>

      {/* Tab 0: Today's Schedule */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={2}>
          {sessions.filter(s => s.date === today).map(session => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={session.id}>
              <Card elevation={0} sx={{ borderLeft: '3px solid', borderColor: session.status === 'COMPLETED' ? 'success.main' : session.status === 'MISSED' ? 'error.main' : 'primary.main' }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                    <Typography variant="h5" fontWeight="bold" color="primary">{session.time}</Typography>
                    <Chip label={session.status} size="small" color={statusColor[session.status]} />
                  </Box>
                  <Typography variant="body2" fontWeight="bold">{session.member}</Typography>
                  <Typography variant="caption" color="text.secondary">Trainer: {session.trainer}</Typography>
                  {session.notes && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">{session.notes}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    {session.status === 'UPCOMING' && <Button size="small" variant="contained" fullWidth>Mark Done</Button>}
                    {session.status === 'UPCOMING' && <Button size="small" variant="outlined" color="error" fullWidth>Cancel</Button>}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {sessions.filter(s => s.status === 'MISSED' && s.date !== today).length > 0 && (
            <Grid size={12}>
              <Card elevation={0} sx={{ border: '1px solid rgba(239,68,68,0.3)', bgcolor: 'rgba(239,68,68,0.04)' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="error">⚠ Missed Sessions</Typography>
                  {sessions.filter(s => s.status === 'MISSED').map(s => (
                    <Typography key={s.id} variant="caption" color="text.secondary" display="block">
                      {s.date} — {s.member} with {s.trainer}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Tab 1: All Sessions */}
      <TabPanel value={tab} index={1}>
        <Card elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Member</TableCell>
                <TableCell>Trainer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.date}</TableCell>
                  <TableCell>{s.time}</TableCell>
                  <TableCell><Typography variant="body2" fontWeight={600}>{s.member}</Typography></TableCell>
                  <TableCell>{s.trainer}</TableCell>
                  <TableCell><Chip label={s.status} size="small" color={statusColor[s.status]} /></TableCell>
                  <TableCell><Typography variant="caption" color="text.secondary">{s.notes || '—'}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </TabPanel>

      {/* Tab 2: Packages */}
      <TabPanel value={tab} index={2}>
        <Grid container spacing={2}>
          {packages.map(pkg => (
            <Grid size={{ xs: 12, sm: 4 }} key={pkg.id}>
              <Card elevation={0}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h3" fontWeight="bold" color="primary">{pkg.sessions}</Typography>
                  <Typography variant="body1" color="text.secondary">Sessions</Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h5" fontWeight="bold">₹{pkg.price.toLocaleString()}</Typography>
                  <Typography variant="caption" color="text.secondary">{pkg.validityDays} days validity</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button variant="outlined" fullWidth>Edit Package</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card elevation={0} sx={{ border: '1px dashed rgba(255,255,255,0.15)', cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <AddIcon sx={{ fontSize: 36, color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>Add Package</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Book Session Dialog */}
      <Dialog open={bookOpen} onClose={() => setBookOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <DialogTitle>Book PT Session</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}><TextField label="Member" fullWidth size="small" placeholder="Search member..." /></Grid>
            <Grid size={12}>
              <TextField label="Trainer" fullWidth size="small" placeholder="Enter trainer name" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Date" type="date" fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Time" type="time" fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} /></Grid>
            <Grid size={12}><TextField label="Notes" fullWidth size="small" multiline rows={2} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setBookOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setBookOpen(false)}>Book Session</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
