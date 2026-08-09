'use client';
import { Suspense, useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useSearchParams } from 'next/navigation';
import {
  Box, Card, CardContent, Typography, Button, Chip, Tabs, Tab,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, CircularProgress, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { mockAttendanceLogs } from '@/lib/mockData';
import { api } from '@/lib/api';

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

type InsideMember = {
  id: string;
  name: string;
  memberId: string;
  plan: string;
  checkIn: string;
  trainer: string;
  attendanceId: string;
};

type AttendanceLog = {
  id: string;
  member: string;
  memberId: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  duration: string;
  method: string;
  branch: string;
};

function AttendancePageContent() {
  const searchParams = useSearchParams();
  const memberParam = searchParams.get('member') ?? '';
  const [tab, setTab] = useState(0);
  const [dateFilter, setDateFilter] = useState('today');
  const [checkInOpen, setCheckInOpen] = useState(() => Boolean(memberParam));
  const [memberSearch, setMemberSearch] = useState(memberParam);
  const [memberIdInput, setMemberIdInput] = useState('');
  const [checkInSubmitting, setCheckInSubmitting] = useState(false);
  const [checkInError, setCheckInError] = useState('');

  // ── Currently inside ─────────────────────────────────────────────────────────────
  const [insideMembers, setInsideMembers] = useState<InsideMember[]>([]);
  const [insideLoading, setInsideLoading] = useState(false);

  const fetchInside = () => {
    setInsideLoading(true);
    api.get('/attendance/currently-inside')
      .then(res => {
        const items = res.data?.items ?? [];
        setInsideMembers(items.map((m: Record<string, unknown>) => ({
          id: String(m.memberId ?? m.id ?? ''),
          name: `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || String(m.memberName ?? ''),
          memberId: String(m.memberNumber ?? m.memberId ?? ''),
          plan: String(m.plan ?? m.membershipPlan ?? ''),
          checkIn: String(m.checkInTime ?? '').substring(11, 16),
          trainer: String(m.trainerName ?? ''),
          attendanceId: String(m.attendanceId ?? m.id ?? ''),
        })));
      })
      .catch(() => setInsideMembers([]))
      .finally(() => setInsideLoading(false));
  };

  // ── History logs ────────────────────────────────────────────────────────────────
  const [historyLogs, setHistoryLogs] = useState<AttendanceLog[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = () => {
    setHistoryLoading(true);
    const params: Record<string, string> = { pageSize: '50' };
    api.get('/attendance', { params })
      .then(res => {
        const items = res.data?.items ?? [];
        setHistoryLogs(items.map((l: Record<string, unknown>) => ({
          id: String(l.id),
          member: `${l.firstName ?? ''} ${l.lastName ?? ''}`.trim() || String(l.memberName ?? ''),
          memberId: String(l.memberNumber ?? l.memberId ?? ''),
          date: String(l.checkInTime ?? l.date ?? '').split('T')[0],
          checkIn: String(l.checkInTime ?? '').substring(11, 16),
          checkOut: l.checkOutTime ? String(l.checkOutTime).substring(11, 16) : null,
          duration: l.durationMinutes ? `${Math.floor(Number(l.durationMinutes) / 60)}h ${Number(l.durationMinutes) % 60}m` : 'Inside',
          method: String(l.method ?? 'MANUAL'),
          branch: String(l.branch ?? ''),
        })));
      })
      .catch(() => setHistoryLogs([]))
      .finally(() => setHistoryLoading(false));
  };

  // ── Peak hours analytics ───────────────────────────────────────────────────────
  const [peakHours, setPeakHours] = useState<{ hour: string; count: number; pct: number }[]>([]);

  const fetchPeakHours = () => {
    api.get('/attendance/analytics/peak-hours')
      .then(res => {
        const rows = res.data?.rows ?? res.data?.items ?? [];
        const maxCount = Math.max(...rows.map((r: Record<string, unknown>) => Number(r.count ?? 0)), 1);
        setPeakHours(rows.map((r: Record<string, unknown>) => ({
          hour: String(r.hour ?? ''),
          count: Number(r.count ?? 0),
          pct: Math.round((Number(r.count ?? 0) / maxCount) * 100),
        })));
      })
      .catch(() => setPeakHours([
        { hour: '6–7 AM', count: 28, pct: 51 }, { hour: '7–8 AM', count: 45, pct: 82 },
        { hour: '8–9 AM', count: 38, pct: 69 }, { hour: '9–10 AM', count: 22, pct: 40 },
        { hour: '10–11 AM', count: 15, pct: 27 }, { hour: '5–6 PM', count: 35, pct: 64 },
        { hour: '6–7 PM', count: 52, pct: 95 }, { hour: '7–8 PM', count: 48, pct: 87 },
        { hour: '8–9 PM', count: 30, pct: 55 },
      ]));
  };

  useEffect(() => {
    fetchInside();
    fetchHistory();
    fetchPeakHours();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show fallback mock data if API returns nothing
  const insideData = insideMembers;
  const allLogs: AttendanceLog[] = historyLogs.length ? historyLogs : mockAttendanceLogs.map(l => ({
    ...l,
    checkOut: l.checkOut,
  }));
  const analyticsData = peakHours.length ? peakHours : [
    { hour: '6–7 AM', count: 28, pct: 51 }, { hour: '7–8 AM', count: 45, pct: 82 },
    { hour: '8–9 AM', count: 38, pct: 69 }, { hour: '9–10 AM', count: 22, pct: 40 },
    { hour: '10–11 AM', count: 15, pct: 27 }, { hour: '5–6 PM', count: 35, pct: 64 },
    { hour: '6–7 PM', count: 52, pct: 95 }, { hour: '7–8 PM', count: 48, pct: 87 },
    { hour: '8–9 PM', count: 30, pct: 55 },
  ];

  const handleCheckIn = async () => {
    if (!memberIdInput) return;
    setCheckInSubmitting(true);
    setCheckInError('');
    try {
      await api.post('/attendance/check-in', { memberNumber: memberIdInput });
      setCheckInOpen(false);
      setMemberIdInput('');
      fetchInside();
      fetchHistory();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCheckInError(msg ?? 'Check-in failed. Please try again.');
    } finally {
      setCheckInSubmitting(false);
    }
  };

  const handleCheckOut = async (attendanceId: string) => {
    try {
      await api.post('/attendance/check-out', { attendanceId });
      fetchInside();
      fetchHistory();
    } catch {
      // silently ignore
    }
  };

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Attendance</Typography>
          <Typography variant="body2" color="text.secondary">Live and historical gym attendance</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCheckInOpen(true)}>Manual Check-in</Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab label={`Currently Inside (${insideLoading ? '...' : insideData.length})`} />
          <Tab label="History" />
          <Tab label="Peak Hour Analytics" />
        </Tabs>
      </Box>

      {/* Tab 0: Currently Inside */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={2}>
          {insideData.map((m, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Card elevation={0} sx={{ border: '1px solid rgba(16,185,129,0.2)' }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'primary.dark', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="subtitle2" fontWeight="bold">{m.name.split(' ').map((n: string) => n[0]).join('')}</Typography>
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
                    <Button variant="outlined" size="small" color="warning" onClick={() => handleCheckOut(m.attendanceId)}>Check Out</Button>
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
          {analyticsData.map(h => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={h.hour}>
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
          {checkInError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{checkInError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField
                label="Member Number or Name"
                fullWidth
                size="small"
                placeholder="e.g. GYM0001"
                value={memberIdInput}
                onChange={e => setMemberIdInput(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => { setCheckInOpen(false); setCheckInError(''); }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCheckIn}
            disabled={checkInSubmitting || !memberIdInput}
            startIcon={checkInSubmitting ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            {checkInSubmitting ? 'Checking in...' : 'Check In'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}

function AttendancePageFallback() {
  return (
    <AppLayout>
      <Box sx={{ py: 3 }}>
        <Typography variant="h5" fontWeight="bold">Attendance</Typography>
        <Typography variant="body2" color="text.secondary">Loading attendance...</Typography>
      </Box>
    </AppLayout>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={<AttendancePageFallback />}>
      <AttendancePageContent />
    </Suspense>
  );
}
