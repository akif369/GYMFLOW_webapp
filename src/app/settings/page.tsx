'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Tabs, Tab,
  TextField, MenuItem, Switch, FormControlLabel, Alert, Snackbar
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
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
  };

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
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>Save Changes</Button>
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
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>Save Branch Settings</Button>
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
              <TextField size="small" type="number" defaultValue="3" sx={{ width: 100 }} />
            </SettingRow>
            <SettingRow label="QR Code Check-in" desc="Allow members to check in via app QR code">
              <Switch defaultChecked />
            </SettingRow>
            <SettingRow label="Late Check-out Alert" desc="Notify staff if member stays past closing">
              <Switch defaultChecked />
            </SettingRow>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>Save Attendance Settings</Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tax / GST */}
      <TabPanel value={tab} index={3}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 3 }}>Tax Configuration</Typography>
            <SettingRow label="Tax Rate (%)" desc="Default tax applied to all plans (e.g. 18 for GST)">
              <TextField size="small" type="number" defaultValue="18" sx={{ width: 100 }} />
            </SettingRow>
            <SettingRow label="Tax Included in Price" desc="If ON, plan prices include tax. If OFF, tax is added at checkout.">
              <Switch defaultChecked />
            </SettingRow>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>Save Tax Settings</Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Invoice */}
      <TabPanel value={tab} index={4}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 3 }}>Invoice Formatting</Typography>
            <SettingRow label="Invoice Prefix" desc="Prefix for generated invoice numbers">
              <TextField size="small" defaultValue="INV-2024-" sx={{ width: 150 }} />
            </SettingRow>
            <SettingRow label="Next Invoice Number" desc="The sequence number for the next invoice">
              <TextField size="small" type="number" defaultValue="1042" sx={{ width: 100 }} />
            </SettingRow>
            <SettingRow label="Invoice Footer Note" desc="Text displayed at the bottom of invoices">
              <TextField size="small" defaultValue="Thank you for your business. Fees are non-refundable." fullWidth />
            </SettingRow>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>Save Invoice Settings</Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Hardware */}
      <TabPanel value={tab} index={5}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 3 }}>Hardware Integrations</Typography>
            <SettingRow label="Biometric Scanner IP" desc="Local IP of fingerprint/face scanner">
              <TextField size="small" defaultValue="192.168.1.100" sx={{ width: 150 }} />
            </SettingRow>
            <SettingRow label="Turnstile Gate Integration" desc="Send signal to open gate on check-in">
              <Switch defaultChecked />
            </SettingRow>
            <SettingRow label="Receipt Printer IP" desc="Network printer for instant invoice printing">
              <TextField size="small" defaultValue="192.168.1.105" sx={{ width: 150 }} />
            </SettingRow>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>Save Hardware Settings</Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      <Snackbar 
        open={saveSuccess} 
        autoHideDuration={3000} 
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSaveSuccess(false)}>Settings saved successfully</Alert>
      </Snackbar>
    </AppLayout>
  );
}
