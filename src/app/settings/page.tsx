'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Tabs, Tab,
  TextField, MenuItem, Divider, Switch, FormControlLabel, Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <Box display="flex" py={2} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box flex={1} mr={2}>
        <Typography variant="body2" fontWeight={600}>{label}</Typography>
        {desc && <Typography variant="caption" color="text.secondary">{desc}</Typography>}
      </Box>
      <Box flexShrink={0}>{children}</Box>
    </Box>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState(0);

  return (
    <AppLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Settings</Typography>
        <Typography variant="body2" color="text.secondary">Configure your gym management system</Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab label="Gym Profile" />
          <Tab label="Branch" />
          <Tab label="Attendance" />
          <Tab label="Tax / GST" />
          <Tab label="Invoice" />
          <Tab label="Hardware" />
        </Tabs>
      </Box>

      {/* Gym Profile */}
      <TabPanel value={tab} index={0}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 3 }}>Gym Profile</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}><TextField label="Gym Name" defaultValue="IronZone Fitness" fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><TextField label="Owner Name" defaultValue="Rajan Sharma" fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><TextField label="Email" defaultValue="admin@ironzone.com" fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><TextField label="Phone" defaultValue="+91 98765 43210" fullWidth size="small" /></Grid>
              <Grid size={12}><TextField label="Address" defaultValue="42, 5th Main, Koramangala, Bangalore - 560095" fullWidth size="small" multiline rows={2} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="GSTIN" defaultValue="29AABCT1332L1ZH" fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Currency" select defaultValue="INR" fullWidth size="small">
                <MenuItem value="INR">INR (₹)</MenuItem>
                <MenuItem value="USD">USD ($)</MenuItem>
              </TextField></Grid>
              <Grid size={12}>
                <Button variant="contained" startIcon={<SaveIcon />}>Save Changes</Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Branch */}
      <TabPanel value={tab} index={1}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 3 }}>Branch Settings</Typography>
            <SettingRow label="Branch Name" desc="Display name for this branch">
              <TextField size="small" defaultValue="Koramangala" sx={{ width: 200 }} />
            </SettingRow>
            <SettingRow label="Opening Time" desc="Gym opening time">
              <TextField size="small" type="time" defaultValue="06:00" InputLabelProps={{ shrink: true }} />
            </SettingRow>
            <SettingRow label="Closing Time" desc="Gym closing time">
              <TextField size="small" type="time" defaultValue="22:00" InputLabelProps={{ shrink: true }} />
            </SettingRow>
            <SettingRow label="Capacity" desc="Maximum members allowed simultaneously">
              <TextField size="small" type="number" defaultValue="80" sx={{ width: 100 }} />
            </SettingRow>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" startIcon={<SaveIcon />}>Save Branch Settings</Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Attendance */}
      <TabPanel value={tab} index={2}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 3 }}>Attendance Settings</Typography>
            <SettingRow label="Auto Check-out" desc="Automatically check out members after N hours">
              <FormControlLabel control={<Switch defaultChecked />} label="" />
            </SettingRow>
            <SettingRow label="Auto Check-out After (hours)" desc="Hours before automatic check-out">
              <TextField size="small" type="number" defaultValue="4" sx={{ width: 100 }} />
            </SettingRow>
            <SettingRow label="Expired Member Entry" desc="Block check-in if membership is expired">
              <FormControlLabel control={<Switch defaultChecked />} label="" />
            </SettingRow>
            <SettingRow label="Default Check-in Method">
              <TextField size="small" select defaultValue="MANUAL" sx={{ width: 150 }}>
                <MenuItem value="MANUAL">Manual</MenuItem>
                <MenuItem value="QR">QR Code</MenuItem>
                <MenuItem value="RFID">RFID</MenuItem>
              </TextField>
            </SettingRow>
            <Box sx={{ mt: 2 }}><Button variant="contained" startIcon={<SaveIcon />}>Save</Button></Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tax / GST */}
      <TabPanel value={tab} index={3}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Tax & GST Configuration</Typography>
            <Alert severity="info" sx={{ mb: 3 }}>India GST (18%) applies to gym services. Configure below.</Alert>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="GSTIN" defaultValue="29AABCT1332L1ZH" fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Default GST Rate (%)" type="number" defaultValue="18" fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="CGST (%)" type="number" defaultValue="9" fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="SGST (%)" type="number" defaultValue="9" fullWidth size="small" /></Grid>
              <Grid size={12}>
                <SettingRow label="Show GST Breakdown on Invoices" desc="">
                  <FormControlLabel control={<Switch defaultChecked />} label="" />
                </SettingRow>
              </Grid>
              <Grid size={12}><Button variant="contained" startIcon={<SaveIcon />}>Save Tax Settings</Button></Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Invoice */}
      <TabPanel value={tab} index={4}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 3 }}>Invoice Settings</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Invoice Prefix" defaultValue="INV-GYM-" fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Starting Number" type="number" defaultValue="1001" fullWidth size="small" /></Grid>
              <Grid size={12}><TextField label="Footer Note" defaultValue="Thank you for choosing IronZone Fitness! Contact us at admin@ironzone.com" fullWidth size="small" multiline rows={2} /></Grid>
              <Grid size={12}>
                <SettingRow label="Include Logo on Invoice" desc="">
                  <FormControlLabel control={<Switch defaultChecked />} label="" />
                </SettingRow>
                <SettingRow label="Include GST Breakdown" desc="">
                  <FormControlLabel control={<Switch defaultChecked />} label="" />
                </SettingRow>
              </Grid>
              <Grid size={12}><Button variant="contained" startIcon={<SaveIcon />}>Save Invoice Settings</Button></Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Hardware */}
      <TabPanel value={tab} index={5}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Hardware & Device Management</Typography>
            <Alert severity="info" sx={{ mb: 3 }}>QR scanner and RFID reader integrations can be configured here.</Alert>
            <SettingRow label="QR Code Scanner" desc="Enable QR-based check-in (requires physical scanner)">
              <FormControlLabel control={<Switch />} label="" />
            </SettingRow>
            <SettingRow label="RFID Reader" desc="Enable RFID card check-in">
              <FormControlLabel control={<Switch />} label="" />
            </SettingRow>
            <SettingRow label="Printer" desc="Receipt printer integration">
              <FormControlLabel control={<Switch />} label="" />
            </SettingRow>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Hardware integration requires additional setup. Contact GymFlow support for configuration assistance.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
    </AppLayout>
  );
}
