'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Alert, CircularProgress, IconButton, Tooltip, Autocomplete,
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SearchIcon from '@mui/icons-material/Search';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { api } from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────────────────
type TrainerRow = {
  id: string; name: string; email: string; phone: string;
  specialization: string; certifications: string[];
  joiningDate: string; shift: string; status: string;
  membersAssigned: number; ptClients: number;
  sessionsThisMonth: number; sessionsCompleted: number; sessionsCancelled: number;
  bio: string; salary: number;
};
type MemberOption = { id: string; name: string; phone?: string };
type AssignedMember = { id: string; name: string; phone: string; email: string; assignedAt?: string };

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error'> = {
  ACTIVE: 'success', ON_LEAVE: 'warning', INACTIVE: 'error',
};

const SHIFTS = [
  { value: 'morning', label: 'Morning (6AM–2PM)' },
  { value: 'evening', label: 'Evening (2PM–10PM)' },
  { value: 'split', label: 'Split Shift' },
  { value: 'flexible', label: 'Flexible' },
];

function mapTrainer(t: Record<string, unknown>): TrainerRow {
  return {
    id: String(t.id),
    name: `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim() || String(t.name ?? ''),
    email: String(t.email ?? ''),
    phone: String(t.phone ?? '').replace(/^\+91/, ''),
    specialization: String(t.specialization ?? ''),
    certifications: Array.isArray(t.certifications) ? t.certifications.map(String) : [],
    joiningDate: String(t.joiningDate ?? t.joinDate ?? '').split('T')[0],
    shift: String(t.shift ?? ''),
    status: String(t.status ?? 'ACTIVE'),
    membersAssigned: Number(t.membersAssigned ?? t.memberCount ?? 0),
    ptClients: Number(t.ptClients ?? t.ptClientCount ?? 0),
    sessionsThisMonth: Number(t.sessionsThisMonth ?? 0),
    sessionsCompleted: Number(t.sessionsCompleted ?? 0),
    sessionsCancelled: Number(t.sessionsCancelled ?? 0),
    bio: String(t.bio ?? ''),
    salary: Number(t.salary ?? 0),
  };
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

// ── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <FitnessCenterIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">No trainers yet</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Add your first trainer to get started</Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>Add Trainer</Button>
    </Box>
  );
}

export default function TrainersPage() {
  // ── Data ────────────────────────────────────────────────────────────────────
  const [trainers, setTrainers] = useState<TrainerRow[] | null>(null);

  // ── Add / Edit Trainer Dialog ───────────────────────────────────────────────
  const [trainerDialogOpen, setTrainerDialogOpen] = useState(false);
  const [editTrainer, setEditTrainer] = useState<TrainerRow | null>(null);
  const [trainerForm, setTrainerForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    specialization: '', certifications: '', shift: 'morning',
    joiningDate: new Date().toISOString().split('T')[0], bio: '',
  });
  const [trainerSubmitting, setTrainerSubmitting] = useState(false);
  const [trainerError, setTrainerError] = useState('');

  // ── Status Dialog ───────────────────────────────────────────────────────────
  const [statusTrainer, setStatusTrainer] = useState<TrainerRow | null>(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // ── View Members Dialog ─────────────────────────────────────────────────────
  const [membersTrainer, setMembersTrainer] = useState<TrainerRow | null>(null);
  const [assignedMembers, setAssignedMembers] = useState<AssignedMember[] | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  // ── Assign Members Dialog ───────────────────────────────────────────────────
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignTrainer, setAssignTrainer] = useState<TrainerRow | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<MemberOption[]>([]);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignError, setAssignError] = useState('');
  const memberSearch = useMemberSearch();

  // ── Fetchers ─────────────────────────────────────────────────────────────────
  const fetchTrainers = () => {
    api.get('/trainers', { params: { pageSize: '100' } })
      .then(res => {
        const items = res.data?.data ?? res.data?.items ?? res.data?.trainers ?? [];
        setTrainers(items.map(mapTrainer));
      })
      .catch(() => setTrainers([]));
  };

  const fetchAssignedMembers = (trainerId: string) => {
    setAssignedMembers(null);
    api.get(`/trainers/${trainerId}/members`)
      .then(res => {
        const items = res.data?.members ?? res.data?.data ?? [];
        setAssignedMembers(items.map((row: Record<string, unknown>) => {
          const m = (row.member ?? row) as Record<string, unknown>;
          return {
            id: String(m.id),
            name: `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || String(m.name ?? ''),
            phone: String(m.phone ?? '').replace(/^\+91/, ''),
            email: String(m.email ?? ''),
            assignedAt: String((row.assignment as Record<string, unknown>)?.assignedAt ?? row.assignedAt ?? '').split('T')[0],
          };
        }));
      })
      .catch(() => setAssignedMembers([]));
  };

  useEffect(() => { fetchTrainers(); }, []);

  // ── Add/Edit handlers ────────────────────────────────────────────────────────
  const openAddTrainer = () => {
    setEditTrainer(null);
    setTrainerForm({ firstName: '', lastName: '', email: '', phone: '', specialization: '', certifications: '', shift: 'morning', joiningDate: new Date().toISOString().split('T')[0], bio: '' });
    setTrainerError(''); setTrainerDialogOpen(true);
  };

  const openEditTrainer = (t: TrainerRow) => {
    setEditTrainer(t);
    const [firstName, ...lastParts] = t.name.split(' ');
    setTrainerForm({
      firstName: firstName || t.name, lastName: lastParts.join(' ') || '',
      email: t.email, phone: t.phone, specialization: t.specialization,
      certifications: t.certifications.join(', '), shift: t.shift,
      joiningDate: t.joiningDate, bio: t.bio,
    });
    setTrainerError(''); setTrainerDialogOpen(true);
  };

  const handleTrainerSubmit = async () => {
    setTrainerError(''); setTrainerSubmitting(true);
    try {
      const payload = {
        ...trainerForm,
        phone: trainerForm.phone ? `+91${trainerForm.phone.replace(/^\+91/, '')}` : undefined,
        certifications: trainerForm.certifications.split(',').map(s => s.trim()).filter(Boolean),
      };
      if (editTrainer) {
        await api.patch(`/trainers/${editTrainer.id}`, payload);
      } else {
        await api.post('/trainers', payload);
      }
      fetchTrainers(); setTrainerDialogOpen(false);
    } catch (e: any) {
      const err = e.response?.data?.error;
      setTrainerError(typeof err === 'string' ? err : err?.message || 'Failed to save trainer');
    } finally { setTrainerSubmitting(false); }
  };

  // ── Status handler ───────────────────────────────────────────────────────────
  const handleStatusChange = async (trainer: TrainerRow, newStatus: string) => {
    setStatusSubmitting(true);
    try {
      await api.patch(`/trainers/${trainer.id}/status`, { status: newStatus });
      fetchTrainers(); setStatusTrainer(null);
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to update status');
    } finally { setStatusSubmitting(false); }
  };

  // ── Remove member handler ────────────────────────────────────────────────────
  const handleRemoveMember = async (trainerId: string, memberId: string) => {
    if (!confirm('Remove this member from trainer?')) return;
    setRemovingMemberId(memberId);
    try {
      await api.delete(`/trainers/${trainerId}/members/${memberId}`);
      fetchAssignedMembers(trainerId);
      fetchTrainers();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to remove member');
    } finally { setRemovingMemberId(null); }
  };

  // ── Assign members handler ───────────────────────────────────────────────────
  const handleAssignMembers = async () => {
    if (!assignTrainer || !selectedMembers.length) return;
    setAssignError(''); setAssignSubmitting(true);
    try {
      await api.post(`/trainers/${assignTrainer.id}/assign-members`, {
        memberIds: selectedMembers.map(m => m.id),
      });
      setSelectedMembers([]);
      fetchTrainers();
      if (membersTrainer?.id === assignTrainer.id) fetchAssignedMembers(assignTrainer.id);
      setAssignDialogOpen(false);
    } catch (e: any) {
      const err = e.response?.data?.error;
      setAssignError(typeof err === 'string' ? err : err?.message || 'Failed to assign members');
    } finally { setAssignSubmitting(false); }
  };

  const trList = trainers ?? [];
  const activeCount = trList.filter(t => t.status === 'ACTIVE').length;
  const totalSessions = trList.reduce((s, t) => s + t.sessionsThisMonth, 0);

  return (
    <AppLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', mb: 3, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Trainer Management</Typography>
          <Typography variant="body2" color="text.secondary">
            {trainers === null ? 'Loading…' : `${trList.length} trainer${trList.length !== 1 ? 's' : ''} · ${activeCount} active`}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAddTrainer}>Add Trainer</Button>
      </Box>

      {/* Summary stat row */}
      {trList.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Total Trainers', value: trList.length },
            { label: 'Active', value: activeCount },
            { label: 'Sessions This Month', value: totalSessions },
            { label: 'Members Assigned', value: trList.reduce((s, t) => s + t.membersAssigned, 0) },
          ].map(({ label, value }) => (
            <Grid size={{ xs: 6, sm: 3 }} key={label}>
              <Card elevation={0}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h5" fontWeight={800}>{value}</Typography>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {trainers === null ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
      ) : trList.length === 0 ? (
        <EmptyState onAdd={openAddTrainer} />
      ) : (
        <Grid container spacing={2}>
          {trList.map(trainer => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={trainer.id}>
              <Card elevation={0} sx={{ height: '100%' }}>
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
                    <Avatar sx={{ width: 52, height: 52, bgcolor: 'primary.dark', fontSize: '1.1rem', flexShrink: 0 }}>
                      {trainer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{trainer.name}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block" noWrap>
                        {trainer.specialization || 'General Training'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                        <Chip label={trainer.status} size="small" color={STATUS_COLOR[trainer.status]} />
                        {trainer.shift && <Chip label={trainer.shift} size="small" variant="outlined" />}
                      </Box>
                    </Box>
                    <Tooltip title="Edit Trainer">
                      <IconButton size="small" onClick={() => openEditTrainer(trainer)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Stats */}
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    {[
                      ['Members', trainer.membersAssigned],
                      ['PT Clients', trainer.ptClients],
                      ['Sessions', trainer.sessionsThisMonth],
                      ['Completed', trainer.sessionsCompleted],
                      ['Missed', trainer.sessionsCancelled],
                    ].map(([k, v]) => (
                      <Grid size={4} key={k as string}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{v}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>{k}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Contact info */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                    {trainer.phone && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">Phone</Typography>
                        <Typography variant="caption" fontWeight={500}>+91{trainer.phone}</Typography>
                      </Box>
                    )}
                    {trainer.email && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Typography variant="caption" fontWeight={500} noWrap sx={{ maxWidth: 180 }}>{trainer.email}</Typography>
                      </Box>
                    )}
                    {trainer.joiningDate && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">Joined</Typography>
                        <Typography variant="caption" fontWeight={500}>{trainer.joiningDate}</Typography>
                      </Box>
                    )}
                    {trainer.certifications.length > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="caption" color="text.secondary">Certs</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3, justifyContent: 'flex-end', maxWidth: 200 }}>
                          {trainer.certifications.map(c => (
                            <Chip key={c} label={c} size="small" sx={{ fontSize: '0.6rem', height: 18 }} />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Action buttons */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small" variant="outlined" startIcon={<PeopleIcon />}
                      onClick={() => { setMembersTrainer(trainer); fetchAssignedMembers(trainer.id); }}
                    >
                      Members ({trainer.membersAssigned})
                    </Button>
                    <Button
                      size="small" variant="outlined" startIcon={<PersonAddIcon />}
                      onClick={() => { setAssignTrainer(trainer); setSelectedMembers([]); setAssignError(''); setAssignDialogOpen(true); }}
                    >
                      Assign
                    </Button>
                    <Button
                      size="small" variant="outlined"
                      color={trainer.status === 'ACTIVE' ? 'warning' : 'success'}
                      onClick={() => setStatusTrainer(trainer)}
                    >
                      {trainer.status === 'ACTIVE' ? 'Change Status' : 'Activate'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ══ Add / Edit Trainer Dialog ════════════════════════════════════════ */}
      <Dialog open={trainerDialogOpen} onClose={() => setTrainerDialogOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <DialogTitle>{editTrainer ? 'Edit Trainer' : 'Add Trainer'}</DialogTitle>
        <DialogContent>
          {trainerError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{trainerError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="First Name *" fullWidth size="small" value={trainerForm.firstName} onChange={e => setTrainerForm(f => ({ ...f, firstName: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Last Name" fullWidth size="small" value={trainerForm.lastName} onChange={e => setTrainerForm(f => ({ ...f, lastName: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Phone (WhatsApp)" fullWidth size="small" value={trainerForm.phone}
                slotProps={{ input: { startAdornment: <InputAdornment position="start">🇮🇳 +91</InputAdornment> } }}
                onChange={e => {
                  const v = e.target.value.replace(/\D/g, '');
                  if (v.length <= 10) setTrainerForm(f => ({ ...f, phone: v }));
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Email" type="email" fullWidth size="small" value={trainerForm.email} onChange={e => setTrainerForm(f => ({ ...f, email: e.target.value }))} />
            </Grid>
            <Grid size={12}>
              <TextField label="Specialization" fullWidth size="small" placeholder="e.g. Weight Training, Yoga, CrossFit" value={trainerForm.specialization} onChange={e => setTrainerForm(f => ({ ...f, specialization: e.target.value }))} />
            </Grid>
            <Grid size={12}>
              <TextField label="Certifications (comma-separated)" fullWidth size="small" placeholder="e.g. ACE, NASM, ISSA" value={trainerForm.certifications} onChange={e => setTrainerForm(f => ({ ...f, certifications: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Shift" select fullWidth size="small" value={trainerForm.shift} onChange={e => setTrainerForm(f => ({ ...f, shift: e.target.value }))}>
                {SHIFTS.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Joining Date" type="date" fullWidth size="small" value={trainerForm.joiningDate}
                onChange={e => setTrainerForm(f => ({ ...f, joiningDate: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={12}>
              <TextField label="Bio" fullWidth size="small" multiline rows={2} value={trainerForm.bio} onChange={e => setTrainerForm(f => ({ ...f, bio: e.target.value }))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setTrainerDialogOpen(false)} disabled={trainerSubmitting}>Cancel</Button>
          <Button variant="contained" onClick={handleTrainerSubmit} disabled={trainerSubmitting || !trainerForm.firstName.trim()}>
            {trainerSubmitting ? <CircularProgress size={22} /> : editTrainer ? 'Save Changes' : 'Add Trainer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══ Status Change Dialog ═════════════════════════════════════════════ */}
      <Dialog open={!!statusTrainer} onClose={() => setStatusTrainer(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <DialogTitle>Change Trainer Status</DialogTitle>
        <DialogContent>
          {statusTrainer && (
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>{statusTrainer.name}</Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Current status: <Chip label={statusTrainer.status} size="small" color={STATUS_COLOR[statusTrainer.status]} />
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {['ACTIVE', 'ON_LEAVE', 'INACTIVE'].filter(s => s !== statusTrainer.status).map(status => (
                  <Button
                    key={status} variant="outlined"
                    color={status === 'ACTIVE' ? 'success' : status === 'ON_LEAVE' ? 'warning' : 'error'}
                    onClick={() => handleStatusChange(statusTrainer, status)}
                    disabled={statusSubmitting}
                  >
                    {statusSubmitting ? <CircularProgress size={20} /> : `Set ${status.replace('_', ' ')}`}
                  </Button>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setStatusTrainer(null)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* ══ View Assigned Members Dialog ════════════════════════════════════ */}
      <Dialog open={!!membersTrainer} onClose={() => setMembersTrainer(null)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Assigned Members</Typography>
              {membersTrainer && <Typography variant="caption" color="text.secondary">{membersTrainer.name}</Typography>}
            </Box>
            <Button
              size="small" variant="outlined" startIcon={<PersonAddIcon />}
              onClick={() => {
                if (membersTrainer) { setAssignTrainer(membersTrainer); setSelectedMembers([]); setAssignError(''); setAssignDialogOpen(true); }
              }}
            >
              Assign More
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {assignedMembers === null ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : assignedMembers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No members assigned yet</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Assigned</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignedMembers.map(m => (
                    <TableRow key={m.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: 'primary.dark' }}>
                            {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>{m.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{m.phone ? `+91${m.phone}` : '—'}</TableCell>
                      <TableCell>{m.assignedAt || '—'}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Unassign">
                          <IconButton
                            size="small" color="error"
                            disabled={removingMemberId === m.id}
                            onClick={() => membersTrainer && handleRemoveMember(membersTrainer.id, m.id)}
                          >
                            {removingMemberId === m.id ? <CircularProgress size={16} /> : <PersonRemoveIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setMembersTrainer(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ══ Assign Members Dialog ════════════════════════════════════════════ */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <DialogTitle>
          Assign Members
          {assignTrainer && <Typography variant="caption" color="text.secondary" display="block">to {assignTrainer.name}</Typography>}
        </DialogTitle>
        <DialogContent>
          {assignError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{assignError}</Alert>}
          <Box sx={{ mt: 1 }}>
            <Autocomplete
              multiple
              options={memberSearch.options}
              loading={memberSearch.loading}
              getOptionLabel={o => `${o.name}${o.phone ? ` · +91${o.phone}` : ''}`}
              value={selectedMembers}
              onChange={(_, v) => setSelectedMembers(v)}
              onInputChange={(_, v) => memberSearch.search(v)}
              filterOptions={x => x}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Search members to assign"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (<><SearchIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: 18 }} />{params.InputProps?.startAdornment}</>),
                  }}
                />
              )}
            />
            {selectedMembers.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''} selected
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAssignDialogOpen(false)} disabled={assignSubmitting}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignMembers} disabled={assignSubmitting || selectedMembers.length === 0}>
            {assignSubmitting ? <CircularProgress size={22} /> : `Assign ${selectedMembers.length > 0 ? selectedMembers.length : ''} Member${selectedMembers.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
