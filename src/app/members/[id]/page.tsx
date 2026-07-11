'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Tabs, Tab, Divider, Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { mockMembers, mockMembershipEvents, mockActivityTimeline, mockMeasurements, mockAttendanceLogs, mockPayments, mockPtSessions } from '@/lib/mockData';

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
function TabPanel({ children, value, index }: TabPanelProps) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

const membershipStatusColor: Record<string, any> = { ACTIVE: 'success', EXPIRING: 'warning', EXPIRED: 'error' };
const payStatusColor: Record<string, any> = { PAID: 'success', PENDING: 'warning', PARTIALLY_PAID: 'warning', FAILED: 'error' };

const eventIcon: Record<string, any> = {
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

  const member = mockMembers.find(m => m.id === id) || mockMembers[0];
  const memberPayments = mockPayments.filter(p => p.memberId === member.id);
  const memberAttendance = mockAttendanceLogs.filter(a => a.memberId === member.id);
  const memberPt = mockPtSessions.filter(p => p.member === `${member.firstName} ${member.lastName}`);

  const tabs = ['Overview', 'Membership', 'Attendance', 'Payments', 'Fitness', 'Measurements', 'PT Sessions', 'Activity'];

  return (
    <AppLayout>
      {/* Back + Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} size="small" variant="outlined">Back</Button>
        <Box flex={1} />
        <Button startIcon={<AutorenewIcon />} variant="outlined" size="small">Renew</Button>
        <Button startIcon={<EditIcon />} variant="contained" size="small">Edit</Button>
      </Box>

      {/* Profile Card */}
      <Card elevation={0} sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 3, alignItems: 'center', p: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.dark', fontSize: '2rem', flexShrink: 0 }}>
            {member.firstName[0]}{member.lastName[0]}
          </Avatar>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Typography variant="h5" fontWeight="bold">{member.firstName} {member.lastName}</Typography>
              <Chip label={member.memberId} size="small" variant="outlined" />
              <Chip label={member.membershipStatus} size="small" color={membershipStatusColor[member.membershipStatus]} />
              <Chip label={member.paymentStatus} size="small" color={payStatusColor[member.paymentStatus]} />
            </Box>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
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
          <Grid item xs={12} md={4}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" mb={2}>Contact Details</Typography>
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
          <Grid item xs={12} md={4}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" mb={2}>Emergency Contact</Typography>
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
                <Typography variant="subtitle2" fontWeight="bold" mb={1.5}>Goals</Typography>
                <Chip label={member.goal} color="primary" variant="outlined" size="small" />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" mb={2}>Current Membership</Typography>
                {[
                  ['Plan', member.plan],
                  ['Start', member.startDate],
                  ['Expiry', member.expiryDate],
                  ['Status', member.membershipStatus],
                  ['Assigned Trainer', member.trainer || 'Unassigned'],
                  ['Last Visit', member.lastVisit],
                ].map(([k, v]) => (
                  <Box key={k} display="flex" justifyContent="space-between" py={0.75} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
          <Grid item xs={12} md={8}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" mb={2}>Membership History</Typography>
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
          <Grid item xs={12} md={4}>
            <Card elevation={0}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" mb={2}>Membership Actions</Typography>
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
            <Typography variant="subtitle2" fontWeight="bold" mb={2}>Attendance History</Typography>
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ border: '1px solid rgba(239,68,68,0.2)' }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">Health & Fitness Profile</Typography>
                  <Chip label="Restricted" size="small" color="error" />
                </Box>
                <Typography variant="caption" color="error.main" display="block" mb={2}>
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
                    <Typography variant="body2" mt={0.25}>{v}</Typography>
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
            <Typography variant="subtitle2" fontWeight="bold" mb={2}>PT Sessions</Typography>
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
            <Typography variant="subtitle2" fontWeight="bold" mb={3}>Activity Timeline</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {mockActivityTimeline.map((a, i) => (
                <Box key={i} display="flex" gap={2} pb={2}>
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
                    <Typography variant="body2" fontWeight={500} mt={0.25}>{a.event}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
    </AppLayout>
  );
}
