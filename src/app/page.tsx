'use client';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Divider, Table, TableBody, TableCell, TableHead, TableRow, Paper, LinearProgress
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import WarningIcon from '@mui/icons-material/Warning';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import {
  mockDashboardStats, mockRevenueChart, mockAttendanceChart,
  mockPeakHours, mockAttendanceLogs, mockPayments
} from '@/lib/mockData';

function StatCard({
  title, value, sub, icon: Icon, color = '#10b981', trend
}: {
  title: string; value: string | number; sub?: string; icon: any; color?: string; trend?: string;
}) {
  return (
    <Card elevation={0} sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" mt={0.5} sx={{ fontSize: '1.8rem' }}>
              {value}
            </Typography>
            {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
          </Box>
          <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: `${color}18` }}>
            <Icon sx={{ color, fontSize: 22 }} />
          </Box>
        </Box>
        {trend && (
          <Box mt={1.5}>
            <Typography variant="caption" sx={{ color, fontWeight: 600 }}>{trend}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function MiniBarChart({ data, color = '#10b981' }: { data: { label: string; count: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.count));
  return (
    <Box display="flex" alignItems="flex-end" gap={0.5} height={60}>
      {data.map((d, i) => (
        <Box key={i} flex={1} display="flex" flexDirection="column" alignItems="center" gap={0.5}>
          <Box
            sx={{
              width: '100%',
              bgcolor: color,
              borderRadius: '3px 3px 0 0',
              height: `${(d.count / max) * 56}px`,
              opacity: 0.7,
              transition: 'opacity 0.2s',
              '&:hover': { opacity: 1 },
              minHeight: 4,
            }}
          />
          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>{d.label}</Typography>
        </Box>
      ))}
    </Box>
  );
}

const statusColor: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  PAID: 'success', PENDING: 'warning', PARTIALLY_PAID: 'warning', FAILED: 'error',
  ACTIVE: 'success', EXPIRING: 'warning', EXPIRED: 'error',
  COMPLETED: 'success', UPCOMING: 'default', MISSED: 'error',
};

export default function Dashboard() {
  const stats = mockDashboardStats;

  return (
    <AppLayout>
      {/* Header Row */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">IronZone Fitness · Today, {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Typography>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button variant="contained" size="small" startIcon={<AddIcon />}>Add Member</Button>
          <Button variant="outlined" size="small" startIcon={<CheckCircleIcon />}>Check In</Button>
          <Button variant="outlined" size="small" startIcon={<ReceiptIcon />}>Add Payment</Button>
          <Button variant="outlined" size="small" startIcon={<AutorenewIcon />}>Renew</Button>
          <Button variant="outlined" size="small" startIcon={<EventAvailableIcon />}>Book PT</Button>
        </Box>
      </Box>

      {/* Row 1: Top Stats */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Today's Check-ins" value={stats.todaysCheckins} icon={AccessTimeIcon} trend="↑ 12% from yesterday" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Currently Inside" value={stats.currentlyInside} icon={PeopleIcon} color="#06b6d4" sub="Live count" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Today's Revenue" value={`₹${stats.todaysRevenue.toLocaleString()}`} icon={AttachMoneyIcon} color="#22c55e" trend="↑ ₹1,200 vs avg" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Month Revenue" value={`₹${(stats.monthRevenue / 1000).toFixed(0)}K`} icon={TrendingUpIcon} color="#a78bfa" trend="↑ 8% vs last month" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Pending Amount" value={`₹${(stats.pendingAmount / 1000).toFixed(1)}K`} icon={WarningIcon} color="#f59e0b" trend="14 members due" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Expiring (7d)" value={stats.expiringIn7Days} icon={AutorenewIcon} color="#ef4444" trend="Action required" />
        </Grid>
      </Grid>

      {/* Row 2: Secondary Stats */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Expired Members" value={stats.expiredMemberships} icon={PersonOffIcon} color="#ef4444" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="New This Month" value={stats.newMembersMonth} icon={AddIcon} color="#22c55e" trend="↑ 5 vs last month" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Active Members" value={stats.activeMembers} icon={PeopleIcon} color="#10b981" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Inactive Members" value={stats.inactiveMembers} icon={PersonOffIcon} color="#94a3b8" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Trainers Working" value={stats.trainersWorking} icon={FitnessCenterIcon} color="#06b6d4" sub="of 3 total" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Today's PT Sessions" value={stats.todaysPtSessions} icon={EventAvailableIcon} color="#a78bfa" />
        </Grid>
      </Grid>

      {/* Row 3: Charts + Live */}
      <Grid container spacing={2} mb={2}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={4}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight="bold" mb={2}>Monthly Revenue</Typography>
              <MiniBarChart
                data={mockRevenueChart.map(r => ({ label: r.month, count: r.revenue }))}
                color="#10b981"
              />
              <Typography variant="caption" color="text.secondary" mt={1} display="block">
                Total: ₹{mockRevenueChart.reduce((s, r) => s + r.revenue, 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Chart */}
        <Grid item xs={12} md={4}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight="bold" mb={2}>Weekly Attendance</Typography>
              <MiniBarChart
                data={mockAttendanceChart.map(a => ({ label: a.day, count: a.count }))}
                color="#06b6d4"
              />
              <Typography variant="caption" color="text.secondary" mt={1} display="block">
                Peak: Saturday ({mockAttendanceChart.find(a => a.day === 'Sat')?.count} members)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Peak Hours */}
        <Grid item xs={12} md={4}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight="bold" mb={2}>Peak Hours Today</Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {mockPeakHours.slice(0, 5).map(h => (
                  <Box key={h.hour} display="flex" alignItems="center" gap={1.5}>
                    <Typography variant="caption" sx={{ width: 60, color: 'text.secondary', flexShrink: 0 }}>{h.hour}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(h.count / 55) * 100}
                      sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 3 } }}
                    />
                    <Typography variant="caption" sx={{ width: 24, textAlign: 'right', color: 'text.secondary' }}>{h.count}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 4: Recent Activity */}
      <Grid container spacing={2}>
        {/* Recent Check-ins */}
        <Grid item xs={12} md={6}>
          <Card elevation={0}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2" fontWeight="bold">Recent Check-ins</Typography>
                <Button size="small" variant="text" color="primary" href="/attendance">View All</Button>
              </Box>
              <Box display="flex" flexDirection="column" gap={1}>
                {mockAttendanceLogs.slice(0, 5).map(log => (
                  <Box key={log.id} display="flex" alignItems="center" gap={1.5} py={0.75} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark', fontSize: '0.75rem' }}>
                      {log.member.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="600">{log.member}</Typography>
                      <Typography variant="caption" color="text.secondary">{log.date} · {log.checkIn}</Typography>
                    </Box>
                    <Chip
                      label={log.checkOut ? log.duration : 'Inside'}
                      size="small"
                      color={log.checkOut ? 'default' : 'success'}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Payments */}
        <Grid item xs={12} md={6}>
          <Card elevation={0}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2" fontWeight="bold">Recent Payments</Typography>
                <Button size="small" variant="text" color="primary" href="/payments">View All</Button>
              </Box>
              <Box display="flex" flexDirection="column" gap={1}>
                {mockPayments.slice(0, 5).map(pay => (
                  <Box key={pay.id} display="flex" alignItems="center" gap={1.5} py={0.75} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.dark', fontSize: '0.75rem' }}>
                      {pay.member.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="600">{pay.member}</Typography>
                      <Typography variant="caption" color="text.secondary">{pay.plan} · {pay.method}</Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="body2" fontWeight="bold">₹{pay.amount.toLocaleString()}</Typography>
                      <Chip label={pay.status} size="small" color={statusColor[pay.status] || 'default'} sx={{ fontSize: '0.65rem', height: 18 }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  );
}
