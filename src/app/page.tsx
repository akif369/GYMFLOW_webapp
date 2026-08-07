'use client';
import React, { type ElementType } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Stack, LinearProgress, alpha,
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
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Link from 'next/link';
import {
  mockDashboardStats, mockRevenueChart, mockAttendanceChart,
  mockAttendanceLogs, mockPayments, mockPeakHours,
} from '@/lib/mockData';

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: ElementType;
  color?: string;
  trend?: number;
  sparkData?: number[];
}

function KpiCard({ title, value, sub, icon: Icon, color = '#10b981', trend, sparkData }: KpiCardProps) {
  const trendUp = (trend ?? 0) >= 0;
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s, transform 0.18s',
        '&:hover': { borderColor: alpha(color, 0.45), transform: 'translateY(-2px)' },
      }}
    >
      {/* Top accent bar */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`,
      }} />

      <CardContent sx={{ p: '14px !important', pb: '12px !important' }}>
        {/* Icon row */}
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.25 }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: 1.5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: alpha(color, 0.14), border: `1px solid ${alpha(color, 0.22)}`,
          }}>
            <Icon sx={{ fontSize: 17, color }} />
          </Box>
          {trend !== undefined && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0.25,
              px: 0.6, py: 0.25, borderRadius: 0.75,
              bgcolor: alpha(trendUp ? '#22c55e' : '#f43f5e', 0.1),
            }}>
              {trendUp
                ? <ArrowUpwardRoundedIcon sx={{ fontSize: 10, color: '#4ade80' }} />
                : <ArrowDownwardRoundedIcon sx={{ fontSize: 10, color: '#fb7185' }} />
              }
              <Typography sx={{ fontSize: '0.63rem', fontWeight: 800, color: trendUp ? '#4ade80' : '#fb7185' }}>
                {Math.abs(trend)}%
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Label */}
        <Typography sx={{
          color: '#7d8590', fontWeight: 700, fontSize: '0.62rem',
          textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {title}
        </Typography>

        {/* Value */}
        <Typography sx={{
          color: '#f0f6fc', fontWeight: 800,
          fontSize: { xs: '1.3rem', xl: '1.5rem' },
          letterSpacing: '-0.03em', lineHeight: 1.1,
        }}>
          {value}
        </Typography>

        {/* Sub */}
        {sub && (
          <Typography sx={{
            color: '#5d6470', fontSize: '0.65rem', mt: 0.4,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {sub}
          </Typography>
        )}

        {/* Sparkline */}
        {sparkData && (
          <Box sx={{ mt: 1, mx: -0.5 }}>
            <SparkLineChart
              data={sparkData}
              height={28}
              color={color}
              curve="natural"
              area
              sx={{ '& .MuiChartsArea-root': { opacity: 0.1 } }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Mini Stat ────────────────────────────────────────────────────────────────
interface MiniStatProps {
  title: string;
  value: string | number;
  icon: ElementType;
  color: string;
  trend?: number;
}

function MiniStat({ title, value, icon: Icon, color, trend }: MiniStatProps) {
  return (
    <Card elevation={0} sx={{ height: '100%' }}>
      <CardContent sx={{ p: '12px !important' }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
          <Box sx={{
            width: 30, height: 30, borderRadius: 1.25, flexShrink: 0,
            bgcolor: alpha(color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon sx={{ fontSize: 15, color }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.59rem', color: '#7d8590', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>
              {title}
            </Typography>
            <Stack direction="row" sx={{ alignItems: 'baseline', gap: 0.5, mt: 0.25 }}>
              <Typography sx={{ color: '#f0f6fc', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {value}
              </Typography>
              {trend !== undefined && (
                <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: trend >= 0 ? '#4ade80' : '#fb7185' }}>
                  {trend >= 0 ? '+' : ''}{trend}%
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Activity Row ─────────────────────────────────────────────────────────────
interface ActivityRowProps {
  avatar: string;
  name: string;
  sub: string;
  right: string;
  rightSub?: string;
  dotColor?: string;
}

function ActivityRow({ avatar, name, sub, right, rightSub, dotColor }: ActivityRowProps) {
  const isInside = !rightSub;
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.25, py: 0.9,
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      '&:last-child': { borderBottom: 0 },
    }}>
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <Avatar sx={{
          width: 30, height: 30,
          bgcolor: alpha(dotColor || '#10b981', 0.15),
          color: dotColor || '#34d399',
          fontSize: '0.65rem', fontWeight: 800,
        }}>{avatar}</Avatar>
        {isInside && (
          <Box sx={{
            position: 'absolute', bottom: 0, right: 0,
            width: 8, height: 8, borderRadius: '50%',
            bgcolor: '#10b981', border: '2px solid #0a0a0a',
          }} />
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ color: '#f0f6fc', fontWeight: 600, fontSize: '0.79rem' }} noWrap>{name}</Typography>
        <Typography sx={{ color: '#7d8590', fontSize: '0.67rem' }} noWrap>{sub}</Typography>
      </Box>
      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography sx={{ fontSize: '0.79rem', fontWeight: 700, color: isInside ? '#34d399' : '#f0f6fc' }}>
          {right}
        </Typography>
        {rightSub && <Typography sx={{ color: '#7d8590', fontSize: '0.65rem' }}>{rightSub}</Typography>}
      </Box>
    </Box>
  );
}

// ─── Card Header ──────────────────────────────────────────────────────────────
function CardHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.75 }}>
      <Box>
        <Typography sx={{ color: '#f0f6fc', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '-0.01em' }}>
          {title}
        </Typography>
        {sub && <Typography sx={{ color: '#7d8590', fontSize: '0.68rem', mt: 0.2 }}>{sub}</Typography>}
      </Box>
      {action}
    </Stack>
  );
}

const payStatusColor: Record<string, string> = {
  PAID: '#4ade80', PENDING: '#fbbf24', PARTIALLY_PAID: '#fbbf24', FAILED: '#fb7185',
};
const payStatusBg: Record<string, string> = {
  PAID: alpha('#22c55e', 0.1), PENDING: alpha('#f59e0b', 0.1), PARTIALLY_PAID: alpha('#f59e0b', 0.1), FAILED: alpha('#f43f5e', 0.1),
};

// ─── Dashboard Page ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const s = mockDashboardStats;
  const revenueData = mockRevenueChart.map(r => r.revenue);
  const attendanceData = mockAttendanceChart.map(a => a.count);

  return (
    <AppLayout>

      {/* ─── Page Header ─────────────────────────────────────────────────── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 3 }}
      >
        <Box>
          <Typography sx={{ color: '#f0f6fc', fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            Good morning, Sarah 👋
          </Typography>
          <Typography sx={{ color: '#7d8590', fontSize: '0.75rem', mt: 0.3 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            <Box component="span" sx={{ mx: 0.75, color: 'rgba(255,255,255,0.15)' }}>·</Box>
            IronZone Fitness
          </Typography>
        </Box>

        <Stack direction="row" sx={{ flexShrink: 0, gap: 0.75 }}>
          <Button size="small" variant="contained" color="primary"
            startIcon={<AddRoundedIcon sx={{ fontSize: 14 }} />}
            sx={{ borderRadius: 1.5, fontWeight: 700, fontSize: '0.76rem', px: 1.5, py: 0.6 }}
          >Add Member</Button>
          <Button size="small" variant="outlined"
            startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 14 }} />}
            sx={{ borderRadius: 1.5, fontSize: '0.76rem', px: 1.25 }}
          >Check In</Button>
          <Button size="small" variant="outlined"
            startIcon={<ReceiptRoundedIcon sx={{ fontSize: 14 }} />}
            sx={{ borderRadius: 1.5, fontSize: '0.76rem', px: 1.25, display: { xs: 'none', md: 'inline-flex' } }}
          >Payment</Button>
          <Button size="small" variant="outlined"
            startIcon={<EventAvailableRoundedIcon sx={{ fontSize: 14 }} />}
            sx={{ borderRadius: 1.5, fontSize: '0.76rem', px: 1.25, display: { xs: 'none', lg: 'inline-flex' } }}
          >Book PT</Button>
        </Stack>
      </Stack>

      {/* ─── Live Strip ───────────────────────────────────────────────────── */}
      <Box sx={{
        mb: 3, px: 2, py: 1,
        borderRadius: 2, border: '1px solid rgba(16,185,129,0.2)',
        bgcolor: alpha('#10b981', 0.04),
        display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
      }}>
        <Stack direction="row" sx={{ alignItems: 'center', flexShrink: 0, gap: 0.75 }}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
          <Typography sx={{ color: '#34d399', fontWeight: 800, fontSize: '0.65rem', letterSpacing: '0.08em' }}>LIVE</Typography>
        </Stack>
        <Box sx={{ width: 1, height: 14, bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
          {[
            { label: 'Inside Now', val: `${s.currentlyInside} members` },
            { label: "Today's Check-ins", val: `${s.todaysCheckins} total` },
            { label: 'PT Sessions', val: `${s.todaysPtSessions} scheduled` },
          ].map(item => (
            <Stack key={item.label} direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ color: '#5d6470', fontSize: '0.68rem' }}>{item.label}:</Typography>
              <Typography sx={{ color: '#f0f6fc', fontWeight: 700, fontSize: '0.72rem' }}>{item.val}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* ─── Row 1: Primary KPIs ─────────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        {[
          { title: "Today's Check-ins", value: s.todaysCheckins, icon: AccessTimeRoundedIcon, color: '#10b981', trend: 12, sub: 'vs 42 yesterday', sparkData: [35,40,38,44,41,47] },
          { title: "Today's Revenue", value: `₹${s.todaysRevenue.toLocaleString()}`, icon: AttachMoneyRoundedIcon, color: '#22c55e', trend: 8, sub: 'vs ₹7,300 avg', sparkData: [5200,6100,7300,6800,7100,8500] },
          { title: 'Month Revenue', value: `₹${(s.monthRevenue/1000).toFixed(0)}K`, icon: TrendingUpRoundedIcon, color: '#8b5cf6', trend: 8, sub: 'vs ₹131K last month', sparkData: [98,112,125,118,132,138,142] },
          { title: 'Active Members', value: s.activeMembers, icon: PeopleRoundedIcon, color: '#06b6d4', sub: 'Total enrolled' },
          { title: 'Pending Amount', value: `₹${(s.pendingAmount/1000).toFixed(1)}K`, icon: WarningAmberRoundedIcon, color: '#f59e0b', trend: -3, sub: '14 members due' },
          { title: 'Expiring in 7d', value: s.expiringIn7Days, icon: AutorenewRoundedIcon, color: '#f43f5e', sub: 'Need action' },
        ].map((card, i) => (
          <Grid size={{ xs: 6, sm: 4, md: 4, lg: 2 }} key={i}>
            <KpiCard {...card} />
          </Grid>
        ))}
      </Grid>
      </Box>

      {/* ─── Row 2: Secondary Stats ───────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        {[
          { title: 'Inactive', value: s.inactiveMembers, icon: PersonOffRoundedIcon, color: '#6b7280' },
          { title: 'New This Month', value: s.newMembersMonth, icon: PersonAddRoundedIcon, color: '#22c55e', trend: 5 },
          { title: 'Expired', value: s.expiredMemberships, icon: PersonOffRoundedIcon, color: '#f43f5e' },
          { title: 'Trainers Working', value: `${s.trainersWorking}/3`, icon: FitnessCenterRoundedIcon, color: '#06b6d4' },
          { title: "Today's PT", value: s.todaysPtSessions, icon: SportsMartialArtsRoundedIcon, color: '#8b5cf6' },
          { title: 'New Leads', value: 5, icon: TrendingUpRoundedIcon, color: '#f59e0b', trend: 12 },
        ].map((stat, i) => (
          <Grid size={{ xs: 6, sm: 4, md: 4, lg: 2 }} key={i}>
            <MiniStat {...stat} />
          </Grid>
        ))}
      </Grid>
      </Box>

      {/* ─── Row 3: Revenue Chart + Peak Hours ───────────────────────────── */}
      <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        {/* Revenue Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent>
              <CardHeader
                title="Revenue Overview"
                sub="Monthly revenue for 2026"
                action={
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
                    <Stack direction="row" sx={{ gap: 2 }}>
                      {[
                        { label: 'This Month', value: `₹${(s.monthRevenue/1000).toFixed(0)}K`, color: '#10b981' },
                        { label: 'Growth', value: '+8%', color: '#4ade80' },
                      ].map(m => (
                        <Box key={m.label} sx={{ display: { xs: 'none', sm: 'block' } }}>
                          <Typography sx={{ fontSize: '0.58rem', color: '#7d8590', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</Typography>
                          <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: m.color, letterSpacing: '-0.02em' }}>{m.value}</Typography>
                        </Box>
                      ))}
                    </Stack>
                    <Chip label="2026" size="small" color="primary" sx={{ ml: 0.5 }} />
                  </Stack>
                }
              />
              <LineChart
                xAxis={[{
                  scaleType: 'point',
                  data: mockRevenueChart.map(r => r.month),
                  tickLabelStyle: { fontSize: 10, fill: '#7d8590' },
                }]}
                yAxis={[{
                  valueFormatter: (v: number) => `₹${(v/1000).toFixed(0)}K`,
                  tickLabelStyle: { fontSize: 10, fill: '#7d8590' },
                }]}
                series={[{
                  data: revenueData,
                  label: 'Revenue',
                  color: '#10b981',
                  curve: 'natural',
                  area: true,
                  showMark: false,
                }]}
                height={190}
                sx={{
                  '& .MuiLineElement-root': { strokeWidth: 2.5 },
                  '& .MuiAreaElement-root': { fillOpacity: 0.1 },
                  '& .MuiChartsLegend-root': { display: 'none' },
                  '& .MuiChartsAxis-line': { stroke: 'rgba(255,255,255,0.06)' },
                  '& .MuiChartsAxis-tick': { stroke: 'rgba(255,255,255,0.06)' },
                }}
                margin={{ left: 54, right: 16, top: 8, bottom: 26 }}
                hideLegend
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Peak Hours */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent>
              <CardHeader title="Peak Hours" sub="Today's gym traffic" />
              <Stack sx={{ gap: 1.25 }}>
                {mockPeakHours.map(h => {
                  const pct = Math.round((h.count / 55) * 100);
                  const color = pct > 80 ? '#f43f5e' : pct > 60 ? '#f59e0b' : '#10b981';
                  return (
                    <Box key={h.hour}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                        <Typography sx={{ color: '#7d8590', fontSize: '0.68rem' }}>{h.hour}</Typography>
                        <Typography sx={{ color, fontWeight: 700, fontSize: '0.68rem' }}>{h.count}</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 4, borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.05)',
                          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 2 },
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
      </Box>

      {/* ─── Row 4: Attendance + Check-ins ───────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0}>
            <CardContent>
              <CardHeader
                title="Weekly Attendance"
                sub="Members per day this week"
                action={<Chip label="This Week" size="small" color="secondary" sx={{ fontSize: '0.6rem' }} />}
              />
              <BarChart
                xAxis={[{
                  scaleType: 'band',
                  data: mockAttendanceChart.map(a => a.day),
                  tickLabelStyle: { fontSize: 10, fill: '#7d8590' },
                }]}
                yAxis={[{ tickLabelStyle: { fontSize: 10, fill: '#7d8590' } }]}
                series={[{ data: attendanceData, label: 'Members', color: '#06b6d4' }]}
                height={180}
                margin={{ left: 38, right: 10, top: 6, bottom: 26 }}
                sx={{
                  '& .MuiChartsAxis-line': { stroke: 'rgba(255,255,255,0.06)' },
                  '& .MuiChartsAxis-tick': { stroke: 'rgba(255,255,255,0.06)' },
                  '& .MuiBarElement-root': { rx: 3 },
                }}
                hideLegend
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent>
              <CardHeader
                title="Recent Check-ins"
                action={
                  <Button component={Link} href="/attendance" size="small" variant="text" color="primary"
                    endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 12 }} />}
                    sx={{ fontSize: '0.68rem', px: 0.75, minHeight: 'auto', py: 0.25 }}
                  >View all</Button>
                }
              />
              {mockAttendanceLogs.slice(0, 6).map(log => (
                <ActivityRow
                  key={log.id}
                  avatar={log.member.split(' ').map((n: string) => n[0]).join('')}
                  name={log.member}
                  sub={`${log.date} · ${log.checkIn}`}
                  right={log.checkOut ? log.duration : 'Inside'}
                  rightSub={log.checkOut ? log.duration : undefined}
                  dotColor={log.checkOut ? '#7d8590' : '#10b981'}
                />
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </Box>

      {/* ─── Row 5: Recent Payments ───────────────────────────────────────── */}
      <Card elevation={0}>
        <CardContent>
          <CardHeader
            title="Recent Payments"
            action={
              <Button component={Link} href="/payments" size="small" variant="text" color="primary"
                endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 12 }} />}
                sx={{ fontSize: '0.68rem', px: 0.75, minHeight: 'auto', py: 0.25 }}
              >View all</Button>
            }
          />
          <Grid container spacing={1.5}>
            {mockPayments.map(pay => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={pay.id}>
                <Box sx={{
                  p: 1.5, borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.06)',
                  bgcolor: 'rgba(255,255,255,0.02)',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', transform: 'translateY(-1px)' },
                }}>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
                    <Avatar sx={{
                      width: 32, height: 32, flexShrink: 0,
                      bgcolor: alpha('#8b5cf6', 0.15), color: '#a78bfa',
                      fontSize: '0.65rem', fontWeight: 800,
                    }}>
                      {pay.member.split(' ').map((n: string) => n[0]).join('')}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ color: '#f0f6fc', fontWeight: 600, fontSize: '0.79rem' }} noWrap>
                        {pay.member}
                      </Typography>
                      <Typography sx={{ color: '#7d8590', fontSize: '0.65rem' }}>
                        {pay.method} · {pay.date}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography sx={{ color: '#f0f6fc', fontWeight: 800, fontSize: '0.85rem' }}>
                        ₹{pay.amount.toLocaleString()}
                      </Typography>
                      <Box sx={{
                        display: 'inline-block', px: 0.6, py: 0.1, borderRadius: 0.75,
                        bgcolor: payStatusBg[pay.status] || 'rgba(255,255,255,0.05)',
                        fontSize: '0.58rem', fontWeight: 800,
                        color: payStatusColor[pay.status] || '#7d8590',
                      }}>
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
