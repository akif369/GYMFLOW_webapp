'use client';
import { use, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Tabs, Tab, Divider, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, Alert, Skeleton, InputAdornment,
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
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import BlockIcon from '@mui/icons-material/Block';
import PanToolIcon from '@mui/icons-material/PanTool';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '@/lib/api';
import { useAuthStore, hasPermission } from '@/store/useAuthStore';
import RenewMembershipDialog from '@/components/RenewMembershipDialog';
import AvatarUpload from '@/components/AvatarUpload';
import { usePresignedUrl } from '@/hooks/usePresignedUrl';
import { formatDateOnly } from '@/lib/date';

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
function TabPanel({ children, value, index }: TabPanelProps) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

function localIndianMobile(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
}

const membershipStatusColor: Record<string, ChipColor> = {
  ACTIVE: 'success', EXPIRING: 'warning', EXPIRED: 'error', FROZEN: 'info', PENDING: 'default', CANCELLED: 'error',
};
const payStatusColor: Record<string, ChipColor> = {
  PAID: 'success', PENDING: 'warning', PARTIALLY_PAID: 'warning', FAILED: 'error', REFUNDED: 'error', CANCELLED: 'default',
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
  return formatDateOnly(utcIso);
}

function getDaysRemaining(endDate?: string) {
  if (!endDate) return null;
  const end = Date.parse(`${endDate.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(end)) return null;
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return Math.ceil((end - todayStart) / (1000 * 60 * 60 * 24));
}

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
  health: { medicalConditions: string; allergies: string; injuries: string; bloodGroup: string; medications?: string; notes?: string } | null;
  trainer: { id: string; firstName: string; lastName: string } | null;
  latestMembership: {
    id: string;
    planName: string;
    startDate: string;
    endDate: string;
    startAt: string;
    expiresAt: string;
    timezone: string;
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
        <Box sx={{ flex: 1 }}>
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
  const { user } = useAuthStore();
  const canDeleteMember = hasPermission(user, 'member.delete');
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
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  // ── Delete State ──────────────────────────────────────────────────────────────
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletionSummary, setDeletionSummary] = useState<any>(null);
  const [deletionReason, setDeletionReason] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

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

  // Member status, attendance, payments, and health actions
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', paymentMethod: 'CASH', referenceId: '', description: '', notes: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [refundPayment, setRefundPayment] = useState<any | null>(null);
  const [refundForm, setRefundForm] = useState({ amount: '', reason: '' });
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundError, setRefundError] = useState('');
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [healthOpen, setHealthOpen] = useState(false);
  const [healthForm, setHealthForm] = useState({ medicalConditions: '', allergies: '', injuries: '', bloodGroup: '', medications: '', notes: '' });
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState('');
  const [sessionActionId, setSessionActionId] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    setLoading(true);

    api.get(`/members/${id}`)
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
          joinDate: String(m.joinDate ?? m.createdAt ?? '').split('T')[0] ?? '',
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
            medications: String(m.health.medications ?? ''),
            notes: String(m.health.notes ?? ''),
          } : null,
          trainer: m.trainer ? {
            id: String(m.trainer.id),
            firstName: String(m.trainer.firstName ?? ''),
            lastName: String(m.trainer.lastName ?? ''),
          } : null,
          latestMembership: m.latestMembership ? {
            id: String(m.latestMembership.id),
            planName: String(m.latestMembership.planName ?? ''),
            startAt: String(m.latestMembership.startAt ?? m.latestMembership.startDate ?? ''),
            expiresAt: String(m.latestMembership.expiresAt ?? m.latestMembership.endDate ?? ''),
            timezone: String(m.latestMembership.timezone ?? 'Asia/Kolkata'),
            startDate: formatDateOnly(m.latestMembership.startAt ?? m.latestMembership.startDate, String(m.latestMembership.timezone ?? 'Asia/Kolkata')),
            endDate: formatDateOnly(m.latestMembership.expiresAt ?? m.latestMembership.endDate, String(m.latestMembership.timezone ?? 'Asia/Kolkata')),
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
        const items = (res.data?.data ?? res.data?.items) ?? [];
        setAttendance(items.map((l: Record<string, unknown>) => ({
          id: String(l.id),
          date: toISTDate(String(l.checkInAt ?? '')),
          checkIn: toISTTime(String(l.checkInAt ?? '')),
          checkOut: l.checkOutAt ? toISTTime(String(l.checkOutAt)) : null,
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
        const items = (res.data?.data ?? res.data?.items) ?? [];
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
        const items = (res.data?.data ?? res.data?.items) ?? [];
        setPtSessions(items.map((s: Record<string, unknown>) => ({
          id: String(s.id),
          trainer: String(s.trainerName ?? `${s.trainerFirstName ?? ''} ${s.trainerLastName ?? ''}`.trim()),
          date: toISTDate(String(s.scheduledAt ?? '')),
          time: toISTTime(String(s.scheduledAt ?? '')),
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
        const items = res.data?.plans ?? (res.data?.data ?? res.data?.items) ?? [];
        setApiPlans(items.map((p: Record<string, unknown>) => ({
          id: String(p.id),
          name: String(p.name ?? ''),
          price: Number(p.price ?? 0),
          durationDays: Number(p.durationDays ?? 30),
        })));
      })
      .catch(() => setApiPlans([]));

    return () => {};
     
  }, [id, fetchTrigger]);

  const refresh = () => setFetchTrigger(t => t + 1);

  // Resolve the S3 key (or legacy URL) stored in member.photoUrl to a presigned URL.
  // Falls back to null while loading, or if the member has no photo.
  const { url: resolvedPhotoUrl } = usePresignedUrl(member?.photoUrl ?? null);

  const trainerName = member?.trainer
    ? `${member.trainer.firstName} ${member.trainer.lastName}`
    : 'Unassigned';

  const daysRemaining = getDaysRemaining(member?.latestMembership?.expiresAt);
  const membershipStatus = member?.latestMembership?.status ?? 'INACTIVE';
  const daysRemainingLabel = daysRemaining === null
    ? 'No expiry date'
    : daysRemaining > 0
      ? `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left`
      : daysRemaining === 0
        ? 'Expires today'
        : `Expired ${Math.abs(daysRemaining)}d ago`;
  const daysRemainingColor: ChipColor = daysRemaining === null
    ? 'default'
    : daysRemaining <= 0
      ? 'error'
      : daysRemaining <= 7
        ? 'warning'
        : 'success';

  // Show one effective status instead of separate member and membership statuses.
  // A past plan expiry takes precedence unless the member was manually archived.
  const memberStatusLabel = member?.status === 'ARCHIVED'
    ? 'INACTIVE'
    : daysRemaining !== null && daysRemaining < 0 && membershipStatus === 'ACTIVE'
      ? 'EXPIRED'
      : membershipStatus;
  const isCurrentlyInside = attendance.some(a => !a.checkOut);

  const handleMemberStatus = async () => {
    if (!member) return;
    setStatusLoading(true);
    setActionError('');
    try {
      await api.patch(`/members/${id}/status`, { status: member.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED' });
      setStatusConfirmOpen(false);
      refresh();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Could not update member status.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAttendance = async () => {
    setAttendanceLoading(true);
    setActionError('');
    try {
      if (isCurrentlyInside) {
        await api.post('/attendance/check-out', { memberId: id });
      } else {
        await api.post('/attendance/check-in', { memberId: id, method: 'MANUAL' });
      }
      refresh();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Could not update attendance.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!member || isCurrentlyInside || member.status === 'ARCHIVED') return;
    setAttendanceLoading(true);
    setActionError('');
    try {
      const response = await api.post('/attendance/check-in', { memberId: id, method: 'MANUAL' });
      const log = response.data?.log;
      const checkInAt = String(log?.checkInAt ?? new Date().toISOString());
      setAttendance(current => [{
        id: String(log?.id ?? `local-${Date.now()}`),
        date: toISTDate(checkInAt),
        checkIn: toISTTime(checkInAt),
        checkOut: null,
        duration: 'Just now',
        method: String(log?.checkInMethod ?? 'MANUAL'),
      }, ...current]);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Could not check in member.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleRecordPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(paymentForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentError('Enter a payment amount greater than zero.');
      return;
    }
    setPaymentLoading(true);
    setPaymentError('');
    try {
      await api.post('/payments', {
        memberId: id,
        amount,
        paymentMethod: paymentForm.paymentMethod,
        referenceId: paymentForm.referenceId || undefined,
        description: paymentForm.description || undefined,
        notes: paymentForm.notes || undefined,
      }, { headers: { 'Idempotency-Key': crypto.randomUUID() } });
      setPaymentOpen(false);
      setPaymentForm({ amount: '', paymentMethod: 'CASH', referenceId: '', description: '', notes: '' });
      refresh();
    } catch (err: any) {
      setPaymentError(err.response?.data?.message || 'Could not record payment.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleRefundPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!refundPayment) return;
    const amount = Number(refundForm.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > refundPayment.amount) {
      setRefundError('Enter a valid refund amount up to the payment total.');
      return;
    }
    if (!refundForm.reason.trim()) {
      setRefundError('A refund reason is required for the audit trail.');
      return;
    }
    setRefundLoading(true);
    setRefundError('');
    try {
      await api.post(`/payments/${refundPayment.id}/refund`, { amount, reason: refundForm.reason.trim() });
      setRefundPayment(null);
      setRefundForm({ amount: '', reason: '' });
      refresh();
    } catch (err: any) {
      setRefundError(err.response?.data?.message || 'Could not refund payment.');
    } finally {
      setRefundLoading(false);
    }
  };

  const openHealthEditor = () => {
    if (!member) return;
    setHealthForm({
      medicalConditions: member.health?.medicalConditions === 'None' ? '' : member.health?.medicalConditions ?? '',
      allergies: member.health?.allergies === 'None' ? '' : member.health?.allergies ?? '',
      injuries: member.health?.injuries === 'None' ? '' : member.health?.injuries ?? '',
      bloodGroup: member.health?.bloodGroup ?? '', medications: member.health?.medications ?? '', notes: member.health?.notes ?? '',
    });
    setHealthError('');
    setHealthOpen(true);
  };

  const handleSessionAction = async (sessionId: string, action: 'complete' | 'miss' | 'cancel') => {
    if (action === 'cancel' && !window.confirm('Cancel this upcoming PT session?')) return;
    if (action === 'miss' && !window.confirm('Mark this PT session as missed?')) return;
    setSessionActionId(sessionId);
    setActionError('');
    try {
      const endpoint = action === 'complete'
        ? `/pt/sessions/${sessionId}/complete`
        : action === 'miss'
          ? `/pt/sessions/${sessionId}/miss`
          : `/pt/sessions/${sessionId}/cancel`;
      await api.post(endpoint, action === 'cancel' ? { reason: 'Cancelled from member profile' } : undefined);
      refresh();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Could not update PT session.');
    } finally {
      setSessionActionId('');
    }
  };

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
      <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1, mb: 3, width: '100%', flexDirection: 'row' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} size="small" variant="outlined">Back</Button>
        <Box sx={{ flex: 1 }} />
        <Button startIcon={<AutorenewIcon />} variant="contained" size="medium"
          sx={{ display: { xs: 'inline-flex', sm: 'none' }, ml: 'auto', minWidth: 145, fontWeight: 700 }}
          onClick={() => { setRenewOpen(true); setRenewError(''); }}>
          Renew
        </Button>
        <Button startIcon={<AutorenewIcon />} variant="outlined" size="small"
          sx={{ display: { xs: 'none', sm: 'inline-flex' }, ml: 'auto' }}
          onClick={() => { setRenewOpen(true); setRenewError(''); }}>
          Renew
        </Button>
        <Button startIcon={<PanToolIcon />} variant="outlined" color="success" size="small"
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          disabled={attendanceLoading || isCurrentlyInside || member.status === 'ARCHIVED'}
          onClick={handleCheckIn}>
          Check in
        </Button>
  
        <Button startIcon={<EditIcon />} variant="contained" size="small" sx={{ display: { xs: 'none', sm: 'inline-flex' } }} onClick={() => {
          setEditForm({
            firstName: member.firstName,
            lastName: member.lastName,
            phone: localIndianMobile(member.phone),
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
          <Avatar
            src={resolvedPhotoUrl ?? undefined}
            sx={{ width: 80, height: 80, bgcolor: 'primary.dark', fontSize: '2rem', flexShrink: 0 }}
          >
            {member.firstName[0]}{member.lastName[0]}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{member.firstName} {member.lastName}</Typography>
              <Chip label={member.memberNumber} size="small" variant="outlined" />
              <Chip label={`${memberStatusLabel}`} size="medium" color={membershipStatusColor[memberStatusLabel] ?? 'default'} />
              <Chip label={daysRemainingLabel} size="small" color={daysRemainingColor} variant="outlined" />
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
      {actionError && <Alert severity="error" onClose={() => setActionError('')} sx={{ mb: 2 }}>{actionError}</Alert>}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0, width: '100%', overflowX: 'auto' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile
          sx={{ minWidth: 'max-content', '& .MuiTab-root': { flexShrink: 0 } }}>
          {tabs.map((t, i) => <Tab key={i} label={t} />)}
        </Tabs>
      </Box>

      {/* Tab 0: Overview */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>Contact & Address</Typography>
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
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Emergency Contact</Typography>
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
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5 }}>Goals & Experience</Typography>
                {member.goal && <Chip label={member.goal} color="primary" variant="outlined" size="small" sx={{ mr: 1, mb: 1 }} />}
                {member.experienceLevel && <Chip label={member.experienceLevel} variant="outlined" size="small" />}
                {!member.goal && !member.experienceLevel && <Typography variant="body2" color="text.secondary">Not set</Typography>}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>Current Membership</Typography>
                {member.latestMembership ? (
                  <>
                    {[
                      ['Plan: ', member.latestMembership.planName],
                      ['Start: ', member.latestMembership.startDate],
                      ['Expiry: ', member.latestMembership.endDate],
                      ['Status: ', member.latestMembership.status],
                      ['PT Sessions: ', `${member.latestMembership.ptSessionsTotal - member.latestMembership.ptSessionsUsed} remaining`],
                      ['Assigned Trainer', trainerName],
                    ].map(([k, v]) => (
                      <Box key={k} sx={{ display: 'flex', py: 1, justifyContent: 'space-between', borderBottom: '1px solid', borderBottomColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary">{k}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{v}</Typography>
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
          <Grid size={{ xs: 12, md: 8 }} sx={{ order: { xs: 2, md: 1 }, minWidth: 0 }}>
            <Card elevation={0} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>Membership History</Typography>
                {membershipHistory.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No memberships found.</Typography>
                ) : (
                  <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <Table size="small" sx={{ minWidth: 650 }}>
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
                          <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{m.planName}</Typography></TableCell>
                          <TableCell><Typography variant="caption">{formatDateOnly(m.startAt ?? m.startDate, m.timezone ?? 'Asia/Kolkata')}</Typography></TableCell>
                          <TableCell><Typography variant="caption">{formatDateOnly(m.expiresAt ?? m.endDate, m.timezone ?? 'Asia/Kolkata')}</Typography></TableCell>
                          <TableCell><Chip label={m.status} size="small" color={membershipStatusColor[m.status] ?? 'default'} /></TableCell>
                          <TableCell><Typography variant="caption" color="text.secondary">{m.notes || '—'}</Typography></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Card elevation={0}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>Event Log</Typography>
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
                            <Box sx={{ width: 1, flex: 1, bgcolor: 'divider', my: 0.5 }} />
                          )}
                        </Box>
                        <Box sx={{ pb: 1 }}>
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

          <Grid size={{ xs: 12, md: 4 }} sx={{ order: { xs: 1, md: 2 }, minWidth: 0 }}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>Membership Actions</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                          setActionError(err.response?.data?.message || 'Failed to activate membership.');
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
                          setActionError(err.response?.data?.message || 'Failed to resume membership.');
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
                   <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    color={member.status === 'ARCHIVED' ? 'success' : 'warning'}
                    startIcon={member.status === 'ARCHIVED' ? <PlayArrowIcon /> : <BlockIcon />}
                    onClick={() => { setActionError(''); setStatusConfirmOpen(true); }}
                  >
                    {member.status === 'ARCHIVED' ? 'Activate member' : 'Deactivate member'}
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
            <Box sx={{ display: 'flex', mb: 2, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Attendance History</Typography>
                <Typography variant="caption" color="text.secondary">{attendance.length} records</Typography>
              </Box>
              <Button
                size="small"
                variant={isCurrentlyInside ? 'contained' : 'outlined'}
                color={isCurrentlyInside ? 'warning' : 'success'}
                startIcon={isCurrentlyInside ? <LogoutIcon /> : <LoginIcon />}
                disabled={attendanceLoading || member.status === 'ARCHIVED'}
                onClick={handleAttendance}
              >
                {attendanceLoading ? 'Saving...' : isCurrentlyInside ? 'Check out' : 'Check in'}
              </Button>
            </Box>
            <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <Table size="small" sx={{ minWidth: 620 }}>
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
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 3: Payments */}
      <TabPanel value={tab} index={3}>
        <Card elevation={0}>
          <CardContent>
            <Box sx={{ display: 'flex', mb: 2, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Payment History</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                  Total: <strong>₹{payments.filter(p => p.status === 'PAID').reduce((s: number, p: any) => s + p.amount, 0).toLocaleString()}</strong>
                </Typography>
                <Button size="small" variant="contained" startIcon={<AddCircleIcon />} onClick={() => { setPaymentError(''); setPaymentOpen(true); }}>
                  Record payment
                </Button>
              </Box>
            </Box>
            <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <Table size="small" sx={{ minWidth: 850 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Ref ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.length > 0 ? payments.map((p: any, i: number) => (
                  <TableRow key={p.id ?? i}>
                    <TableCell>{p.date || '—'}</TableCell>
                    <TableCell><Typography variant="caption">{p.description || '—'}</Typography></TableCell>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>₹{p.amount.toLocaleString()}</Typography></TableCell>
                    <TableCell><Chip label={p.method || 'CASH'} size="small" variant="outlined" /></TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">{p.refId || '—'}</Typography></TableCell>
                    <TableCell><Chip label={p.status} size="small" color={payStatusColor[p.status] ?? 'default'} /></TableCell>
                    <TableCell>
                      {['PAID', 'PARTIALLY_PAID'].includes(p.status) && (
                        <Button size="small" color="error" onClick={() => {
                          setRefundPayment(p);
                          setRefundForm({ amount: String(p.amount), reason: '' });
                          setRefundError('');
                        }}>
                          Refund
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="caption" color="text.secondary">No payment records yet</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </Box>
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
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Health & Fitness Profile</Typography>
                  <Chip label="Sensitive" size="small" color="error" />
                  <Box sx={{ flex: 1 }} />
                  <Button size="small" variant="outlined" onClick={openHealthEditor}>Edit</Button>
                </Box>
                <Typography variant="caption" color="error.main" sx={{ display: 'block', mb: 2 }}>
                  ⚠ Access to this section is logged. Sensitive health information.
                </Typography>
                {[
                  ['Experience Level', member.experienceLevel || '—'],
                  ['Goal', member.goal || '—'],
                  ['Medical Conditions', member.health?.medicalConditions || 'None'],
                  ['Allergies', member.health?.allergies || 'None'],
                  ['Previous Injuries', member.health?.injuries || 'None'],
                  ['Medications', member.health?.medications || 'None'],
                  ['Health Notes', member.health?.notes || '-'],
                  ['Blood Group', member.health?.bloodGroup || '—'],
                ].map(([k, v]) => (
                  <Box key={k} sx={{ py: 1, borderBottom: '1px solid', borderBottomColor: 'divider' }}>
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
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Body Measurements History</Typography>
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
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.weight ?? '—'}</Typography>
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
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>PT Sessions</Typography>
            <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Trainer</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Actions</TableCell>
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
                        color={s.status === 'COMPLETED' ? 'success' : s.status === 'UPCOMING' ? 'default' : 'error'} />
                    </TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">{s.notes || '—'}</Typography></TableCell>
                    <TableCell>
                      {s.status === 'UPCOMING' && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          <Button size="small" color="success" disabled={sessionActionId === s.id} onClick={() => handleSessionAction(s.id, 'complete')}>Complete</Button>
                          <Button size="small" color="warning" disabled={sessionActionId === s.id} onClick={() => handleSessionAction(s.id, 'miss')}>Missed</Button>
                          <Button size="small" color="error" disabled={sessionActionId === s.id} onClick={() => handleSessionAction(s.id, 'cancel')}>Cancel</Button>
                        </Box>
                      )}
                    </TableCell>
                   </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="caption" color="text.secondary">No PT sessions found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 7: Activity */}
      <TabPanel value={tab} index={7}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 3 }}>Activity Timeline</Typography>
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
                        <Box sx={{ width: 1, flex: 1, bgcolor: 'divider', my: 0.5 }} />
                      )}
                    </Box>
                    <Box sx={{ pb: 2 }}>
                      <Typography variant="caption" color="text.secondary">{a.date}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.25 }}>{a.description}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* ── Edit Profile Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onClose={() => { setEditOpen(false); setEditAvatarFile(null); }} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={async (e) => {
          e.preventDefault();
          if (!editForm.firstName || !editForm.lastName || !editForm.phone) {
            setEditError('First Name, Last Name, and Phone are required.');
            return;
          }
          if (!/^[6-9]\d{9}$/.test(editForm.phone)) {
            setEditError('Enter a valid 10-digit Indian mobile number.');
            return;
          }
          setEditLoading(true);
          setEditError('');
          try {
            // 1. Save text fields
            await api.patch(`/members/${id}`, { ...editForm, phone: `+91${editForm.phone}` });

            // 2. Upload new photo if one was selected
            if (editAvatarFile) {
              setPhotoUploading(true);
              try {
                const fd = new FormData();
                fd.append('photo', editAvatarFile);
                await api.post(`/members/${id}/photo`, fd, {
                  headers: { 'Content-Type': 'multipart/form-data' },
                });
              } catch {
                setEditError('Profile saved, but the photo upload failed. Please try again.');
                setPhotoUploading(false);
                setEditLoading(false);
                refresh();
                return;
              }
              setPhotoUploading(false);
            }

            setEditAvatarFile(null);
            setEditOpen(false);
            refresh();
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

            {/* Profile photo upload */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5, mt: 1 }}>
              <AvatarUpload
                initialImage={resolvedPhotoUrl ?? null}
                onImageSelected={setEditAvatarFile}
                onDeleteRequested={async () => {
                  await api.delete(`/members/${id}/photo`);
                  refresh();
                }}
                disabled={editLoading || photoUploading}
                size={90}
              />
            </Box>

            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="First Name" required value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Last Name" required value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Mobile number" required value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} fullWidth size="small" helperText="Enter the 10-digit mobile number" slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[6-9][0-9]{9}', maxLength: 10 }, input: { startAdornment: <InputAdornment position="start">+91 (IN)</InputAdornment> } }} /></Grid>
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
          <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
            {canDeleteMember ? (
              <Button 
                color="error" 
                startIcon={<DeleteIcon />}
                disabled={editLoading || photoUploading}
                onClick={async () => {
                  setDeleteOpen(true);
                  setSummaryLoading(true);
                  try {
                    const res = await api.get(`/members/${id}/deletion-summary`);
                    setDeletionSummary(res.data);
                  } catch (err) {
                    console.error('Failed to fetch deletion summary', err);
                  } finally {
                    setSummaryLoading(false);
                  }
                }}
              >
                Delete Member
              </Button>
            ) : (
              <Box /> // placeholder for flex space-between
            )}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={() => { setEditOpen(false); setEditAvatarFile(null); }}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={editLoading || photoUploading || deleteLoading}>
                {(editLoading || photoUploading) ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Box>
          </DialogActions>

        </Box>
      </Dialog>

      {/* ── Delete Member Dialog ─────────────────────────────────────────────── */}
      <Dialog open={deleteOpen} onClose={() => !deleteLoading && setDeleteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>Delete Member?</DialogTitle>
        <DialogContent>
          {summaryLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                {member?.firstName} {member?.lastName}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                This member has:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mb: 3, typography: 'body2' }}>
                <li>{deletionSummary?.activeMemberships || 0} active membership(s)</li>
                <li>{deletionSummary?.attendanceRecords || 0} attendance record(s)</li>
                <li>{deletionSummary?.paymentTransactions || 0} payment transaction(s)</li>
                <li>{deletionSummary?.invoices || 0} invoice(s)</li>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                The member will be removed from normal gym operations, but historical financial and attendance records will be retained. Access will be immediately revoked.
              </Typography>
              <TextField
                label="Reason for deletion (Optional)"
                fullWidth
                size="small"
                multiline
                rows={2}
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteLoading || summaryLoading}
            onClick={async () => {
              setDeleteLoading(true);
              try {
                await api.delete(`/members/${id}`, { data: { deletionReason } });
                router.push('/members');
              } catch (err: any) {
                setEditError(err.response?.data?.message || 'Failed to delete member');
                setDeleteOpen(false);
                setDeleteLoading(false);
              }
            }}
          >
            {deleteLoading ? <CircularProgress size={24} color="inherit" /> : 'Delete Member'}
          </Button>
        </DialogActions>
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

      <Button
        variant="contained"
        startIcon={<EditIcon />}
        aria-label="Edit member"
        sx={{
          display: { xs: 'inline-flex', sm: 'none' },
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 1200,
          borderRadius: 6,
          boxShadow: 4,
          fontWeight: 700,
        }}
        onClick={() => {
          setEditForm({
            firstName: member.firstName,
            lastName: member.lastName,
            phone: localIndianMobile(member.phone),
            email: member.email,
            gender: member.gender,
            dob: member.dob,
            address: member.address,
            goal: member.goal,
          });
          setEditError('');
          setEditOpen(true);
        }}
      >
        Edit
      </Button>

      <Button
        variant="contained"
        color="success"
        aria-label="Check in member"
        title={isCurrentlyInside ? 'Member is already checked in' : 'Check in member'}
        sx={{
          display: { xs: 'inline-flex', sm: 'none' },
          position: 'fixed',
          right: 17,
          bottom: 75,
          minWidth: 48,
          width: 48,
          height: 48,
          p: 0,
          zIndex: 1200,
          borderRadius: '50%',
          boxShadow: 4,
        }}
        disabled={attendanceLoading || isCurrentlyInside || member.status === 'ARCHIVED'}
        onClick={handleCheckIn}
      >
        <PanToolIcon sx={{mr:0.35}} />
      </Button>

      <Dialog open={statusConfirmOpen} onClose={() => !statusLoading && setStatusConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{member.status === 'ARCHIVED' ? 'Activate member?' : 'Deactivate member?'}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {member.status === 'ARCHIVED'
              ? 'This restores the member to the active member list. Their history and payments remain unchanged.'
              : 'This hides the member from normal active workflows. Their history, membership, and payment ledger remain unchanged.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setStatusConfirmOpen(false)} disabled={statusLoading}>Keep status</Button>
          <Button variant="contained" color={member.status === 'ARCHIVED' ? 'success' : 'warning'} onClick={handleMemberStatus} disabled={statusLoading}>
            {statusLoading ? <CircularProgress size={20} /> : member.status === 'ARCHIVED' ? 'Activate member' : 'Deactivate member'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={paymentOpen} onClose={() => !paymentLoading && setPaymentOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleRecordPayment}>
          <DialogTitle>Record payment</DialogTitle>
          <DialogContent>
            {paymentError && <Alert severity="error" sx={{ mt: 1, mb: 2 }}>{paymentError}</Alert>}
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Amount" type="number" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} fullWidth required slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select label="Payment method" value={paymentForm.paymentMethod} onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })} fullWidth>
                  {['CASH', 'UPI', 'CARD', 'NETBANKING', 'CHEQUE', 'OTHER'].map(method => <MenuItem key={method} value={method}>{method}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={12}><TextField label="Reference ID (optional)" value={paymentForm.referenceId} onChange={e => setPaymentForm({ ...paymentForm, referenceId: e.target.value })} fullWidth helperText="UPI reference, card authorization, or cheque number" /></Grid>
              <Grid size={12}><TextField label="Description (optional)" value={paymentForm.description} onChange={e => setPaymentForm({ ...paymentForm, description: e.target.value })} fullWidth /></Grid>
              <Grid size={12}><TextField label="Internal note (optional)" value={paymentForm.notes} onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })} fullWidth multiline rows={2} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setPaymentOpen(false)} disabled={paymentLoading}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={paymentLoading}>{paymentLoading ? <CircularProgress size={20} /> : 'Record payment'}</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(refundPayment)} onClose={() => !refundLoading && setRefundPayment(null)} maxWidth="xs" fullWidth>
        <Box component="form" onSubmit={handleRefundPayment}>
          <DialogTitle>Refund payment</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>Refunds are recorded in the payment ledger and cannot be silently deleted.</Alert>
            {refundError && <Alert severity="error" sx={{ mb: 2 }}>{refundError}</Alert>}
            <TextField label="Refund amount" type="number" value={refundForm.amount} onChange={e => setRefundForm({ ...refundForm, amount: e.target.value })} fullWidth required slotProps={{ htmlInput: { min: 0.01, step: 0.01, max: refundPayment?.amount } }} sx={{ mb: 2 }} />
            <TextField label="Reason" value={refundForm.reason} onChange={e => setRefundForm({ ...refundForm, reason: e.target.value })} fullWidth required multiline rows={3} />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setRefundPayment(null)} disabled={refundLoading}>Keep payment</Button>
            <Button type="submit" variant="contained" color="error" disabled={refundLoading}>{refundLoading ? <CircularProgress size={20} /> : 'Process refund'}</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={healthOpen} onClose={() => !healthLoading && setHealthOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={async (event) => {
          event.preventDefault();
          setHealthLoading(true); setHealthError('');
          try {
            await api.patch(`/members/${id}/health-profile`, healthForm);
            setHealthOpen(false);
            refresh();
          } catch (err: any) {
            setHealthError(err.response?.data?.message || 'Could not update health profile.');
          } finally { setHealthLoading(false); }
        }}>
          <DialogTitle>Edit health profile</DialogTitle>
          <DialogContent>
            {healthError && <Alert severity="error" sx={{ mt: 1, mb: 2 }}>{healthError}</Alert>}
            <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>Health information is sensitive and access is logged.</Alert>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Medical conditions" value={healthForm.medicalConditions} onChange={e => setHealthForm({ ...healthForm, medicalConditions: e.target.value })} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Allergies" value={healthForm.allergies} onChange={e => setHealthForm({ ...healthForm, allergies: e.target.value })} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Previous injuries" value={healthForm.injuries} onChange={e => setHealthForm({ ...healthForm, injuries: e.target.value })} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Blood group" value={healthForm.bloodGroup} onChange={e => setHealthForm({ ...healthForm, bloodGroup: e.target.value })} fullWidth /></Grid>
              <Grid size={12}><TextField label="Medications" value={healthForm.medications} onChange={e => setHealthForm({ ...healthForm, medications: e.target.value })} fullWidth /></Grid>
              <Grid size={12}><TextField label="Notes" value={healthForm.notes} onChange={e => setHealthForm({ ...healthForm, notes: e.target.value })} fullWidth multiline rows={2} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setHealthOpen(false)} disabled={healthLoading}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={healthLoading}>{healthLoading ? <CircularProgress size={20} /> : 'Save health profile'}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </AppLayout>
  );
}
