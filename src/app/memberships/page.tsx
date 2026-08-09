'use client';

import { useState, useEffect, type ReactNode, type SyntheticEvent } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {
  mockMembershipPlans,
  mockMembershipEvents,
} from '@/lib/mockData';
import { api } from '@/lib/api';

interface TabPanelProps {
  children?: ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      sx={{ pt: 3 }}
    >
      {value === index && children}
    </Box>
  );
}

type ChipColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning';

const eventColor: Record<string, ChipColor> = {
  CREATED: 'info',
  RENEWED: 'success',
  FROZEN: 'warning',
  RESUMED: 'default',
  EXTENDED: 'primary',
  CANCELLED: 'error',
};

const operations: {
  op: string;
  desc: string;
  color: ChipColor;
}[] = [
  {
    op: 'Create',
    desc: 'Start a new membership for a member',
    color: 'primary',
  },
  {
    op: 'Activate',
    desc: 'Activate a pending membership',
    color: 'success',
  },
  {
    op: 'Renew',
    desc: 'Extend membership for another period',
    color: 'primary',
  },
  {
    op: 'Upgrade',
    desc: 'Upgrade to a higher plan',
    color: 'secondary',
  },
  {
    op: 'Downgrade',
    desc: 'Move to a lower plan',
    color: 'default',
  },
  {
    op: 'Freeze',
    desc: 'Pause membership temporarily',
    color: 'warning',
  },
  {
    op: 'Resume',
    desc: 'Resume a frozen membership',
    color: 'primary',
  },
  {
    op: 'Extend',
    desc: 'Extend expiry by N days',
    color: 'primary',
  },
  {
    op: 'Cancel',
    desc: 'Cancel and record reason',
    color: 'error',
  },
  {
    op: 'Transfer',
    desc: 'Transfer to another branch or member',
    color: 'secondary',
  },
];

