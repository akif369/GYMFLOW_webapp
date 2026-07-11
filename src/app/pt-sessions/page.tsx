'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Tabs, Tab,
  Table, TableBody, TableCell, TableHead, TableRow, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { mockPtSessions, mockPtPackages } from '@/lib/mockData';

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

const statusColor: Record<string, any> = { COMPLETED: 'success', UPCOMING: 'default', MISSED: 'error', CANCELLED: 'warning' };

export default function PtSessionsPage() {
  const [tab, setTab] = useState(0);
  const [bookOpen, setBookOpen] = useState(false);

  return (
    <AppLayout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Personal Training</Typography>
          <Typography variant="body2" color="text.secondary">PT packages, schedules, and session tracking</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setBookOpen(true)}>Book Session</Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Today's Schedule" />
          <Tab label="All Sessions" />
          <Tab label="Packages" />
        </Tabs>
      </Box>

      {/* Tab 0: Today's Schedule */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={2}>
          {mockPtSessions.filter(s => s.date === '2026-07-10').map(session => (
            <Grid item xs={12} sm={6} md={4} key={session.id}>
              <Card elevation={0} sx={{ borderLeft: '3px solid', borderColor: session.status === 'COMPLETED' ? 'success.main' : session.status === 'MISSED' ? 'error.main' : 'primary.main' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Typography variant="h5" fontWeight="bold" color="primary">{session.time}</Typography>
                    <Chip label={session.status} size="small" color={statusColor[session.status]} />
                  </Box>
                  <Typography variant="body2" fontWeight="bold">{session.member}</Typography>
                  <Typography variant="caption" color="text.secondary">Trainer: {session.trainer}</Typography>
                  {session.notes && (
                    <Box mt={1} p={1} sx={{ bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">{session.notes}</Typography>
                    </Box>
                  )}
                  <Box display="flex" gap={1} mt={2}>
                    {session.status === 'UPCOMING' && <Button size="small" variant="contained" fullWidth>Mark Done</Button>}
                    {session.status === 'UPCOMING' && <Button size="small" variant="outlined" color="error" fullWidth>Cancel</Button>}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {mockPtSessions.filter(s => s.status === 'MISSED' && s.date !== '2026-07-10').length > 0 && (
            <Grid item xs={12}>
              <Card elevation={0} sx={{ border: '1px solid rgba(239,68,68,0.3)', bgcolor: 'rgba(239,68,68,0.04)' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="error">⚠ Missed Sessions</Typography>
                  {mockPtSessions.filter(s => s.status === 'MISSED').map(s => (
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
              {mockPtSessions.map(s => (
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
          {mockPtPackages.map(pkg => (
            <Grid item xs={12} sm={4} key={pkg.id}>
              <Card elevation={0}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h3" fontWeight="bold" color="primary">{pkg.sessions}</Typography>
                  <Typography variant="body1" color="text.secondary">Sessions</Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h5" fontWeight="bold">₹{pkg.price.toLocaleString()}</Typography>
                  <Typography variant="caption" color="text.secondary">+ {pkg.gst}% GST</Typography>
                  <Box mt={2}>
                    <Button variant="outlined" fullWidth>Edit Package</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ border: '1px dashed rgba(255,255,255,0.15)', cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <AddIcon sx={{ fontSize: 36, color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary" mt={1}>Add Package</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Book Session Dialog */}
      <Dialog open={bookOpen} onClose={() => setBookOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper' } }}>
        <DialogTitle>Book PT Session</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12}><TextField label="Member" fullWidth size="small" placeholder="Search member..." /></Grid>
            <Grid item xs={12}>
              <TextField label="Trainer" select fullWidth size="small">
                {['Amit Singh', 'Neha Gupta', 'Ravi Kumar'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}><TextField label="Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}><TextField label="Time" type="time" fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><TextField label="Notes" fullWidth size="small" multiline rows={2} /></Grid>
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
