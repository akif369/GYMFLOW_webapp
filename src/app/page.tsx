'use client';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Divider, Stack, LinearProgress, alpha,
} from '@mui/material';
import { BarChart, LineChart, SparkLineChart } from '@mui/x-charts';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import PersonOffRoundedIcon from '@mui/icons-material/PersonOffRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import SportsMartialArtsRoundedIcon from '@mui/icons-material/SportsMartialArtsRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import Link from 'next/link';
import {
  mockDashboardStats, mockRevenueChart, mockAttendanceChart,
  mockAttendanceLogs, mockPayments, mockPeakHours,
} from '@/lib/mockData';

// --- Stat Card ---
interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: any;
  color?: string;
  trend?: number;
  sparkData?: number[];
}

function StatCard({ title, value, sub, icon: Icon, color = '#10b981', trend, sparkData }: StatCardProps) {
  const trendUp = (trend ?? 0) >= 0;
  return (
    <Card elevation={0} sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle glow */}
      <Box sx={{
        position: 'absolute', inset: 0, opacity: 0.03,
        background: `radial-gradient(circle at top right, ${color}, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <CardContent sx={{ position: 'relative' }}>
        <Stack direction="row" mb={1.5} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box
            sx={{
              width: 36, height: 36, borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: alpha(color, 0.12),
            }}
          >
            <Icon sx={{ fontSize: 19, color }} />
          </Box>
          {trend !== undefined && (
            <Box
              sx={{
                display: "flex", alignItems: "center", gap: 0.3,
                px: 0.75, py: 0.25, borderRadius: 1,
                bgcolor: alpha(trendUp ? '#22c55e' : '#f43f5e', 0.1),
              }}
            >
              {trendUp
                ? <ArrowUpwardRoundedIcon sx={{ fontSize: 11, color: '#4ade80' }} />
                : <ArrowDownwardRoundedIcon sx={{ fontSize: 11, color: '#fb7185' }} />
              }
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: trendUp ? '#4ade80' : '#fb7185' }}>
                {Math.abs(trend)}%
              </Typography>
            </Box>
          )}
        </Stack>

        <Typography variant="caption" sx={{ color: '#7d8590', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={800} sx={{ color: '#f0f6fc', mt: 0.25, letterSpacing: '-0.5px', fontSize: '1.6rem' }}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" sx={{ color: '#7d8590', fontSize: '0.7rem' }}>{sub}</Typography>
        )}

        {sparkData && (
          <Box sx={{ mt: 1.5, mx: -0.5 }}>
            <SparkLineChart
              data={sparkData}
              height={36}
              colors={[color]}
              curve="natural"
              area
              sx={{ '& .MuiChartsArea-root': { opacity: 0.15 } }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// --- Mini Activity Row ---
function ActivityRow({ avatar, name, sub, right, rightSub, dotColor }: any) {
  return (
    <Box
      sx={{
        display: "flex", alignItems: "center", gap: 1.5, py: 1,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        '&:last-child': { borderBottom: 0 }
      }}
    >
      <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(dotColor || '#10b981', 0.15), color: dotColor || '#34d399', fontSize: '0.72rem', fontWeight: 700 }}>
        {avatar}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap sx={{ color: '#f0f6fc', fontSize: '0.82rem' }}>{name}</Typography>
        <Typography variant="caption" noWrap sx={{ color: '#7d8590', fontSize: '0.7rem' }}>{sub}</Typography>
      </Box>
      <Box sx={{ textAlign: "right", flexShrink: 0 }}>
        <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.82rem', color: '#f0f6fc' }}>{right}</Typography>
        {rightSub && <Typography variant="caption" sx={{ color: '#7d8590', fontSize: '0.68rem' }}>{rightSub}</Typography>}
      </Box>
    </Box>
  );
}

const payStatusColor: Record<string, string> = {
  PAID: '#4ade80', PENDING: '#fbbf24', PARTIALLY_PAID: '#fbbf24', FAILED: '#fb7185',
};

export default function Dashboard() {
  const s = mockDashboardStats;
  const revenueData = mockRevenueChart.map(r => r.revenue);
  const attendanceData = mockAttendanceChart.map(a => a.count);

  return (
    <AppLayout>
      {/* ─── Page Header ─── */}
      <Stack direction="row" mb={3} gap={2} sx={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#f0f6fc', letterSpacing: '-0.5px' }}>
            Good morning, Sarah 👋
          </Typography>
          <Typography variant="body2" sx={{ color: '#7d8590', mt: 0.25 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · IronZone Fitness
          </Typography>
        </Box>
        <Stack direction="row" gap={1} sx={{ flexWrap: 'wrap' }}>
          <Button size="small" variant="contained" startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}>
            Add Member
          </Button>
          <Button size="small" variant="outlined" startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />}>
            Check In
          </Button>
          <Button size="small" variant="outlined" startIcon={<ReceiptRoundedIcon sx={{ fontSize: 16 }} />}>
            Add Payment
          </Button>
          <Button size="small" variant="outlined" startIcon={<AutorenewRoundedIcon sx={{ fontSize: 16 }} />}>
            Renew
          </Button>
          <Button size="small" variant="outlined" startIcon={<EventAvailableRoundedIcon sx={{ fontSize: 16 }} />}>
            Book PT
          </Button>
        </Stack>
      </Stack>

      {/* ─── Row 1: Primary Stats ─── */}
      <Grid container spacing={2} mb={2}>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Today's Check-ins"
            value={s.todaysCheckins}
            icon={AccessTimeRoundedIcon}
            color="#10b981"
            trend={12}
            sub="vs 42 yesterday"
            sparkData={[35, 40, 38, 44, 41, 47]}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Currently Inside"
            value={s.currentlyInside}
            icon={PeopleRoundedIcon}
            color="#06b6d4"
            sub="Live now"
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Today's Revenue"
            value={`₹${s.todaysRevenue.toLocaleString()}`}
            icon={AttachMoneyRoundedIcon}
            color="#22c55e"
            trend={8}
            sub="vs ₹7,300 avg"
            sparkData={[5200, 6100, 7300, 6800, 7100, 8500]}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Month Revenue"
            value={`₹${(s.monthRevenue / 1000).toFixed(0)}K`}
            icon={TrendingUpRoundedIcon}
            color="#8b5cf6"
            trend={8}
            sub="vs ₹131K last month"
            sparkData={[98, 112, 125, 118, 132, 138, 142]}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Pending Amount"
            value={`₹${(s.pendingAmount / 1000).toFixed(1)}K`}
            icon={WarningAmberRoundedIcon}
            color="#f59e0b"
            trend={-3}
            sub="14 members due"
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Expiring in 7d"
            value={s.expiringIn7Days}
            icon={AutorenewRoundedIcon}
            color="#f43f5e"
            sub="Need action"
          />
        </Grid>
      </Grid>

      {/* ─── Row 2: Secondary Stats ─── */}
      <Grid container spacing={2} mb={3}>
        {[
          { title: 'Active Members', value: s.activeMembers, icon: PeopleRoundedIcon, color: '#10b981' },
          { title: 'Inactive', value: s.inactiveMembers, icon: PersonOffRoundedIcon, color: '#7d8590' },
          { title: 'New This Month', value: s.newMembersMonth, icon: PersonAddRoundedIcon, color: '#22c55e', trend: 5 },
          { title: 'Expired', value: s.expiredMemberships, icon: PersonOffRoundedIcon, color: '#f43f5e' },
          { title: 'Trainers Working', value: `${s.trainersWorking}/3`, icon: FitnessCenterRoundedIcon, color: '#06b6d4' },
          { title: "Today's PT", value: s.todaysPtSessions, icon: SportsMartialArtsRoundedIcon, color: '#8b5cf6' },
        ].map((stat, i) => (
          <Grid xs={12} sm={6} md={4} lg={2} key={i}>
            <Card elevation={0}>
              <CardContent sx={{ py: '14px !important', px: '16px !important' }}>
                <Stack direction="row" gap={1.25} sx={{ alignItems: 'center' }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha(stat.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <stat.icon sx={{ fontSize: 17, color: stat.color }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.65rem', color: '#7d8590', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h6" fontWeight={800} sx={{ color: '#f0f6fc', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ─── Row 3: Charts ─── */}
      <Grid container spacing={2} mb={3}>
        {/* Revenue Chart */}
        <Grid xs={12} lg={8}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" mb={0.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#f0f6fc' }}>Revenue Overview</Typography>
                  <Typography variant="caption" sx={{ color: '#7d8590' }}>Monthly revenue for 2026</Typography>
                </Box>
                <Stack direction="row" gap={1}>
                  <Chip label="2026" size="small" color="primary" />
                </Stack>
              </Stack>
              <LineChart
                xAxis={[{
                  scaleType: 'point',
                  data: mockRevenueChart.map(r => r.month),
                  tickLabelStyle: { fontSize: 11, fill: '#7d8590' },
                }]}
                yAxis={[{
                  valueFormatter: (v) => `₹${(v / 1000).toFixed(0)}K`,
                  tickLabelStyle: { fontSize: 11, fill: '#7d8590' },
                }]}
                series={[{
                  data: revenueData,
                  label: 'Revenue',
                  color: '#10b981',
                  curve: 'natural',
                  area: true,
                  showMark: false,
                }]}
                height={220}
                sx={{
                  '& .MuiLineElement-root': { strokeWidth: 2.5 },
                  '& .MuiAreaElement-root': { fillOpacity: 0.08 },
                  '& .MuiChartsLegend-root': { display: 'none' },
                  '& .MuiChartsAxis-line': { stroke: 'rgba(255,255,255,0.06)' },
                  '& .MuiChartsAxis-tick': { stroke: 'rgba(255,255,255,0.06)' },
                }}
                margin={{ left: 60, right: 20, top: 16, bottom: 30 }}
                slotProps={{ legend: { hidden: true } }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Peak Hours */}
        <Grid xs={12} lg={4}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#f0f6fc' }} mb={0.5}>Peak Hours</Typography>
              <Typography variant="caption" sx={{ color: '#7d8590' }} mb={2} display="block">Today's gym traffic</Typography>
              <Stack gap={1.25}>
                {mockPeakHours.map(h => {
                  const max = 55;
                  const pct = Math.round((h.count / max) * 100);
                  const color = pct > 80 ? '#f43f5e' : pct > 60 ? '#f59e0b' : '#10b981';
                  return (
                    <Box key={h.hour}>
                      <Stack direction="row" mb={0.4} sx={{ justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: '#7d8590', fontSize: '0.7rem' }}>{h.hour}</Typography>
                        <Typography variant="caption" sx={{ color, fontWeight: 700, fontSize: '0.7rem' }}>{h.count}</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          '& .MuiLinearProgress-bar': { bgcolor: color },
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ─── Row 4: Weekly Attendance Chart ─── */}
      <Grid container spacing={2} mb={3}>
        <Grid xs={12} lg={7}>
          <Card elevation={0}>
            <CardContent>
              <Stack direction="row" mb={0.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#f0f6fc' }}>Weekly Attendance</Typography>
                  <Typography variant="caption" sx={{ color: '#7d8590' }}>Members per day this week</Typography>
                </Box>
              </Stack>
              <BarChart
                xAxis={[{
                  scaleType: 'band',
                  data: mockAttendanceChart.map(a => a.day),
                  tickLabelStyle: { fontSize: 11, fill: '#7d8590' },
                }]}
                yAxis={[{
                  tickLabelStyle: { fontSize: 11, fill: '#7d8590' },
                }]}
                series={[{
                  data: attendanceData,
                  label: 'Members',
                  color: '#06b6d4',
                }]}
                height={200}
                margin={{ left: 40, right: 10, top: 12, bottom: 30 }}
                sx={{
                  '& .MuiChartsAxis-line': { stroke: 'rgba(255,255,255,0.06)' },
                  '& .MuiChartsAxis-tick': { stroke: 'rgba(255,255,255,0.06)' },
                  '& .MuiBarElement-root': { rx: 4 },
                }}
                slotProps={{ legend: { hidden: true } }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Check-ins */}
        <Grid xs={12} lg={5}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" mb={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#f0f6fc' }}>Recent Check-ins</Typography>
                <Button component={Link} href="/attendance" size="small" variant="text" color="primary" sx={{ fontSize: '0.75rem' }}>
                  View all →
                </Button>
              </Stack>
              {mockAttendanceLogs.slice(0, 5).map(log => (
                <ActivityRow
                  key={log.id}
                  avatar={log.member.split(' ').map((n: string) => n[0]).join('')}
                  name={log.member}
                  sub={`${log.date} · Check-in ${log.checkIn}`}
                  right={log.checkOut ? log.duration : 'Inside'}
                  rightSub={log.checkOut ? undefined : log.checkIn}
                  dotColor={log.checkOut ? '#7d8590' : '#10b981'}
                />
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ─── Row 5: Recent Payments ─── */}
      <Card elevation={0}>
        <CardContent>
          <Stack direction="row" mb={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#f0f6fc' }}>Recent Payments</Typography>
            <Button component={Link} href="/payments" size="small" variant="text" color="primary" sx={{ fontSize: '0.75rem' }}>
              View all →
            </Button>
          </Stack>
          <Grid container spacing={1.5}>
            {mockPayments.map(pay => (
              <Grid xs={12} md={6} lg={4} key={pay.id}>
                <Box
                  sx={{
                    p: 1.5, borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.05)',
                    bgcolor: 'rgba(255,255,255,0.02)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' },
                    transition: 'all 0.15s',
                  }}
                >
                  <Stack direction="row" gap={1.5} sx={{ alignItems: 'center' }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: alpha('#8b5cf6', 0.15), color: '#a78bfa', fontSize: '0.72rem', fontWeight: 700 }}>
                      {pay.member.split(' ').map((n: string) => n[0]).join('')}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ color: '#f0f6fc', fontSize: '0.82rem' }}>{pay.member}</Typography>
                      <Stack direction="row" gap={0.5} sx={{ alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#7d8590', fontSize: '0.7rem' }}>{pay.method}</Typography>
                        <Typography variant="caption" sx={{ color: '#7d8590', fontSize: '0.7rem' }}>·</Typography>
                        <Typography variant="caption" sx={{ color: '#7d8590', fontSize: '0.7rem' }}>{pay.date}</Typography>
                      </Stack>
                    </Box>
                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                      <Typography variant="body2" fontWeight={800} sx={{ color: '#f0f6fc', fontSize: '0.9rem' }}>
                        ₹{pay.amount.toLocaleString()}
                      </Typography>
                      <Box
                        component="span"
                        sx={{
                          fontSize: '0.65rem', fontWeight: 700,
                          color: payStatusColor[pay.status] || '#7d8590',
                        }}
                      >
                        {pay.status}
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
