'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Tabs, Tab,
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Alert, CircularProgress, Divider, IconButton, Tooltip,
  ToggleButton, ToggleButtonGroup, Autocomplete, InputAdornment, Paper,
  LinearProgress, Checkbox, ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { api } from '@/lib/api';
import { usePtSessions, useTodayPtSessions, usePtPackages, usePtMutations, usePtPackageMutations } from '@/hooks/queries/pt-sessions';
import { useTrainers } from '@/hooks/queries/trainers';

// ── Types ──────────────────────────────────────────────────────────────────
type SessionRow = {
  id: string; member: string; memberId: string;
  trainer: string; trainerId: string;
  scheduledAt: string; date: string; time: string;
  duration: number; sessionType: string;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
  notes: string; cancellationReason: string;
};
type PackageRow = {
  id: string; name: string; sessionsCount: number;
  validityDays: number; price: number; description: string;
};
type TrainerOption = { id: string; name: string };
type MemberOption = { id: string; name: string; phone?: string };
type BookMode = 'INDIVIDUAL' | 'GROUP' | 'RECURRING';

// ── Constants ───────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, 'success' | 'default' | 'error' | 'warning' | 'info'> = {
  COMPLETED: 'success', UPCOMING: 'info', MISSED: 'error', CANCELLED: 'warning',
};
const SESSION_TYPES = ['General', 'Weight Training', 'Cardio', 'Yoga', 'CrossFit', 'HIIT', 'Functional', 'Rehabilitation'];
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

function mapSession(s: Record<string, unknown>): SessionRow {
  const scheduledAt = String(s.scheduledAt ?? '');
  return {
    id: String(s.id),
    member: `${s.memberFirstName ?? ''} ${s.memberLastName ?? ''}`.trim() || String(s.memberName ?? ''),
    memberId: String(s.memberId ?? ''),
    trainer: `${s.trainerFirstName ?? ''} ${s.trainerLastName ?? ''}`.trim() || String(s.trainerName ?? ''),
    trainerId: String(s.trainerId ?? ''),
    scheduledAt,
    date: scheduledAt.split('T')[0],
    time: scheduledAt.substring(11, 16),
    duration: Number(s.durationMinutes ?? 60),
    sessionType: String(s.sessionType ?? 'General'),
    status: String(s.status ?? 'UPCOMING') as SessionRow['status'],
    notes: String(s.notes ?? ''),
    cancellationReason: String(s.cancellationReason ?? ''),
  };
}

function getRecurringDates(startDate: string, endDate: string, dayOfWeek: number, time: string): string[] {
  const dates: string[] = [];
  const end = new Date(endDate);
  const cur = new Date(startDate);
  while (cur.getDay() !== dayOfWeek) cur.setDate(cur.getDate() + 1);
  while (cur <= end) {
    dates.push(`${cur.toISOString().split('T')[0]}T${time}:00`);
    cur.setDate(cur.getDate() + 7);
  }
  return dates;
}

