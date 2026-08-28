'use client';
import React, { type ElementType, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Stack, LinearProgress, alpha, IconButton, useMediaQuery, useTheme,
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
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import Link from 'next/link';
import AddMemberDialog from '@/components/AddMemberDialog';
import PageSkeleton from '@/components/PageSkeleton';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useBranches } from '@/hooks/queries/branches';
type DashboardStats = {
  todaysCheckins: number; currentlyInside: number; todaysRevenue: number; monthRevenue: number;
  pendingAmount: number; expiringIn7Days: number; expiredMemberships: number; newMembersMonth: number;
  activeMembers: number; inactiveMembers: number; trainersWorking: number; totalTrainers: number; todaysPtSessions: number; newLeads: number;
};
type DashboardLog = { id: string; member: string; memberId: string; date: string; checkIn: string; checkOut: string | null; duration: string; method: string; branch: string };
type DashboardPayment = { id: string; member: string; memberId: string; amount: number; method: string; status: string; date: string; refId: string; plan: string };

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: ElementType;
  color?: string;
  trend?: number;
  sparkData?: number[];
  onClick?: () => void;
  actionLabel?: string;
}

function KpiCard({ title, value, sub, icon: Icon, color = '#10b981', trend, sparkData, onClick, actionLabel }: KpiCardProps) {
  const trendUp = (trend ?? 0) >= 0;
  return (
    <Card
      elevation={0}
      onClick={onClick}
      onKeyDown={event => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick();
        }
      }}
      role={onClick ? 'link' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={actionLabel}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s, transform 0.18s',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': { borderColor: alpha(color, 0.45), transform: onClick ? 'translateY(-2px)' : 'none' },
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
          color: 'text.secondary', fontWeight: 700, fontSize: '0.62rem',
          textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {title}
        </Typography>

        {/* Value */}
        <Typography sx={{
          color: 'text.primary', fontWeight: 800,
          fontSize: { xs: '1.3rem', xl: '1.5rem' },
          letterSpacing: '-0.03em', lineHeight: 1.1,
        }}>
          {value}
        </Typography>

        {/* Sub */}
        {sub && (
          <Typography sx={{
            color: 'text.secondary', fontSize: '0.65rem', mt: 0.4,
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
  onClick?: () => void;
  actionLabel?: string;
}

function MiniStat({ title, value, icon: Icon, color, trend, onClick, actionLabel }: MiniStatProps) {
  return (
    <Card
      elevation={0}
      onClick={onClick}
      onKeyDown={event => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick();
        }
      }}
      role={onClick ? 'link' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={actionLabel}
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: onClick ? 'border-color 0.2s, transform 0.18s' : undefined,
        '&:hover': onClick ? { borderColor: alpha(color, 0.45), transform: 'translateY(-2px)' } : undefined,
      }}
    >
      <CardContent sx={{ p: '12px !important' }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
          <Box sx={{
            width: 30, height: 30, borderRadius: 1.25, flexShrink: 0,
            bgcolor: alpha(color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon sx={{ fontSize: 15, color }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.59rem', color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>
              {title}
            </Typography>
            <Stack direction="row" sx={{ alignItems: 'baseline', gap: 0.5, mt: 0.25 }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', lineHeight: 1 }}>
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
  const theme = useTheme();
  const isInside = !rightSub;
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.25, py: 0.9,
      borderBottom: '1px solid', borderBottomColor: 'divider',
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
            bgcolor: '#10b981', border: `2px solid ${theme.palette.background.paper}`,
          }} />
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.79rem' }} noWrap>{name}</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.67rem' }} noWrap>{sub}</Typography>
      </Box>
      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography sx={{ fontSize: '0.79rem', fontWeight: 700, color: isInside ? '#34d399' : 'text.primary' }}>
          {right}
        </Typography>
        {rightSub && <Typography sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>{rightSub}</Typography>}
      </Box>
    </Box>
  );
}

// ─── Card Header ──────────────────────────────────────────────────────────────
interface CardHeaderProps {
  title: string;
  sub?: string;
  action?: React.ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}

function CardHeader({ title, sub, action, collapsible, collapsed, onToggle }: CardHeaderProps) {
  return (
    <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.75, gap: 1 }}>
      <Box>
        <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '-0.01em' }}>
          {title}
        </Typography>
        {sub && <Typography sx={{ color: 'text.secondary', fontSize: '0.68rem', mt: 0.2 }}>{sub}</Typography>}
      </Box>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
        {action}
        {collapsible && (
          <IconButton
            aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${title}`}
            onClick={onToggle}
            size="small"
            sx={{
              display: { xs: 'inline-flex', sm: 'none' },
              color: 'text.secondary',
              p: 0.5,
              transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <ExpandMoreRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
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
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.firstName ?? 'there';

  // ── API state ────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueChart, setRevenueChart] = useState<{ month: string; revenue: number }[]>([]);
  const [attendanceChart, setAttendanceChart] = useState<{ day: string; count: number }[]>([]);
  const [peakHours, setPeakHours] = useState<{ hour: string; count: number }[]>([]);
  const [recentLogs, setRecentLogs] = useState<DashboardLog[]>([]);
  const [recentPayments, setRecentPayments] = useState<DashboardPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const { data: branchesData } = useBranches();
  const branches = branchesData?.branches || [];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await api.get('/dashboard');
        if (cancelled) return;
        const data = response.data;
        setStats(data.stats);
        setRevenueChart(data.revenueChart ?? []);
        setAttendanceChart(data.attendanceChart ?? []);
        setPeakHours(data.peakHours ?? []);
        setRecentLogs((data.recentLogs ?? []).map((log: Record<string, unknown>) => {
          const checkInAt = String(log.checkInAt ?? '');
          const checkOutAt = log.checkOutAt ? String(log.checkOutAt) : null;
          const minutes = checkOutAt ? Math.max(0, Math.round((new Date(checkOutAt).getTime() - new Date(checkInAt).getTime()) / 60000)) : 0;
          return { id: String(log.id), member: String(log.memberName ?? ''), memberId: String(log.memberId ?? ''), date: String(log.date ?? ''), checkIn: String(log.checkIn ?? ''), checkOut: log.checkOut ? String(log.checkOut) : null, duration: checkOutAt ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : 'Inside', method: String(log.method ?? 'MANUAL'), branch: '' };
        }));
        setRecentPayments((data.recentPayments ?? []).map((payment: Record<string, unknown>) => ({ id: String(payment.id), member: String(payment.memberName ?? ''), memberId: String(payment.memberId ?? ''), amount: Number(payment.amount ?? 0), method: String(payment.method ?? ''), status: String(payment.status ?? ''), date: String(payment.date ?? ''), refId: String(payment.refId ?? ''), plan: String(payment.plan ?? '') })));
      } catch {
        // Fallback gracefully — leave state as null/empty arrays
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const s = stats ?? { 
    todaysCheckins: 0, currentlyInside: 0, todaysRevenue: 0, monthRevenue: 0, activeMembers: 0,
    pendingAmount: 0, expiringIn7Days: 0, inactiveMembers: 0, newMembersMonth: 0,
    expiredMemberships: 0, trainersWorking: 0, totalTrainers: 0, todaysPtSessions: 0, newLeads: 0
  };
  const revenueData = revenueChart.length ? revenueChart.map(r => r.revenue) : [0, 0, 0, 0, 0, 0, 0];
  const attendanceData = attendanceChart.length ? attendanceChart.map(a => a.count) : [0, 0, 0, 0, 0, 0, 0];
  const peakHoursData = peakHours.length ? peakHours : [];
  const logsData = recentLogs.length ? recentLogs : [];
  const paymentsData = recentPayments.length ? recentPayments : [];
  const revChartLabels = revenueChart.length ? revenueChart.map(r => r.month) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const attChartLabels = attendanceChart.length ? attendanceChart.map(a => a.day) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const previousMonthRevenue = revenueData.at(-2) ?? 0;
  const currentMonthRevenue = revenueData.at(-1) ?? 0;
  const revenueGrowthLabel = previousMonthRevenue > 0
    ? `${Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)}% vs last month`
    : currentMonthRevenue > 0 ? 'New revenue this month' : 'No revenue yet';

  const cardLinks: Record<string, string> = {
    "Today's Check-ins": '/attendance',
    "Today's Revenue": '/payments',
    'Month Revenue': '/reports',
    'Active Members': '/members?filter=ACTIVE',
    'Pending Amount': '/members?filter=PAYMENT_PENDING',
    'Expiring in 7d': '/members?filter=EXPIRING',
    Inactive: '/members',
    'New This Month': '/members',
    Expired: '/members?filter=EXPIRED',
    'Trainers Working': '/trainers',
    "Today's PT": '/pt-sessions',
    'New Leads': '/leads',
  };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });
  const [expandedCards, setExpandedCards] = React.useState({
    revenue: false,
    peakHours: false,
    attendance: false,
  });

  const toggleCard = (card: keyof typeof expandedCards) => {
    setExpandedCards(previous => ({ ...previous, [card]: !previous[card] }));
  };

  const isCollapsed = (card: keyof typeof expandedCards) => isMobile && !expandedCards[card];

  if (loading) {
    return (
      <AppLayout>
        <PageSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout>

      {/* ─── Page Header ─────────────────────────────────────────────────── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 3 }}
      >
        <Box>
          <Typography sx={{ color: 'text.primary', fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            Good morning, {firstName}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 0.3 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            <Box component="span" sx={{ mx: 0.75, color: 'text.disabled' }}>·</Box>
            Gym dashboard
          </Typography>
        </Box>

        <Stack direction="row" sx={{ flexShrink: 0, gap: 0.75 }}>
          <Button size="small" variant="contained" color="primary"
            startIcon={<AddRoundedIcon sx={{ fontSize: 14 }} />}
            sx={{ borderRadius: 1.5, fontWeight: 700, fontSize: '0.76rem', px: 1.5, py: 0.6 }}
            onClick={() => setAddOpen(true)}
          >Add Member</Button>
          <Button size="small" variant="outlined"
            startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 14 }} />}
            sx={{ borderRadius: 1.5, fontSize: '0.76rem', px: 1.25 }}
            onClick={() => router.push('/attendance')}
          >Check In</Button>
          <Button size="small" variant="outlined"
            startIcon={<ReceiptRoundedIcon sx={{ fontSize: 14 }} />}
            sx={{ borderRadius: 1.5, fontSize: '0.76rem', px: 1.25, display: { xs: 'none', md: 'inline-flex' } }}
            onClick={() => router.push('/payments')}
          >Payment</Button>
          <Button size="small" variant="outlined"
            startIcon={<EventAvailableRoundedIcon sx={{ fontSize: 14 }} />}
            sx={{ borderRadius: 1.5, fontSize: '0.76rem', px: 1.25, display: { xs: 'none', lg: 'inline-flex' } }}
            onClick={() => router.push('/pt-sessions')}
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
        <Box sx={{ width: 1, height: 14, bgcolor: 'divider' }} />
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
          {[
            { label: 'Inside Now', val: loading ? '...' : `${s.currentlyInside} members` },
            { label: "Today's Check-ins", val: loading ? '...' : `${s.todaysCheckins} total` },
            { label: 'PT Sessions', val: loading ? '...' : `${s.todaysPtSessions} scheduled` },
          ].map(item => (
            <Stack key={item.label} direction="row" sx={{ alignItems: 'center', gap: 0.5, display: item.label === 'PT Sessions' ? { xs: 'none', sm: 'flex' } : 'flex' }}>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>{item.label}:</Typography>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: '0.72rem' }}>{item.val}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* ─── Row 1: Primary KPIs ─────────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        {[
          { title: "Today's Check-ins", value: s.todaysCheckins, icon: AccessTimeRoundedIcon, color: '#10b981' },
          { title: "Today's Revenue", value: `₹${s.todaysRevenue.toLocaleString()}`, icon: AttachMoneyRoundedIcon, color: '#22c55e' },
          { title: 'Month Revenue', value: `₹${(s.monthRevenue/1000).toFixed(0)}K`, icon: TrendingUpRoundedIcon, color: '#8b5cf6' },
          { title: 'Active Members', value: s.activeMembers, icon: PeopleRoundedIcon, color: '#06b6d4', sub: 'Total enrolled' },
          { title: 'Pending Amount', value: `₹${(s.pendingAmount/1000).toFixed(1)}K`, icon: WarningAmberRoundedIcon, color: '#f59e0b' },
          { title: 'Expiring in 7d', value: s.expiringIn7Days, icon: AutorenewRoundedIcon, color: '#f43f5e', sub: 'Need action' },
        ].map((card, i) => (
          <Grid size={{ xs: 6, sm: 4, md: 4, lg: 2 }} key={i}>
            <KpiCard
              {...card}
              onClick={() => router.push(cardLinks[card.title as keyof typeof cardLinks] || '/')}
              actionLabel={`View ${card.title}`}
            />
          </Grid>
        ))}
      </Grid>
      </Box>

      {/* ─── Row 2: Secondary Stats ───────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        {[
          { title: 'Inactive', value: s.inactiveMembers, icon: PersonOffRoundedIcon, color: '#6b7280' },
          { title: 'New This Month', value: s.newMembersMonth, icon: PersonAddRoundedIcon, color: '#22c55e' },
          { title: 'Expired', value: s.expiredMemberships, icon: PersonOffRoundedIcon, color: '#f43f5e' },
          { title: 'Trainers Working', value: `${s.trainersWorking}/${s.totalTrainers}`, icon: FitnessCenterRoundedIcon, color: '#06b6d4' },
          { title: "Today's PT", value: s.todaysPtSessions, icon: SportsMartialArtsRoundedIcon, color: '#8b5cf6' },
          { title: 'New Leads', value: s.newLeads, icon: TrendingUpRoundedIcon, color: '#f59e0b' },
        ].map((stat, i) => (
          <Grid size={{ xs: 6, sm: 4, md: 4, lg: 2 }} key={i} sx={{ display: ['Trainers Working', 'New Leads'].includes(stat.title) ? { xs: 'none', sm: 'block' } : 'block' }}>
            <MiniStat
              {...stat}
              onClick={() => router.push(cardLinks[stat.title as keyof typeof cardLinks] || '/')}
              actionLabel={`View ${stat.title}`}
            />
          </Grid>
        ))}
      </Grid>
      </Box>

      {/* Recent payments moves above revenue on mobile for faster daily review. */}
      <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 3 }}>
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
              {paymentsData.map(pay => (
                <Grid size={12} key={pay.id}>
                  <Box sx={{
                    p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
                      <Avatar sx={{ width: 32, height: 32, flexShrink: 0, bgcolor: alpha('#8b5cf6', 0.15), color: '#a78bfa', fontSize: '0.65rem', fontWeight: 800 }}>
                        {(pay.member ?? '').split(' ').map((n: string) => n[0]).join('')}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.79rem' }} noWrap>{pay.member}</Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>{pay.method} · {pay.date}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography sx={{ color: 'text.primary', fontWeight: 800, fontSize: '0.85rem' }}>₹{pay.amount.toLocaleString()}</Typography>
                        <Box sx={{ display: 'inline-block', px: 0.6, py: 0.1, borderRadius: 0.75, bgcolor: payStatusBg[pay.status] || 'rgba(255,255,255,0.05)', fontSize: '0.58rem', fontWeight: 800, color: payStatusColor[pay.status] || 'text.secondary' }}>{pay.status}</Box>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
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
                sub="Monthly revenue for the last 6 months"
                collapsible
                collapsed={isCollapsed('revenue')}
                onToggle={() => toggleCard('revenue')}
                action={
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
                    <Stack direction="row" sx={{ gap: 2 }}>
                      {[
                        { label: 'This Month', value: `₹${(s.monthRevenue/1000).toFixed(0)}K`, color: '#10b981' },
                      { label: 'Growth', value: revenueGrowthLabel, color: '#4ade80' },
                      ].map(m => (
                        <Box key={m.label} sx={{ display: { xs: 'none', sm: 'block' } }}>
                          <Typography sx={{ fontSize: '0.58rem', color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</Typography>
                          <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: m.color, letterSpacing: '-0.02em' }}>{m.value}</Typography>
                        </Box>
                      ))}
                    </Stack>
                    <Chip label="Last 6 months" size="small" color="primary" sx={{ ml: 0.5 }} />
                  </Stack>
                }
              />
              {!isCollapsed('revenue') && <LineChart
                xAxis={[{
                  scaleType: 'point',
                  data: revChartLabels,
                  tickLabelStyle: { fontSize: 10, fill: theme.palette.text.secondary },
                }]}
                yAxis={[{
                  valueFormatter: (v: number) => `₹${(v/1000).toFixed(0)}K`,
                  tickLabelStyle: { fontSize: 10, fill: theme.palette.text.secondary },
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
                  '& .MuiChartsAxis-line': { stroke: 'divider' },
                  '& .MuiChartsAxis-tick': { stroke: 'divider' },
                }}
                margin={{ left: 54, right: 16, top: 8, bottom: 26 }}
                hideLegend
              />}
            </CardContent>
          </Card>
        </Grid>

        {/* Peak Hours */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent>
              <CardHeader
                title="Peak Hours"
                sub="Today's gym traffic"
                collapsible
                collapsed={isCollapsed('peakHours')}
                onToggle={() => toggleCard('peakHours')}
              />
              {!isCollapsed('peakHours') && <Stack sx={{ gap: 1.25 }}>
                {peakHoursData.map(h => {
                  const pct = Math.round((h.count / 55) * 100);
                  const color = pct > 80 ? '#f43f5e' : pct > 60 ? '#f59e0b' : '#10b981';
                  return (
                    <Box key={h.hour}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>{h.hour}</Typography>
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
              </Stack>}
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
                collapsible
                collapsed={isCollapsed('attendance')}
                onToggle={() => toggleCard('attendance')}
                action={<Chip label="This Week" size="small" color="secondary" sx={{ fontSize: '0.6rem' }} />}
              />
              {!isCollapsed('attendance') && <BarChart
                xAxis={[{
                  scaleType: 'band',
                  data: attChartLabels,
                  tickLabelStyle: { fontSize: 10, fill: theme.palette.text.secondary },
                }]}
                yAxis={[{ tickLabelStyle: { fontSize: 10, fill: theme.palette.text.secondary } }]}
                series={[{ data: attendanceData, label: 'Members', color: '#06b6d4' }]}
                height={180}
                margin={{ left: 38, right: 10, top: 6, bottom: 26 }}
                sx={{
                  '& .MuiChartsAxis-line': { stroke: 'divider' },
                  '& .MuiChartsAxis-tick': { stroke: 'divider' },
                  '& .MuiBarElement-root': { rx: 3 },
                }}
                hideLegend
              />}
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
              {logsData.slice(0, 6).map(log => (
                <ActivityRow
                  key={log.id}
                  avatar={(log.member ?? '').split(' ').map((n: string) => n[0]).join('')}
                  name={log.member}
                  sub={`${log.date} · ${log.checkIn}`}
                  right={log.checkOut ? log.duration : 'Inside'}
                  rightSub={log.checkOut ? log.duration : undefined}
                  dotColor={log.checkOut ? theme.palette.text.secondary : '#10b981'}
                />
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </Box>

      {/* ─── Row 5: Recent Payments ───────────────────────────────────────── */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
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
            {paymentsData.map(pay => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={pay.id}>
                <Box sx={{
                  p: 1.5, borderRadius: 2,
                  border: '1px solid', borderColor: 'divider',
                  bgcolor: 'background.paper',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: 'divider', borderColor: 'divider', transform: 'translateY(-1px)' },
                }}>
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
                    <Avatar sx={{
                      width: 32, height: 32, flexShrink: 0,
                      bgcolor: alpha('#8b5cf6', 0.15), color: '#a78bfa',
                      fontSize: '0.65rem', fontWeight: 800,
                    }}>
                      {(pay.member ?? '').split(' ').map((n: string) => n[0]).join('')}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.79rem' }} noWrap>
                        {pay.member}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                        {pay.method} · {pay.date}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography sx={{ color: 'text.primary', fontWeight: 800, fontSize: '0.85rem' }}>
                        ₹{pay.amount.toLocaleString()}
                      </Typography>
                      <Box sx={{
                        display: 'inline-block', px: 0.6, py: 0.1, borderRadius: 0.75,
                        bgcolor: payStatusBg[pay.status] || 'rgba(255,255,255,0.05)',
                        fontSize: '0.58rem', fontWeight: 800,
                        color: payStatusColor[pay.status] || 'text.secondary',
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
      </Box>

      <AddMemberDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        branches={branches}
        onSuccess={() => {
          router.push('/members');
        }}
      />
    </AppLayout>
  );
}
