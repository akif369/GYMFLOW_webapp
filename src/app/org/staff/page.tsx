'use client';
import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, CircularProgress,
  Select, FormControl,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { api } from '@/lib/api';
import useSWR from 'swr';

const fetcher = (url: string) => api.get(url).then(res => res.data);

const ALL_PERMISSIONS = [
  'member.create', 'member.update', 'member.delete', 'attendance.create',
  'attendance.correct', 'payment.create', 'payment.refund', 'revenue.view',
  'trainer.manage', 'report.export',
];
type StaffRow = { id: string; name: string; email: string; phone: string; role: string; status: string; permissions: string[]; joinDate: string; branch: string; branchId: string; };

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const roleColor: Record<string, ChipColor> = { OWNER: 'error', MANAGER: 'warning', RECEPTIONIST: 'info', TRAINER: 'success' };

export default function StaffPage() {
  const [tab, setTab] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('RECEPTIONIST');

  // Form fields
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [inviteBranchId, setInviteBranchId] = useState('');
  const [invitePermissions, setInvitePermissions] = useState<string[]>(['member.create', 'payment.create', 'attendance.create']);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Staff State
  const [editOpen, setEditOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffRow | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  // ── API state ────────────────────────────────────────────────────────────────
  const [apiStaff, setApiStaff] = useState<StaffRow[] | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const { data: branchesData } = useSWR('/branches', fetcher);
  const branches = branchesData?.branches || [];

  const fetchStaff = () => {
    api.get('/staff', { params: selectedBranchId !== 'ALL' ? { branchId: selectedBranchId } : {} })
      .then(res => {
        const items = res.data?.items ?? res.data?.staff ?? [];
        setApiStaff(items.map((s: Record<string, unknown>) => ({
          id: String(s.id),
          name: `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || String(s.name ?? ''),
          email: String(s.email ?? ''),
          phone: String(s.phone ?? ''),
          role: String(s.role ?? ''),
          status: String(s.status ?? 'ACTIVE'),
          permissions: Array.isArray(s.permissions) ? s.permissions.map(String) : [],
          joinDate: String(s.joinDate ?? s.createdAt ?? '').split('T')[0],
          branch: String(s.branch ?? ''),
          branchId: String(s.branchId ?? ''),
        })));
      })
      .catch(() => setApiStaff([]));
  };

  useEffect(() => { fetchStaff(); }, [selectedBranchId]);

  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole);
    if (newRole === 'MANAGER') setInvitePermissions(ALL_PERMISSIONS.filter(p => !p.includes('delete')));
    else if (newRole === 'RECEPTIONIST') setInvitePermissions(['member.create', 'payment.create', 'attendance.create']);
    else if (newRole === 'TRAINER') setInvitePermissions(['attendance.create']);
  };

  const togglePermission = (perm: string) => {
    setInvitePermissions(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  const handleAdd = async () => {
    setAddError('');
    setAddSubmitting(true);
    try {
      await api.post('/staff/invite', {
        firstName: nameInput.split(' ')[0] || nameInput,
        lastName: nameInput.split(' ').slice(1).join(' ') || '',
        email: emailInput,
        phone: phoneInput,
        role: selectedRole,
        branchId: inviteBranchId,
        permissions: invitePermissions,
      });
      fetchStaff();
      setAddOpen(false);
      setNameInput(''); setEmailInput(''); setPhoneInput(''); setInviteBranchId('');
      handleRoleChange('RECEPTIONIST');
    } catch (e: any) {
      setAddError(e.response?.data?.error || 'Failed to invite staff member');
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editStaff) return;
    setEditError('');
    setEditSubmitting(true);
    try {
      // 1. Update basic info
      const [firstName, ...lastNames] = editStaff.name.split(' ');
      await api.patch(`/staff/${editStaff.id}`, {
        firstName: firstName || editStaff.name,
        lastName: lastNames.join(' ') || '',
        phone: editStaff.phone,
        role: editStaff.role,
      });
      // 2. Update permissions
      await api.patch(`/staff/${editStaff.id}/permissions`, {
        permissions: editStaff.permissions,
      });
      fetchStaff();
      setEditOpen(false);
    } catch (e: any) {
      setEditError(e.response?.data?.error || 'Failed to update staff member');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleToggleStatus = async (staffId: string, currentStatus: string) => {
    try {
      await api.patch(`/staff/${staffId}/status`, { status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
      fetchStaff();
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const handleResetPassword = async (staffId: string) => {
    if (!confirm('Are you sure you want to send a password reset link to this staff member?')) return;
    try {
      await api.post(`/staff/${staffId}/reset-password`);
      alert('Password reset link sent to email and WhatsApp');
    } catch (e) {
      console.error(e);
      alert('Failed to send reset link');
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to completely delete this staff member? This action cannot be undone.')) return;
    try {
      await api.delete(`/staff/${staffId}`);
      fetchStaff();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.error || 'Failed to delete staff member');
    }
  };

  const staff = apiStaff ?? [];

  return (
    <Box sx={{ pb: 6 }}>
      {/* Page header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
            Team Management
          </Typography>
          <Typography component="h1" sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: 'text.primary' }}>
            Staff Directory
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.02)',
                borderRadius: 2,
                fontSize: '0.85rem',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.12)' },
              }}
            >
              <MenuItem value="ALL">All Branches</MenuItem>
              {branches.map((b: any) => (
                <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)} size="small"
            sx={{ bgcolor: '#f59e0b', color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#d97706' } }}>
            Invite Staff
          </Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab label="Staff Members" />
          <Tab label="Roles & Permissions" />
        </Tabs>
      </Box>

      {/* Tab 0: Staff Members */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={2}>
          {staff.map(staffMember => (
            <Grid item xs={12} md={6} key={staffMember.id}>
              <Card elevation={0}>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.dark' }}>{staffMember.name.split(' ').map((n: string) => n[0]).join('')}</Avatar>
                    <Box sx={{flex:1}}>
                      <Typography variant="subtitle2" sx={{fontWeight:"bold"}} >{staffMember.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{staffMember.email} · {staffMember.phone}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "flex-end" }}>
                      <Chip label={staffMember.role} size="small" color={roleColor[staffMember.role]} />
                      <Chip label={staffMember.status} size="small" color={staffMember.status === 'ACTIVE' ? 'success' : 'default'} />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary"  sx={{ mb: 0.5,display:"block" }}>Permissions</Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {staffMember.permissions.map(p => (
                        <Chip key={p} label={p} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                    <Button size="small" variant="outlined" onClick={() => { setEditStaff({...staffMember}); setEditOpen(true); }}>Edit</Button>
                    <Button size="small" variant="outlined" color="warning" onClick={() => handleResetPassword(staffMember.id)}>Reset Password</Button>
                    <Button size="small" variant="outlined" color={staffMember.status === 'ACTIVE' ? 'error' : 'success'} onClick={() => handleToggleStatus(staffMember.id, staffMember.status)}>
                      {staffMember.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteStaff(staffMember.id)}>Delete</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Tab 1: Roles & Permissions */}
      <TabPanel value={tab} index={1}>
        <Grid container spacing={2}>
          {[
            { role: 'OWNER', perms: ALL_PERMISSIONS, desc: 'Full access to everything' },
            { role: 'MANAGER', perms: ALL_PERMISSIONS.filter(p => !p.includes('delete')), desc: 'All except delete' },
            { role: 'RECEPTIONIST', perms: ['member.create', 'payment.create', 'attendance.create'], desc: 'Daily operations only' },
            { role: 'TRAINER', perms: ['attendance.create'], desc: 'View own sessions only' },
          ].map(r => (
            <Grid item xs={12} md={6} key={r.role}>
              <Card elevation={0}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Chip label={r.role} color={roleColor[r.role]} />
                    <Typography variant="caption" color="text.secondary">{r.desc}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {r.perms.map(p => (
                      <Chip key={p} label={p} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Invite Staff Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth sx={{bgcolor: 'background.paper'}} slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <DialogTitle>Invite Staff Member</DialogTitle>
        <DialogContent>
          {addError && <Alert severity="error" sx={{ mt: 1, mb: 2 }}>{addError}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                An invitation link with a temporary password will be sent via Email and WhatsApp.
              </Typography>
            </Grid>
            <Grid item xs={12}><TextField label="Full Name" fullWidth size="small" value={nameInput} onChange={e => setNameInput(e.target.value)} /></Grid>
            <Grid item xs={12}><TextField label="Email" fullWidth size="small" value={emailInput} onChange={e => setEmailInput(e.target.value)} /></Grid>
            <Grid item xs={12}><TextField label="Phone (WhatsApp)" fullWidth size="small" value={phoneInput} onChange={e => setPhoneInput(e.target.value)} /></Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Role" select fullWidth size="small" value={selectedRole} onChange={e => handleRoleChange(e.target.value)}>
                {['MANAGER', 'RECEPTIONIST', 'TRAINER'].map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Assign to Branch" select fullWidth size="small" value={inviteBranchId} onChange={e => setInviteBranchId(e.target.value)} required>
                {branches.map((b: any) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary"  sx={{ mb: 1,display:"block" }}>Permissions</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {ALL_PERMISSIONS.map(p => (
                  <Chip
                    key={p}
                    label={p}
                    size="small"
                    onClick={() => togglePermission(p)}
                    clickable
                    variant={invitePermissions.includes(p) ? 'filled' : 'outlined'}
                    color={invitePermissions.includes(p) ? 'primary' : 'default'}
                    sx={{ fontSize: '0.65rem', height: 22 }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAddOpen(false)} disabled={addSubmitting}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd} disabled={addSubmitting || !nameInput || !emailInput || !inviteBranchId}>
            {addSubmitting ? <CircularProgress size={24} /> : 'Send Invite'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth sx={{bgcolor: 'background.paper'}} slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <DialogTitle>Edit Staff Member</DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mt: 1, mb: 2 }}>{editError}</Alert>}
          {editStaff && (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}><TextField label="Full Name" fullWidth size="small" value={editStaff.name} onChange={e => setEditStaff({...editStaff, name: e.target.value})} /></Grid>
              <Grid item xs={12}><TextField label="Email" fullWidth size="small" value={editStaff.email} disabled helperText="Email cannot be changed" /></Grid>
              <Grid item xs={12}><TextField label="Phone (WhatsApp)" fullWidth size="small" value={editStaff.phone} onChange={e => setEditStaff({...editStaff, phone: e.target.value})} /></Grid>
              <Grid item xs={12}>
                <TextField label="Role" select fullWidth size="small" value={editStaff.role} onChange={e => {
                  const newRole = e.target.value;
                  let newPerms = [...editStaff.permissions];
                  if (newRole === 'MANAGER') newPerms = ALL_PERMISSIONS.filter(p => !p.includes('delete'));
                  else if (newRole === 'RECEPTIONIST') newPerms = ['member.create', 'payment.create', 'attendance.create'];
                  else if (newRole === 'TRAINER') newPerms = ['attendance.create'];
                  setEditStaff({...editStaff, role: newRole, permissions: newPerms});
                }}>
                  {['MANAGER', 'RECEPTIONIST', 'TRAINER'].map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary"  sx={{ mb: 1,display:"block" }}>Permissions</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {ALL_PERMISSIONS.map(p => (
                    <Chip
                      key={p}
                      label={p}
                      size="small"
                      onClick={() => {
                        const newPerms = editStaff.permissions.includes(p) ? editStaff.permissions.filter(perm => perm !== p) : [...editStaff.permissions, p];
                        setEditStaff({...editStaff, permissions: newPerms});
                      }}
                      clickable
                      variant={editStaff.permissions.includes(p) ? 'filled' : 'outlined'}
                      color={editStaff.permissions.includes(p) ? 'primary' : 'default'}
                      sx={{ fontSize: '0.65rem', height: 22 }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
          <Button color="error" onClick={() => { setEditOpen(false); handleDeleteStaff(editStaff!.id); }}>Delete Staff</Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setEditOpen(false)} disabled={editSubmitting}>Cancel</Button>
            <Button variant="contained" onClick={handleEditSubmit} disabled={editSubmitting || !editStaff?.name}>
              {editSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
