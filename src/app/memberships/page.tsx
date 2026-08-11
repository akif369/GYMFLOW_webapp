'use client';

import { useState, useEffect, type ReactNode, type SyntheticEvent } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Card, CardContent, Typography, Button, Chip, Tabs, Tab, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, Alert, Table, TableHead, TableRow, TableCell, TableBody, FormControlLabel, Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '@/lib/api';

interface TabPanelProps { children?: ReactNode; value: number; index: number; }
function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  );
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const eventColor: Record<string, ChipColor> = {
  CREATED: 'info', RENEWED: 'success', FROZEN: 'info', ACTIVATED: 'success',
  RESUMED: 'default', EXTENDED: 'primary', CANCELLED: 'error',
};

type Plan = {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  gstPercent: number;
  joiningFee: number;
  ptSessionsIncluded: number;
  status: string;
};

type MembershipEvent = {
  id: string;
  memberId: string;
  eventType: string;
  actorName: string;
  notes: string;
  createdAt: string;
  firstName: string;
  lastName: string;
};

export default function MembershipsPage() {
  const [tab, setTab] = useState(0);

  // ── Plans ──────────────────────────────────────────────────────────────────
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const refresh = () => setFetchTrigger(t => t + 1);

  // ── Events ─────────────────────────────────────────────────────────────────
  const [events, setEvents] = useState<MembershipEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    setPlansLoading(true);
    api.get('/membership-plans', { params: { pageSize: '50' } })
      .then(res => {
        const items = res.data?.plans ?? res.data?.items ?? [];
        setPlans(items.map((p: Record<string, unknown>) => ({
          id: String(p.id),
          name: String(p.name ?? ''),
          durationDays: Number(p.durationDays ?? 30),
          price: Number(p.price ?? 0),
          gstPercent: Number(p.gstPercent ?? 18),
          joiningFee: Number(p.joiningFee ?? 0),
          ptSessionsIncluded: Number(p.ptSessionsIncluded ?? 0),
          status: String(p.status ?? 'ACTIVE'),
        })));
      })
      .catch(() => setPlans([]))
      .finally(() => setPlansLoading(false));

    setEventsLoading(true);
    api.get('/membership-events', { params: { pageSize: '50' } })
      .then(res => {
        const items = res.data?.items ?? [];
        setEvents(items.map((e: Record<string, unknown>) => ({
          id: String(e.id),
          memberId: String(e.memberId ?? ''),
          eventType: String(e.eventType ?? e.event ?? ''),
          actorName: String(e.actorName ?? ''),
          notes: String(e.notes ?? ''),
          createdAt: String(e.createdAt ?? ''),
          firstName: String(e.firstName ?? ''),
          lastName: String(e.lastName ?? ''),
        })));
      })
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  }, [fetchTrigger]);

  // ── Create Plan Dialog ─────────────────────────────────────────────────────
  const [planOpen, setPlanOpen] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: '', durationDays: 30, price: 0, gstPercent: 18, joiningFee: 0, ptSessionsIncluded: 0, status: 'ACTIVE',
  });
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState('');

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name || !planForm.durationDays || !planForm.price) {
      setPlanError('Name, Duration, and Price are required.');
      return;
    }
    setPlanLoading(true); setPlanError('');
    try {
      await api.post('/membership-plans', planForm);
      setPlanOpen(false);
      setPlanForm({ name: '', durationDays: 30, price: 0, gstPercent: 18, joiningFee: 0, ptSessionsIncluded: 0, status: 'ACTIVE' });
      refresh();
    } catch (err: any) {
      setPlanError(err.response?.data?.message || 'Failed to create plan');
    } finally {
      setPlanLoading(false);
    }
  };

  // ── Edit Plan Dialog ───────────────────────────────────────────────────────
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editPlanForm, setEditPlanForm] = useState({
    name: '', durationDays: 30, price: 0, gstPercent: 18, joiningFee: 0, ptSessionsIncluded: 0, status: 'ACTIVE',
  });
  const [editPlanLoading, setEditPlanLoading] = useState(false);
  const [editPlanError, setEditPlanError] = useState('');

  const openEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setEditPlanForm({
      name: plan.name,
      durationDays: plan.durationDays,
      price: plan.price,
      gstPercent: plan.gstPercent,
      joiningFee: plan.joiningFee,
      ptSessionsIncluded: plan.ptSessionsIncluded,
      status: plan.status,
    });
    setEditPlanError('');
    setEditPlanOpen(true);
  };

  const handleEditPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setEditPlanLoading(true); setEditPlanError('');
    try {
      await api.patch(`/membership-plans/${editingPlan.id}`, editPlanForm);
      setEditPlanOpen(false);
      refresh();
    } catch (err: any) {
      setEditPlanError(err.response?.data?.message || 'Failed to update plan');
    } finally {
      setEditPlanLoading(false);
    }
  };

  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [deletePlanLoading, setDeletePlanLoading] = useState(false);
  const [deletePlanError, setDeletePlanError] = useState('');

  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    setDeletePlanLoading(true);
    setDeletePlanError('');
    try {
      await api.delete(`/membership-plans/${planToDelete.id}`);
      setPlanToDelete(null);
      refresh();
    } catch (err: any) {
      setDeletePlanError(err.response?.data?.message || 'Failed to delete plan');
    } finally {
      setDeletePlanLoading(false);
    }
  };

  // ── Membership Operation Dialogs ───────────────────────────────────────────
  const [opDialog, setOpDialog] = useState<string | null>(null);
  const [opMemberId, setOpMemberId] = useState('');
  const [opPlanId, setOpPlanId] = useState('');
  const [opStartDate, setOpStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [opFreezeStart, setOpFreezeStart] = useState('');
  const [opFreezeEnd, setOpFreezeEnd] = useState('');
  const [opDays, setOpDays] = useState(7);
  const [opReason, setOpReason] = useState('');
  const [opNotes, setOpNotes] = useState('');
  const [opLoading, setOpLoading] = useState(false);
  const [opError, setOpError] = useState('');

  const openOp = (op: string) => {
    setOpDialog(op);
    setOpError('');
    setOpMemberId('');
    setOpPlanId('');
    setOpReason('');
    setOpNotes('');
    setOpStartDate(new Date().toISOString().split('T')[0]);
  };

  const executeOperation = async () => {
    if (!opMemberId) { setOpError('Member ID is required'); return; }
    setOpLoading(true); setOpError('');
    try {
      switch (opDialog) {
        case 'Create':
          if (!opPlanId || !opStartDate) { setOpError('Plan and start date required'); setOpLoading(false); return; }
          await api.post(`/members/${opMemberId}/memberships/create`, { planId: opPlanId, startDate: opStartDate, notes: opNotes });
          break;
        case 'Activate':
          await api.post(`/members/${opMemberId}/memberships/activate`);
          break;
        case 'Renew':
          await api.post(`/members/${opMemberId}/memberships/renew`, { planId: opPlanId || undefined, notes: opNotes });
          break;
        case 'Freeze':
          if (!opFreezeStart || !opFreezeEnd) { setOpError('Freeze start and end dates required'); setOpLoading(false); return; }
          await api.post(`/members/${opMemberId}/memberships/freeze`, { freezeStart: opFreezeStart, freezeEnd: opFreezeEnd, reason: opReason });
          break;
        case 'Resume':
          await api.post(`/members/${opMemberId}/memberships/resume`);
          break;
        case 'Extend':
          await api.post(`/members/${opMemberId}/memberships/extend`, { days: opDays, reason: opReason });
          break;
        case 'Cancel':
          await api.post(`/members/${opMemberId}/memberships/cancel`, { reason: opReason });
          break;
        default:
          break;
      }
      setOpDialog(null);
      refresh();
    } catch (err: any) {
      setOpError(err.response?.data?.message || `Failed to execute ${opDialog}`);
    } finally {
      setOpLoading(false);
    }
  };

  const operations: { op: string; desc: string; color: ChipColor }[] = [
    { op: 'Create', desc: 'Start a new membership for a member', color: 'primary' },
    { op: 'Activate', desc: 'Activate a pending membership', color: 'success' },
    { op: 'Renew', desc: 'Extend membership for another period', color: 'primary' },
    { op: 'Freeze', desc: 'Pause membership temporarily (extends expiry)', color: 'info' },
    { op: 'Resume', desc: 'Resume a frozen membership', color: 'primary' },
    { op: 'Extend', desc: 'Extend expiry by N days', color: 'primary' },
    { op: 'Cancel', desc: 'Cancel and record reason', color: 'error' },
  ];

  return (
    <AppLayout>
      {/* Page Header */}
      <Box sx={{ display: 'flex', mb: 3, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Membership Management</Typography>
          <Typography variant="body2" color="text.secondary">Plans, events, and membership operations</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setPlanOpen(true); setPlanError(''); }} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          Create Plan
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_: SyntheticEvent, v: number) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab label={`Plans (${plans.length})`} />
          <Tab label="Event History" />
          <Tab label="Operations" />
        </Tabs>
      </Box>

      {/* ── Plans ── */}
      <TabPanel value={tab} index={0}>
        {plansLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        ) : plans.length === 0 ? (
          <Card elevation={0}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">No membership plans yet.</Typography>
              <Button variant="contained" startIcon={<AddIcon />} sx={{ mt: 2 }} onClick={() => setPlanOpen(true)}>Create First Plan</Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {plans.map(plan => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={plan.id}>
                <Card elevation={0} sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', mb: 2, alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{plan.name}</Typography>
                      <Chip label={plan.status} size="small" color={plan.status === 'ACTIVE' ? 'success' : 'default'} />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {[
                        ['Duration', `${plan.durationDays} days`],
                        ['Price', `₹${plan.price.toLocaleString()}`],
                        ['GST', `${plan.gstPercent}%`],
                        ['Joining Fee', plan.joiningFee > 0 ? `₹${plan.joiningFee.toLocaleString()}` : 'None'],
                        ['PT Sessions', plan.ptSessionsIncluded],
                      ].map(([key, value]) => (
                        <Box key={String(key)} sx={{ py: 0.5, display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', justifyContent: 'space-between', gap: 2 }}>
                          <Typography variant="caption" color="text.secondary">{key}</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{value}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button size="small" variant="outlined" fullWidth startIcon={<EditIcon />} onClick={() => openEditPlan(plan)}>Edit</Button>
                      <Button size="small" variant="outlined" color="error" fullWidth startIcon={<DeleteIcon />} onClick={() => { setPlanToDelete(plan); setDeletePlanError(''); }}>
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* ── Event History ── */}
      <TabPanel value={tab} index={1}>
        <Card elevation={0}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>All Membership Events</Typography>
                <Typography variant="caption" color="text.secondary">Immutable audit trail of all membership changes</Typography>
              </Box>
            </Box>
            {eventsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>
            ) : events.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No membership events yet.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Member</TableCell>
                    <TableCell>Event</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>By</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.map((event, index) => (
                    <TableRow key={event.id ?? index} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {event.firstName} {event.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={event.eventType} size="small" color={eventColor[event.eventType] ?? 'default'} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{String(event.createdAt).split('T')[0]}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{event.actorName || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{event.notes || '—'}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* ── Operations ── */}
      <TabPanel value={tab} index={2}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Perform membership lifecycle operations on any member by entering their Member ID.
        </Typography>
        <Grid container spacing={2}>
          {operations.map(({ op, desc, color }) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={op}>
              <Card elevation={0} sx={{ height: '100%', cursor: 'pointer', transition: 'border-color 0.2s', '&:hover': { borderColor: 'primary.main' } }}>
                <CardContent>
                  <Chip label={op} color={color} size="small" sx={{ mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">{desc}</Typography>
                  <Button size="small" variant="text" sx={{ mt: 1, p: 0 }} onClick={() => openOp(op)}>
                    Open →
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* ── Create Plan Dialog ── */}
      <Dialog open={planOpen} onClose={() => setPlanOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 2, bgcolor: 'background.paper' } } }}>
        <Box component="form" onSubmit={handleCreatePlan}>
          <DialogTitle>Create Membership Plan</DialogTitle>
          <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
            {planError && <Alert severity="error" sx={{ mb: 2 }}>{planError}</Alert>}
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={12}><TextField label="Plan Name" required value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} fullWidth size="small" placeholder="e.g. Monthly Pro" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Duration (days)" required type="number" value={planForm.durationDays} onChange={e => setPlanForm({ ...planForm, durationDays: Number(e.target.value) })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Price (₹)" required type="number" value={planForm.price} onChange={e => setPlanForm({ ...planForm, price: Number(e.target.value) })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="GST (%)" type="number" value={planForm.gstPercent} onChange={e => setPlanForm({ ...planForm, gstPercent: Number(e.target.value) })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Joining Fee (₹)" type="number" value={planForm.joiningFee} onChange={e => setPlanForm({ ...planForm, joiningFee: Number(e.target.value) })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="PT Sessions Included" type="number" value={planForm.ptSessionsIncluded} onChange={e => setPlanForm({ ...planForm, ptSessionsIncluded: Number(e.target.value) })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Status" select value={planForm.status} onChange={e => setPlanForm({ ...planForm, status: e.target.value })} fullWidth size="small">
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, gap: 1 }}>
            <Button onClick={() => setPlanOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={planLoading}>
              {planLoading ? <CircularProgress size={24} /> : 'Create Plan'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ── Edit Plan Dialog ── */}
      <Dialog open={editPlanOpen} onClose={() => setEditPlanOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 2, bgcolor: 'background.paper' } } }}>
        <Box component="form" onSubmit={handleEditPlan}>
          <DialogTitle>Edit Plan — {editingPlan?.name}</DialogTitle>
          <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
            {editPlanError && <Alert severity="error" sx={{ mb: 2 }}>{editPlanError}</Alert>}
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={12}><TextField label="Plan Name" required value={editPlanForm.name} onChange={e => setEditPlanForm({ ...editPlanForm, name: e.target.value })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Duration (days)" required type="number" value={editPlanForm.durationDays} onChange={e => setEditPlanForm({ ...editPlanForm, durationDays: Number(e.target.value) })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Price (₹)" required type="number" value={editPlanForm.price} onChange={e => setEditPlanForm({ ...editPlanForm, price: Number(e.target.value) })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="GST (%)" type="number" value={editPlanForm.gstPercent} onChange={e => setEditPlanForm({ ...editPlanForm, gstPercent: Number(e.target.value) })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Joining Fee (₹)" type="number" value={editPlanForm.joiningFee} onChange={e => setEditPlanForm({ ...editPlanForm, joiningFee: Number(e.target.value) })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="PT Sessions Included" type="number" value={editPlanForm.ptSessionsIncluded} onChange={e => setEditPlanForm({ ...editPlanForm, ptSessionsIncluded: Number(e.target.value) })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ height: '100%', minHeight: 40, px: 1.5, border: 1, borderColor: 'divider', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{editPlanForm.status === 'ACTIVE' ? 'Active' : 'Inactive'}</Typography>
                  <FormControlLabel
                    label=""
                    control={<Switch checked={editPlanForm.status === 'ACTIVE'} onChange={(_, checked) => setEditPlanForm({ ...editPlanForm, status: checked ? 'ACTIVE' : 'INACTIVE' })} />}
                    sx={{ m: 0 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, gap: 1 }}>
            <Button onClick={() => setEditPlanOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={editPlanLoading}>
              {editPlanLoading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ── Operations Dialog ── */}
      <Dialog open={Boolean(planToDelete)} onClose={() => !deletePlanLoading && setPlanToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete plan?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Delete <strong>{planToDelete?.name}</strong>? This cannot be undone.</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Plans with membership history cannot be deleted. Set those plans to inactive from Edit instead.</Typography>
          {deletePlanError && <Alert severity="error" sx={{ mt: 2 }}>{deletePlanError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setPlanToDelete(null)} disabled={deletePlanLoading}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeletePlan} disabled={deletePlanLoading}>
            {deletePlanLoading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(opDialog)} onClose={() => setOpDialog(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <DialogTitle>{opDialog} Membership</DialogTitle>
        <DialogContent>
          {opError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{opError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField
                label="Member ID (UUID)"
                required
                value={opMemberId}
                onChange={e => setOpMemberId(e.target.value)}
                fullWidth size="small"
                helperText="Paste the member's UUID from the member profile URL"
              />
            </Grid>

            {(opDialog === 'Create' || opDialog === 'Renew') && (
              <Grid size={12}>
                <TextField label="Select Plan" select value={opPlanId} onChange={e => setOpPlanId(e.target.value)} fullWidth size="small">
                  <MenuItem value=""><em>{opDialog === 'Renew' ? 'Keep current plan' : 'Select a plan'}</em></MenuItem>
                  {plans.filter(p => p.status === 'ACTIVE').map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.name} — ₹{p.price.toLocaleString()} ({p.durationDays}d)</MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {opDialog === 'Create' && (
              <Grid size={12}>
                <TextField label="Start Date" type="date" required value={opStartDate} onChange={e => setOpStartDate(e.target.value)} fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
            )}

            {opDialog === 'Freeze' && (
              <>
                <Grid size={12}><TextField label="Freeze From" type="date" required value={opFreezeStart} onChange={e => setOpFreezeStart(e.target.value)} fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                <Grid size={12}><TextField label="Freeze Until" type="date" required value={opFreezeEnd} onChange={e => setOpFreezeEnd(e.target.value)} fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} /></Grid>
              </>
            )}

            {opDialog === 'Extend' && (
              <Grid size={12}><TextField label="Extend by (days)" type="number" required value={opDays} onChange={e => setOpDays(Number(e.target.value))} fullWidth size="small" slotProps={{ input: { inputProps: { min: 1 } } }} /></Grid>
            )}

            {['Freeze', 'Extend', 'Cancel', 'Create', 'Renew'].includes(opDialog ?? '') && (
              <Grid size={12}><TextField label={opDialog === 'Cancel' ? 'Reason' : 'Notes (optional)'} value={opDialog === 'Cancel' ? opReason : opNotes} onChange={e => opDialog === 'Cancel' ? setOpReason(e.target.value) : setOpNotes(e.target.value)} fullWidth size="small" multiline rows={2} /></Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setOpDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={opDialog === 'Cancel' ? 'error' : opDialog === 'Freeze' ? 'info' : 'primary'}
            disabled={opLoading}
            onClick={executeOperation}
          >
            {opLoading ? <CircularProgress size={24} /> : `Execute ${opDialog}`}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