export default function MembershipsPage() {
  const [tab, setTab] = useState(0);
  const [planOpen, setPlanOpen] = useState(false);
  const [apiPlans, setApiPlans] = useState<typeof mockMembershipPlans | null>(null);
  const [apiEvents, setApiEvents] = useState<typeof mockMembershipEvents | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Form State
  const [planForm, setPlanForm] = useState({
    name: '', durationDays: 30, price: 0, gstPercent: 18, joiningFee: 0, ptSessionsIncluded: 0, status: 'ACTIVE'
  });
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState('');

  useEffect(() => {
    api.get('/membership-plans', { params: { pageSize: '50' } })
      .then(res => {
        const items = res.data?.items ?? [];
        setApiPlans(items.map((p: Record<string, unknown>) => ({
          id: String(p.id),
          name: String(p.name ?? ''),
          duration: Number(p.durationDays ?? p.duration ?? 30),
          price: Number(p.price ?? 0),
          description: String(p.description ?? ''),
          features: Array.isArray(p.features) ? p.features.map(String) : [],
          isPopular: Boolean(p.isPopular),
          isActive: Boolean(p.isActive ?? true),
          category: String(p.category ?? ''),
          ptSessions: Number(p.ptSessions ?? 0),
          guestPasses: Number(p.guestPasses ?? 0),
        })));
      })
      .catch(() => setApiPlans(null));

    api.get('/membership-events', { params: { pageSize: '50' } })
      .then(res => {
        const items = res.data?.items ?? [];
        setApiEvents(items.map((e: Record<string, unknown>) => ({
          id: String(e.id),
          memberId: String(e.memberId ?? ''),
          member: String(e.memberName ?? `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim()),
          event: String(e.eventType ?? e.event ?? ''),
          plan: String(e.planName ?? e.plan ?? ''),
          date: String(e.createdAt ?? e.date ?? '').split('T')[0],
          by: String(e.createdByName ?? e.by ?? ''),
          notes: String(e.notes ?? ''),
        })));
      })
      .catch(() => setApiEvents(null));
  }, [fetchTrigger]);

  const plans = apiPlans ?? mockMembershipPlans;
  const events = apiEvents ?? mockMembershipEvents;

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name || !planForm.durationDays || !planForm.price) {
      setPlanError('Name, Duration, and Price are required.');
      return;
    }
    setPlanLoading(true);
    setPlanError('');
    try {
      await api.post('/membership-plans', planForm);
      setPlanOpen(false);
      setPlanForm({ name: '', durationDays: 30, price: 0, gstPercent: 18, joiningFee: 0, ptSessionsIncluded: 0, status: 'ACTIVE' });
      setFetchTrigger(t => t + 1);
    } catch (err: any) {
      setPlanError(err.response?.data?.message || 'Failed to create plan');
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          mb: 3,
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Membership Management
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Plans, events, and membership operations
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setPlanOpen(true)}
          fullWidth
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Create Plan
        </Button>
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 3,
        }}
      >
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              minWidth: { xs: 120, sm: 140 },
              px: { xs: 1.5, sm: 2 },
            },
          }}
        >
          <Tab label="Plans" />
          <Tab label="Event History" />
          <Tab label="Operations" />
        </Tabs>
      </Box>

      {/* ==================== PLANS ==================== */}

      <TabPanel value={tab} index={0}>
        <Grid container spacing={2}>
          {mockMembershipPlans.map((plan) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              key={plan.id}
            >
              <Card elevation={0} sx={{ height: '100%' }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      mb: 2,
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {plan.name}
                    </Typography>

                    <Chip
                      label={plan.status}
                      size="small"
                      color={
                        plan.status === 'ACTIVE'
                          ? 'success'
                          : 'default'
                      }
                    />
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    {[
                      ['Duration', `${plan.duration} days`],
                      [
                        'Price',
                        `₹${plan.price.toLocaleString()}`,
                      ],
                      ['GST', `${plan.gst}%`],
                      [
                        'Joining Fee',
                        plan.joiningFee > 0
                          ? `₹${plan.joiningFee}`
                          : 'None',
                      ],
                      ['PT Sessions', plan.ptSessions],
                    ].map(([key, value]) => (
                      <Box
                        key={String(key)}
                        sx={{
                          py: 0.5,
                          display: 'flex',
                          borderBottom:
                            '1px solid rgba(255,255,255,0.05)',
                          justifyContent: 'space-between',
                          gap: 2,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {key}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600 }}
                        >
                          {value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      mt: 2,
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                    >
                      Edit
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      fullWidth
                    >
                      Disable
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* ==================== EVENT HISTORY ==================== */}

      <TabPanel value={tab} index={1}>
        <Card elevation={0}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 'bold',
                mb: 2,
              }}
            >
              All Membership Events
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mb: 2,
                display: 'block',
              }}
            >
              Events are immutable records. We never simply change
              expiry dates.
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {mockMembershipEvents.map((event, index) => (
                <Box
                  key={event.id}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    pb: 3,
                    minWidth: 0,
                  }}
                >
                  {/* Timeline */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: 'background.default',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 'bold' }}
                      >
                        {index + 1}
                      </Typography>
                    </Box>

                    {index <
                      mockMembershipEvents.length - 1 && (
                      <Box
                        sx={{
                          width: 2,
                          flex: 1,
                          bgcolor:
                            'rgba(255,255,255,0.08)',
                          my: 0.5,
                        }}
                      />
                    )}
                  </Box>

                  {/* Event information */}
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Chip
                        label={event.type}
                        size="small"
                        color={
                          eventColor[event.type] ??
                          'default'
                        }
                      />

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {event.date}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        by {event.actor}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{ mt: 0.5, overflowWrap: 'anywhere' }}
                    >
                      {event.notes}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* ==================== OPERATIONS ==================== */}

      <TabPanel value={tab} index={2}>
        <Grid container spacing={2}>
          {operations.map(({ op, desc, color }) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              key={op}
            >
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                <CardContent>
                  <Chip
                    label={op}
                    color={color}
                    size="small"
                    sx={{ mb: 1 }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {desc}
                  </Typography>

                  <Button
                    size="small"
                    variant="text"
                    sx={{
                      mt: 1,
                      p: 0,
                    }}
                  >
                    Open →
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* ==================== CREATE PLAN DIALOG ==================== */}

      <Dialog
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              bgcolor: 'background.paper',
            },
          },
        }}
      >
        <Box component="form" onSubmit={handleCreatePlan}>
          <DialogTitle>Create Membership Plan</DialogTitle>

          <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
            {planError && <Alert severity="error" sx={{ mb: 2 }}>{planError}</Alert>}
            <Grid
              container
              spacing={2}
              sx={{ mt: 0.5 }}
            >
              <Grid size={12}>
                <TextField
                  label="Plan Name"
                  required
                  value={planForm.name}
                  onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                  fullWidth
                  size="small"
                  placeholder="e.g. Monthly Pro"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Duration (days)"
                  required
                  type="number"
                  value={planForm.durationDays}
                  onChange={e => setPlanForm({ ...planForm, durationDays: Number(e.target.value) })}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Price (₹)"
                  required
                  type="number"
                  value={planForm.price}
                  onChange={e => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="GST (%)"
                  type="number"
                  value={planForm.gstPercent}
                  onChange={e => setPlanForm({ ...planForm, gstPercent: Number(e.target.value) })}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Joining Fee (₹)"
                  type="number"
                  value={planForm.joiningFee}
                  onChange={e => setPlanForm({ ...planForm, joiningFee: Number(e.target.value) })}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="PT Sessions Included"
                  type="number"
                  value={planForm.ptSessionsIncluded}
                  onChange={e => setPlanForm({ ...planForm, ptSessionsIncluded: Number(e.target.value) })}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Status"
                  select
                  value={planForm.status}
                  onChange={e => setPlanForm({ ...planForm, status: e.target.value })}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions
            sx={{
              p: { xs: 2, sm: 2.5 },
              gap: 1,
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              '& > *': { width: { xs: '100%', sm: 'auto' } },
            }}
          >
            <Button onClick={() => setPlanOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={planLoading}>
              {planLoading ? <CircularProgress size={24} /> : 'Create Plan'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </AppLayout>
  );
}
