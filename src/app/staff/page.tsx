'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Checkbox, FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { mockStaff, ALL_PERMISSIONS } from '@/lib/mockData';

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const roleColor: Record<string, ChipColor> = { OWNER: 'error', MANAGER: 'warning', RECEPTIONIST: 'info', TRAINER: 'success' };

export default function StaffPage() {
  const [tab, setTab] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('RECEPTIONIST');

  const defaultPerms = selectedRole === 'MANAGER' ? ALL_PERMISSIONS.filter(p => !p.includes('delete')) : ['member.create', 'payment.create', 'attendance.create'];

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', mb: 3, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{fontWeight:"bold"}}>Staff & Permissions</Typography>
          <Typography variant="body2" color="text.secondary">{mockStaff.length} staff members</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>Add Staff</Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab label="Staff Members" />
          <Tab label="Roles & Permissions" />
        </Tabs>
      </Box>

      {/* Tab 0: Staff Members */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={2}>
          {mockStaff.map(staff => (
            <Grid size={{ xs: 12, md: 6 }} key={staff.id}>
              <Card elevation={0}>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.dark' }}>{staff.name.split(' ').map(n => n[0]).join('')}</Avatar>
                    <Box sx={{flex:1}}>
                      <Typography variant="subtitle2" sx={{fontWidth:"bold"}} >{staff.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{staff.email} · {staff.phone}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "flex-end" }}>
                      <Chip label={staff.role} size="small" color={roleColor[staff.role]} />
                      <Chip label={staff.status} size="small" color={staff.status === 'ACTIVE' ? 'success' : 'default'} />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary"  sx={{ mb: 0.5,display:"block" }}>Permissions</Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {staff.permissions.map(p => (
                        <Chip key={p} label={p} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button size="small" variant="outlined" fullWidth>Edit Permissions</Button>
                    <Button size="small" variant="outlined" color={staff.status === 'ACTIVE' ? 'error' : 'success'} fullWidth>
                      {staff.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Tab 1: Roles & Permissions */}
      <TabPanel value={tab} index={1}>
        <Grid container spacing={2}>
          {[
            { role: 'OWNER', perms: ALL_PERMISSIONS, desc: 'Full access to everything' },
            { role: 'MANAGER', perms: ALL_PERMISSIONS.filter(p => !p.includes('delete')), desc: 'All except delete' },
            { role: 'RECEPTIONIST', perms: ['member.create', 'payment.create', 'attendance.create'], desc: 'Daily operations only' },
            { role: 'TRAINER', perms: ['attendance.create'], desc: 'View own sessions only' },
          ].map(r => (
            <Grid size={{ xs: 12, md: 6 }} key={r.role}>
              <Card elevation={0}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Chip label={r.role} color={roleColor[r.role]} />
                    <Typography variant="caption" color="text.secondary">{r.desc}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {ALL_PERMISSIONS.map(p => (
                      <Chip
                        key={p}
                        label={p}
                        size="small"
                        variant={r.perms.includes(p) ? 'filled' : 'outlined'}
                        color={r.perms.includes(p) ? 'primary' : 'default'}
                        sx={{ fontSize: '0.65rem', height: 20, opacity: r.perms.includes(p) ? 1 : 0.4 }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Add Staff Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth sx={{bgcolor: 'background.paper'}} PaperProps={{ sx: { bgcolor: 'background.paper' } }}>
        <DialogTitle>Add Staff Member</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="First Name" fullWidth size="small" /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Last Name" fullWidth size="small" /></Grid>
            <Grid size={12}><TextField label="Email" fullWidth size="small" /></Grid>
            <Grid size={12}><TextField label="Phone" fullWidth size="small" /></Grid>
            <Grid size={12}>
              <TextField label="Role" select fullWidth size="small" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                {['MANAGER', 'RECEPTIONIST', 'TRAINER'].map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={12}>
              <Typography variant="caption" color="text.secondary"  sx={{ mb: 1,display:"block" }}>Permissions</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {ALL_PERMISSIONS.map(p => (
                  <Chip
                    key={p}
                    label={p}
                    size="small"
                    clickable
                    variant={defaultPerms.includes(p) ? 'filled' : 'outlined'}
                    color={defaultPerms.includes(p) ? 'primary' : 'default'}
                    sx={{ fontSize: '0.65rem', height: 22 }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddOpen(false)}>Add Staff</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
