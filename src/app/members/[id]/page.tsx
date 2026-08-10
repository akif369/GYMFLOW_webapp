'use client';
import { use, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Tabs, Tab, Divider, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, Alert, Skeleton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { api } from '@/lib/api';
import RenewMembershipDialog from '@/components/RenewMembershipDialog';

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
function TabPanel({ children, value, index }: TabPanelProps) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const membershipStatusColor: Record<string, ChipColor> = {
  ACTIVE: 'success', EXPIRING: 'warning', EXPIRED: 'error', FROZEN: 'info', PENDING: 'default', CANCELLED: 'error',
};
const payStatusColor: Record<string, ChipColor> = {
  PAID: 'success', PENDING: 'warning', PARTIALLY_PAID: 'warning', FAILED: 'error',
};

const eventIcon: Record<string, ReactNode> = {
  CheckCircle: <CheckCircleIcon sx={{ fontSize: 14 }} />,
  Payment: <PaymentIcon sx={{ fontSize: 14 }} />,
  Autorenew: <AutorenewIcon sx={{ fontSize: 14 }} />,
  FitnessCenter: <FitnessCenterIcon sx={{ fontSize: 14 }} />,
  SwapHoriz: <SwapHorizIcon sx={{ fontSize: 14 }} />,
  ATTENDANCE: <FitnessCenterIcon sx={{ fontSize: 14 }} />,
  PAYMENT: <PaymentIcon sx={{ fontSize: 14 }} />,
  CREATED: <CheckCircleIcon sx={{ fontSize: 14 }} />,
  RENEWED: <AutorenewIcon sx={{ fontSize: 14 }} />,
  FROZEN: <AcUnitIcon sx={{ fontSize: 14 }} />,
  EXTENDED: <EventRepeatIcon sx={{ fontSize: 14 }} />,
  CANCELLED: <CancelIcon sx={{ fontSize: 14 }} />,
};

const membershipEventColor: Record<string, ChipColor> = {
  CREATED: 'info', RENEWED: 'success', FROZEN: 'info', RESUMED: 'default',
  EXTENDED: 'primary', CANCELLED: 'error', ACTIVATED: 'success',
};

type MemberData = {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  address: string;
  goal: string;
  experienceLevel: string;
  joinDate: string;
  status: string;
  photoUrl: string | null;
  emergency: { name: string; phone: string; relation: string } | null;
  health: { medicalConditions: string; allergies: string; injuries: string; bloodGroup: string } | null;
  trainer: { id: string; firstName: string; lastName: string } | null;
  latestMembership: {
    id: string;
    planName: string;
    startDate: string;
    endDate: string;
    status: string;
    ptSessionsTotal: number;
    ptSessionsUsed: number;
  } | null;
};

function SkeletonProfile() {
  return (
    <Card elevation={0} sx={{ mb: 3 }}>
      <CardContent sx={{ display: 'flex', gap: 3, alignItems: 'center', p: 3 }}>
        <Skeleton variant="circular" width={80} height={80} />
        <Box flex={1}>
          <Skeleton variant="text" width={240} height={32} />
          <Skeleton variant="text" width={320} height={20} sx={{ mt: 0.5 }} />
          <Skeleton variant="text" width={280} height={20} />
        </Box>
      </CardContent>
    </Card>
  );
}

export default function MemberProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<MemberData | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Tab data
  const [membershipHistory, setMembershipHistory] = useState<any[]>([]);
  const [membershipEvents, setMembershipEvents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [ptSessions, setPtSessions] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);

  // Plans for renew
  const [apiPlans, setApiPlans] = useState<{ id: string; name: string; price: number; durationDays: number }[]>([]);

  // ── Edit State ────────────────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    gender: '', dob: '', address: '', goal: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // ── Renew State ───────────────────────────────────────────────────────────────
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewForm, setRenewForm] = useState({ planId: '', notes: '' });
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewError, setRenewError] = useState('');

  // ── Create Membership State ───────────────────────────────────────────────────
  const [createMemOpen, setCreateMemOpen] = useState(false);
  const [createMemForm, setCreateMemForm] = useState({ planId: '', startDate: new Date().toISOString().split('T')[0], notes: '' });
  const [createMemLoading, setCreateMemLoading] = useState(false);
  const [createMemError, setCreateMemError] = useState('');

  // ── Freeze State ──────────────────────────────────────────────────────────────
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [freezeForm, setFreezeForm] = useState({ freezeStart: '', freezeEnd: '', reason: '' });
  const [freezeLoading, setFreezeLoading] = useState(false);
  const [freezeError, setFreezeError] = useState('');

  // ── Extend State ──────────────────────────────────────────────────────────────
  const [extendOpen, setExtendOpen] = useState(false);
  const [extendForm, setExtendForm] = useState({ days: 7, reason: '' });
  const [extendLoading, setExtendLoading] = useState(false);
  const [extendError, setExtendError] = useState('');

  // ── Cancel State ──────────────────────────────────────────────────────────────
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // ── Resume State ──────────────────────────────────────────────────────────────
  const [resumeLoading, setResumeLoading] = useState(false);

  // ── Add Measurement State ─────────────────────────────────────────────────────
  const [measureOpen, setMeasureOpen] = useState(false);
  const [measureForm, setMeasureForm] = useState({
    weight: '', bodyFat: '', chest: '', waist: '', arm: '', thigh: '', recordedAt: new Date().toISOString().split('T')[0],
  });
  const [measureLoading, setMeasureLoading] = useState(false);
  const [measureError, setMeasureError] = useState('');

  useEffect(() => {
    setLoading(true);

    const loadMember = api.get(`/members/${id}`)
      .then(res => {
        const m = res.data?.member ?? res.data;
        if (!m) return;
        setMember({
          id: String(m.id),
          memberNumber: String(m.memberNumber ?? ''),
          firstName: String(m.firstName ?? ''),
          lastName: String(m.lastName ?? ''),
          email: String(m.email ?? ''),
          phone: String(m.phone ?? ''),
          gender: String(m.gender ?? ''),
          dob: String(m.dob ?? ''),
          address: String(m.address ?? ''),
          goal: String(m.goal ?? ''),
          experienceLevel: String(m.experienceLevel ?? ''),
          joinDate: String(m.joinDate ?? m.createdAt ?? '').split('T')[0],
          status: String(m.status ?? 'ACTIVE'),
          photoUrl: m.photoUrl ?? null,
          emergency: m.emergency ? {
            name: String(m.emergency.name ?? ''),
            phone: String(m.emergency.phone ?? ''),
            relation: String(m.emergency.relation ?? ''),
          } : null,
          health: m.health ? {
            medicalConditions: String(m.health.medicalConditions ?? 'None'),
            allergies: String(m.health.allergies ?? 'None'),
            injuries: String(m.health.injuries ?? 'None'),
            bloodGroup: String(m.health.bloodGroup ?? ''),
          } : null,
          trainer: m.trainer ? {
            id: String(m.trainer.id),
            firstName: String(m.trainer.firstName ?? ''),
            lastName: String(m.trainer.lastName ?? ''),
          } : null,
          latestMembership: m.latestMembership ? {
            id: String(m.latestMembership.id),
            planName: String(m.latestMembership.planName ?? ''),
            startDate: String(m.latestMembership.startDate ?? ''),
            endDate: String(m.latestMembership.endDate ?? ''),
            status: String(m.latestMembership.status ?? ''),
            ptSessionsTotal: Number(m.latestMembership.ptSessionsTotal ?? 0),
            ptSessionsUsed: Number(m.latestMembership.ptSessionsUsed ?? 0),
          } : null,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Membership history
    api.get(`/members/${id}/memberships`)
      .then(res => setMembershipHistory(res.data?.memberships ?? []))
      .catch(() => setMembershipHistory([]));

    // Membership events
    api.get(`/members/${id}/membership-events`)
      .then(res => setMembershipEvents(res.data?.events ?? []))
      .catch(() => setMembershipEvents([]));

    // Attendance (member-scoped)
    api.get('/attendance', { params: { memberId: id, pageSize: '50' } })
      .then(res => {
        const items = res.data?.items ?? [];
        setAttendance(items.map((l: Record<string, unknown>) => ({
          id: String(l.id),
          date: String(l.checkInAt ?? '').split('T')[0],
          checkIn: String(l.checkInAt ?? '').substring(11, 16),
          checkOut: l.checkOutAt ? String(l.checkOutAt).substring(11, 16) : null,
          duration: l.durationMinutes
            ? `${Math.floor(Number(l.durationMinutes) / 60)}h ${Number(l.durationMinutes) % 60}m`
            : '—',
          method: String(l.checkInMethod ?? l.method ?? 'MANUAL'),
        })));
      })
      .catch(() => setAttendance([]));

    // Payments
    api.get('/payments', { params: { memberId: id, pageSize: '50' } })
      .then(res => {
        const items = res.data?.items ?? [];
        setPayments(items.map((p: Record<string, unknown>) => ({
          id: String(p.id),
          amount: Number(p.totalAmount ?? p.amount ?? 0),
          method: String(p.paymentMethod ?? p.method ?? ''),
          status: String(p.status ?? ''),
          date: String(p.createdAt ?? '').split('T')[0],
          refId: String(p.referenceId ?? ''),
          description: String(p.description ?? ''),
        })));
      })
      .catch(() => setPayments([]));

    // PT Sessions
    api.get('/pt/sessions', { params: { memberId: id, pageSize: '50' } })
      .then(res => {
        const items = res.data?.items ?? [];
        setPtSessions(items.map((s: Record<string, unknown>) => ({
          id: String(s.id),
          trainer: String(s.trainerName ?? `${s.trainerFirstName ?? ''} ${s.trainerLastName ?? ''}`.trim()),
          date: String(s.scheduledAt ?? '').split('T')[0],
          time: String(s.scheduledAt ?? '').substring(11, 16),
          status: String(s.status ?? ''),
          notes: String(s.notes ?? ''),
          duration: Number(s.durationMinutes ?? 60),
        })));
      })
      .catch(() => setPtSessions([]));

    // Measurements
    api.get(`/members/${id}/measurements`)
      .then(res => {
        const items = res.data?.measurements ?? [];
        setMeasurements(items.map((m: Record<string, unknown>) => ({
          id: String(m.id),
          date: String(m.recordedAt ?? '').split('T')[0],
          weight: m.weightKg != null ? Number(m.weightKg) : null,
          bodyFat: m.bodyFatPercent != null ? Number(m.bodyFatPercent) : null,
          chest: m.chestCm != null ? Number(m.chestCm) : null,
          waist: m.waistCm != null ? Number(m.waistCm) : null,
          arm: m.armCm != null ? Number(m.armCm) : null,
          thigh: m.thighCm != null ? Number(m.thighCm) : null,
        })));
      })
      .catch(() => setMeasurements([]));

    // Activity timeline
    api.get(`/members/${id}/activity`)
      .then(res => {
        const items = res.data?.activity ?? [];
        setActivity(items.map((a: Record<string, unknown>) => ({
          date: String(a.createdAt ?? '').split('T')[0],
          type: String(a.type ?? ''),
          description: String(a.description ?? a.notes ?? a.type ?? ''),
        })));
      })
      .catch(() => setActivity([]));

    // Plans (for renew/create)
    api.get('/membership-plans', { params: { pageSize: '50' } })
      .then(res => {
        const items = res.data?.plans ?? res.data?.items ?? [];
        setApiPlans(items.map((p: Record<string, unknown>) => ({
          id: String(p.id),
          name: String(p.name ?? ''),
          price: Number(p.price ?? 0),
          durationDays: Number(p.durationDays ?? 30),
        })));
      })
      .catch(() => setApiPlans([]));

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, fetchTrigger]);

  const refresh = () => setFetchTrigger(t => t + 1);

  const trainerName = member?.trainer
    ? `${member.trainer.firstName} ${member.trainer.lastName}`
    : 'Unassigned';

  const membershipStatus = member?.latestMembership?.status ?? member?.status ?? 'ACTIVE';

  const tabs = ['Overview', 'Membership', 'Attendance', 'Payments', 'Fitness', 'Measurements', 'PT Sessions', 'Activity'];

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} size="small" variant="outlined">Back</Button>
        </Box>
        <SkeletonProfile />
      </AppLayout>
    );
  }

  if (!member) {
    return (
      <AppLayout>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} size="small" variant="outlined" sx={{ mb: 3 }}>Back</Button>
        <Alert severity="error">Member not found or failed to load.</Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Back + Header */}
      <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} size="small" variant="outlined">Back</Button>
        <Box flex={1} />
        <Button startIcon={<AutorenewIcon />} variant="outlined" size="small" onClick={() => { setRenewOpen(true); setRenewError(''); }}>Renew</Button>
        <Button startIcon={<EditIcon />} variant="contained" size="small" onClick={() => {
          setEditForm({
            firstName: member.firstName,
            lastName: member.lastName,
            phone: member.phone,
            email: member.email,
            gender: member.gender,
            dob: member.dob,
            address: member.address,
            goal: member.goal,
          });
          setEditError('');
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
              <Chip label={member.memberNumber} size="small" variant="outlined" />
              <Chip label={membershipStatus} size="small" color={membershipStatusColor[membershipStatus] ?? 'default'} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {member.email} · {member.phone}{member.gender ? ` · ${member.gender}` : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Plan: <strong style={{ color: '#f8fafc' }}>{member.latestMembership?.planName || 'None'}</strong>
              {member.latestMembership && <> · Expires: <strong style={{ color: '#f8fafc' }}>{member.latestMembership.endDate}</strong></>}
              {' '}· Trainer: <strong style={{ color: '#f8fafc' }}>{trainerName}</strong>
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    ['Email', member.email || '—'],
                    ['Phone', member.phone || '—'],
                    ['Gender', member.gender || '—'],
                    ['DOB', member.dob || '—'],
                    ['Joined', member.joinDate || '—'],
                    ['Address', member.address || '—'],
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
                {member.emergency ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {[
                      ['Name', member.emergency.name || '—'],
                      ['Phone', member.emergency.phone || '—'],
                      ['Relation', member.emergency.relation || '—'],
                    ].map(([k, v]) => (
                      <Box key={k}>
                        <Typography variant="caption" color="text.secondary">{k}</Typography>
                        <Typography variant="body2">{v}</Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">No emergency contact on file</Typography>
                )}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>Goals & Experience</Typography>
                {member.goal && <Chip label={member.goal} color="primary" variant="outlined" size="small" sx={{ mr: 1, mb: 1 }} />}
                {member.experienceLevel && <Chip label={member.experienceLevel} variant="outlined" size="small" />}
                {!member.goal && !member.experienceLevel && <Typography variant="body2" color="text.secondary">Not set</Typography>}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>Current Membership</Typography>
                {member.latestMembership ? (
                  <>
                    {[
                      ['Plan', member.latestMembership.planName],
                      ['Start', member.latestMembership.startDate],
                      ['Expiry', member.latestMembership.endDate],
                      ['Status', member.latestMembership.status],
                      ['PT Sessions', `${member.latestMembership.ptSessionsTotal - member.latestMembership.ptSessionsUsed} remaining`],
                      ['Assigned Trainer', trainerName],
                    ].map(([k, v]) => (
                      <Box key={k} display="flex" py={0.75} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">{k}</Typography>
                        <Typography variant="caption" fontWeight={600}>{v}</Typography>
                      </Box>
                    ))}
                  </>
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No active membership</Typography>
                    <Button size="small" variant="outlined" startIcon={<AddCircleIcon />} onClick={() => { setCreateMemOpen(true); setCreateMemError(''); }}>
                      Create Membership
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 1: Membership */}
      <TabPanel value={tab} index={1}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card elevation={0} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>Membership History</Typography>
                {membershipHistory.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No memberships found.</Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Plan</TableCell>
                        <TableCell>Start</TableCell>
                        <TableCell>End</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Notes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {membershipHistory.map((m: any) => (
                        <TableRow key={m.id}>
                          <TableCell><Typography variant="body2" fontWeight={600}>{m.planName}</Typography></TableCell>
                          <TableCell><Typography variant="caption">{m.startDate}</Typography></TableCell>
                          <TableCell><Typography variant="caption">{m.endDate}</Typography></TableCell>
                          <TableCell><Chip label={m.status} size="small" color={membershipStatusColor[m.status] ?? 'default'} /></TableCell>
                          <TableCell><Typography variant="caption" color="text.secondary">{m.notes || '—'}</Typography></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card elevation={0}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>Event Log</Typography>
                {membershipEvents.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No membership events yet.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {membershipEvents.map((e: any, i: number) => (
                      <Box key={e.id ?? i} sx={{ display: 'flex', gap: 2, pb: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.dark', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {eventIcon[e.eventType] ?? eventIcon['CheckCircle']}
                          </Box>
                          {i < membershipEvents.length - 1 && (
                            <Box sx={{ width: 1, flex: 1, bgcolor: 'rgba(255,255,255,0.06)', my: 0.5 }} />
                          )}
                        </Box>
                        <Box pb={1}>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                            <Chip label={e.eventType} size="small" color={membershipEventColor[e.eventType] ?? 'default'} />
                            <Typography variant="caption" color="text.secondary">
                              {String(e.createdAt ?? '').split('T')[0]}
                            </Typography>
                            {e.actorName && <Typography variant="caption" color="text.secondary">by {e.actorName}</Typography>}
                          </Box>
                          {e.notes && <Typography variant="body2" sx={{ mt: 0.5 }}>{e.notes}</Typography>}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>Membership Actions</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button variant="outlined" size="small" fullWidth startIcon={<AutorenewIcon />}
                    onClick={() => { setRenewOpen(true); setRenewError(''); }}>
                    Renew
                  </Button>
                  <Button variant="outlined" size="small" fullWidth startIcon={<AddCircleIcon />}
                    onClick={() => { setCreateMemOpen(true); setCreateMemError(''); }}>
                    Create New
                  </Button>
                  {member.latestMembership?.status === 'PENDING' && (
                    <Button variant="outlined" size="small" fullWidth color="success" startIcon={<PlayArrowIcon />}
                      onClick={async () => {
                        try {
                          await api.post(`/members/${id}/memberships/activate`);
                          refresh();
                        } catch (err: any) {
                          alert(err.response?.data?.message || 'Failed to activate');
                        }
                      }}>
                      Activate Pending
                    </Button>
                  )}
                  {member.latestMembership?.status === 'ACTIVE' && (
                    <Button variant="outlined" size="small" fullWidth color="info" startIcon={<AcUnitIcon />}
                      onClick={() => { setFreezeOpen(true); setFreezeError(''); }}>
                      Freeze
                    </Button>
                  )}
                  {member.latestMembership?.status === 'FROZEN' && (
                    <Button variant="outlined" size="small" fullWidth color="success" startIcon={<PlayArrowIcon />}
                      disabled={resumeLoading}
                      onClick={async () => {
                        setResumeLoading(true);
                        try {
                          await api.post(`/members/${id}/memberships/resume`);
                          refresh();
                        } catch (err: any) {
                          alert(err.response?.data?.message || 'Failed to resume');
                        } finally { setResumeLoading(false); }
                      }}>
                      {resumeLoading ? <CircularProgress size={18} /> : 'Resume'}
                    </Button>
                  )}
                  {member.latestMembership?.status === 'ACTIVE' && (
                    <Button variant="outlined" size="small" fullWidth startIcon={<EventRepeatIcon />}
                      onClick={() => { setExtendOpen(true); setExtendError(''); }}>
                      Extend
                    </Button>
                  )}
                  <Button variant="outlined" size="small" fullWidth color="error" startIcon={<CancelIcon />}
                    onClick={() => { setCancelOpen(true); setCancelError(''); setCancelReason(''); }}>
                    Cancel
                  </Button>
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
            <Box sx={{ display: 'flex', mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" fontWeight="bold">Attendance History</Typography>
              <Typography variant="caption" color="text.secondary">{attendance.length} records</Typography>
            </Box>
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
                {attendance.length > 0 ? attendance.map((a: any, i: number) => (
                  <TableRow key={a.id ?? i}>
                    <TableCell>{a.date || '—'}</TableCell>
                    <TableCell>{a.checkIn || '—'}</TableCell>
                    <TableCell>{a.checkOut || <Typography variant="caption" color="success.main">Still inside</Typography>}</TableCell>
                    <TableCell><Chip label={a.duration} size="small" color={a.checkOut ? 'default' : 'success'} /></TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">{a.method}</Typography></TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="caption" color="text.secondary">No attendance records yet</Typography>
                    </TableCell>
                  </TableRow>
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
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                  Total: <strong>₹{payments.filter(p => p.status === 'PAID').reduce((s: number, p: any) => s + p.amount, 0).toLocaleString()}</strong>
                </Typography>
              </Box>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Ref ID</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.length > 0 ? payments.map((p: any, i: number) => (
                  <TableRow key={p.id ?? i}>
                    <TableCell>{p.date || '—'}</TableCell>
                    <TableCell><Typography variant="caption">{p.description || '—'}</Typography></TableCell>
                    <TableCell><Typography variant="body2" fontWeight={600}>₹{p.amount.toLocaleString()}</Typography></TableCell>
                    <TableCell><Chip label={p.method || 'CASH'} size="small" variant="outlined" /></TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">{p.refId || '—'}</Typography></TableCell>
                    <TableCell><Chip label={p.status} size="small" color={payStatusColor[p.status] ?? 'default'} /></TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="caption" color="text.secondary">No payment records yet</Typography>
                    </TableCell>
                  </TableRow>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">Health & Fitness Profile</Typography>
                  <Chip label="Sensitive" size="small" color="error" />
                </Box>
                <Typography variant="caption" color="error.main" display="block" sx={{ mb: 2 }}>
                  ⚠ Access to this section is logged. Sensitive health information.
                </Typography>
                {[
                  ['Experience Level', member.experienceLevel || '—'],
                  ['Goal', member.goal || '—'],
                  ['Medical Conditions', member.health?.medicalConditions || 'None'],
                  ['Allergies', member.health?.allergies || 'None'],
                  ['Previous Injuries', member.health?.injuries || 'None'],
                  ['Blood Group', member.health?.bloodGroup || '—'],
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
              <Button variant="outlined" size="small" onClick={() => { setMeasureOpen(true); setMeasureError(''); }}>
                Add Assessment
              </Button>
            </Box>
            {measurements.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No measurements recorded yet.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Date', 'Weight (kg)', 'Body Fat %', 'Chest (cm)', 'Waist (cm)', 'Arm (cm)', 'Thigh (cm)'].map(h => (
                      <TableCell key={h}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {measurements.map((m: any, i: number) => (
                    <TableRow key={m.id ?? i}>
                      <TableCell>{m.date}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{m.weight ?? '—'}</Typography>
                      </TableCell>
                      <TableCell>{m.bodyFat != null ? `${m.bodyFat}%` : '—'}</TableCell>
                      <TableCell>{m.chest ?? '—'}</TableCell>
                      <TableCell>{m.waist ?? '—'}</TableCell>
                      <TableCell>{m.arm ?? '—'}</TableCell>
                      <TableCell>{m.thigh ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
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
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ptSessions.length > 0 ? ptSessions.map((s: any, i: number) => (
                  <TableRow key={s.id ?? i}>
                    <TableCell>{s.date}</TableCell>
                    <TableCell>{s.time}</TableCell>
                    <TableCell>{s.trainer}</TableCell>
                    <TableCell>{s.duration}min</TableCell>
                    <TableCell>
                      <Chip label={s.status} size="small"
                        color={s.status === 'COMPLETED' ? 'success' : s.status === 'SCHEDULED' ? 'default' : 'error'} />
                    </TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">{s.notes || '—'}</Typography></TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="caption" color="text.secondary">No PT sessions found</Typography>
                    </TableCell>
                  </TableRow>
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
            {activity.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No activity recorded yet.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {activity.map((a: any, i: number) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, pb: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.dark', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {eventIcon[a.type] ?? eventIcon['CheckCircle']}
                      </Box>
                      {i < activity.length - 1 && (
                        <Box sx={{ width: 1, flex: 1, bgcolor: 'rgba(255,255,255,0.06)', my: 0.5 }} />
                      )}
                    </Box>
                    <Box pb={2}>
                      <Typography variant="caption" color="text.secondary">{a.date}</Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ mt: 0.25 }}>{a.description}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* ── Edit Profile Dialog ─────────────────────────────────────────────────── */}
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
            refresh();
          } catch (err: any) {
            setEditError(err.response?.data?.message || 'Failed to update member');
          } finally {
            setEditLoading(false);
          }
        }}>
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight={700}>Edit Member Profile</Typography>
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

      {/* ── Renew Membership Dialog ─────────────────────────────────────────────── */}
      <RenewMembershipDialog
        open={renewOpen}
        memberId={id}
        memberName={member ? `${member.firstName} ${member.lastName}` : undefined}
        plans={apiPlans}
        onClose={() => setRenewOpen(false)}
        onSuccess={refresh}
      />
      <Dialog open={false} onClose={() => setRenewOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={async (e) => {
          e.preventDefault();
          if (!renewForm.planId) { setRenewError('Please select a plan.'); return; }
          setRenewLoading(true); setRenewError('');
          try {
            await api.post(`/members/${id}/memberships/renew`, renewForm);
            setRenewOpen(false);
            setRenewForm({ planId: '', notes: '' });
            refresh();
          } catch (err: any) {
            setRenewError(err.response?.data?.message || 'Failed to renew. Try "Create New" if no active membership exists.');
          } finally { setRenewLoading(false); }
        }}>
          <DialogTitle>Renew Membership</DialogTitle>
          <DialogContent>
            {renewError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{renewError}</Alert>}
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={12}>
                <TextField label="Select Plan" select required value={renewForm.planId} onChange={e => setRenewForm({ ...renewForm, planId: e.target.value })} fullWidth size="small">
                  <MenuItem value=""><em>Select a Plan</em></MenuItem>
                  {apiPlans.map(p => <MenuItem key={p.id} value={p.id}>{p.name} — ₹{p.price.toLocaleString()} ({p.durationDays} days)</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={12}><TextField label="Notes (Optional)" value={renewForm.notes} onChange={e => setRenewForm({ ...renewForm, notes: e.target.value })} fullWidth size="small" multiline rows={2} /></Grid>
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

      {/* ── Create Membership Dialog ────────────────────────────────────────────── */}
      <Dialog open={createMemOpen} onClose={() => setCreateMemOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={async (e) => {
          e.preventDefault();
          if (!createMemForm.planId || !createMemForm.startDate) { setCreateMemError('Plan and start date are required.'); return; }
          setCreateMemLoading(true); setCreateMemError('');
          try {
            await api.post(`/members/${id}/memberships/create`, createMemForm);
            setCreateMemOpen(false);
            setCreateMemForm({ planId: '', startDate: new Date().toISOString().split('T')[0], notes: '' });
            refresh();
          } catch (err: any) {
            setCreateMemError(err.response?.data?.message || 'Failed to create membership');
          } finally { setCreateMemLoading(false); }
        }}>
          <DialogTitle>Create Membership</DialogTitle>
          <DialogContent>
            {createMemError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{createMemError}</Alert>}
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={12}>
                <TextField label="Select Plan" select required value={createMemForm.planId} onChange={e => setCreateMemForm({ ...createMemForm, planId: e.target.value })} fullWidth size="small">
                  <MenuItem value=""><em>Select a Plan</em></MenuItem>
                  {apiPlans.map(p => <MenuItem key={p.id} value={p.id}>{p.name} — ₹{p.price.toLocaleString()} ({p.durationDays} days)</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField label="Start Date" type="date" required value={createMemForm.startDate} onChange={e => setCreateMemForm({ ...createMemForm, startDate: e.target.value })} fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={12}><TextField label="Notes (Optional)" value={createMemForm.notes} onChange={e => setCreateMemForm({ ...createMemForm, notes: e.target.value })} fullWidth size="small" multiline rows={2} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setCreateMemOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMemLoading}>
              {createMemLoading ? <CircularProgress size={24} /> : 'Create Membership'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ── Freeze Membership Dialog ────────────────────────────────────────────── */}
      <Dialog open={freezeOpen} onClose={() => setFreezeOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={async (e) => {
          e.preventDefault();
          if (!freezeForm.freezeStart || !freezeForm.freezeEnd) { setFreezeError('Freeze start and end dates are required.'); return; }
          setFreezeLoading(true); setFreezeError('');
          try {
            await api.post(`/members/${id}/memberships/freeze`, freezeForm);
            setFreezeOpen(false);
            setFreezeForm({ freezeStart: '', freezeEnd: '', reason: '' });
            refresh();
          } catch (err: any) {
            setFreezeError(err.response?.data?.message || 'Failed to freeze membership');
          } finally { setFreezeLoading(false); }
        }}>
          <DialogTitle>Freeze Membership</DialogTitle>
          <DialogContent>
            {freezeError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{freezeError}</Alert>}
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={12}><TextField label="Freeze From" type="date" required value={freezeForm.freezeStart} onChange={e => setFreezeForm({ ...freezeForm, freezeStart: e.target.value })} fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} /></Grid>
              <Grid size={12}><TextField label="Freeze Until" type="date" required value={freezeForm.freezeEnd} onChange={e => setFreezeForm({ ...freezeForm, freezeEnd: e.target.value })} fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} /></Grid>
              <Grid size={12}><TextField label="Reason" value={freezeForm.reason} onChange={e => setFreezeForm({ ...freezeForm, reason: e.target.value })} fullWidth size="small" /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setFreezeOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="info" disabled={freezeLoading}>
              {freezeLoading ? <CircularProgress size={24} /> : 'Freeze Membership'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ── Extend Membership Dialog ────────────────────────────────────────────── */}
      <Dialog open={extendOpen} onClose={() => setExtendOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={async (e) => {
          e.preventDefault();
          if (!extendForm.days || extendForm.days <= 0) { setExtendError('Enter a valid number of days.'); return; }
          setExtendLoading(true); setExtendError('');
          try {
            await api.post(`/members/${id}/memberships/extend`, extendForm);
            setExtendOpen(false);
            setExtendForm({ days: 7, reason: '' });
            refresh();
          } catch (err: any) {
            setExtendError(err.response?.data?.message || 'Failed to extend membership');
          } finally { setExtendLoading(false); }
        }}>
          <DialogTitle>Extend Membership</DialogTitle>
          <DialogContent>
            {extendError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{extendError}</Alert>}
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={12}><TextField label="Extend by (days)" type="number" required value={extendForm.days} onChange={e => setExtendForm({ ...extendForm, days: Number(e.target.value) })} fullWidth size="small" slotProps={{ input: { inputProps: { min: 1 } } }} /></Grid>
              <Grid size={12}><TextField label="Reason" value={extendForm.reason} onChange={e => setExtendForm({ ...extendForm, reason: e.target.value })} fullWidth size="small" /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setExtendOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={extendLoading}>
              {extendLoading ? <CircularProgress size={24} /> : 'Extend'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ── Cancel Membership Dialog ────────────────────────────────────────────── */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={async (e) => {
          e.preventDefault();
          setCancelLoading(true); setCancelError('');
          try {
            await api.post(`/members/${id}/memberships/cancel`, { reason: cancelReason });
            setCancelOpen(false);
            setCancelReason('');
            refresh();
          } catch (err: any) {
            setCancelError(err.response?.data?.message || 'Failed to cancel membership');
          } finally { setCancelLoading(false); }
        }}>
          <DialogTitle>Cancel Membership</DialogTitle>
          <DialogContent>
            {cancelError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{cancelError}</Alert>}
            <Alert severity="warning" sx={{ mb: 2, mt: 1 }}>This action will cancel the member's current membership.</Alert>
            <TextField label="Reason (Optional)" value={cancelReason} onChange={e => setCancelReason(e.target.value)} fullWidth size="small" multiline rows={2} sx={{ mt: 1 }} />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setCancelOpen(false)}>Keep Membership</Button>
            <Button type="submit" variant="contained" color="error" disabled={cancelLoading}>
              {cancelLoading ? <CircularProgress size={24} /> : 'Cancel Membership'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ── Add Measurement Dialog ──────────────────────────────────────────────── */}
      <Dialog open={measureOpen} onClose={() => setMeasureOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={async (e) => {
          e.preventDefault();
          setMeasureLoading(true); setMeasureError('');
          try {
            await api.post(`/members/${id}/measurements`, {
              weightKg: measureForm.weight ? Number(measureForm.weight) : undefined,
              bodyFatPercent: measureForm.bodyFat ? Number(measureForm.bodyFat) : undefined,
              chestCm: measureForm.chest ? Number(measureForm.chest) : undefined,
              waistCm: measureForm.waist ? Number(measureForm.waist) : undefined,
              armCm: measureForm.arm ? Number(measureForm.arm) : undefined,
              thighCm: measureForm.thigh ? Number(measureForm.thigh) : undefined,
              recordedAt: measureForm.recordedAt,
            });
            setMeasureOpen(false);
            setMeasureForm({ weight: '', bodyFat: '', chest: '', waist: '', arm: '', thigh: '', recordedAt: new Date().toISOString().split('T')[0] });
            refresh();
          } catch (err: any) {
            setMeasureError(err.response?.data?.message || 'Failed to add measurement');
          } finally { setMeasureLoading(false); }
        }}>
          <DialogTitle>Add Body Measurement</DialogTitle>
          <DialogContent>
            {measureError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{measureError}</Alert>}
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={12}><TextField label="Date" type="date" value={measureForm.recordedAt} onChange={e => setMeasureForm({ ...measureForm, recordedAt: e.target.value })} fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Weight (kg)" type="number" value={measureForm.weight} onChange={e => setMeasureForm({ ...measureForm, weight: e.target.value })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Body Fat %" type="number" value={measureForm.bodyFat} onChange={e => setMeasureForm({ ...measureForm, bodyFat: e.target.value })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Chest (cm)" type="number" value={measureForm.chest} onChange={e => setMeasureForm({ ...measureForm, chest: e.target.value })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Waist (cm)" type="number" value={measureForm.waist} onChange={e => setMeasureForm({ ...measureForm, waist: e.target.value })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Arm (cm)" type="number" value={measureForm.arm} onChange={e => setMeasureForm({ ...measureForm, arm: e.target.value })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Thigh (cm)" type="number" value={measureForm.thigh} onChange={e => setMeasureForm({ ...measureForm, thigh: e.target.value })} fullWidth size="small" /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setMeasureOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={measureLoading}>
              {measureLoading ? <CircularProgress size={24} /> : 'Save Measurement'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </AppLayout>
  );
}
