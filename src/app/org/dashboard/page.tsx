'use client';
import type { ElementType } from 'react';
import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Stack,
  LinearProgress, alpha, Button, Avatar, Divider, Skeleton,
  Select, MenuItem, FormControl,
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
import { useBranches } from '@/hooks/queries/branches';
import { useDashboard } from '@/hooks/queries/dashboard';

// ORG_STATS replaced by API data

type BranchPerf = { id: string; name: string; members: number; revenue: number; growth: number; occupancy: number; status: string };

const MONTHLY_REVENUE = [62000, 71000, 68500, 74000, 80200, 85000, 91000, 94300];
const MONTHLY_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
const MEMBER_GROWTH = [2100, 2180, 2240, 2310, 2450, 2600, 2720, 2847];



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
        <Typography sx={{ fontSize: { xs: '1.25rem', sm: '1.6rem' }, fontWeight: 800, letterSpacing: '-0.05em', color: 'text.primary', lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.73rem' }, color: 'text.secondary', mt: 0.5, fontWeight: 500 }} noWrap>
          {title}
        </Typography>
        {sub && <Typography sx={{ fontSize: { xs: '0.6rem', sm: '0.68rem' }, color: 'text.disabled', mt: 0.25 }} noWrap>{sub}</Typography>}
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

function BranchRow({ branch }: { branch: BranchPerf }) {
  const growthUp = branch.growth >= 0;
  return (
    <Grid container alignItems="center" spacing={2} sx={{
      py: 1.5, px: 2, borderRadius: 2, cursor: 'pointer',
      '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' }, transition: 'background 0.15s',
    }}>
      <Grid size={{ xs: 12, sm: 5 }} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{
          width: 36, height: 36, fontSize: '0.82rem', fontWeight: 700,
          bgcolor: 'rgba(245,158,11,0.15)', color: '#f59e0b', flexShrink: 0,
        }}>
          {branch.name[0]}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary' }} noWrap>
            {branch.name}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
            {branch.members.toLocaleString()} members
          </Typography>
        </Box>
      </Grid>

      <Grid size={{ xs: 6, sm: 4 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'text.primary' }}>
          ₹{branch.revenue.toLocaleString()}
        </Typography>
        <Typography sx={{
          fontSize: '0.7rem', fontWeight: 600,
          color: growthUp ? '#4ade80' : '#f87171',
          display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: 0.25,
        }}>
          {growthUp ? <ArrowUpwardRoundedIcon sx={{ fontSize: 10 }} /> : <ArrowDownwardRoundedIcon sx={{ fontSize: 10 }} />}
          {Math.abs(branch.growth)}%
        </Typography>
      </Grid>

      <Grid size={{ xs: 6, sm: 3 }}>
        <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled', mb: 0.4, textAlign: 'right' }}>
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
      </Grid>
    </Grid>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrgDashboardPage() {
  const { user } = useAuthStore();
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');

  const { data: branchesData } = useBranches();
  const branches = branchesData?.branches || [];

  const { data: dashboardData, isLoading: loading } = useDashboard(
    selectedBranchId !== 'ALL' ? { branchId: selectedBranchId } : {}
  );

  const fmt = (n: number) => n?.toLocaleString('en-IN') ?? '0';
  const fmtCurrency = (n: number) => `₹${((n ?? 0) / 1000).toFixed(0)}K`;

  const stats = dashboardData?.stats || {};
  const recentActivity = dashboardData?.recentLogs || [];

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
            Here's the consolidated view across all branches.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.03)',
                borderRadius: 1.5,
                fontSize: '0.85rem',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <MenuItem value="ALL">All Branches</MenuItem>
              {branches.map((b: any) => (
                <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            component={Link} href="/org/reports"
            variant="outlined" size="small"
            sx={{ borderColor: 'rgba(245,158,11,0.3)', color: '#f59e0b', '&:hover': { borderColor: '#f59e0b', bgcolor: 'rgba(245,158,11,0.08)' } }}
          >
            Full Report
          </Button>
        </Box>
      </Box>

      {/* KPI Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          { title: 'Monthly Revenue', value: fmtCurrency(stats.monthRevenue), sub: `₹${fmtCurrency(stats.todaysRevenue)} today`, icon: AttachMoneyRoundedIcon, color: '#f59e0b', sparkData: dashboardData?.revenueChart?.map((r:any) => r.revenue) || MONTHLY_REVENUE },
          { title: 'Active Members', value: fmt(stats.activeMembers), sub: `${fmt(stats.newMembersMonth)} new this month`, icon: PeopleRoundedIcon, color: '#10b981', sparkData: MEMBER_GROWTH },
          { title: 'Total Branches', value: branches.length, sub: 'All operational', icon: StorefrontRoundedIcon, color: '#8b5cf6' },
          { title: 'Trainers', value: stats.totalTrainers, sub: `${stats.trainersWorking} active`, icon: GroupRoundedIcon, color: '#06b6d4' },
          { title: 'PT Sessions (Today)', value: stats.todaysPtSessions, sub: 'Across all branches', icon: FitnessCenterRoundedIcon, color: '#ec4899' },
          { title: 'Currently Inside', value: stats.currentlyInside, sub: `${stats.todaysCheckins} total check-ins today`, icon: TrendingUpRoundedIcon, color: '#f97316' },
          { title: 'Expired Memberships', value: fmt(stats.expiredMemberships), sub: `${stats.expiringIn7Days} expiring soon`, icon: WarningAmberRoundedIcon, color: '#f43f5e' },
          { title: 'Pending Collections', value: fmtCurrency(stats.pendingAmount), sub: 'Overdue payments', icon: AccountBalanceRoundedIcon, color: '#eab308' },
        ].map((kpi) => (
          <Grid size={{ xs: 6, sm: 6, md: 4, lg: 3 }} key={kpi.title}>
            {loading
              ? <Skeleton variant="rounded" height={140} sx={{ borderRadius: 2 }} />
              : <KpiCard {...kpi} />}
          </Grid>
        ))}
      </Grid>

      {/* Charts + Branch Performance */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {/* Revenue chart */}
        <Grid size={{ xs: 12, lg: 7 }}>
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
                    xAxis={[{ data: dashboardData?.revenueChart?.map((r:any) => r.month) || ['Jan'], scaleType: 'band' }]}
                    series={[{
                      data: dashboardData?.revenueChart?.map((r:any) => r.revenue) || [0],
                      color: '#f59e0b',
                      label: 'Revenue (₹)',
                    }]}
                    height={300}
                    sx={{
                      '& .MuiChartsAxis-root': { '& text': { fill: 'rgba(255,255,255,0.4)', fontSize: 11 } },
                      '& .MuiGrid-line': { stroke: 'rgba(255,255,255,0.05)' },
                    }}
                  />
                )}
            </CardContent>
          </Card>
        </Grid>

        {/* Branch performance */}
        <Grid size={{ xs: 12, lg: 5 }}>
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
                {(dashboardData?.branchPerformance || []).map((branch: BranchPerf) => (
                  <BranchRow key={branch.name} branch={branch} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Member growth + Activity feed */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card elevation={0}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
                    Attendance Trend
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    Check-ins over the last 7 days
                  </Typography>
                </Box>
              </Box>
              {loading
                ? <Skeleton variant="rounded" height={200} />
                : (
                  <LineChart
                    xAxis={[{ data: dashboardData?.attendanceChart?.map((a:any) => a.day) || ['Mon'], scaleType: 'band' }]}
                    series={[{
                      data: dashboardData?.attendanceChart?.map((a:any) => a.count) || [0],
                      color: '#10b981',
                      label: 'Check-ins',
                      area: true,
                    }]}
                    height={300}
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
        <Grid size={{ xs: 12, lg: 5 }}>
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
                {recentActivity.map((activity: any, idx: number) => {
                  return (
                    <Box key={activity.id} sx={{ display: 'flex', gap: 1.5, py: 1.25, borderBottom: idx < recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <Box sx={{
                        width: 7, height: 7, borderRadius: '50%', mt: 0.75, flexShrink: 0,
                        bgcolor: '#10b981', boxShadow: `0 0 6px #10b981`,
                      }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.8rem', color: 'text.primary', lineHeight: 1.4 }}>
                          {activity.memberName} checked in
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                          <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled' }}>
                            {activity.checkIn}
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
