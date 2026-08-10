'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Tabs, Tab,
  TextField, MenuItem, Switch, Alert, Snackbar
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { api } from '@/lib/api';

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', py: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ flex: 1, mr: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
        {desc && <Typography variant="caption" color="text.secondary">{desc}</Typography>}
      </Box>
      <Box sx={{ flexShrink: 0 }}>{children}</Box>
    </Box>
  );
}

type OrgForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  gstNumber: string;
  currency: string;
  timezone: string;
};

type BranchForm = {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  capacity: string;
  status: 'ACTIVE' | 'INACTIVE';
  openingTime: string;
  closingTime: string;
};

type AttendanceForm = {
  autoCheckoutHours: string;
  qrCheckIn: boolean;
  lateCheckoutAlert: boolean;
};

type TaxForm = {
  taxRate: string;
  taxIncluded: boolean;
};

const emptyOrg: OrgForm = {
  name: '', email: '', phone: '', address: '', city: '', state: '', gstNumber: '', currency: 'INR', timezone: 'Asia/Kolkata',
};

const emptyBranch: BranchForm = {
  id: '', name: '', address: '', city: '', phone: '', email: '', capacity: '', status: 'ACTIVE', openingTime: '06:00', closingTime: '22:00',
};

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'response' in error) {
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (message) return message;
  }
  return fallback;
}

