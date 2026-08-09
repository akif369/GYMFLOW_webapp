'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Tabs, Tab,
  Table, TableBody, TableCell, TableHead, TableRow, Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { mockAttendanceLogs, mockPayments, mockMembers, mockTrainers, mockPtSessions } from '@/lib/mockData';
import { api } from '@/lib/api';

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

type ReportCell = string | number | { chip: true; label: string; color: string };
type ReportRow = Record<string, ReportCell>;

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

interface ReportCardProps {
  title: string;
  subtitle?: string;
  rows: ReportRow[];
  columns: string[];
}

function ReportCard({ title, subtitle, rows, columns }: ReportCardProps) {
  return (
    <Card elevation={0}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">{title}</Typography>
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
          </Box>
          <Button size="small" variant="outlined" startIcon={<DownloadIcon />}>CSV</Button>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>{columns.map((c: string) => <TableCell key={c}>{c}</TableCell>)}</TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                {Object.values(row).map((v, j) => (
                  <TableCell key={j}>
                    {typeof v === 'object' && v.chip ? <Chip label={v.label} size="small" color={v.color as ChipColor} /> : v}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const [tab, setTab] = useState(0);

  // ── API report data ───────────────────────────────────────────────────────────
  type ALog = typeof mockAttendanceLogs[0];
  type APayment = typeof mockPayments[0];
  type AMember = typeof mockMembers[0];
  type ATrainer = typeof mockTrainers[0];
  type APtSession = typeof mockPtSessions[0];

  const [attendanceLogs, setAttendanceLogs] = useState<ALog[]>([]);
  const [payments, setPayments] = useState<APayment[]>([]);
  const [members, setMembers] = useState<AMember[]>([]);
  const [trainers, setTrainers] = useState<ATrainer[]>([]);
  const [ptSessions, setPtSessions] = useState<APtSession[]>([]);

  useEffect(() => {
    api.get('/attendance', { params: { pageSize: '100' } })
      .then(res => {
        const items = res.data?.items ?? [];
        setAttendanceLogs(items.map((l: Record<string, unknown>) => ({
          id: String(l.id), member: `${l.firstName ?? ''} ${l.lastName ?? ''}`.trim() || String(l.memberName ?? ''),
          memberId: String(l.memberId ?? ''), date: String(l.checkInTime ?? '').split('T')[0],
          checkIn: String(l.checkInTime ?? '').substring(11, 16),
          checkOut: l.checkOutTime ? String(l.checkOutTime).substring(11, 16) : null,
          duration: l.durationMinutes ? `${Math.floor(Number(l.durationMinutes) / 60)}h ${Number(l.durationMinutes) % 60}m` : 'Inside',
          method: String(l.method ?? 'MANUAL'), branch: String(l.branch ?? ''),
        })));
      }).catch(() => setAttendanceLogs(mockAttendanceLogs));

    api.get('/payments', { params: { pageSize: '100' } })
      .then(res => {
        const items = res.data?.items ?? [];
        setPayments(items.map((p: Record<string, unknown>) => ({
          id: String(p.id), member: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || String(p.memberName ?? ''),
          memberId: String(p.memberId ?? ''), amount: Number(p.amount ?? 0),
          method: String(p.method ?? ''), status: String(p.status ?? ''),
          date: String(p.date ?? p.createdAt ?? '').split('T')[0],
          refId: String(p.referenceId ?? ''), plan: String(p.plan ?? ''),
        })));
      }).catch(() => setPayments(mockPayments));

    api.get('/members', { params: { pageSize: '100' } })
      .then(res => {
        const items = res.data?.items ?? [];
        setMembers(items.map((m: Record<string, unknown>) => ({
          id: String(m.id), memberId: String(m.memberNumber ?? ''),
          firstName: String(m.firstName ?? ''), lastName: String(m.lastName ?? ''),
          email: String(m.email ?? ''), phone: String(m.phone ?? ''),
          photoUrl: null, joinDate: String(m.createdAt ?? '').split('T')[0], gender: '', dob: '',
          plan: String(m.membershipPlan ?? ''),
          startDate: String(m.membershipStart ?? '').split('T')[0],
          expiryDate: String(m.membershipExpiry ?? '').split('T')[0],
          trainer: null, lastVisit: '', paymentStatus: String(m.paymentStatus ?? 'PAID'),
          membershipStatus: String(m.membershipStatus ?? 'ACTIVE'),
          goal: '', experience: '', branch: '', address: '',
          emergency: { name: '', phone: '', relation: '' },
          medicalConditions: '', allergies: '', injuries: '',
        })));
      }).catch(() => setMembers(mockMembers));

    api.get('/trainers', { params: { pageSize: '50' } })
      .then(res => {
        const items = res.data?.items ?? [];
        setTrainers(items.map((t: Record<string, unknown>) => ({
          id: String(t.id), name: `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim() || String(t.name ?? ''),
          specialization: String(t.specialization ?? ''), email: String(t.email ?? ''),
          phone: String(t.phone ?? ''), status: String(t.status ?? 'ACTIVE'),
          membersAssigned: Number(t.memberCount ?? 0), ptClients: Number(t.ptClients ?? 0),
          sessionsThisMonth: Number(t.sessionsThisMonth ?? 0), sessionsCompleted: Number(t.sessionsCompleted ?? 0),
          sessionsCancelled: Number(t.sessionsCancelled ?? 0), rating: Number(t.rating ?? 0),
          bio: '', certifications: [], joinDate: '', salary: 0,
        })));
      }).catch(() => setTrainers(mockTrainers));

    api.get('/pt/sessions', { params: { pageSize: '100' } })
      .then(res => {
        const items = res.data?.items ?? [];
        setPtSessions(items.map((s: Record<string, unknown>) => ({
          id: String(s.id),
          member: `${s.memberFirstName ?? ''} ${s.memberLastName ?? ''}`.trim() || String(s.memberName ?? ''),
          memberId: String(s.memberId ?? ''), trainer: String(s.trainerName ?? ''),
          trainerId: String(s.trainerId ?? ''), date: String(s.scheduledAt ?? '').split('T')[0],
          time: String(s.scheduledAt ?? '').substring(11, 16), duration: Number(s.durationMinutes ?? 60),
          type: String(s.sessionType ?? ''), status: String(s.status ?? ''),
          notes: String(s.notes ?? ''), package: String(s.packageName ?? ''), sessionsRemaining: Number(s.sessionsRemaining ?? 0),
        })));
      }).catch(() => setPtSessions(mockPtSessions));
  }, []);

  // Use API data if populated, else fall back to mock
  const aLogs = attendanceLogs.length ? attendanceLogs : mockAttendanceLogs;
  const aPayments = payments.length ? payments : mockPayments;
  const aMembers = members.length ? members : mockMembers;
  const aTrainers = trainers.length ? trainers : mockTrainers;
  const aPtSessions = ptSessions.length ? ptSessions : mockPtSessions;

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Reports</Typography>
          <Typography variant="body2" color="text.secondary">Analytics and exportable reports</Typography>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab label="Attendance" />
          <Tab label="Revenue" />
          <Tab label="Memberships" />
          <Tab label="Trainer Performance" />
          <Tab label="PT Sessions" />
        </Tabs>
      </Box>

      {/* Attendance Report */}
      <TabPanel value={tab} index={0}>
        <ReportCard
          title="Attendance Report"
          subtitle={`${aLogs.length} records`}
          columns={['Member', 'Date', 'Check-in', 'Check-out', 'Duration', 'Method']}
          rows={aLogs.map(l => ({
            member: l.member, date: l.date, checkin: l.checkIn, checkout: l.checkOut || '—', duration: l.duration, method: l.method,
          }))}
        />
      </TabPanel>

      {/* Revenue Report */}
      <TabPanel value={tab} index={1}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Total Revenue', value: `₹${aPayments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0).toLocaleString()}` },
            { label: 'Pending', value: `₹${aPayments.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0).toLocaleString()}` },
            { label: 'Transactions', value: aPayments.length },
          ].map(s => (
            <Grid size={{ xs: 12, sm: 4 }} key={s.label}>
              <Card elevation={0}><CardContent>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>{s.value}</Typography>
              </CardContent></Card>
            </Grid>
          ))}
        </Grid>
        <ReportCard
          title="Revenue by Transaction"
          columns={['Member', 'Plan', 'Amount', 'Method', 'Date', 'Status']}
          rows={aPayments.map(p => ({
            member: p.member, plan: p.plan,
            amount: `₹${p.amount.toLocaleString()}`, method: p.method, date: p.date,
            status: { chip: true, label: p.status, color: p.status === 'PAID' ? 'success' : 'warning' },
          }))}
        />
      </TabPanel>

      {/* Membership Report */}
      <TabPanel value={tab} index={2}>
        <ReportCard
          title="Membership Status Report"
          subtitle={`${aMembers.length} members`}
          columns={['Member', 'Plan', 'Start', 'Expiry', 'Membership Status', 'Payment Status']}
          rows={aMembers.map(m => ({
            member: `${m.firstName} ${m.lastName}`, plan: m.plan,
            start: m.startDate, expiry: m.expiryDate,
            memStatus: { chip: true, label: m.membershipStatus, color: m.membershipStatus === 'ACTIVE' ? 'success' : m.membershipStatus === 'EXPIRING' ? 'warning' : 'error' },
            payStatus: { chip: true, label: m.paymentStatus, color: m.paymentStatus === 'PAID' ? 'success' : 'warning' },
          }))}
        />
      </TabPanel>

      {/* Trainer Performance */}
      <TabPanel value={tab} index={3}>
        <ReportCard
          title="Trainer Performance"
          columns={['Trainer', 'Members', 'PT Clients', 'Sessions', 'Completed', 'Cancelled', 'Completion Rate']}
          rows={aTrainers.map(t => ({
            name: t.name,
            members: t.membersAssigned,
            ptClients: t.ptClients,
            sessions: t.sessionsThisMonth,
            completed: t.sessionsCompleted,
            cancelled: t.sessionsCancelled,
            rate: t.sessionsThisMonth > 0 ? `${Math.round((t.sessionsCompleted / t.sessionsThisMonth) * 100)}%` : 'N/A',
          }))}
        />
      </TabPanel>

      {/* PT Sessions Report */}
      <TabPanel value={tab} index={4}>
        <ReportCard
          title="PT Sessions Report"
          subtitle={`${aPtSessions.length} total sessions`}
          columns={['Date', 'Member', 'Trainer', 'Time', 'Status']}
          rows={aPtSessions.map(s => ({
            date: s.date, member: s.member, trainer: s.trainer, time: s.time,
            status: { chip: true, label: s.status, color: s.status === 'COMPLETED' ? 'success' : s.status === 'MISSED' ? 'error' : 'default' },
          }))}
        />
      </TabPanel>
    </AppLayout>
  );
}


