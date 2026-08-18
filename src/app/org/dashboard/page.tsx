'use client';
import type { ElementType } from 'react';
import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Stack,
  LinearProgress, alpha, Button, Avatar, Divider, Skeleton,
} from '@mui/material';
import { BarChart, LineChart, SparkLineChart } from '@mui/x-charts';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

// ── Mocked org-level data ─────────────────────────────────────────────────────
// In production, replace with: const { data } = useSWR('/org/dashboard/stats', fetcher)

const ORG_STATS = {
  totalRevenue: 842500,
  monthRevenue: 94300,
  revenueGrowth: 12.4,
  totalMembers: 2847,
  activeMembers: 2241,
  memberGrowth: 8.2,
  totalBranches: 4,
  activeBranches: 4,
  totalStaff: 38,
  activeTrainers: 14,
  totalPtSessions: 312,
  avgOccupancy: 68,
  expiredMemberships: 187,
  pendingAmount: 42000,
};

const BRANCH_PERFORMANCE = [
  { name: 'Koramangala', members: 820, revenue: 28400, growth: 15.2, occupancy: 82, status: 'ACTIVE' },
  { name: 'Indiranagar', members: 710, revenue: 24100, growth: 9.8, occupancy: 71, status: 'ACTIVE' },
  { name: 'HSR Layout', members: 648, revenue: 21800, growth: 6.4, occupancy: 64, status: 'ACTIVE' },
  { name: 'Whitefield', members: 669, revenue: 20000, growth: -1.2, occupancy: 55, status: 'ACTIVE' },
];

const MONTHLY_REVENUE = [62000, 71000, 68500, 74000, 80200, 85000, 91000, 94300];
const MONTHLY_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
const MEMBER_GROWTH = [2100, 2180, 2240, 2310, 2450, 2600, 2720, 2847];

const RECENT_ACTIVITY = [
  { id: '1', type: 'new_member', message: 'New member joined at Koramangala', time: '2 min ago', branch: 'Koramangala', severity: 'success' },
  { id: '2', type: 'payment', message: 'Payment of ₹8,000 received at Indiranagar', time: '12 min ago', branch: 'Indiranagar', severity: 'info' },
  { id: '3', type: 'expiry', message: '23 memberships expiring in 3 days — Whitefield', time: '1 hr ago', branch: 'Whitefield', severity: 'warning' },
  { id: '4', type: 'staff', message: 'New trainer onboarded at HSR Layout', time: '2 hr ago', branch: 'HSR Layout', severity: 'success' },
  { id: '5', type: 'alert', message: 'Attendance down 18% vs last week — Whitefield', time: '3 hr ago', branch: 'Whitefield', severity: 'error' },
];

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: ElementType;
  color?: string;
  trend?: number;
  sparkData?: number[];
}