export default function SettingsPage() {
  const [tab, setTab] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [strictPaymentPolicy, setStrictPaymentPolicy] = useState(false);
  const [policyLoading, setPolicyLoading] = useState(true);
  const [policySaving, setPolicySaving] = useState(false);
  const [policyError, setPolicyError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState('');
  const [orgForm, setOrgForm] = useState<OrgForm>(emptyOrg);
  const [branchForm, setBranchForm] = useState<BranchForm>(emptyBranch);
  const [attendanceForm, setAttendanceForm] = useState<AttendanceForm>({ autoCheckoutHours: '3', qrCheckIn: true, lateCheckoutAlert: true });
  const [taxForm, setTaxForm] = useState<TaxForm>({ taxRate: '18', taxIncluded: true });

  useEffect(() => {
    Promise.all([api.get('/org'), api.get('/branches'), api.get('/settings')])
      .then(([orgResponse, branchesResponse, settingsResponse]) => {
        const org = orgResponse.data?.org ?? {};
        setOrgForm({
          name: String(org.name ?? ''), email: String(org.email ?? ''), phone: String(org.phone ?? ''),
          address: String(org.address ?? ''), city: String(org.city ?? ''), state: String(org.state ?? ''),
          gstNumber: String(org.gstNumber ?? ''), currency: String(org.currency ?? 'INR'), timezone: String(org.timezone ?? 'Asia/Kolkata'),
        });

        const branch = (branchesResponse.data?.branches ?? [])[0];
        const settingMap = settingsResponse.data?.settings ?? {};
        const branchSetting = settingMap.branch && typeof settingMap.branch === 'object' ? settingMap.branch as Record<string, unknown> : {};
        const attendanceSetting = settingMap.attendance && typeof settingMap.attendance === 'object' ? settingMap.attendance as Record<string, unknown> : {};
        const taxSetting = settingMap.tax && typeof settingMap.tax === 'object' ? settingMap.tax as Record<string, unknown> : {};

        if (branch) {
          setBranchForm({
            id: String(branch.id), name: String(branch.name ?? ''), address: String(branch.address ?? ''), city: String(branch.city ?? ''),
            phone: String(branch.phone ?? ''), email: String(branch.email ?? ''), capacity: branch.capacity == null ? '' : String(branch.capacity),
            status: branch.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
            openingTime: String(branchSetting.openingTime ?? '06:00'), closingTime: String(branchSetting.closingTime ?? '22:00'),
          });
        }
        setAttendanceForm({
          autoCheckoutHours: String(attendanceSetting.autoCheckoutHours ?? '3'),
          qrCheckIn: attendanceSetting.qrCheckIn !== false,
          lateCheckoutAlert: attendanceSetting.lateCheckoutAlert !== false,
        });
        setTaxForm({ taxRate: String(taxSetting.taxRate ?? '18'), taxIncluded: taxSetting.taxIncluded !== false });
        const policy = settingMap['payment-policy'];
        setStrictPaymentPolicy(typeof policy === 'object' && policy !== null && 'strictPaymentPolicy' in policy && policy.strictPaymentPolicy === true);
      })
      .catch(error => {
        const message = errorMessage(error, 'Could not load settings.');
        setSettingsError(message);
        setPolicyError(message);
      })
      .finally(() => { setLoading(false); setPolicyLoading(false); });
  }, []);

  const save = async (section: string, request: Promise<unknown>, fallback: string) => {
    setSavingSection(section);
    setSettingsError('');
    try {
      await request;
      setSaveSuccess(true);
    } catch (error: unknown) {
      setSettingsError(errorMessage(error, fallback));
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <AppLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Settings</Typography>
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
          <Tab label="Payments" />
        </Tabs>
      </Box>

      {/* Gym Profile */}
      <TabPanel value={tab} index={0}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 'bold' }}>Gym Profile</Typography>
            {settingsError && <Alert severity="error" sx={{ mb: 2 }}>{settingsError}</Alert>}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}><TextField label="Gym Name" value={orgForm.name} onChange={e => setOrgForm({ ...orgForm, name: e.target.value })} disabled={loading} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><TextField label="Email" value={orgForm.email} onChange={e => setOrgForm({ ...orgForm, email: e.target.value })} disabled={loading} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><TextField label="Phone" value={orgForm.phone} onChange={e => setOrgForm({ ...orgForm, phone: e.target.value })} disabled={loading} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><TextField label="GSTIN" value={orgForm.gstNumber} onChange={e => setOrgForm({ ...orgForm, gstNumber: e.target.value })} disabled={loading} fullWidth size="small" /></Grid>
              <Grid size={12}><TextField label="Address" value={orgForm.address} onChange={e => setOrgForm({ ...orgForm, address: e.target.value })} disabled={loading} fullWidth size="small" multiline rows={2} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="City" value={orgForm.city} onChange={e => setOrgForm({ ...orgForm, city: e.target.value })} disabled={loading} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="State" value={orgForm.state} onChange={e => setOrgForm({ ...orgForm, state: e.target.value })} disabled={loading} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Currency" select value={orgForm.currency} onChange={e => setOrgForm({ ...orgForm, currency: e.target.value })} disabled={loading} fullWidth size="small">
                <MenuItem value="INR">INR (₹)</MenuItem>
                <MenuItem value="USD">USD ($)</MenuItem>
              </TextField></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Timezone" select value={orgForm.timezone} onChange={e => setOrgForm({ ...orgForm, timezone: e.target.value })} disabled={loading} fullWidth size="small">
                <MenuItem value="Asia/Kolkata">Asia/Kolkata</MenuItem>
                <MenuItem value="UTC">UTC</MenuItem>
              </TextField></Grid>
              <Grid size={12}>
                <Button variant="contained" startIcon={<SaveIcon />} disabled={loading || savingSection !== null} onClick={() => save('org', api.patch('/org', orgForm), 'Could not save gym profile.')}>Save Changes</Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Branch */}
      <TabPanel value={tab} index={1}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 'bold' }}>Branch Settings</Typography>
            {settingsError && <Alert severity="error" sx={{ mb: 2 }}>{settingsError}</Alert>}
            {!branchForm.id && <Alert severity="info" sx={{ mb: 2 }}>No branch exists yet. Enter a branch name to create the first branch.</Alert>}
            <SettingRow label="Branch Name" desc="Display name for this branch">
              <TextField size="small" value={branchForm.name} onChange={e => setBranchForm({ ...branchForm, name: e.target.value })} disabled={loading} sx={{ width: 200 }} />
            </SettingRow>
            <SettingRow label="Branch Address" desc="Address shown on receipts and invoices">
              <TextField size="small" value={branchForm.address} onChange={e => setBranchForm({ ...branchForm, address: e.target.value })} disabled={loading} sx={{ width: 200 }} />
            </SettingRow>
            <SettingRow label="Opening Time" desc="Gym opening time">
              <TextField size="small" type="time" value={branchForm.openingTime} onChange={e => setBranchForm({ ...branchForm, openingTime: e.target.value })} disabled={loading} slotProps={{ inputLabel: { shrink: true } }} />
            </SettingRow>
            <SettingRow label="Closing Time" desc="Gym closing time">
              <TextField size="small" type="time" value={branchForm.closingTime} onChange={e => setBranchForm({ ...branchForm, closingTime: e.target.value })} disabled={loading} slotProps={{ inputLabel: { shrink: true } }} />
            </SettingRow>
            <SettingRow label="Capacity" desc="Maximum members allowed simultaneously">
              <TextField size="small" type="number" value={branchForm.capacity} onChange={e => setBranchForm({ ...branchForm, capacity: e.target.value })} disabled={loading} sx={{ width: 100 }} />
            </SettingRow>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" startIcon={<SaveIcon />} disabled={loading || savingSection !== null || !branchForm.name.trim()} onClick={() => {
                const branchRequest = branchForm.id
                  ? api.patch(`/branches/${branchForm.id}`, { name: branchForm.name, address: branchForm.address, city: branchForm.city, phone: branchForm.phone, email: branchForm.email, capacity: branchForm.capacity ? Number(branchForm.capacity) : 0, status: branchForm.status })
                  : api.post('/branches', { name: branchForm.name, address: branchForm.address, capacity: branchForm.capacity ? Number(branchForm.capacity) : 0, status: branchForm.status });
                save('branch', branchRequest.then(async response => {
                  const branch = response.data?.branch;
                  if (branch?.id) setBranchForm(form => ({ ...form, id: String(branch.id) }));
                  return api.patch('/settings/branch', { branchId: branch?.id ?? branchForm.id, openingTime: branchForm.openingTime, closingTime: branchForm.closingTime });
                }), 'Could not save branch settings.');
              }}>{branchForm.id ? 'Save Branch Settings' : 'Create Branch'}</Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Attendance */}
      <TabPanel value={tab} index={2}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 'bold' }}>Attendance Settings</Typography>
            {settingsError && <Alert severity="error" sx={{ mb: 2 }}>{settingsError}</Alert>}
            <SettingRow label="Auto Check-out" desc="Automatically check out members after N hours">
              <TextField size="small" type="number" value={attendanceForm.autoCheckoutHours} onChange={e => setAttendanceForm({ ...attendanceForm, autoCheckoutHours: e.target.value })} disabled={loading} sx={{ width: 100 }} />
            </SettingRow>
            <SettingRow label="QR Code Check-in" desc="Allow members to check in via app QR code">
              <Switch checked={attendanceForm.qrCheckIn} onChange={e => setAttendanceForm({ ...attendanceForm, qrCheckIn: e.target.checked })} disabled={loading} />
            </SettingRow>
            <SettingRow label="Late Check-out Alert" desc="Notify staff if member stays past closing">
              <Switch checked={attendanceForm.lateCheckoutAlert} onChange={e => setAttendanceForm({ ...attendanceForm, lateCheckoutAlert: e.target.checked })} disabled={loading} />
            </SettingRow>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" startIcon={<SaveIcon />} disabled={loading || savingSection !== null} onClick={() => save('attendance', api.patch('/settings/attendance', { ...attendanceForm, autoCheckoutHours: Number(attendanceForm.autoCheckoutHours) }), 'Could not save attendance settings.')}>Save Attendance Settings</Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tax / GST */}
      <TabPanel value={tab} index={3}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 'bold' }}>Tax Configuration</Typography>
            {settingsError && <Alert severity="error" sx={{ mb: 2 }}>{settingsError}</Alert>}
            <SettingRow label="Tax Rate (%)" desc="Default tax applied to all plans (e.g. 18 for GST)">
              <TextField size="small" type="number" value={taxForm.taxRate} onChange={e => setTaxForm({ ...taxForm, taxRate: e.target.value })} disabled={loading} sx={{ width: 100 }} />
            </SettingRow>
            <SettingRow label="Tax Included in Price" desc="If ON, plan prices include tax. If OFF, tax is added at checkout.">
              <Switch checked={taxForm.taxIncluded} onChange={e => setTaxForm({ ...taxForm, taxIncluded: e.target.checked })} disabled={loading} />
            </SettingRow>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" startIcon={<SaveIcon />} disabled={loading || savingSection !== null} onClick={() => save('tax', api.patch('/settings/tax', { ...taxForm, taxRate: Number(taxForm.taxRate) }), 'Could not save tax settings.')}>Save Tax Settings</Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Invoice */}
      <TabPanel value={tab} index={4}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>Invoice Formatting</Typography>
            <Alert severity="info">
              Invoice numbering, PDF templates, and footer customization are intentionally deferred until the invoice template and numbering migration are implemented. Invoice records and WhatsApp queue actions are available from Payments.
            </Alert>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Hardware */}
      <TabPanel value={tab} index={5}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>Hardware Integrations</Typography>
            <Alert severity="info">
              Hardware integrations are coming soon. Biometric devices, turnstiles, and receipt printers will be enabled after device discovery, secure pairing, and connection health checks are available.
            </Alert>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Payments */}
      <TabPanel value={tab} index={6}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 'bold' }}>Payment Policy</Typography>
            {policyError && <Alert severity="error" sx={{ mb: 2 }}>{policyError}</Alert>}
            <SettingRow
              label="Strict payment access"
              desc="Only members with an active membership and a PAID payment can check in. When off, staff may check in members without a completed payment."
            >
              <Switch
                checked={strictPaymentPolicy}
                disabled={policyLoading || policySaving}
                onChange={event => setStrictPaymentPolicy(event.target.checked)}
                color="success"
              />
            </SettingRow>
            <Alert severity={strictPaymentPolicy ? 'warning' : 'info'} sx={{ mt: 2 }}>
              {strictPaymentPolicy
                ? 'Strict mode is ON. The Members table will show Payment status, and unpaid members will be blocked at check-in.'
                : 'Strict mode is OFF. Payment status remains available in payment workflows, but unpaid members are not blocked at check-in.'}
            </Alert>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={policyLoading || policySaving}
                onClick={async () => {
                  setPolicySaving(true);
                  setPolicyError('');
                  try {
                    await api.patch('/settings/payment-policy', { strictPaymentPolicy });
                    setSaveSuccess(true);
                  } catch (error: unknown) {
                    const message = error && typeof error === 'object' && 'response' in error
                      ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                      : undefined;
                    setPolicyError(message || 'Could not save payment policy.');
                  } finally {
                    setPolicySaving(false);
                  }
                }}
              >
                {policySaving ? 'Saving...' : 'Save Payment Policy'}
              </Button>
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
