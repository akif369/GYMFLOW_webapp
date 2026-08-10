'use client';
import { use, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Tabs, Tab, Divider, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { mockMembers, mockMembershipEvents, mockActivityTimeline, mockMeasurements, mockAttendanceLogs, mockPayments, mockPtSessions } from '@/lib/mockData';
import { api } from '@/lib/api';

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
function TabPanel({ children, value, index }: TabPanelProps) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const membershipStatusColor: Record<string, ChipColor> = { ACTIVE: 'success', EXPIRING: 'warning', EXPIRED: 'error' };
const payStatusColor: Record<string, ChipColor> = { PAID: 'success', PENDING: 'warning', PARTIALLY_PAID: 'warning', FAILED: 'error' };

const eventIcon: Record<string, ReactNode> = {
  CheckCircle: <CheckCircleIcon sx={{ fontSize: 14 }} />,
  Payment: <PaymentIcon sx={{ fontSize: 14 }} />,
  Autorenew: <AutorenewIcon sx={{ fontSize: 14 }} />,
  FitnessCenter: <FitnessCenterIcon sx={{ fontSize: 14 }} />,
  SwapHoriz: <SwapHorizIcon sx={{ fontSize: 14 }} />,
};

export default function MemberProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tab, setTab] = useState(0);

  const [apiMember, setApiMember] = useState<typeof mockMembers[0] | null>(null);
  const [apiPayments, setApiPayments] = useState<typeof mockPayments | null>(null);
  const [apiAttendance, setApiAttendance] = useState<typeof mockAttendanceLogs | null>(null);
  const [apiPtSessions, setApiPtSessions] = useState<typeof mockPtSessions | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Edit State
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', email: '', gender: '', dob: '', address: '', goal: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Renew State
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewForm, setRenewForm] = useState({ planId: '', notes: '' });
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewError, setRenewError] = useState('');
  const [apiPlans, setApiPlans] = useState<{ id: string; name: string; price: string; durationDays: number }[]>([]);

  useEffect(() => {
    // Member details
    api.get(`/members/${id}`).then(res => {
      const m = res.data;
      if (m) {
        setApiMember({
          id: String(m.id),
          memberId: String(m.memberNumber ?? ''),
          firstName: String(m.firstName ?? ''),
          lastName: String(m.lastName ?? ''),
          email: String(m.email ?? ''),
          phone: String(m.phone ?? ''),
          photoUrl: null,
          joinDate: String(m.createdAt ?? '').split('T')[0],
          gender: '',
          dob: '',
          plan: String(m.membershipPlan ?? ''),
          startDate: String(m.membershipStart ?? '').split('T')[0],
          expiryDate: String(m.membershipExpiry ?? '').split('T')[0],
          trainer: null,
          lastVisit: '',
          paymentStatus: String(m.paymentStatus ?? 'PAID'),
          membershipStatus: String(m.membershipStatus ?? 'ACTIVE'),
          goal: '',
          experience: '',
          branch: '',
          address: '',
          emergency: { name: '', phone: '', relation: '' },
          medicalConditions: '',
          allergies: '',
          injuries: '',
        });
      }
    }).catch(() => setApiMember(null));

    // Attendance
    api.get('/attendance', { params: { memberId: id } }).then(res => {
      const items = res.data?.items ?? [];
      setApiAttendance(items.map((l: Record<string, unknown>) => ({
        id: String(l.id), member: '', memberId: String(l.memberId ?? ''),
        date: String(l.checkInTime ?? '').split('T')[0],
        checkIn: String(l.checkInTime ?? '').substring(11, 16),
        checkOut: l.checkOutTime ? String(l.checkOutTime).substring(11, 16) : null,
        duration: l.durationMinutes ? `${Math.floor(Number(l.durationMinutes) / 60)}h ${Number(l.durationMinutes) % 60}m` : 'Inside',
        method: String(l.method ?? 'MANUAL'), branch: String(l.branch ?? ''),
      })));
    }).catch(() => setApiAttendance(null));

    // Payments
    api.get('/payments', { params: { memberId: id } }).then(res => {
      const items = res.data?.items ?? [];
      setApiPayments(items.map((p: Record<string, unknown>) => ({
        id: String(p.id), member: '', memberId: String(p.memberId ?? ''),
        amount: Number(p.amount ?? 0), method: String(p.method ?? ''),
        status: String(p.status ?? ''), date: String(p.date ?? p.createdAt ?? '').split('T')[0],
        refId: String(p.referenceId ?? ''), plan: String(p.plan ?? ''),
      })));
    }).catch(() => setApiPayments(null));

    // PT Sessions
    api.get('/pt/sessions', { params: { memberId: id } }).then(res => {
      const items = res.data?.items ?? [];
      setApiPtSessions(items.map((s: Record<string, unknown>) => ({
        id: String(s.id), member: '', memberId: String(s.memberId ?? ''),
        trainer: String(s.trainerName ?? ''), trainerId: String(s.trainerId ?? ''),
        date: String(s.scheduledAt ?? '').split('T')[0], time: String(s.scheduledAt ?? '').substring(11, 16),
        duration: Number(s.durationMinutes ?? 60), type: String(s.sessionType ?? ''),
        status: String(s.status ?? ''), notes: String(s.notes ?? ''),
        package: String(s.packageName ?? ''), sessionsRemaining: Number(s.sessionsRemaining ?? 0),
      })));
    }).catch(() => setApiPtSessions(null));

    // Membership Plans for Renew
    api.get('/membership-plans', { params: { pageSize: '50' } })
      .then(res => setApiPlans(res.data?.items ?? []))
      .catch(() => setApiPlans([]));
  }, [id, fetchTrigger]);

  const member = apiMember ?? mockMembers.find(m => m.id === id) ?? mockMembers[0];
  const memberPayments = apiPayments ?? mockPayments.filter(p => p.memberId === member.id);
  const memberAttendance = apiAttendance ?? mockAttendanceLogs.filter(a => a.memberId === member.id);
  const memberPt = apiPtSessions ?? mockPtSessions.filter(p => p.member === `${member.firstName} ${member.lastName}`);

  const tabs = ['Overview', 'Membership', 'Attendance', 'Payments', 'Fitness', 'Measurements', 'PT Sessions', 'Activity'];

  return (
    <AppLayout>
      {/* Back + Header */}
      <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} size="small" variant="outlined">Back</Button>
        <Box flex={1} />
        <Button startIcon={<AutorenewIcon />} variant="outlined" size="small" onClick={() => setRenewOpen(true)}>Renew</Button>
        <Button startIcon={<EditIcon />} variant="contained" size="small" onClick={() => {
          setEditForm({
            firstName: member.firstName || '',
            lastName: member.lastName || '',
            phone: member.phone || '',
            email: member.email || '',
            gender: member.gender || '',
            dob: member.dob || '',
            address: member.address || '',
            goal: member.goal || '',
          });
          setEditOpen(true);
        }}>Edit</Button>
      </Box>

      {/* Profile Card */}
      <Card elevation={0} sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 3, alignItems: 'center', p: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.dark', fontSize: '2rem', flexShrink: 0 }}>
            {member.firstName[0]}{member.lastName[0]}
          </Avatar>
          <Box flex={1}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h5" fontWeight="bold">{member.firstName} {member.lastName}</Typography>
              <Chip label={member.memberId} size="small" variant="outlined" />
              <Chip label={member.membershipStatus} size="small" color={membershipStatusColor[member.membershipStatus]} />
              <Chip label={member.paymentStatus} size="small" color={payStatusColor[member.paymentStatus]} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {member.email} · {member.phone} · {member.gender}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Plan: <strong style={{ color: '#f8fafc' }}>{member.plan}</strong> · Expires: <strong style={{ color: '#f8fafc' }}>{member.expiryDate}</strong> · Trainer: <strong style={{ color: '#f8fafc' }}>{member.trainer || 'Unassigned'}</strong>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          {tabs.map((t, i) => <Tab key={i} label={t} />)}
        </Tabs>
      </Box>

      {/* Tab 0: Overview */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>Contact Details</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {[
                    ['Email', member.email],
                    ['Phone', member.phone],
                    ['Gender', member.gender],
                    ['DOB', member.dob],
                    ['Joined', member.joinDate],
                    ['Address', member.address],
                    ['Branch', member.branch],
                  ].map(([k, v]) => (
                    <Box key={k}>
                      <Typography variant="caption" color="text.secondary">{k}</Typography>
                      <Typography variant="body2">{v}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>Emergency Contact</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Name</Typography>
                    <Typography variant="body2">{member.emergency.name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                    <Typography variant="body2">{member.emergency.phone}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Relation</Typography>
                    <Typography variant="body2">{member.emergency.relation}</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>Goals</Typography>
                <Chip label={member.goal} color="primary" variant="outlined" size="small" />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>Current Membership</Typography>
                {[
                  ['Plan', member.plan],
                  ['Start', member.startDate],
                  ['Expiry', member.expiryDate],
                  ['Status', member.membershipStatus],
                  ['Assigned Trainer', member.trainer || 'Unassigned'],
                  ['Last Visit', member.lastVisit],
                ].map(([k, v]) => (
                  <Box key={k} display="flex" py={0.75} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">{k}</Typography>
                    <Typography variant="caption" fontWeight={600}>{v}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 1: Membership */}
      <TabPanel value={tab} index={1}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>Membership History</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockMembershipEvents.map(e => (
                      <TableRow key={e.id}>
                        <TableCell>
                          <Chip label={e.type} size="small" color={e.type === 'FROZEN' ? 'warning' : e.type === 'RENEWED' ? 'success' : 'default'} />
                        </TableCell>
                        <TableCell><Typography variant="caption">{e.date}</Typography></TableCell>
                        <TableCell><Typography variant="caption">{e.notes}</Typography></TableCell>
                        <TableCell><Typography variant="caption" color="text.secondary">{e.actor}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>Membership Actions</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {['Renew', 'Upgrade', 'Downgrade', 'Freeze', 'Extend', 'Cancel', 'Transfer'].map(action => (
                    <Button key={action} variant="outlined" size="small" fullWidth
                      color={action === 'Cancel' ? 'error' : action === 'Freeze' ? 'warning' : 'primary'}>
                      {action}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 2: Attendance */}
      <TabPanel value={tab} index={2}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>Attendance History</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Check-in</TableCell>
                  <TableCell>Check-out</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Method</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {memberAttendance.length > 0 ? memberAttendance.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>{a.date}</TableCell>
                    <TableCell>{a.checkIn}</TableCell>
                    <TableCell>{a.checkOut || '—'}</TableCell>
                    <TableCell><Chip label={a.duration} size="small" color={a.checkOut ? 'default' : 'success'} /></TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">{a.method}</Typography></TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} align="center"><Typography variant="caption" color="text.secondary">No attendance records</Typography></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 3: Payments */}
      <TabPanel value={tab} index={3}>
        <Card elevation={0}>
          <CardContent>
            <Box sx={{ display: 'flex', mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" fontWeight="bold">Payment History</Typography>
              <Button variant="outlined" size="small" startIcon={<PaymentIcon />}>Add Payment</Button>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Ref ID</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {memberPayments.length > 0 ? memberPayments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.date}</TableCell>
                    <TableCell><Typography variant="caption">{p.plan}</Typography></TableCell>
                    <TableCell><Typography variant="body2" fontWeight={600}>₹{p.amount.toLocaleString()}</Typography></TableCell>
                    <TableCell>{p.method}</TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">{p.refId || '—'}</Typography></TableCell>
                    <TableCell><Chip label={p.status} size="small" color={payStatusColor[p.status]} /></TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={6} align="center"><Typography variant="caption" color="text.secondary">No payment records</Typography></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 4: Fitness */}
      <TabPanel value={tab} index={4}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ border: '1px solid rgba(239,68,68,0.2)' }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">Health & Fitness Profile</Typography>
                  <Chip label="Restricted" size="small" color="error" />
                </Box>
                <Typography variant="caption" color="error.main" display="block" sx={{ mb: 2 }}>
                  ⚠ Access to this section is logged. Sensitive health information.
                </Typography>
                {[
                  ['Experience Level', member.experience],
                  ['Goal', member.goal],
                  ['Medical Conditions', member.medicalConditions],
                  ['Allergies', member.allergies],
                  ['Previous Injuries', member.injuries],
                ].map(([k, v]) => (
                  <Box key={k} py={1} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography variant="caption" color="text.secondary">{k}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.25 }}>{v}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 5: Measurements */}
      <TabPanel value={tab} index={5}>
        <Card elevation={0}>
          <CardContent>
            <Box sx={{ display: 'flex', mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" fontWeight="bold">Body Measurements History</Typography>
              <Button variant="outlined" size="small">Add Assessment</Button>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Date', 'Weight (kg)', 'Body Fat %', 'Chest (cm)', 'Waist (cm)', 'Arm (cm)', 'Thigh (cm)'].map(h => (
                    <TableCell key={h}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {mockMeasurements.map((m, i) => (
                  <TableRow key={i}>
                    <TableCell>{m.date}</TableCell>
                    <TableCell><Typography variant="body2" fontWeight={600} color={i < mockMeasurements.length - 1 && m.weight < mockMeasurements[i + 1].weight ? 'success.main' : 'inherit'}>{m.weight}</Typography></TableCell>
                    <TableCell>{m.bodyFat}%</TableCell>
                    <TableCell>{m.chest}</TableCell>
                    <TableCell>{m.waist}</TableCell>
                    <TableCell>{m.arm}</TableCell>
                    <TableCell>{m.thigh}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(16,185,129,0.05)', borderRadius: 2, border: '1px solid rgba(16,185,129,0.1)' }}>
              <Typography variant="caption" color="primary">
                📉 Weight progress: {mockMeasurements[mockMeasurements.length - 1].weight} kg → {mockMeasurements[0].weight} kg 
                ({(mockMeasurements[mockMeasurements.length - 1].weight - mockMeasurements[0].weight).toFixed(1)} kg lost in 3 months)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 6: PT Sessions */}
      <TabPanel value={tab} index={6}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>PT Sessions</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Trainer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {memberPt.length > 0 ? memberPt.map(s => (
                  <TableRow key={s.id}>
                    <TableCell>{s.date}</TableCell>
                    <TableCell>{s.time}</TableCell>
                    <TableCell>{s.trainer}</TableCell>
                    <TableCell>
                      <Chip label={s.status} size="small"
                        color={s.status === 'COMPLETED' ? 'success' : s.status === 'UPCOMING' ? 'default' : 'error'} />
                    </TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">{s.notes || '—'}</Typography></TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} align="center"><Typography variant="caption" color="text.secondary">No PT sessions</Typography></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 7: Activity */}
      <TabPanel value={tab} index={7}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 3 }}>Activity Timeline</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {mockActivityTimeline.map((a, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, pb: 2 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.dark', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {eventIcon[a.icon]}
                    </Box>
                    {i < mockActivityTimeline.length - 1 && (
                      <Box sx={{ width: 1, flex: 1, bgcolor: 'rgba(255,255,255,0.06)', my: 0.5 }} />
                    )}
                  </Box>
                  <Box pb={2}>
                    <Typography variant="caption" color="text.secondary">{a.date}</Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ mt: 0.25 }}>{a.event}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={async (e) => {
          e.preventDefault();
          if (!editForm.firstName || !editForm.lastName || !editForm.phone) {
            setEditError('First Name, Last Name, and Phone are required.');
            return;
          }
          setEditLoading(true);
          setEditError('');
          try {
            await api.patch(`/members/${id}`, editForm);
            setEditOpen(false);
            setFetchTrigger(t => t + 1);
          } catch (err: any) {
            setEditError(err.response?.data?.message || 'Failed to update member');
          } finally {
            setEditLoading(false);
          }
        }}>
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Edit Member Profile</Typography>
          </DialogTitle>
          <DialogContent>
            {editError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{editError}</Alert>}
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="First Name" required value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Last Name" required value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Phone" required value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Email" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Gender" select value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })} fullWidth size="small">
                  <MenuItem value=""><em>None</em></MenuItem>
                  {['MALE', 'FEMALE', 'OTHER'].map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Date of Birth" type="date" value={editForm.dob} onChange={e => setEditForm({ ...editForm, dob: e.target.value })} fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Fitness Goal" value={editForm.goal} onChange={e => setEditForm({ ...editForm, goal: e.target.value })} fullWidth size="small" />
              </Grid>
              <Grid size={12}><TextField label="Address" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} fullWidth size="small" multiline rows={2} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={editLoading}>
              {editLoading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Renew Membership Dialog */}
      <Dialog open={renewOpen} onClose={() => setRenewOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={async (e) => {
          e.preventDefault();
          if (!renewForm.planId) {
            setRenewError('Please select a membership plan.');
            return;
          }
          setRenewLoading(true);
          setRenewError('');
          try {
            await api.post(`/members/${id}/memberships/renew`, renewForm);
            setRenewOpen(false);
            setRenewForm({ planId: '', notes: '' });
            setFetchTrigger(t => t + 1);
          } catch (err: any) {
            setRenewError(err.response?.data?.message || 'Failed to renew membership. Member might not have an active membership to renew. Use Create instead.');
          } finally {
            setRenewLoading(false);
          }
        }}>
          <DialogTitle>Renew Membership</DialogTitle>
          <DialogContent>
            {renewError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{renewError}</Alert>}
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={12}>
                <TextField label="Select Plan" select required value={renewForm.planId} onChange={e => setRenewForm({ ...renewForm, planId: e.target.value })} fullWidth size="small">
                  <MenuItem value=""><em>Select a Plan</em></MenuItem>
                  {apiPlans.map(p => <MenuItem key={p.id} value={p.id}>{p.name} — ₹{p.price} ({p.durationDays} days)</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField label="Notes (Optional)" value={renewForm.notes} onChange={e => setRenewForm({ ...renewForm, notes: e.target.value })} fullWidth size="small" multiline rows={2} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setRenewOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={renewLoading}>
              {renewLoading ? <CircularProgress size={24} /> : 'Renew Membership'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </AppLayout>
  );
}
