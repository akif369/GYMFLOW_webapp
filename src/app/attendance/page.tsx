'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Card, CardContent, Typography, Button, Chip, Tabs, Tab,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { mockAttendanceLogs } from '@/lib/mockData';

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

const CURRENTLY_INSIDE = [
  { name: 'Vikram Nair', memberId: 'GYM005', plan: 'Half-Yearly Elite', checkIn: '07:15', trainer: 'Amit Singh' },
  { name: 'Arjun Verma', memberId: 'GYM003', plan: 'Yearly Platinum', checkIn: '06:45', trainer: 'Amit Singh' },
  { name: 'Meera Singh', memberId: 'GYM012', plan: 'Monthly Pro', checkIn: '06:00', trainer: 'Neha Gupta' },
];

export default function AttendancePage() {
  const [tab, setTab] = useState(0);
  const [dateFilter, setDateFilter] = useState('today');
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  const allLogs = mockAttendanceLogs;

  return (
    <AppLayout>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Attendance</Typography>
          <Typography variant="body2" color="text.secondary">Live and historical gym attendance</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCheckInOpen(true)}>Manual Check-in</Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`Currently Inside (${CURRENTLY_INSIDE.length})`} />
          <Tab label="History" />
          <Tab label="Peak Hour Analytics" />
        </Tabs>
      </Box>

      {/* Tab 0: Currently Inside */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={2}>
          {CURRENTLY_INSIDE.map((m, i) => (
            <Grid xs={12} sm={6} md={4} key={i}>
              <Card elevation={0} sx={{ border: '1px solid rgba(16,185,129,0.2)' }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'primary.dark', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="subtitle2" fontWeight="bold">{m.name.split(' ').map(n => n[0]).join('')}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="bold">{m.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{m.memberId} · {m.plan}</Typography>
                    </Box>
                    <Chip label="Inside" color="success" size="small" />
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Check-in</Typography>
                      <Typography variant="body2" fontWeight={600}>{m.checkIn}</Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="caption" color="text.secondary">Trainer</Typography>
                      <Typography variant="body2">{m.trainer}</Typography>
                    </Box>
                    <Button variant="outlined" size="small" color="warning">Check Out</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Tab 1: History */}
      <TabPanel value={tab} index={1}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            size="small"
            label="Member Name"
            value={memberSearch}
            onChange={e => setMemberSearch(e.target.value)}
            sx={{ width: 250 }}
          />
          <TextField size="small" label="Date" type="date" InputLabelProps={{ shrink: true }} />
        </Box>
        <Card elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Check-in</TableCell>
                <TableCell>Check-out</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allLogs.filter(l => l.member.toLowerCase().includes(memberSearch.toLowerCase())).map(log => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{log.member}</Typography>
                  </TableCell>
                  <TableCell>{log.date}</TableCell>
                  <TableCell>{log.checkIn}</TableCell>
                  <TableCell>{log.checkOut || <Typography variant="caption" color="success.main">Still inside</Typography>}</TableCell>
                  <TableCell><Chip label={log.duration} size="small" color={!log.checkOut ? 'success' : 'default'} /></TableCell>
                  <TableCell><Typography variant="caption" color="text.secondary">{log.method}</Typography></TableCell>
                  <TableCell><Typography variant="caption" color="text.secondary">{log.branch}</Typography></TableCell>
                  <TableCell>
                    <Button size="small" variant="text" color="primary">Correct</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </TabPanel>

      {/* Tab 2: Analytics */}
      <TabPanel value={tab} index={2}>
        <Grid container spacing={2}>
          {[
            { hour: '6–7 AM', count: 28, pct: 51 }, { hour: '7–8 AM', count: 45, pct: 82 },
            { hour: '8–9 AM', count: 38, pct: 69 }, { hour: '9–10 AM', count: 22, pct: 40 },
            { hour: '10–11 AM', count: 15, pct: 27 }, { hour: '5–6 PM', count: 35, pct: 64 },
            { hour: '6–7 PM', count: 52, pct: 95 }, { hour: '7–8 PM', count: 48, pct: 87 },
            { hour: '8–9 PM', count: 30, pct: 55 },
          ].map(h => (
            <Grid xs={12} sm={6} md={4} key={h.hour}>
              <Card elevation={0}>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">{h.hour}</Typography>
                    <Typography variant="body2" color="text.secondary">{h.count} members</Typography>
                  </Box>
                  <Box sx={{ width: 60, height: 60, borderRadius: '50%', border: `4px solid`, borderColor: h.pct > 80 ? 'error.main' : h.pct > 60 ? 'warning.main' : 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="caption" fontWeight="bold">{h.pct}%</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Manual Check-in Dialog */}
      <Dialog open={checkInOpen} onClose={() => setCheckInOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper' } }}>
        <DialogTitle>Manual Check-in</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid xs={12}>
              <TextField label="Member Name or ID" fullWidth size="small" placeholder="Search member..." />
            </Grid>
            <Grid xs={6}>
              <TextField label="Check-in Time" type="time" fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid xs={6}>
              <TextField label="Branch" select fullWidth size="small">
                <MenuItem value="koramangala">Koramangala</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCheckInOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setCheckInOpen(false)}>Check In</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
