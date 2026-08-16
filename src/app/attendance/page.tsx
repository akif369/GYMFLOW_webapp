'use client';
import { Suspense, useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { useSearchParams } from 'next/navigation';
import {
  Box, Card, CardContent, Typography, Button, Chip, Tabs, Tab,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, CircularProgress, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { api } from '@/lib/api';
import MemberSearchField, { type MemberSearchResult } from '@/components/MemberSearchField';

/** Convert a UTC ISO string to HH:MM in Asia/Kolkata */
function toISTTime(utcIso: string): string {
  if (!utcIso) return '';
  return new Date(utcIso).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Convert a UTC ISO string to YYYY-MM-DD in Asia/Kolkata */
function toISTDate(utcIso: string): string {
  if (!utcIso) return '';
  return new Date(utcIso).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // en-CA → YYYY-MM-DD
}

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
};

function AttendancePageContent() {
  const searchParams = useSearchParams();
  const memberParam = searchParams.get('member') ?? '';
  const [tab, setTab] = useState(0);
  const [checkInOpen, setCheckInOpen] = useState(() => Boolean(memberParam));
  const [memberIdInput, setMemberIdInput] = useState('');
  const [selectedCheckInMember, setSelectedCheckInMember] = useState<MemberSearchResult | null>(null);
  const [checkInSubmitting, setCheckInSubmitting] = useState(false);
  const [checkInError, setCheckInError] = useState('');

  // ── Currently inside ─────────────────────────────────────────────────────────
  const [insideMembers, setInsideMembers] = useState<InsideMember[]>([]);
  const [insideLoading, setInsideLoading] = useState(false);

  const fetchInside = useCallback(() => {
    setInsideLoading(true);
    api.get('/attendance/currently-inside')
      .then(res => {
        // Backend returns { members: [...], count }
        const items = res.data?.members ?? res.data?.items ?? [];
        setInsideMembers(items.map((m: Record<string, unknown>) => ({
          id: String(m.memberId ?? m.id ?? ''),
          name: `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || String(m.memberName ?? ''),
          memberId: String(m.memberNumber ?? m.memberId ?? ''),
          plan: String(m.planName ?? m.plan ?? ''),
          checkIn: toISTTime(String(m.checkInAt ?? m.checkInTime ?? '')),
          trainer: String(m.trainerName ?? ''),
          attendanceId: String(m.attendanceId ?? m.id ?? ''),
        })));
      })
      .catch(() => setInsideMembers([]))
      .finally(() => setInsideLoading(false));
  }, []);

  // ── History logs ─────────────────────────────────────────────────────────────
  const [historyLogs, setHistoryLogs] = useState<AttendanceLog[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState(memberParam);
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchHistory = useCallback((reset = true) => {
    setHistoryLoading(true);
    const params: Record<string, string> = { pageSize: '50', page: String(reset ? 1 : page) };
    if (dateFilter) params.date = dateFilter;
    if (memberSearch) params.search = memberSearch;

    api.get('/attendance', { params })
      .then(res => {
        const items = res.data?.items ?? [];
        const mapped: AttendanceLog[] = items.map((l: Record<string, unknown>) => ({
          id: String(l.id),
          member: `${l.firstName ?? ''} ${l.lastName ?? ''}`.trim() || String(l.memberName ?? ''),
          memberId: String(l.memberNumber ?? l.memberId ?? ''),
          date: toISTDate(String(l.checkInAt ?? l.date ?? '')),
          checkIn: toISTTime(String(l.checkInAt ?? '')),
          checkOut: l.checkOutAt ? toISTTime(String(l.checkOutAt)) : null,
          duration: l.durationMinutes
            ? `${Math.floor(Number(l.durationMinutes) / 60)}h ${Number(l.durationMinutes) % 60}m`
            : 'Inside',
          method: String(l.checkInMethod ?? l.method ?? 'MANUAL'),
        }));
        if (reset) {
          setHistoryLogs(mapped);
          setPage(2);
        } else {
          setHistoryLogs(prev => [...prev, ...mapped]);
          setPage(p => p + 1);
        }
        setHasMore(items.length === 50);
      })
      .catch(() => { if (reset) setHistoryLogs([]); })
      .finally(() => setHistoryLoading(false));
  }, [dateFilter, memberSearch, page]);

  // ── Peak hours analytics ──────────────────────────────────────────────────────
  const [peakHours, setPeakHours] = useState<{ hour: string; count: number; pct: number }[]>([]);

  const fetchPeakHours = useCallback(() => {
    api.get('/attendance/analytics/peak-hours')
      .then(res => {
        const rows = res.data?.peakHours ?? res.data?.rows ?? [];
        const maxCount = Math.max(...rows.map((r: Record<string, unknown>) => Number(r.count ?? 0)), 1);
        setPeakHours(rows.map((r: Record<string, unknown>) => ({
          hour: String(r.hour ?? r.hourLabel ?? ''),
          count: Number(r.count ?? 0),
          pct: Math.round((Number(r.count ?? 0) / maxCount) * 100),
        })));
      })
      .catch(() => setPeakHours([]));
  }, []);

  useEffect(() => {
    fetchInside();
    fetchHistory(true);
    fetchPeakHours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch history when filters change
  useEffect(() => {
    fetchHistory(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter, memberSearch]);

  const handleCheckIn = async () => {
    if (!memberIdInput) return;
    setCheckInSubmitting(true);
    setCheckInError('');
    try {
      await api.post('/attendance/check-in', { memberId: memberIdInput });
      setCheckInOpen(false);
      setMemberIdInput('');
      setSelectedCheckInMember(null);
      fetchInside();
      fetchHistory(true);
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
      fetchHistory(true);
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => { fetchInside(); fetchHistory(true); }} size="small">Refresh</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setCheckInOpen(true); setCheckInError(''); }}>Manual Check-in</Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab label={`Currently Inside (${insideLoading ? '…' : insideMembers.length})`} />
          <Tab label="History" />
          <Tab label="Peak Hour Analytics" />
        </Tabs>
      </Box>

      {/* Tab 0: Currently Inside */}
      <TabPanel value={tab} index={0}>
        {insideLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : insideMembers.length === 0 ? (
          <Card elevation={0}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">No members are currently inside</Typography>
              <Typography variant="caption" color="text.secondary">Use Manual Check-in to add someone</Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {insideMembers.map((m, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card elevation={0} sx={{ border: '1px solid rgba(16,185,129,0.2)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'primary.dark', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {m.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight="bold" noWrap>{m.name || 'Unknown'}</Typography>
                        <Typography variant="caption" color="text.secondary">{m.memberId}{m.plan ? ` · ${m.plan}` : ''}</Typography>
                      </Box>
                      <Chip label="Inside" color="success" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Check-in</Typography>
                        <Typography variant="body2" fontWeight={600}>{m.checkIn || '—'}</Typography>
                      </Box>
                      {m.trainer && (
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">Trainer</Typography>
                          <Typography variant="body2">{m.trainer}</Typography>
                        </Box>
                      )}
                      <Button variant="outlined" size="small" color="warning" onClick={() => handleCheckOut(m.attendanceId)}>
                        Check Out
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Tab 1: History */}
      <TabPanel value={tab} index={1}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            label="Search Member"
            value={memberSearch}
            onChange={e => setMemberSearch(e.target.value)}
            sx={{ minWidth: 200 }}
            placeholder="Name or member ID"
          />
          <TextField
            size="small"
            label="Date"
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 160 }}
          />
          {(memberSearch || dateFilter) && (
            <Button size="small" variant="text" onClick={() => { setMemberSearch(''); setDateFilter(''); }}>
              Clear filters
            </Button>
          )}
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
              </TableRow>
            </TableHead>
            <TableBody>
              {historyLoading && historyLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : historyLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="caption" color="text.secondary">No attendance records found</Typography>
                  </TableCell>
                </TableRow>
              ) : historyLogs.map(log => (
                <TableRow key={log.id} sx={{ '&:hover': { bgcolor: 'rgba(16,185,129,0.03)' } }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{log.member || log.memberId}</Typography>
                    <Typography variant="caption" color="text.secondary">{log.memberId}</Typography>
                  </TableCell>
                  <TableCell>{log.date}</TableCell>
                  <TableCell>{log.checkIn}</TableCell>
                  <TableCell>{log.checkOut || <Typography variant="caption" color="success.main">Still inside</Typography>}</TableCell>
                  <TableCell><Chip label={log.duration} size="small" color={!log.checkOut ? 'success' : 'default'} /></TableCell>
                  <TableCell><Typography variant="caption" color="text.secondary">{log.method}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {hasMore && historyLogs.length > 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Button size="small" onClick={() => fetchHistory(false)} disabled={historyLoading}>
                {historyLoading ? <CircularProgress size={16} /> : 'Load more'}
              </Button>
            </Box>
          )}
        </Card>
      </TabPanel>

      {/* Tab 2: Analytics */}
      <TabPanel value={tab} index={2}>
        {peakHours.length === 0 ? (
          <Card elevation={0}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">No analytics data yet — check back after members start checking in.</Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {peakHours.map(h => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={h.hour}>
                <Card elevation={0}>
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">{h.hour}</Typography>
                      <Typography variant="body2" color="text.secondary">{h.count} check-ins avg</Typography>
                    </Box>
                    <Box sx={{
                      width: 60, height: 60, borderRadius: '50%', border: '4px solid',
                      borderColor: h.pct > 80 ? 'error.main' : h.pct > 60 ? 'warning.main' : 'primary.main',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Typography variant="caption" fontWeight="bold">{h.pct}%</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Manual Check-in Dialog */}
      <Dialog open={checkInOpen} onClose={() => { setCheckInOpen(false); setCheckInError(''); }} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleCheckIn(); }}>
          <DialogTitle>Manual Check-in</DialogTitle>
          <DialogContent>
            {checkInError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{checkInError}</Alert>}
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={12}>
                <MemberSearchField
                  autoFocus={checkInOpen}
                  label="Find member"
                  helperText="Search by name or member number, then select the member"
                  onSelect={member => { setSelectedCheckInMember(member); setMemberIdInput(member?.id ?? ''); setCheckInError(''); }}
                />
                {selectedCheckInMember?.status === 'EXPIRED' && <Alert severity="warning" sx={{ mt: 1 }}>This membership is expired and cannot be checked in.</Alert>}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => { setCheckInOpen(false); setCheckInError(''); setMemberIdInput(''); setSelectedCheckInMember(null); }}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={checkInSubmitting || !memberIdInput || selectedCheckInMember?.status === 'EXPIRED'}
              startIcon={checkInSubmitting ? <CircularProgress size={14} color="inherit" /> : undefined}
            >
              {checkInSubmitting ? 'Checking in…' : 'Check In'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </AppLayout>
  );
}

function AttendancePageFallback() {
  return (
    <AppLayout>
      <Box sx={{ py: 3 }}>
        <Typography variant="h5" fontWeight="bold">Attendance</Typography>
        <Typography variant="body2" color="text.secondary">Loading attendance…</Typography>
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
