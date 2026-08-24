'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, CircularProgress,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useStaff, useStaffMutations } from '@/hooks/queries/staff';
import { api } from '@/lib/api';

const ALL_PERMISSIONS = [
  'member.create', 'member.update', 'member.delete', 'attendance.create',
  'attendance.correct', 'payment.create', 'payment.refund', 'revenue.view',
  'trainer.manage', 'report.export',
];

type StaffRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  permissions: string[];
  joinDate: string;
  branch: string;
};

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const roleColor: Record<string, ChipColor> = {
  OWNER: 'error',
  MANAGER: 'warning',
  RECEPTIONIST: 'info',
  TRAINER: 'success',
};

const defaultPermsByRole = (role: string): string[] => {
  if (role === 'MANAGER') return ALL_PERMISSIONS.filter(p => !p.includes('delete'));
  if (role === 'RECEPTIONIST') return ['member.create', 'payment.create', 'attendance.create'];
  if (role === 'TRAINER') return ['attendance.create'];
  return [];
};

export default function StaffPage() {
  const [tab, setTab] = useState(0);

  // ── Invite state ───────────────────────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('RECEPTIONIST');
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [invitePermissions, setInvitePermissions] = useState<string[]>(defaultPermsByRole('RECEPTIONIST'));
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState('');
  const [generatedInvite, setGeneratedInvite] = useState<string | null>(null);

  // ── Edit state ─────────────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffRow | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  // ── Staff list ─────────────────────────────────────────────────────────────
  const { data: apiStaff, isLoading: staffLoading } = useStaff({});
  const { inviteStaff, updateStaffInfo, updateStaffPermissions, updateStaffStatus, resetPassword, deleteStaff } = useStaffMutations();

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole);
    setInvitePermissions(defaultPermsByRole(newRole));
  };

  const toggleInvitePermission = (perm: string) => {
    setInvitePermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleAdd = async () => {
    setAddError('');
    setAddSubmitting(true);
    try {
      const res = await inviteStaff.mutateAsync({
        firstName: nameInput.split(' ')[0] || nameInput,
        lastName: nameInput.split(' ').slice(1).join(' ') || '',
        email: emailInput,
        phone: phoneInput ? `+91${phoneInput}` : undefined,
        role: selectedRole,
        permissions: invitePermissions,
      });
      if (res.inviteLink) {
        setGeneratedInvite(res.inviteLink);
      } else {
        setAddOpen(false);
      }
      setNameInput(''); setEmailInput(''); setPhoneInput('');
      handleRoleChange('RECEPTIONIST');
    } catch (e: any) {
      const err = e.response?.data?.error;
      setAddError(typeof err === 'string' ? err : (err?.message || 'Failed to invite staff member'));
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editStaff) return;
    setEditError('');
    setEditSubmitting(true);
    try {
      const [firstName, ...lastNames] = editStaff.name.split(' ');
      await updateStaffInfo.mutateAsync({
        staffId: editStaff.id,
        data: {
          firstName: firstName || editStaff.name,
          lastName: lastNames.join(' ') || '',
          phone: editStaff.phone ? `+91${editStaff.phone}` : undefined,
          role: editStaff.role,
        }
      });
      await updateStaffPermissions.mutateAsync({
        staffId: editStaff.id,
        permissions: editStaff.permissions,
      });
      setEditOpen(false);
    } catch (e: any) {
      const err = e.response?.data?.error;
      setEditError(typeof err === 'string' ? err : (err?.message || 'Failed to update staff member'));
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleToggleStatus = async (staffId: string, currentStatus: string) => {
    try {
      await updateStaffStatus.mutateAsync({ staffId, status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const handleResetPassword = async (staffId: string) => {
    if (!confirm('Send a password reset link to this staff member?')) return;
    try {
      await resetPassword.mutateAsync(staffId);
      alert('Password reset link sent to email and WhatsApp');
    } catch (e) {
      console.error(e);
      alert('Failed to send reset link');
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member? This cannot be undone.')) return;
    try {
      await deleteStaff.mutateAsync(staffId);
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.error || 'Failed to delete staff member');
    }
  };

  const staff = apiStaff ?? [];

  return (
    <AppLayout>
      {/* Page Header */}
      <Box sx={{ display: 'flex', mb: 3, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Staff &amp; Permissions</Typography>
          <Typography variant="body2" color="text.secondary">
            {apiStaff === null ? 'Loading…' : `${staff.length} staff member${staff.length !== 1 ? 's' : ''}`}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
          Invite Staff
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab label="Staff Members" />
          <Tab label="Roles &amp; Permissions" />
        </Tabs>
      </Box>

      {/* Tab 0: Staff Members */}
      <TabPanel value={tab} index={0}>
        {apiStaff === null ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : staff.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">No staff members yet. Invite your first staff member.</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {staff.map(staffMember => (
              <Grid size={{ xs: 12, md: 6 }} key={staffMember.id}>
                <Card elevation={0}>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.dark' }}>
                        {staffMember.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{staffMember.name}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {staffMember.email}{staffMember.phone ? ` · +91${staffMember.phone}` : ''}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end', flexShrink: 0 }}>
                        <Chip label={staffMember.role} size="small" color={roleColor[staffMember.role] ?? 'default'} />
                        <Chip label={staffMember.status} size="small" color={staffMember.status === 'ACTIVE' ? 'success' : 'default'} />
                      </Box>
                    </Box>

                    {staffMember.permissions.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Permissions</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {staffMember.permissions.map(p => (
                            <Chip key={p} label={p} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small" variant="outlined"
                        onClick={() => { setEditStaff({ ...staffMember }); setEditOpen(true); setEditError(''); }}
                      >Edit</Button>
                      <Button size="small" variant="outlined" color="warning" onClick={() => handleResetPassword(staffMember.id)}>
                        Reset Password
                      </Button>
                      <Button
                        size="small" variant="outlined"
                        color={staffMember.status === 'ACTIVE' ? 'error' : 'success'}
                        onClick={() => handleToggleStatus(staffMember.id, staffMember.status)}
                      >
                        {staffMember.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
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
            <Grid size={{ xs: 12, md: 6 }} key={r.role}>
              <Card elevation={0}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Chip label={r.role} color={roleColor[r.role]} />
                    <Typography variant="caption" color="text.secondary">{r.desc}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {ALL_PERMISSIONS.map(p => (
                      <Chip
                        key={p} label={p} size="small"
                        variant={r.perms.includes(p) ? 'filled' : 'outlined'}
                        color={r.perms.includes(p) ? 'primary' : 'default'}
                        sx={{ fontSize: '0.65rem', height: 20, opacity: r.perms.includes(p) ? 1 : 0.4 }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* ── Invite Staff Dialog ─────────────────────────────────────────────── */}
      <Dialog
        open={addOpen}
        onClose={() => { setAddOpen(false); setGeneratedInvite(null); setAddError(''); }}
        maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}
      >
        <DialogTitle>{generatedInvite ? 'Staff Invited Successfully' : 'Invite Staff Member'}</DialogTitle>
        <DialogContent>
          {generatedInvite ? (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                The staff member has been created. Copy the secure invite link below and send it to them so they can set up their password.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', p: 1.5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, border: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="body2" sx={{ flex: 1, wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {generatedInvite}
                </Typography>
                <Button variant="contained" size="small" onClick={() => navigator.clipboard.writeText(generatedInvite)}>
                  Copy
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                This link expires in 7 days and can only be used once.
              </Typography>
            </Box>
          ) : (
            <>
              {addError && <Alert severity="error" sx={{ mt: 1, mb: 2 }}>{addError}</Alert>}
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    An invitation link will be sent via Email and WhatsApp.
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <TextField label="Full Name" fullWidth size="small" value={nameInput} onChange={e => setNameInput(e.target.value)} />
                </Grid>
                <Grid size={12}>
                  <TextField type="email" label="Email" fullWidth size="small" value={emailInput} onChange={e => setEmailInput(e.target.value)} />
                </Grid>
                <Grid size={12}>
                  <TextField
                    label="Phone (WhatsApp)" fullWidth size="small" value={phoneInput}
                    slotProps={{ input: {
                      startAdornment: (
                        <InputAdornment position="start" sx={{
                          bgcolor: 'rgba(255,255,255,0.05)', px: 1.5, py: 2.5, ml: -1.75,
                          borderRight: '1px solid rgba(255,255,255,0.1)', color: 'text.secondary',
                          fontWeight: 600, borderTopLeftRadius: 4, borderBottomLeftRadius: 4,
                        }}>🇮🇳 +91</InputAdornment>
                      ),
                    }}}
                    onChange={e => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 10) setPhoneInput(val); }}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField label="Role" select fullWidth size="small" value={selectedRole} onChange={e => handleRoleChange(e.target.value)}>
                    {['MANAGER', 'RECEPTIONIST', 'TRAINER'].map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={12}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Permissions (click to toggle)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {ALL_PERMISSIONS.map(p => (
                      <Chip
                        key={p} label={p} size="small" clickable
                        onClick={() => toggleInvitePermission(p)}
                        variant={invitePermissions.includes(p) ? 'filled' : 'outlined'}
                        color={invitePermissions.includes(p) ? 'primary' : 'default'}
                        sx={{ fontSize: '0.65rem', height: 22 }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          {generatedInvite ? (
            <Button onClick={() => { setAddOpen(false); setGeneratedInvite(null); }}>Close</Button>
          ) : (
            <>
              <Button onClick={() => { setAddOpen(false); setAddError(''); }} disabled={addSubmitting}>Cancel</Button>
              <Button
                variant="contained" onClick={handleAdd}
                disabled={addSubmitting || !nameInput.trim() || !emailInput.includes('@') || (phoneInput.length > 0 && phoneInput.length !== 10)}
              >
                {addSubmitting ? <CircularProgress size={22} /> : 'Send Invite'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Edit Staff Dialog ───────────────────────────────────────────────── */}
      <Dialog
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditError(''); }}
        maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}
      >
        <DialogTitle>Edit Staff Member</DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mt: 1, mb: 2 }}>{editError}</Alert>}
          {editStaff && (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={12}>
                <TextField label="Full Name" fullWidth size="small" value={editStaff.name} onChange={e => setEditStaff({ ...editStaff, name: e.target.value })} />
              </Grid>
              <Grid size={12}>
                <TextField label="Email" fullWidth size="small" value={editStaff.email} disabled helperText="Email cannot be changed" />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Phone (WhatsApp)" fullWidth size="small" value={editStaff.phone}
                  slotProps={{ input: {
                    startAdornment: (
                      <InputAdornment position="start" sx={{
                        bgcolor: 'rgba(255,255,255,0.05)', px: 1.5, py: 2.5, ml: -1.75,
                        borderRight: '1px solid rgba(255,255,255,0.1)', color: 'text.secondary',
                        fontWeight: 600, borderTopLeftRadius: 4, borderBottomLeftRadius: 4,
                      }}>🇮🇳 +91</InputAdornment>
                    ),
                  }}}
                  onChange={e => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 10) setEditStaff({ ...editStaff, phone: val }); }}
                />
              </Grid>
              <Grid size={12}>
                <TextField label="Role" select fullWidth size="small" value={editStaff.role}
                  onChange={e => {
                    const newRole = e.target.value;
                    setEditStaff({ ...editStaff, role: newRole, permissions: defaultPermsByRole(newRole) });
                  }}
                >
                  {['MANAGER', 'RECEPTIONIST', 'TRAINER'].map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={12}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Permissions (click to toggle)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {ALL_PERMISSIONS.map(p => (
                    <Chip
                      key={p} label={p} size="small" clickable
                      onClick={() => {
                        const newPerms = editStaff.permissions.includes(p)
                          ? editStaff.permissions.filter(perm => perm !== p)
                          : [...editStaff.permissions, p];
                        setEditStaff({ ...editStaff, permissions: newPerms });
                      }}
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
            <Button onClick={() => { setEditOpen(false); setEditError(''); }} disabled={editSubmitting}>Cancel</Button>
            <Button
              variant="contained" onClick={handleEditSubmit}
              disabled={editSubmitting || !editStaff?.name?.trim() || (editStaff?.phone ? editStaff.phone.length !== 10 : false)}
            >
              {editSubmitting ? <CircularProgress size={22} /> : 'Save Changes'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
