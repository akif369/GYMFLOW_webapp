'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Card, CardContent, Typography, Button, Chip, Tabs, Tab,
  Table, TableBody, TableCell, TableHead, TableRow, Grid, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { mockMembershipPlans, mockMembershipEvents } from '@/lib/mockData';

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

const eventColor: Record<string, any> = {
  CREATED: 'info', RENEWED: 'success', FROZEN: 'warning', RESUMED: 'default', EXTENDED: 'primary', CANCELLED: 'error',
};

export default function MembershipsPage() {
  const [tab, setTab] = useState(0);
  const [planOpen, setPlanOpen] = useState(false);

  return (
    <AppLayout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Membership Management</Typography>
          <Typography variant="body2" color="text.secondary">Plans, events, and membership operations</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setPlanOpen(true)}>Create Plan</Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Plans" />
          <Tab label="Event History" />
          <Tab label="Operations" />
        </Tabs>
      </Box>

      {/* Tab 0: Plans */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={2}>
          {mockMembershipPlans.map(plan => (
            <Grid item xs={12} sm={6} md={4} key={plan.id}>
              <Card elevation={0} sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">{plan.name}</Typography>
                    <Chip label={plan.status} size="small" color="success" />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {[
                      ['Duration', `${plan.duration} days`],
                      ['Price', `₹${plan.price.toLocaleString()}`],
                      ['GST', `${plan.gst}%`],
                      ['Joining Fee', plan.joiningFee > 0 ? `₹${plan.joiningFee}` : 'None'],
                      ['PT Sessions', plan.ptSessions],
                    ].map(([k, v]) => (
                      <Box key={k} display="flex" justifyContent="space-between" py={0.5} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography variant="caption" color="text.secondary">{k}</Typography>
                        <Typography variant="caption" fontWeight={600}>{v}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box display="flex" gap={1} mt={2}>
                    <Button size="small" variant="outlined" fullWidth>Edit</Button>
                    <Button size="small" variant="outlined" color="error" fullWidth>Disable</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Tab 1: Event History */}
      <TabPanel value={tab} index={1}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" mb={2}>All Membership Events</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              Events are immutable records. We never simply change expiry dates.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {mockMembershipEvents.map((e, i) => (
                <Box key={e.id} display="flex" gap={2} pb={3}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'background.default', border: '2px solid', borderColor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Typography variant="caption" fontWeight="bold">{i + 1}</Typography>
                    </Box>
                    {i < mockMembershipEvents.length - 1 && (
                      <Box sx={{ width: 2, flex: 1, bgcolor: 'rgba(255,255,255,0.08)', my: 0.5 }} />
                    )}
                  </Box>
                  <Box>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                      <Chip label={e.type} size="small" color={eventColor[e.type] || 'default'} />
                      <Typography variant="caption" color="text.secondary">{e.date}</Typography>
                      <Typography variant="caption" color="text.secondary">by {e.actor}</Typography>
                    </Box>
                    <Typography variant="body2" mt={0.5}>{e.notes}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 2: Operations */}
      <TabPanel value={tab} index={2}>
        <Grid container spacing={2}>
          {[
            { op: 'Create', desc: 'Start a new membership for a member', color: 'primary' },
            { op: 'Activate', desc: 'Activate a pending membership', color: 'success' },
            { op: 'Renew', desc: 'Extend membership for another period', color: 'primary' },
            { op: 'Upgrade', desc: 'Upgrade to a higher plan', color: 'secondary' },
            { op: 'Downgrade', desc: 'Move to a lower plan', color: 'default' },
            { op: 'Freeze', desc: 'Pause membership temporarily', color: 'warning' },
            { op: 'Resume', desc: 'Resume a frozen membership', color: 'primary' },
            { op: 'Extend', desc: 'Extend expiry by N days', color: 'primary' },
            { op: 'Cancel', desc: 'Cancel and record reason', color: 'error' },
            { op: 'Transfer', desc: 'Transfer to another branch or member', color: 'secondary' },
          ].map(({ op, desc, color }) => (
            <Grid item xs={12} sm={6} md={4} key={op}>
              <Card elevation={0} sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main', border: '1px solid' } }}>
                <CardContent>
                  <Chip label={op} color={color as any} size="small" sx={{ mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">{desc}</Typography>
                  <Button size="small" variant="text" sx={{ mt: 1, p: 0 }}>Open →</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Create Plan Dialog */}
      <Dialog open={planOpen} onClose={() => setPlanOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper' } }}>
        <DialogTitle>Create Membership Plan</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12}><TextField label="Plan Name" fullWidth size="small" placeholder="e.g. Monthly Pro" /></Grid>
            <Grid item xs={6}><TextField label="Duration (days)" type="number" fullWidth size="small" /></Grid>
            <Grid item xs={6}><TextField label="Price (₹)" type="number" fullWidth size="small" /></Grid>
            <Grid item xs={6}><TextField label="GST (%)" type="number" fullWidth size="small" /></Grid>
            <Grid item xs={6}><TextField label="Joining Fee (₹)" type="number" fullWidth size="small" /></Grid>
            <Grid item xs={6}><TextField label="PT Sessions Included" type="number" fullWidth size="small" /></Grid>
            <Grid item xs={6}>
              <TextField label="Status" select fullWidth size="small">
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setPlanOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setPlanOpen(false)}>Create Plan</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