function KpiCard({ title, value, sub, icon: Icon, color = '#f59e0b', trend, sparkData }: KpiCardProps) {
  const trendUp = (trend ?? 0) >= 0;
  return (
    <Card elevation={0} sx={{
      height: '100%', position: 'relative', overflow: 'hidden',
      transition: 'border-color 0.2s, transform 0.18s',
      '&:hover': { borderColor: alpha(color, 0.4), transform: 'translateY(-2px)' },
    }}>
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`,
      }} />
      <CardContent sx={{ p: '14px !important', pb: '12px !important' }}>
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
                : <ArrowDownwardRoundedIcon sx={{ fontSize: 10, color: '#f87171' }} />}
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: trendUp ? '#4ade80' : '#f87171' }}>
                {Math.abs(trend)}%
              </Typography>
            </Box>
          )}
        </Stack>
        <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.05em', color: 'text.primary', lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: '0.73rem', color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
          {title}
        </Typography>
        {sub && <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled', mt: 0.25 }}>{sub}</Typography>}
        {sparkData && (
          <Box sx={{ mt: 1.5, height: 36 }}>
            <SparkLineChart data={sparkData} color={color} height={36} showTooltip showHighlight />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ── Branch Performance Row ────────────────────────────────────────────────────

function BranchRow({ branch }: { branch: typeof BRANCH_PERFORMANCE[0] }) {
  const growthUp = branch.growth >= 0;
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 2,
      py: 1.5, px: 2,
      borderRadius: 2, cursor: 'pointer',
      '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
      transition: 'background 0.15s',
    }}>
      <Avatar sx={{
        width: 36, height: 36, fontSize: '0.82rem', fontWeight: 700,
        bgcolor: 'rgba(245,158,11,0.15)', color: '#f59e0b', flexShrink: 0,
      }}>
        {branch.name[0]}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary' }}>
          {branch.name}
        </Typography>
        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
          {branch.members.toLocaleString()} members
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'text.primary' }}>
          ₹{branch.revenue.toLocaleString()}
        </Typography>
        <Typography sx={{
          fontSize: '0.7rem', fontWeight: 600,
          color: growthUp ? '#4ade80' : '#f87171',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.25,
        }}>
          {growthUp ? <ArrowUpwardRoundedIcon sx={{ fontSize: 10 }} /> : <ArrowDownwardRoundedIcon sx={{ fontSize: 10 }} />}
          {Math.abs(branch.growth)}%
        </Typography>
      </Box>
      <Box sx={{ width: 80, flexShrink: 0 }}>
        <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled', mb: 0.4 }}>
          {branch.occupancy}% capacity
        </Typography>
        <LinearProgress
          variant="determinate"
          value={branch.occupancy}
          sx={{
            height: 4, borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.06)',
            '& .MuiLinearProgress-bar': {
              bgcolor: branch.occupancy >= 70 ? '#10b981' : branch.occupancy >= 50 ? '#f59e0b' : '#f43f5e',
              borderRadius: 4,
            },
          }}
        />
      </Box>
    </Box>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrgDashboardPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call — replace with real fetch
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const fmt = (n: number) => n.toLocaleString('en-IN');
  const fmtCurrency = (n: number) => `₹${(n / 1000).toFixed(0)}K`;

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
            Organization Overview
          </Typography>
          <Typography component="h1" sx={{ fontSize: { xs: '1.5rem', md: '1.9rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: 'text.primary', lineHeight: 1 }}>
            Welcome back, {user?.firstName}
          </Typography>
          <Typography sx={{ mt: 0.75, fontSize: '0.85rem', color: 'text.secondary' }}>
            Here's the consolidated view across all {ORG_STATS.totalBranches} branches.
          </Typography>
        </Box>
        <Button
          component={Link} href="/org/reports"
          variant="outlined" size="small"
          sx={{ borderColor: 'rgba(245,158,11,0.3)', color: '#f59e0b', '&:hover': { borderColor: '#f59e0b', bgcolor: 'rgba(245,158,11,0.08)' } }}
        >
          Full Report
        </Button>
      </Box>

      {/* KPI Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Monthly Revenue', value: fmtCurrency(ORG_STATS.monthRevenue), sub: `₹${fmt(ORG_STATS.totalRevenue)} lifetime`, icon: AttachMoneyRoundedIcon, color: '#f59e0b', trend: ORG_STATS.revenueGrowth, sparkData: MONTHLY_REVENUE },
          { title: 'Active Members', value: fmt(ORG_STATS.activeMembers), sub: `${fmt(ORG_STATS.totalMembers)} total`, icon: PeopleRoundedIcon, color: '#10b981', trend: ORG_STATS.memberGrowth, sparkData: MEMBER_GROWTH },
          { title: 'Total Branches', value: ORG_STATS.activeBranches, sub: 'All operational', icon: StorefrontRoundedIcon, color: '#8b5cf6' },
          { title: 'Staff Members', value: ORG_STATS.totalStaff, sub: `${ORG_STATS.activeTrainers} trainers`, icon: GroupRoundedIcon, color: '#06b6d4' },
          { title: 'PT Sessions (Month)', value: ORG_STATS.totalPtSessions, sub: 'Across all branches', icon: FitnessCenterRoundedIcon, color: '#ec4899' },
          { title: 'Avg Occupancy', value: `${ORG_STATS.avgOccupancy}%`, sub: 'Across all branches', icon: TrendingUpRoundedIcon, color: '#f97316' },
          { title: 'Expired Memberships', value: fmt(ORG_STATS.expiredMemberships), sub: 'Renewal opportunity', icon: WarningAmberRoundedIcon, color: '#f43f5e' },
          { title: 'Pending Collections', value: fmtCurrency(ORG_STATS.pendingAmount), sub: 'Overdue payments', icon: AccountBalanceRoundedIcon, color: '#eab308' },
        ].map((kpi) => (
          <Grid item xs={12} sm={6} md={3} key={kpi.title}>
            {loading
              ? <Skeleton variant="rounded" height={140} sx={{ borderRadius: 2 }} />
              : <KpiCard {...kpi} />}
          </Grid>
        ))}
      </Grid>

      {/* Charts + Branch Performance */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Revenue chart */}
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
                    Revenue Trend
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    Monthly revenue across all branches
                  </Typography>
                </Box>
                <Chip label="2026" size="small" sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 700 }} />
              </Box>
              {loading
                ? <Skeleton variant="rounded" height={220} />
                : (
                  <BarChart
                    xAxis={[{ data: MONTHLY_LABELS, scaleType: 'band' }]}
                    series={[{
                      data: MONTHLY_REVENUE,
                      color: '#f59e0b',
                      label: 'Revenue (₹)',
                    }]}
                    height={220}
                    sx={{
                      '& .MuiChartsAxis-root': { '& text': { fill: 'rgba(255,255,255,0.4)', fontSize: 11 } },
                      '& .MuiChartsGrid-line': { stroke: 'rgba(255,255,255,0.05)' },
                    }}
                  />
                )}
            </CardContent>
          </Card>
        </Grid>

        {/* Branch performance */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
                    Branch Performance
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    Revenue & capacity this month
                  </Typography>
                </Box>
                <Button component={Link} href="/org/branches" size="small"
                  sx={{ fontSize: '0.75rem', color: '#f59e0b', '&:hover': { bgcolor: 'rgba(245,158,11,0.08)' } }}>
                  View all
                </Button>
              </Box>
              <Stack divider={<Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}>
                {BRANCH_PERFORMANCE.map((branch) => (
                  <BranchRow key={branch.name} branch={branch} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Member growth + Activity feed */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card elevation={0}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
                    Member Growth
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    Total members across all branches
                  </Typography>
                </Box>
                <Chip label="+{ORG_STATS.memberGrowth}% MoM" size="small"
                  sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700 }} />
              </Box>
              {loading
                ? <Skeleton variant="rounded" height={200} />
                : (
                  <LineChart
                    xAxis={[{ data: MONTHLY_LABELS, scaleType: 'band' }]}
                    series={[{
                      data: MEMBER_GROWTH,
                      color: '#10b981',
                      label: 'Total Members',
                      area: true,
                    }]}
                    height={200}
                    sx={{
                      '& .MuiChartsAxis-root': { '& text': { fill: 'rgba(255,255,255,0.4)', fontSize: 11 } },
                      '& .MuiAreaElement-root': { fill: 'url(#memberGrowthGradient)', opacity: 0.15 },
                    }}
                  />
                )}
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Feed */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
                  Activity Feed
                </Typography>
                <Chip label="Live" size="small"
                  sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700, fontSize: '0.68rem' }}
                  icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981', ml: 0.5 }} />}
                />
              </Box>
              <Stack spacing={0}>
                {RECENT_ACTIVITY.map((activity, idx) => {
                  const severityColor: Record<string, string> = {
                    success: '#10b981', info: '#3b82f6', warning: '#f59e0b', error: '#f43f5e',
                  };
                  const color = severityColor[activity.severity] ?? '#6b7280';
                  return (
                    <Box key={activity.id} sx={{ display: 'flex', gap: 1.5, py: 1.25, borderBottom: idx < RECENT_ACTIVITY.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <Box sx={{
                        width: 7, height: 7, borderRadius: '50%', mt: 0.75, flexShrink: 0,
                        bgcolor: color, boxShadow: `0 0 6px ${color}`,
                      }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.8rem', color: 'text.primary', lineHeight: 1.4 }}>
                          {activity.message}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                          <Chip label={activity.branch} size="small" sx={{
                            height: 16, fontSize: '0.62rem', fontWeight: 600,
                            bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary',
                          }} />
                          <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled' }}>
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