// ── Member Search Hook ──────────────────────────────────────────────────────
function useMemberSearch() {
  const [options, setOptions] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setOptions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get('/members', { params: { search: q, pageSize: 10 } });
        const items = res.data?.data ?? res.data?.items ?? res.data?.members ?? [];
        setOptions(items.map((m: Record<string, unknown>) => ({
          id: String(m.id),
          name: `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim(),
          phone: String(m.phone ?? '').replace(/^\+91/, ''),
        })));
      } catch { setOptions([]); }
      finally { setLoading(false); }
    }, 350);
  }, []);

  return { options, loading, search };
}

export default function PtSessionsPage() {
  const [tab, setTab] = useState(0);
  const today = new Date().toISOString().split('T')[0];

  // ── Queries ─────────────────────────────────────────────────────────────────
  const { data: todayData, isLoading: todayLoading } = useTodayPtSessions();
  const { data: packagesData, isLoading: pkgsLoading } = usePtPackages();
  const { data: trainersData, isLoading: trainersLoading } = useTrainers({ pageSize: '100' });

  // ── All Sessions Filters ────────────────────────────────────────────────────
  const [filterTrainerId, setFilterTrainerId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const { data: allData, isLoading: allLoading } = usePtSessions({
    trainerId: filterTrainerId || undefined,
    status: filterStatus || undefined,
    date: filterDate || undefined,
    pageSize: '100',
  });

  const { bookSession, completeSession: completeMutation, cancelSession: cancelMutation, missSession } = usePtMutations();
  const { addPackage, updatePackage } = usePtPackageMutations();

  // ── Book Dialog ─────────────────────────────────────────────────────────────
  const [bookOpen, setBookOpen] = useState(false);
  const [bookMode, setBookMode] = useState<BookMode>('INDIVIDUAL');
  const [bookSubmitting, setBookSubmitting] = useState(false);
  const [bookError, setBookError] = useState('');
  const [bookProgress, setBookProgress] = useState<{ done: number; total: number } | null>(null);
  // Shared fields
  const [bookTrainerId, setBookTrainerId] = useState('');
  const [bookDate, setBookDate] = useState(today);
  const [bookTime, setBookTime] = useState('09:00');
  const [bookDuration, setBookDuration] = useState(60);
  const [bookType, setBookType] = useState('General');
  const [bookNotes, setBookNotes] = useState('');
  // Individual
  const [bookMember, setBookMember] = useState<MemberOption | null>(null);
  // Group (multiple members)
  const [groupMembers, setGroupMembers] = useState<MemberOption[]>([]);
  // Recurring
  const [recurMember, setRecurMember] = useState<MemberOption | null>(null);
  const [recurStartDate, setRecurStartDate] = useState(today);
  const [recurEndDate, setRecurEndDate] = useState('');
  const [recurDay, setRecurDay] = useState(1);

  const memberSearch1 = useMemberSearch();  // for individual
  const memberSearch2 = useMemberSearch();  // for group
  const memberSearch3 = useMemberSearch();  // for recurring

  // ── Action Dialogs ──────────────────────────────────────────────────────────
  const [completeSession, setCompleteSession] = useState<SessionRow | null>(null);
  const [completeNotes, setCompleteNotes] = useState('');
  const [cancelSession, setCancelSession] = useState<SessionRow | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  // ── Package Dialog ───────────────────────────────────────────────────────────
  const [pkgOpen, setPkgOpen] = useState(false);
  const [editPkg, setEditPkg] = useState<PackageRow | null>(null);
  const [pkgForm, setPkgForm] = useState({ name: '', sessionsCount: 10, validityDays: 30, price: 0, description: '' });
  const [pkgSubmitting, setPkgSubmitting] = useState(false);
  const [pkgError, setPkgError] = useState('');

  // ── Mapped Data ─────────────────────────────────────────────────────────────
  const todaySess = todayData ? (todayData.sessions ?? todayData.data ?? []).map(mapSession) : [];
  const allSess = allData ? (allData.data ?? allData.items ?? []).map(mapSession) : [];
  const pkgs = packagesData ? (packagesData.packages ?? packagesData.data ?? packagesData.items ?? []).map((p: Record<string, unknown>) => ({
    id: String(p.id),
    name: String(p.name ?? ''),
    sessionsCount: Number(p.sessionsCount ?? p.sessions ?? 0),
    validityDays: Number(p.validityDays ?? 30),
    price: Number(p.price ?? 0),
    description: String(p.description ?? ''),
  })) : [];
  const trainersOptions = trainersData ? (trainersData.data ?? trainersData.items ?? trainersData.trainers ?? []).map((t: Record<string, unknown>) => ({
    id: String(t.id),
    name: `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim() || String(t.name ?? ''),
  })) : [];

  // ── Book handlers ────────────────────────────────────────────────────────────
  const resetBookForm = () => {
    setBookMember(null); setGroupMembers([]); setRecurMember(null);
    setBookTrainerId(''); setBookDate(today); setBookTime('09:00');
    setBookDuration(60); setBookType('General'); setBookNotes('');
    setRecurStartDate(today); setRecurEndDate(''); setRecurDay(1);
    setBookError(''); setBookProgress(null);
  };

  const handleBook = async () => {
    setBookError(''); setBookSubmitting(true);
    try {
      if (bookMode === 'INDIVIDUAL') {
        if (!bookMember || !bookTrainerId || !bookDate || !bookTime) throw new Error('Fill all required fields');
        await bookSession.mutateAsync({
          memberId: bookMember.id, trainerId: bookTrainerId,
          scheduledAt: `${bookDate}T${bookTime}:00`,
          durationMinutes: bookDuration, sessionType: bookType, notes: bookNotes,
        });
      } else if (bookMode === 'GROUP') {
        if (!groupMembers.length || !bookTrainerId || !bookDate || !bookTime) throw new Error('Fill all required fields');
        setBookProgress({ done: 0, total: groupMembers.length });
        for (let i = 0; i < groupMembers.length; i++) {
          await bookSession.mutateAsync({
            memberId: groupMembers[i].id, trainerId: bookTrainerId,
            scheduledAt: `${bookDate}T${bookTime}:00`,
            durationMinutes: bookDuration, sessionType: bookType, notes: bookNotes,
          });
          setBookProgress({ done: i + 1, total: groupMembers.length });
        }
      } else if (bookMode === 'RECURRING') {
        if (!recurMember || !bookTrainerId || !recurStartDate || !recurEndDate || !bookTime) throw new Error('Fill all required fields');
        const dates = getRecurringDates(recurStartDate, recurEndDate, recurDay, bookTime);
        if (!dates.length) throw new Error('No sessions fall within the date range for the selected day');
        setBookProgress({ done: 0, total: dates.length });
        for (let i = 0; i < dates.length; i++) {
          await bookSession.mutateAsync({
            memberId: recurMember.id, trainerId: bookTrainerId,
            scheduledAt: dates[i], durationMinutes: bookDuration, sessionType: bookType, notes: bookNotes,
          });
          setBookProgress({ done: i + 1, total: dates.length });
        }
      }
      setBookOpen(false); resetBookForm();
    } catch (e: any) {
      const err = e.response?.data?.error;
      setBookError(typeof err === 'string' ? err : e.message || 'Failed to book session(s)');
      setBookProgress(null);
    } finally { setBookSubmitting(false); }
  };

  // ── Session action handlers ──────────────────────────────────────────────────
  const handleComplete = async () => {
    if (!completeSession) return;
    setActionError(''); setActionSubmitting(true);
    try {
      await completeMutation.mutateAsync({ id: completeSession.id, notes: completeNotes });
      setCompleteSession(null); setCompleteNotes('');
    } catch (e: any) {
      setActionError(e.response?.data?.error?.message || e.response?.data?.error || 'Failed to complete session');
    } finally { setActionSubmitting(false); }
  };

  const handleCancel = async () => {
    if (!cancelSession) return;
    setActionError(''); setActionSubmitting(true);
    try {
      await cancelMutation.mutateAsync({ id: cancelSession.id, reason: cancelReason || 'Cancelled' });
      setCancelSession(null); setCancelReason('');
    } catch (e: any) {
      setActionError(e.response?.data?.error?.message || e.response?.data?.error || 'Failed to cancel session');
    } finally { setActionSubmitting(false); }
  };

  const handleMiss = async (sessionId: string) => {
    if (!confirm('Mark this session as missed?')) return;
    try {
      await missSession.mutateAsync(sessionId);
    } catch (e: any) { alert(e.response?.data?.error || 'Failed'); }
  };

  // ── Package handlers ─────────────────────────────────────────────────────────
  const openAddPkg = () => {
    setEditPkg(null);
    setPkgForm({ name: '', sessionsCount: 10, validityDays: 30, price: 0, description: '' });
    setPkgError(''); setPkgOpen(true);
  };
  const openEditPkg = (pkg: PackageRow) => {
    setEditPkg(pkg);
    setPkgForm({ name: pkg.name, sessionsCount: pkg.sessionsCount, validityDays: pkg.validityDays, price: pkg.price, description: pkg.description });
    setPkgError(''); setPkgOpen(true);
  };
  const handlePkgSubmit = async () => {
    setPkgError(''); setPkgSubmitting(true);
    try {
      if (editPkg) {
        await updatePackage.mutateAsync({ id: editPkg.id, data: pkgForm });
      } else {
        await addPackage.mutateAsync(pkgForm);
      }
      setPkgOpen(false);
    } catch (e: any) {
      setPkgError(e.response?.data?.error?.message || e.response?.data?.error || 'Failed to save package');
    } finally { setPkgSubmitting(false); }
  };

  const bookValid = (() => {
    if (!bookTrainerId) return false;
    if (bookMode === 'INDIVIDUAL') return !!bookMember && !!bookDate && !!bookTime;
    if (bookMode === 'GROUP') return groupMembers.length > 0 && !!bookDate && !!bookTime;
    if (bookMode === 'RECURRING') return !!recurMember && !!recurStartDate && !!recurEndDate && !!bookTime;
    return false;
  })();

  return (
    <AppLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', mb: 3, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Personal Training</Typography>
          <Typography variant="body2" color="text.secondary">PT packages, schedules, and session tracking</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetBookForm(); setBookOpen(true); }}>
          Schedule Session
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab label={`Today (${todaySess.filter(s => s.status === 'UPCOMING').length} upcoming)`} />
          <Tab label="All Sessions" />
          <Tab label="Packages" />
        </Tabs>
      </Box>

      {/* ── Tab 0: Today's Schedule ─────────────────────────────────────────── */}
      <TabPanel value={tab} index={0}>
        {todayLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : todaySess.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">No sessions scheduled for today</Typography>
            <Button sx={{ mt: 2 }} variant="outlined" startIcon={<AddIcon />} onClick={() => { resetBookForm(); setBookOpen(true); }}>Schedule a Session</Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {todaySess.sort((a, b) => a.time.localeCompare(b.time)).map(session => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={session.id}>
                <Card elevation={0} sx={{
                  borderLeft: '4px solid',
                  borderColor: session.status === 'COMPLETED' ? 'success.main' : session.status === 'MISSED' ? 'error.main' : session.status === 'CANCELLED' ? 'warning.main' : 'primary.main',
                  height: '100%',
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Typography variant="h5" fontWeight="bold" color="primary">{session.time}</Typography>
                      <Chip label={session.status} size="small" color={STATUS_COLOR[session.status]} />
                    </Box>
                    <Typography variant="body1" fontWeight={700}>{session.member}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Trainer: {session.trainer}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {session.duration} min · {session.sessionType}
                    </Typography>
                    {session.notes && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">{session.notes}</Typography>
                      </Box>
                    )}
                    {session.cancellationReason && (
                      <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5 }}>
                        Reason: {session.cancellationReason}
                      </Typography>
                    )}
                    {session.status === 'UPCOMING' && (
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button size="small" variant="contained" color="success" startIcon={<CheckCircleIcon />} fullWidth
                          onClick={() => { setCompleteSession(session); setCompleteNotes(''); setActionError(''); }}>
                          Done
                        </Button>
                        <Button size="small" variant="outlined" color="warning" fullWidth
                          onClick={() => { setActionError(''); handleMiss(session.id); }}>
                          Missed
                        </Button>
                        <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />} fullWidth
                          onClick={() => { setCancelSession(session); setCancelReason(''); setActionError(''); }}>
                          Cancel
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* ── Tab 1: All Sessions ─────────────────────────────────────────────── */}
      <TabPanel value={tab} index={1}>
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Filter by Trainer" select size="small" sx={{ minWidth: 180 }}
            value={filterTrainerId} onChange={e => setFilterTrainerId(e.target.value)}
          >
            <MenuItem value="">All Trainers</MenuItem>
            {(trainersData?.data ?? trainersData?.items ?? []).map((t: any) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
          </TextField>
          <TextField
            label="Filter by Status" select size="small" sx={{ minWidth: 150 }}
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {['UPCOMING', 'COMPLETED', 'CANCELLED', 'MISSED'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField
            label="Date" type="date" size="small" sx={{ minWidth: 160 }}
            value={filterDate} onChange={e => setFilterDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Button variant="outlined" size="small" onClick={() => { setFilterTrainerId(''); setFilterStatus(''); setFilterDate(''); }}>
            Clear
          </Button>
        </Box>

        {allLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : (
          <Card elevation={0}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Member</TableCell>
                    <TableCell>Trainer</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allSess.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No sessions found
                      </TableCell>
                    </TableRow>
                  ) : allSess.map(s => (
                    <TableRow key={s.id} hover>
                      <TableCell>{s.date}</TableCell>
                      <TableCell>{s.time}</TableCell>
                      <TableCell><Typography variant="body2" fontWeight={600}>{s.member}</Typography></TableCell>
                      <TableCell>{s.trainer}</TableCell>
                      <TableCell>{s.sessionType}</TableCell>
                      <TableCell>{s.duration}m</TableCell>
                      <TableCell><Chip label={s.status} size="small" color={STATUS_COLOR[s.status]} /></TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary" sx={{ maxWidth: 120, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.notes || '—'}</Typography></TableCell>
                      <TableCell align="right">
                        {s.status === 'UPCOMING' && (
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <Tooltip title="Mark Complete">
                              <IconButton size="small" color="success" onClick={() => { setCompleteSession(s); setCompleteNotes(''); setActionError(''); }}>
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Mark Missed">
                              <IconButton size="small" color="warning" onClick={() => handleMiss(s.id)}>
                                <EventRepeatIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel">
                              <IconButton size="small" color="error" onClick={() => { setCancelSession(s); setCancelReason(''); setActionError(''); }}>
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </TabPanel>

      {/* ── Tab 2: Packages ─────────────────────────────────────────────────── */}
      <TabPanel value={tab} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={openAddPkg}>New Package</Button>
        </Box>
        {pkgsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={2}>
            {pkgs.map(pkg => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={pkg.id}>
                <Card elevation={0} sx={{ height: '100%', position: 'relative' }}>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h2" fontWeight={800} color="primary">{pkg.sessionsCount}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Sessions</Typography>
                    <Typography variant="h5" fontWeight="bold">₹{pkg.price.toLocaleString('en-IN')}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">{pkg.validityDays} days validity</Typography>
                    {pkg.name && <Chip label={pkg.name} size="small" sx={{ mt: 1 }} />}
                    {pkg.description && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        {pkg.description}
                      </Typography>
                    )}
                    <Button variant="outlined" fullWidth sx={{ mt: 2 }} startIcon={<EditIcon />} onClick={() => openEditPkg(pkg)}>
                      Edit
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {pkgs.length === 0 && (
              <Grid size={12}>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography color="text.secondary">No packages yet. Create your first PT package.</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </TabPanel>

      {/* ══ Book Session Dialog ══════════════════════════════════════════════ */}
      <Dialog open={bookOpen} onClose={() => { setBookOpen(false); resetBookForm(); }} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <DialogTitle>Schedule PT Session</DialogTitle>
        <DialogContent>
          {bookError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{bookError}</Alert>}
          {bookProgress && (
            <Box sx={{ mb: 2, mt: 1 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>Creating sessions… {bookProgress.done}/{bookProgress.total}</Typography>
              <LinearProgress variant="determinate" value={(bookProgress.done / bookProgress.total) * 100} />
            </Box>
          )}

          {/* Mode Switcher */}
          <Box sx={{ mb: 3, mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Session Mode</Typography>
            <ToggleButtonGroup value={bookMode} exclusive onChange={(_, v) => v && setBookMode(v)} size="small" fullWidth>
              <ToggleButton value="INDIVIDUAL"><PersonIcon sx={{ mr: 0.5, fontSize: 16 }} />Individual</ToggleButton>
              <ToggleButton value="GROUP"><GroupIcon sx={{ mr: 0.5, fontSize: 16 }} />Group</ToggleButton>
              <ToggleButton value="RECURRING"><EventRepeatIcon sx={{ mr: 0.5, fontSize: 16 }} />Recurring</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Grid container spacing={2}>
            {/* Individual: single member */}
            {bookMode === 'INDIVIDUAL' && (
              <Grid size={12}>
                <Autocomplete
                  options={memberSearch1.options}
                  loading={memberSearch1.loading}
                  getOptionLabel={o => `${o.name}${o.phone ? ` · ${o.phone}` : ''}`}
                  value={bookMember}
                  onChange={(_, v) => setBookMember(v)}
                  onInputChange={(_, v) => memberSearch1.search(v)}
                  filterOptions={x => x}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Member *"
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (<><SearchIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 18 }} />{params.InputProps?.startAdornment}</>),
                      }}
                    />
                  )}
                />
              </Grid>
            )}

            {/* Group: multi-member */}
            {bookMode === 'GROUP' && (
              <Grid size={12}>
                <Autocomplete
                  multiple
                  options={memberSearch2.options}
                  loading={memberSearch2.loading}
                  getOptionLabel={o => `${o.name}${o.phone ? ` · ${o.phone}` : ''}`}
                  value={groupMembers}
                  onChange={(_, v) => setGroupMembers(v)}
                  onInputChange={(_, v) => memberSearch2.search(v)}
                  filterOptions={x => x}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  renderInput={params => (
                    <TextField {...params} label="Members * (search to add)" size="small" />
                  )}
                />
                {groupMembers.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {groupMembers.length} member{groupMembers.length > 1 ? 's' : ''} selected → {groupMembers.length} session{groupMembers.length > 1 ? 's' : ''} will be created
                  </Typography>
                )}
              </Grid>
            )}

            {/* Recurring: single member */}
            {bookMode === 'RECURRING' && (
              <>
                <Grid size={12}>
                  <Autocomplete
                    options={memberSearch3.options}
                    loading={memberSearch3.loading}
                    getOptionLabel={o => `${o.name}${o.phone ? ` · ${o.phone}` : ''}`}
                    value={recurMember}
                    onChange={(_, v) => setRecurMember(v)}
                    onInputChange={(_, v) => memberSearch3.search(v)}
                    filterOptions={x => x}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    renderInput={params => <TextField {...params} label="Member *" size="small" />}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Day of Week" select fullWidth size="small" value={recurDay} onChange={e => setRecurDay(Number(e.target.value))}>
                    {DAYS_OF_WEEK.map((d, i) => <MenuItem key={i} value={i}>{d}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Start Date *" type="date" fullWidth size="small" value={recurStartDate}
                    onChange={e => setRecurStartDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="End Date *" type="date" fullWidth size="small" value={recurEndDate}
                    onChange={e => setRecurEndDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                </Grid>
                {recurStartDate && recurEndDate && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ p: 1.5, bgcolor: 'primary.main', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight={700} color="primary.contrastText">
                        {getRecurringDates(recurStartDate, recurEndDate, recurDay, bookTime).length}
                      </Typography>
                      <Typography variant="caption" color="primary.contrastText">sessions to be created</Typography>
                    </Box>
                  </Grid>
                )}
              </>
            )}

            {/* Shared: Trainer */}
            <Grid size={12}>
              <TextField label="Trainer *" select fullWidth size="small" value={bookTrainerId} onChange={e => setBookTrainerId(e.target.value)}>
                {trainersOptions.map(t => (
                  <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}</TextField>
            </Grid>

            {/* Shared: Date (not for RECURRING which has start/end) */}
            {bookMode !== 'RECURRING' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Date *" type="date" fullWidth size="small" value={bookDate}
                  onChange={e => setBookDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
            )}

            {/* Shared: Time */}
            <Grid size={{ xs: 12, sm: bookMode === 'RECURRING' ? 12 : 6 }}>
              <TextField label="Time *" type="time" fullWidth size="small" value={bookTime}
                onChange={e => setBookTime(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>

            {/* Shared: Duration + Type */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Duration (min)" select fullWidth size="small" value={bookDuration} onChange={e => setBookDuration(Number(e.target.value))}>
                {[30, 45, 60, 75, 90, 120].map(d => <MenuItem key={d} value={d}>{d} min</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Session Type" select fullWidth size="small" value={bookType} onChange={e => setBookType(e.target.value)}>
                {SESSION_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField label="Notes" fullWidth size="small" multiline rows={2} value={bookNotes} onChange={e => setBookNotes(e.target.value)} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => { setBookOpen(false); resetBookForm(); }} disabled={bookSubmitting}>Cancel</Button>
          <Button variant="contained" onClick={handleBook} disabled={bookSubmitting || !bookValid}>
            {bookSubmitting ? <CircularProgress size={22} /> : bookMode === 'INDIVIDUAL' ? 'Book Session' : bookMode === 'GROUP' ? `Book ${groupMembers.length} Session${groupMembers.length !== 1 ? 's' : ''}` : 'Create Recurring Schedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══ Mark Complete Dialog ═════════════════════════════════════════════ */}
      <Dialog open={!!completeSession} onClose={() => { setCompleteSession(null); setActionError(''); }} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <DialogTitle>Mark Session Complete</DialogTitle>
        <DialogContent>
          {actionError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{actionError}</Alert>}
          {completeSession && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={600}>{completeSession.member}</Typography>
              <Typography variant="caption" color="text.secondary">with {completeSession.trainer} · {completeSession.date} {completeSession.time}</Typography>
            </Box>
          )}
          <TextField label="Session Notes (optional)" fullWidth size="small" multiline rows={3}
            value={completeNotes} onChange={e => setCompleteNotes(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => { setCompleteSession(null); setActionError(''); }} disabled={actionSubmitting}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleComplete} disabled={actionSubmitting}>
            {actionSubmitting ? <CircularProgress size={22} /> : 'Mark Complete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══ Cancel Dialog ════════════════════════════════════════════════════ */}
      <Dialog open={!!cancelSession} onClose={() => { setCancelSession(null); setActionError(''); }} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <DialogTitle>Cancel Session</DialogTitle>
        <DialogContent>
          {actionError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{actionError}</Alert>}
          {cancelSession && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={600}>{cancelSession.member}</Typography>
              <Typography variant="caption" color="text.secondary">with {cancelSession.trainer} · {cancelSession.date} {cancelSession.time}</Typography>
            </Box>
          )}
          <TextField label="Cancellation Reason" fullWidth size="small" multiline rows={2}
            value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Optional reason…" />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => { setCancelSession(null); setActionError(''); }} disabled={actionSubmitting}>Go Back</Button>
          <Button variant="contained" color="error" onClick={handleCancel} disabled={actionSubmitting}>
            {actionSubmitting ? <CircularProgress size={22} /> : 'Cancel Session'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══ Package Dialog ═══════════════════════════════════════════════════ */}
      <Dialog open={pkgOpen} onClose={() => setPkgOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <DialogTitle>{editPkg ? 'Edit Package' : 'New PT Package'}</DialogTitle>
        <DialogContent>
          {pkgError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{pkgError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}><TextField label="Package Name *" fullWidth size="small" value={pkgForm.name} onChange={e => setPkgForm(f => ({ ...f, name: e.target.value }))} /></Grid>
            <Grid size={6}><TextField label="Sessions" type="number" fullWidth size="small" value={pkgForm.sessionsCount} onChange={e => setPkgForm(f => ({ ...f, sessionsCount: Number(e.target.value) }))} /></Grid>
            <Grid size={6}><TextField label="Validity (days)" type="number" fullWidth size="small" value={pkgForm.validityDays} onChange={e => setPkgForm(f => ({ ...f, validityDays: Number(e.target.value) }))} /></Grid>
            <Grid size={12}><TextField label="Price (₹)" type="number" fullWidth size="small" value={pkgForm.price} onChange={e => setPkgForm(f => ({ ...f, price: Number(e.target.value) }))} /></Grid>
            <Grid size={12}><TextField label="Description" fullWidth size="small" multiline rows={2} value={pkgForm.description} onChange={e => setPkgForm(f => ({ ...f, description: e.target.value }))} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setPkgOpen(false)} disabled={pkgSubmitting}>Cancel</Button>
          <Button variant="contained" onClick={handlePkgSubmit} disabled={pkgSubmitting || !pkgForm.name.trim()}>
            {pkgSubmitting ? <CircularProgress size={22} /> : editPkg ? 'Save Changes' : 'Create Package'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
