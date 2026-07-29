'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Tabs, Tab,
  Table, TableBody, TableCell, TableHead, TableRow, Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { mockAttendanceLogs, mockPayments, mockMembers, mockTrainers, mockPtSessions } from '@/lib/mockData';

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

function ReportCard({ title, subtitle, rows, columns }: any) {
  return (
    <Card elevation={0}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
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
            {rows.map((row: any, i: number) => (
              <TableRow key={i}>
                {Object.values(row).map((v: any, j: number) => (
                  <TableCell key={j}>
                    {typeof v === 'object' && v?.chip ? <Chip label={v.label} size="small" color={v.color} /> : v}
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

  return (
    <AppLayout>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Reports</Typography>
          <Typography variant="body2" color="text.secondary">Analytics and exportable reports</Typography>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
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
          subtitle={`${mockAttendanceLogs.length} records`}
          columns={['Member', 'Date', 'Check-in', 'Check-out', 'Duration', 'Method']}
          rows={mockAttendanceLogs.map(l => ({
            member: l.member, date: l.date, checkin: l.checkIn, checkout: l.checkOut || '—', duration: l.duration, method: l.method,
          }))}
        />
      </TabPanel>

      {/* Revenue Report */}
      <TabPanel value={tab} index={1}>
        <Grid container spacing={2} mb={3}>
          {[
            { label: 'Total Revenue', value: `₹${mockPayments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0).toLocaleString()}` },
            { label: 'Pending', value: `₹${mockPayments.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0).toLocaleString()}` },
            { label: 'Transactions', value: mockPayments.length },
          ].map(s => (
            <Grid xs={4} key={s.label}>
              <Card elevation={0}><CardContent>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                <Typography variant="h5" fontWeight="bold" mt={0.5}>{s.value}</Typography>
              </CardContent></Card>
            </Grid>
          ))}
        </Grid>
        <ReportCard
          title="Revenue by Transaction"
          columns={['Member', 'Plan', 'Amount', 'Method', 'Date', 'Status']}
          rows={mockPayments.map(p => ({
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
          subtitle={`${mockMembers.length} members`}
          columns={['Member', 'Plan', 'Start', 'Expiry', 'Membership Status', 'Payment Status']}
          rows={mockMembers.map(m => ({
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
          rows={mockTrainers.map(t => ({
            name: t.name,
            members: t.membersAssigned,
            ptClients: t.ptClients,
            sessions: t.sessionsThisMonth,
            completed: t.sessionsCompleted,
            cancelled: t.sessionsCancelled,
            rate: `${Math.round((t.sessionsCompleted / t.sessionsThisMonth) * 100)}%`,
          }))}
        />
      </TabPanel>

      {/* PT Sessions Report */}
      <TabPanel value={tab} index={4}>
        <ReportCard
          title="PT Sessions Report"
          subtitle={`${mockPtSessions.length} total sessions`}
          columns={['Date', 'Member', 'Trainer', 'Time', 'Status']}
          rows={mockPtSessions.map(s => ({
            date: s.date, member: s.member, trainer: s.trainer, time: s.time,
            status: { chip: true, label: s.status, color: s.status === 'COMPLETED' ? 'success' : s.status === 'MISSED' ? 'error' : 'default' },
          }))}
        />
      </TabPanel>
    </AppLayout>
  );
}
