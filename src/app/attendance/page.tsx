'use client';
import { Suspense, useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { useSearchParams } from 'next/navigation';
import {
  Box, Card, CardContent, Typography, Button, Chip, Tabs, Tab,
  Table, TableBody, TableCell, TableHead, TableRow, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, CircularProgress, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import MemberSearchField, { type MemberSearchResult } from '@/components/MemberSearchField';
import { useResponsivePageSize } from '@/hooks/useResponsivePageSize';
import { useAttendanceInside, useAttendanceHistory, usePeakHours, useAttendanceMutations } from '@/hooks/queries/attendance';
import Link from 'next/link';

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

function AttendancePageContent() {
  const searchParams = useSearchParams();
  const defaultPageSize = useResponsivePageSize();
  const memberParam = searchParams.get('member') ?? '';
  
  const [tab, setTab] = useState(0);
  const [checkInOpen, setCheckInOpen] = useState(() => Boolean(memberParam));
  const [memberIdInput, setMemberIdInput] = useState('');
  const [selectedCheckInMember, setSelectedCheckInMember] = useState<MemberSearchResult | null>(null);
  
  const [memberSearch, setMemberSearch] = useState(memberParam);
  const [dateFilter, setDateFilter] = useState('');

  const [checkoutError, setCheckoutError] = useState('');
  const [checkInError, setCheckInError] = useState('');

  // ── Queries ─────────────────────────────────────────────────────────────────
  const { data: insideMembers = [], isLoading: insideLoading, refetch: refetchInside } = useAttendanceInside();
  
  const { 
    data: historyData, 
    fetchNextPage: fetchHistoryNext, 
    hasNextPage: hasMore, 
    isFetching: historyLoading,
    refetch: refetchHistory
  } = useAttendanceHistory({
    pageSize: defaultPageSize,
    date: dateFilter || undefined,
    search: memberSearch || undefined
  });

  const historyLogs = useMemo(() => historyData?.pages.flatMap(p => p.items) || [], [historyData]);

  const { data: peakHours = [] } = usePeakHours();

  // ── Mutations ───────────────────────────────────────────────────────────────
  const { checkIn, checkOut } = useAttendanceMutations();

  const handleCheckIn = async () => {
    if (!memberIdInput) return;
    setCheckInError('');
    try {
      await checkIn.mutateAsync({ memberId: memberIdInput });
      setCheckInOpen(false);
      setMemberIdInput('');
      setSelectedCheckInMember(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Check-in failed. Please try again.';
      setCheckInError(msg);
    }
  };

  const handleCheckOut = async (memberId: string, memberName: string) => {
    setCheckoutError('');
    try {
      await checkOut.mutateAsync({ memberId });
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? `Failed to check out ${memberName}`;
      setCheckoutError(msg);
    }
  };

  const handleRefresh = () => {
    refetchInside();
    refetchHistory();
  };

  const getCardBorderColor = (status: string) => {
    if (status === 'EXPIRED') return 'rgba(244,63,94,0.6)'; // red
    if (status === 'EXPIRING') return 'rgba(245,158,11,0.6)'; // yellow
    return 'rgba(16,185,129,0.2)'; // default green
  };

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Attendance</Typography>
          <Typography variant="body2" color="text.secondary">Live and historical gym attendance</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh} size="small">Refresh</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setCheckInOpen(true); setCheckInError(''); }}>Manual Check-in</Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab label={`Currently Inside (${insideLoading ? '…' : insideMembers.length})`} />
          <Tab label="History" />
          <Tab label="Peak Hour Analytics" />
        </Tabs>
      </Box>

      {/* Tab 0: Currently Inside */}
      <TabPanel value={tab} index={0}>
        {checkoutError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCheckoutError('')}>{checkoutError}</Alert>
        )}
        {insideLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : insideMembers.length === 0 ? (
          <Card elevation={0}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">No members are currently inside</Typography>
              <Typography variant="caption" color="text.secondary">Use Manual Check-in to add someone</Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {insideMembers.map((m: any, i: number) => {
              const cardBorder = getCardBorderColor(m.membershipStatus);
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                  <Card elevation={0} sx={{ 
                    border: `1px solid ${cardBorder}`, 
                    transition: 'border-color 0.2s',
                    '&:hover': { borderColor: cardBorder.replace('0.6', '1').replace('0.2', '0.5') }
                  }}>
                    <CardContent>
                      <Box 
                        component={Link} 
                        href={`/members/${m.id}`}
                        sx={{ 
                          display: 'flex', alignItems: 'center', gap: 2, 
                          textDecoration: 'none', color: 'inherit',
                          cursor: 'pointer' 
                        }}
                      >
                        <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'primary.dark', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#fff' }}>
                            {m.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }} noWrap>{m.name || 'Unknown'}</Typography>
                          <Typography variant="caption" color="text.secondary">{m.memberId}{m.plan ? ` · ${m.plan}` : ''}</Typography>
                          {m.membershipStatus === 'EXPIRED' && (
                            <Typography variant="caption" sx={{ display: 'block', color: 'error.main', fontWeight: 'bold' }}>Membership Expired</Typography>
                          )}
                          {m.membershipStatus === 'EXPIRING' && (
                            <Typography variant="caption" sx={{ display: 'block', color: 'warning.main', fontWeight: 'bold' }}>Expiring Soon</Typography>
                          )}
                        </Box>
                        <Chip label="Inside" color="success" size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Check-in</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.checkIn || '—'}</Typography>
                        </Box>
                        {m.trainer && (
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">Trainer</Typography>
                            <Typography variant="body2">{m.trainer}</Typography>
                          </Box>
                        )}
                        <Button 
                          variant="outlined" 
                          size="small" 
                          color="warning" 
                          onClick={() => handleCheckOut(m.id, m.name)}
                          disabled={checkOut.isPending}
                        >
                          {checkOut.isPending ? 'Wait...' : 'Check Out'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </TabPanel>

      {/* Tab 1: History */}
      <TabPanel value={tab} index={1}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            label="Search Member"
            value={memberSearch}
            onChange={e => setMemberSearch(e.target.value)}
            sx={{ minWidth: 200 }}
            placeholder="Name or member ID"
          />
          <TextField
            size="small"
            label="Date"
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 160 }}
          />
          {(memberSearch || dateFilter) && (
            <Button size="small" variant="text" onClick={() => { setMemberSearch(''); setDateFilter(''); }}>
              Clear filters
            </Button>
          )}
        </Box>
        <Card elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Check-in</TableCell>
                <TableCell>Check-out</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Method</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyLoading && historyLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : historyLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="caption" color="text.secondary">No attendance records found</Typography>
                  </TableCell>
                </TableRow>
              ) : historyLogs.map((log: any) => (
                <TableRow key={log.id} sx={{ '&:hover': { bgcolor: 'rgba(16,185,129,0.03)' } }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{log.member || log.memberId}</Typography>
                    <Typography variant="caption" color="text.secondary">{log.memberId}</Typography>
                  </TableCell>
                  <TableCell>{log.date}</TableCell>
                  <TableCell>{log.checkIn}</TableCell>
                  <TableCell>{log.checkOut || <Typography variant="caption" color="success.main">Still inside</Typography>}</TableCell>
                  <TableCell><Chip label={log.duration} size="small" color={!log.checkOut ? 'success' : 'default'} /></TableCell>
                  <TableCell><Typography variant="caption" color="text.secondary">{log.method}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {hasMore && historyLogs.length > 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Button size="small" onClick={() => fetchHistoryNext()} disabled={historyLoading}>
                {historyLoading ? <CircularProgress size={16} /> : 'Load more'}
              </Button>
            </Box>
          )}
        </Card>
      </TabPanel>

      {/* Tab 2: Analytics */}
      <TabPanel value={tab} index={2}>
        {peakHours.length === 0 ? (
          <Card elevation={0}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">No analytics data yet — check back after members start checking in.</Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {peakHours.map((h: any) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={h.hour}>
                <Card elevation={0}>
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{h.hour}</Typography>
                      <Typography variant="body2" color="text.secondary">{h.count} check-ins avg</Typography>
                    </Box>
                    <Box sx={{
                      width: 60, height: 60, borderRadius: '50%', border: '4px solid',
                      borderColor: h.pct > 80 ? 'error.main' : h.pct > 60 ? 'warning.main' : 'primary.main',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{h.pct}%</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Manual Check-in Dialog */}
      <Dialog open={checkInOpen} onClose={() => { setCheckInOpen(false); setCheckInError(''); }} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleCheckIn(); }}>
          <DialogTitle>Manual Check-in</DialogTitle>
          <DialogContent>
            {checkInError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{checkInError}</Alert>}
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={12}>
                <MemberSearchField
                  autoFocus={checkInOpen}
                  label="Find member"
                  helperText="Search by name or member number, then select the member"
                  onSelect={member => { setSelectedCheckInMember(member); setMemberIdInput(member?.id ?? ''); setCheckInError(''); }}
                />
                {selectedCheckInMember?.status === 'EXPIRED' && <Alert severity="warning" sx={{ mt: 1 }}>This membership is expired. Check in may be restricted.</Alert>}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => { setCheckInOpen(false); setCheckInError(''); setMemberIdInput(''); setSelectedCheckInMember(null); }}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={checkIn.isPending || !memberIdInput}
              startIcon={checkIn.isPending ? <CircularProgress size={14} color="inherit" /> : undefined}
            >
              {checkIn.isPending ? 'Checking in…' : 'Check In'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </AppLayout>
  );
}

function AttendancePageFallback() {
  return (
    <AppLayout>
      <Box sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Attendance</Typography>
        <Typography variant="body2" color="text.secondary">Loading attendance…</Typography>
      </Box>
    </AppLayout>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={<AttendancePageFallback />}>
      <AttendancePageContent />
    </Suspense>
  );
}
