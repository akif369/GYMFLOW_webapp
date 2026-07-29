'use client';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Divider, Stack, LinearProgress, alpha, IconButton,
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
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
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
  icon: any;
  color?: string;
  trend?: number;
  sparkData?: number[];
  href?: string;
}

function KpiCard({ title, value, sub, icon: Icon, color = '#10b981', trend, sparkData, href }: KpiCardProps) {
  const trendUp = (trend ?? 0) >= 0;
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        transition: 'border-color 0.2s, transform 0.2s',
        '&:hover': { borderColor: alpha(color, 0.4), transform: 'translateY(-2px)' },
        cursor: href ? 'pointer' : 'default',
      }}
    >
      {/* Subtle color bleed at top */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`,
      }} />

      <CardContent sx={{ p: '20px !important', pb: '16px !important' }}>
        {/* Top row: icon + trend badge */}
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} mb={2}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: alpha(color, 0.12),
              border: `1px solid ${alpha(color, 0.2)}`,
            }}
          >
            <Icon sx={{ fontSize: 20, color }} />
          </Box>
          {trend !== undefined && (
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.3,
                px: 0.75, py: 0.3, borderRadius: 1,
                bgcolor: alpha(trendUp ? '#22c55e' : '#f43f5e', 0.1),
              }}
            >
              {trendUp
                ? <ArrowUpwardRoundedIcon sx={{ fontSize: 11, color: '#4ade80' }} />
                : <ArrowDownwardRoundedIcon sx={{ fontSize: 11, color: '#fb7185' }} />
              }
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: trendUp ? '#4ade80' : '#fb7185' }}>
                {Math.abs(trend)}%
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Label */}
        <Typography sx={{
          color: '#7d8590', fontWeight: 700, fontSize: '0.68rem',
          textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5,
        }}>
          {title}
        </Typography>

        {/* Value */}
        <Typography sx={{
          color: '#f0f6fc', fontWeight: 800, fontSize: '1.7rem',
          letterSpacing: '-0.03em', lineHeight: 1.1,
        }}>
          {value}
        </Typography>

        {/* Sub */}
        {sub && (
          <Typography sx={{ color: '#7d8590', fontSize: '0.72rem', mt: 0.5 }}>
            {sub}
          </Typography>
        )}

        {/* Sparkline */}
        {sparkData && (
          <Box sx={{ mt: 1.5, mx: -1 }}>
            <SparkLineChart
              data={sparkData}
              height={34}
              colors={[color]}
              curve="natural"
              area
              sx={{ '& .MuiChartsArea-root': { opacity: 0.12 } }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Mini Stat (secondary row) ────────────────────────────────────────────────
function MiniStat({ title, value, icon: Icon, color, trend }: any) {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: '16px !important' }}>
        <Stack direction="row" gap={1.5} sx={{ alignItems: 'center' }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: 1.5, flexShrink: 0,
            bgcolor: alpha(color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon sx={{ fontSize: 18, color }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.62rem', color: '#7d8590', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {title}
            </Typography>
            <Stack direction="row" sx={{ alignItems: 'baseline' }} gap={0.75}>
              <Typography sx={{ color: '#f0f6fc', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {value}
              </Typography>
              {trend !== undefined && (
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: trend >= 0 ? '#4ade80' : '#fb7185' }}>
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
function ActivityRow({ avatar, name, sub, right, rightSub, dotColor }: any) {
  const isInside = !rightSub;
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, py: 1.1,
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        '&:last-child': { borderBottom: 0 },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Avatar sx={{
          width: 34, height: 34,
          bgcolor: alpha(dotColor || '#10b981', 0.15),
          color: dotColor || '#34d399',
          fontSize: '0.7rem', fontWeight: 800,
        }}>
          {avatar}
        </Avatar>
        {isInside && (
          <Box sx={{
            position: 'absolute', bottom: 0, right: 0,
            width: 9, height: 9, borderRadius: '50%',
            bgcolor: '#10b981', border: '2px solid #0a0a0a',
          }} />
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ color: '#f0f6fc', fontWeight: 600, fontSize: '0.82rem' }} noWrap>{name}</Typography>
        <Typography sx={{ color: '#7d8590', fontSize: '0.7rem' }} noWrap>{sub}</Typography>
      </Box>
      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: isInside ? '#34d399' : '#f0f6fc' }}>
          {right}
        </Typography>
        {rightSub && (
          <Typography sx={{ color: '#7d8590', fontSize: '0.68rem' }}>{rightSub}</Typography>
        )}
      </Box>
    </Box>
  );
}

const payStatusColor: Record<string, string> = {
  PAID: '#4ade80', PENDING: '#fbbf24', PARTIALLY_PAID: '#fbbf24', FAILED: '#fb7185',
};
const payStatusBg: Record<string, string> = {
  PAID: alpha('#22c55e', 0.1), PENDING: alpha('#f59e0b', 0.1), PARTIALLY_PAID: alpha('#f59e0b', 0.1), FAILED: alpha('#f43f5e', 0.1),
};

// ─── Card Header ──────────────────────────────────────────────────────────────
function CardHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} mb={2.5}>
      <Box>
        <Typography sx={{ color: '#f0f6fc', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
          {title}
        </Typography>
        {sub && (
          <Typography sx={{ color: '#7d8590', fontSize: '0.72rem', mt: 0.25 }}>
            {sub}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  );
}

import React from 'react';

// ─── Dashboard Page ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const s = mockDashboardStats;
  const revenueData = mockRevenueChart.map(r => r.revenue);
  const attendanceData = mockAttendanceChart.map(a => a.count);

  return (
    <AppLayout>

      {/* ─── Page Header ─────────────────────────────────────────────────── */}
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2.5 }}>
          <Box>
            <Typography sx={{ color: '#f0f6fc', fontWeight: 800, fontSize: '1.55rem', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
              Good morning, Sarah 👋
            </Typography>
            <Typography sx={{ color: '#7d8590', fontSize: '0.8rem', mt: 0.5 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              <Box component="span" sx={{ mx: 1, color: 'rgba(255,255,255,0.2)' }}>·</Box>
              IronZone Fitness
            </Typography>
          </Box>

          {/* Action buttons */}
          <Stack direction="row" gap={1} sx={{ flexShrink: 0 }}>
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{ borderRadius: 2, fontWeight: 700, px: 2 }}
            >
              Add Member
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{ borderRadius: 2, px: 1.75 }}
            >
              Check In
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ReceiptRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{ borderRadius: 2, px: 1.75, display: { xs: 'none', md: 'inline-flex' } }}
            >
              Payment
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<EventAvailableRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{ borderRadius: 2, px: 1.75, display: { xs: 'none', lg: 'inline-flex' } }}
            >
              Book PT
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* ─── Live Activity Strip ──────────────────────────────────────────── */}
      <Box
        sx={{
          mb: 3,
          px: 2.5, py: 1.5,
          borderRadius: 3,
          border: '1px solid rgba(16,185,129,0.2)',
          bgcolor: alpha('#10b981', 0.05),
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Stack direction="row" gap={1} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse 2s infinite' }} />
          <Typography sx={{ color: '#34d399', fontWeight: 700, fontSize: '0.78rem' }}>LIVE</Typography>
        </Stack>
        <Divider orientation="vertical" flexItem sx={{ height: 16, alignSelf: 'center' }} />
        <Stack direction="row" gap={2.5} sx={{ flexWrap: 'wrap' }}>
          {[
            { label: 'Inside Now', value: `${s.currentlyInside} members` },
            { label: "Today's Check-ins", value: `${s.todaysCheckins} total` },
            { label: 'PT Sessions Today', value: `${s.todaysPtSessions} scheduled` },
          ].map(item => (
            <Stack key={item.label} direction="row" gap={0.75} sx={{ alignItems: 'center' }}>
              <Typography sx={{ color: '#7d8590', fontSize: '0.72rem' }}>{item.label}:</Typography>
              <Typography sx={{ color: '#f0f6fc', fontWeight: 700, fontSize: '0.78rem' }}>{item.value}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* ─── Row 1: Primary KPIs ─────────────────────────────────────────── */}
      <Grid container spacing={2} mb={2}>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            title="Today's Check-ins"
            value={s.todaysCheckins}
            icon={AccessTimeRoundedIcon}
            color="#10b981"
            trend={12}
            sub="vs 42 yesterday"
            sparkData={[35, 40, 38, 44, 41, 47]}
            href="/attendance"
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            title="Today's Revenue"
            value={`₹${s.todaysRevenue.toLocaleString()}`}
            icon={AttachMoneyRoundedIcon}
            color="#22c55e"
            trend={8}
            sub="vs ₹7,300 avg"
            sparkData={[5200, 6100, 7300, 6800, 7100, 8500]}
            href="/payments"
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <KpiCard
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
          <KpiCard
            title="Active Members"
            value={s.activeMembers}
            icon={PeopleRoundedIcon}
            color="#06b6d4"
            sub="Total enrolled"
            href="/members"
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            title="Pending Amount"
            value={`₹${(s.pendingAmount / 1000).toFixed(1)}K`}
            icon={WarningAmberRoundedIcon}
            color="#f59e0b"
            trend={-3}
            sub="14 members due"
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            title="Expiring in 7d"
            value={s.expiringIn7Days}
            icon={AutorenewRoundedIcon}
            color="#f43f5e"
            sub="Need action"
          />
        </Grid>
      </Grid>

      {/* ─── Row 2: Secondary Stats ───────────────────────────────────────── */}
      <Grid container spacing={2} mb={3}>
        {[
          { title: 'Inactive', value: s.inactiveMembers, icon: PersonOffRoundedIcon, color: '#6b7280' },
          { title: 'New This Month', value: s.newMembersMonth, icon: PersonAddRoundedIcon, color: '#22c55e', trend: 5 },
          { title: 'Expired', value: s.expiredMemberships, icon: PersonOffRoundedIcon, color: '#f43f5e' },
          { title: 'Trainers Working', value: `${s.trainersWorking}/3`, icon: FitnessCenterRoundedIcon, color: '#06b6d4' },
          { title: "Today's PT", value: s.todaysPtSessions, icon: SportsMartialArtsRoundedIcon, color: '#8b5cf6' },
          { title: 'New Leads', value: 5, icon: TrendingUpRoundedIcon, color: '#f59e0b', trend: 12 },
        ].map((stat, i) => (
          <Grid xs={6} sm={4} md={2} key={i}>
            <MiniStat {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* ─── Row 3: Charts ───────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={2}>
        {/* Revenue Chart */}
        <Grid xs={12} lg={8}>
          <Card elevation={0} sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <CardHeader
                title="Revenue Overview"
                sub="Monthly revenue for 2026"
                action={
                  <Stack direction="row" gap={1} sx={{ alignItems: 'center' }}>
                    <Chip label="2026" size="small" color="primary" />
                    <IconButton size="small" href="/payments" component={Link} sx={{ color: '#7d8590', '&:hover': { color: '#f0f6fc' } }}>
                      <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Stack>
                }
              />
              {/* Revenue KPIs */}
              <Stack direction="row" gap={3} mb={2}>
                {[
                  { label: 'This Month', value: `₹${(s.monthRevenue / 1000).toFixed(0)}K`, color: '#10b981' },
                  { label: 'Avg/Month', value: '₹131K', color: '#7d8590' },
                  { label: 'Growth', value: '+8%', color: '#4ade80' },
                ].map(m => (
                  <Box key={m.label}>
                    <Typography sx={{ fontSize: '0.65rem', color: '#7d8590', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</Typography>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: m.color, letterSpacing: '-0.02em' }}>{m.value}</Typography>
                  </Box>
                ))}
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
                height={200}
                sx={{
                  '& .MuiLineElement-root': { strokeWidth: 2.5 },
                  '& .MuiAreaElement-root': { fillOpacity: 0.1 },
                  '& .MuiChartsLegend-root': { display: 'none' },
                  '& .MuiChartsAxis-line': { stroke: 'rgba(255,255,255,0.06)' },
                  '& .MuiChartsAxis-tick': { stroke: 'rgba(255,255,255,0.06)' },
                }}
                margin={{ left: 60, right: 20, top: 10, bottom: 28 }}
                slotProps={{ legend: { hidden: true } }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Peak Hours */}
        <Grid xs={12} lg={4}>
          <Card elevation={0} sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <CardHeader title="Peak Hours" sub="Today's gym traffic" />
              <Stack gap={1.5}>
                {mockPeakHours.map(h => {
                  const max = 55;
                  const pct = Math.round((h.count / max) * 100);
                  const color = pct > 80 ? '#f43f5e' : pct > 60 ? '#f59e0b' : '#10b981';
                  return (
                    <Box key={h.hour}>
                      <Stack direction="row" mb={0.5} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#7d8590', fontSize: '0.72rem', fontWeight: 500 }}>{h.hour}</Typography>
                        <Stack direction="row" gap={0.75} sx={{ alignItems: 'center' }}>
                          <Typography sx={{ color, fontWeight: 700, fontSize: '0.72rem' }}>{h.count}</Typography>
                          <Typography sx={{ color: '#3d4349', fontSize: '0.65rem' }}>ppl</Typography>
                        </Stack>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 5, borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.05)',
                          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
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

      {/* ─── Row 4: Attendance + Check-ins ───────────────────────────────── */}
      <Grid container spacing={2} mb={2}>
        {/* Weekly Attendance */}
        <Grid xs={12} lg={7}>
          <Card elevation={0} sx={{ borderRadius: 3 }}>
            <CardContent>
              <CardHeader
                title="Weekly Attendance"
                sub="Members per day this week"
                action={
                  <Chip
                    label="This Week"
                    size="small"
                    color="secondary"
                    sx={{ fontSize: '0.65rem' }}
                  />
                }
              />
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
                height={190}
                margin={{ left: 40, right: 10, top: 8, bottom: 28 }}
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
          <Card elevation={0} sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <CardHeader
                title="Recent Check-ins"
                action={
                  <Button
                    component={Link}
                    href="/attendance"
                    size="small"
                    variant="text"
                    color="primary"
                    endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />}
                    sx={{ fontSize: '0.72rem', px: 1 }}
                  >
                    View all
                  </Button>
                }
              />
              <Stack gap={0}>
                {mockAttendanceLogs.slice(0, 5).map(log => (
                  <ActivityRow
                    key={log.id}
                    avatar={log.member.split(' ').map((n: string) => n[0]).join('')}
                    name={log.member}
                    sub={`${log.date} · Check-in ${log.checkIn}`}
                    right={log.checkOut ? log.duration : 'Inside'}
                    rightSub={log.checkOut ? log.duration : undefined}
                    dotColor={log.checkOut ? '#7d8590' : '#10b981'}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ─── Row 5: Recent Payments ───────────────────────────────────────── */}
      <Card elevation={0} sx={{ borderRadius: 3 }}>
        <CardContent>
          <CardHeader
            title="Recent Payments"
            action={
              <Button
                component={Link}
                href="/payments"
                size="small"
                variant="text"
                color="primary"
                endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />}
                sx={{ fontSize: '0.72rem', px: 1 }}
              >
                View all
              </Button>
            }
          />
          <Grid container spacing={1.5}>
            {mockPayments.map(pay => (
              <Grid xs={12} md={6} lg={4} key={pay.id}>
                <Box
                  sx={{
                    p: 1.75, borderRadius: 2.5,
                    border: '1px solid rgba(255,255,255,0.06)',
                    bgcolor: 'rgba(255,255,255,0.02)',
                    transition: 'all 0.15s',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.04)',
                      borderColor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Stack direction="row" gap={1.5} sx={{ alignItems: 'center' }}>
                    <Avatar sx={{
                      width: 36, height: 36,
                      bgcolor: alpha('#8b5cf6', 0.15), color: '#a78bfa',
                      fontSize: '0.72rem', fontWeight: 800, flexShrink: 0,
                    }}>
                      {pay.member.split(' ').map((n: string) => n[0]).join('')}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ color: '#f0f6fc', fontWeight: 600, fontSize: '0.82rem' }} noWrap>
                        {pay.member}
                      </Typography>
                      <Typography sx={{ color: '#7d8590', fontSize: '0.7rem' }}>
                        {pay.method} · {pay.date}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography sx={{ color: '#f0f6fc', fontWeight: 800, fontSize: '0.9rem' }}>
                        ₹{pay.amount.toLocaleString()}
                      </Typography>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 0.75, py: 0.1, borderRadius: 0.75,
                          bgcolor: payStatusBg[pay.status] || 'rgba(255,255,255,0.05)',
                          fontSize: '0.6rem', fontWeight: 800,
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
