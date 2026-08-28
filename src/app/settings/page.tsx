'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Tabs, Tab,
  TextField, MenuItem, Switch, Alert, Snackbar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  FormControlLabel
} from '@mui/material';
import PageSkeleton from '@/components/PageSkeleton';
import SaveIcon from '@mui/icons-material/Save';
import { useSettings, useOrg, useSettingMutations } from '@/hooks/queries/settings';
import { useBranches, useBranchMutations } from '@/hooks/queries/branches';
import { useBiometricDevices, useBiometricIdentities, useRegisterBiometricDevice, useDeleteBiometricDevice, useSyncMemberToDevice, useSyncMemberAccess, useDeleteBiometricIdentity } from '@/hooks/queries/biometrics';
import { useMembers } from '@/hooks/queries/members';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SyncIcon from '@mui/icons-material/Sync';
import { IconButton, Chip, Tooltip, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
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
  allowExpiredCheckin: boolean;
};

type TaxForm = {
  taxRate: string;
  taxIncluded: boolean;
};

type MemberForm = {
  daysBeforeInactive: string;
};

type InvoiceForm = {
  prefix: string;
  footer: string;
  dueDays: string;
  autoSendOnRenewal: boolean;
};

type NotificationsForm = {
  attachInvoicePdf: boolean;
};

const emptyOrg: OrgForm = {
  name: '', email: '', phone: '', address: '', city: '', state: '', gstNumber: '', currency: 'INR', timezone: 'Asia/Kolkata',
};

const emptyBranch: BranchForm = {
  id: '', name: '', address: '', city: '', phone: '', email: '', capacity: '', status: 'ACTIVE', openingTime: '06:00', closingTime: '22:00',
};

function gymNumberToPin(memberNumber: string | undefined) {
  const str = String(memberNumber ?? '');
  const digits = str.replace(/\D/g, '');
  if (!digits) return '';
  const normalized = parseInt(digits, 10);
  if (!Number.isFinite(normalized)) return '';
  const isStaff = str.toUpperCase().startsWith('SAF');
  return `${isStaff ? '2' : '1'}${String(normalized).padStart(4, '0')}`;
}

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
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState('');

  const { data: orgData, isLoading: orgLoading } = useOrg();
  const { data: branchesData, isLoading: branchesLoading } = useBranches();
  const { data: settingsData, isLoading: settingsLoading } = useSettings();
  const { updateSetting, updateOrg } = useSettingMutations();
  const { addBranch, updateBranch } = useBranchMutations();

  const [deviceForm, setDeviceForm] = useState({ serialNumber: '', deviceName: '', deviceType: 'F09', purpose: 'ENTRY' });
  const { data: devices, isLoading: devicesLoading, refetch: refetchDevices } = useBiometricDevices();
  const registerDeviceMutation = useRegisterBiometricDevice();
  const deleteDeviceMutation = useDeleteBiometricDevice();
  const syncMutation = useSyncMemberToDevice();
  const syncMemberAccessMutation = useSyncMemberAccess();
  const deleteIdentityMutation = useDeleteBiometricIdentity();
  const { data: identities, refetch: refetchIdentities } = useBiometricIdentities();
  const [syncingMemberId, setSyncingMemberId] = useState<string | null>(null);
  
  const { data: membersData, isLoading: membersLoading } = useMembers({ pageSize: 1000 });
  const membersList = membersData?.items || [];

  const loading = orgLoading || branchesLoading || settingsLoading;

  const [orgForm, setOrgForm] = useState<OrgForm>(emptyOrg);
  const [branchForm, setBranchForm] = useState<BranchForm>(emptyBranch);
  const [attendanceForm, setAttendanceForm] = useState<AttendanceForm>({ autoCheckoutHours: '3', qrCheckIn: true, lateCheckoutAlert: true, allowExpiredCheckin: false });
  const [taxForm, setTaxForm] = useState<TaxForm>({ taxRate: '18', taxIncluded: true });
  const [memberForm, setMemberForm] = useState<MemberForm>({ daysBeforeInactive: '30' });
  const [invoiceForm, setInvoiceForm] = useState<InvoiceForm>({ prefix: 'GYM', footer: '', dueDays: '0', autoSendOnRenewal: true });
  const [notificationsForm, setNotificationsForm] = useState<NotificationsForm>({ attachInvoicePdf: false });
  const [strictPaymentPolicy, setStrictPaymentPolicy] = useState(false);
  const [biometricsForm, setBiometricsForm] = useState({ autoSync: true });
  const [manualSyncForm, setManualSyncForm] = useState({ memberId: '', pin: '' });

  useEffect(() => {
    if (orgData?.org) {
      const org = orgData.org;
      setOrgForm({
        name: String(org.name ?? ''), email: String(org.email ?? ''), phone: String(org.phone ?? ''),
        address: String(org.address ?? ''), city: String(org.city ?? ''), state: String(org.state ?? ''),
        gstNumber: String(org.gstNumber ?? ''), currency: String(org.currency ?? 'INR'), timezone: String(org.timezone ?? 'Asia/Kolkata'),
      });
    }

    if (branchesData?.branches?.length) {
      const branch = branchesData.branches[0];
      const settingMap = settingsData?.settings ?? {};
      const branchSetting = settingMap.branch && typeof settingMap.branch === 'object' ? settingMap.branch as Record<string, unknown> : {};
      setBranchForm({
        id: String(branch.id), name: String(branch.name ?? ''), address: String(branch.address ?? ''), city: String(branch.city ?? ''),
        phone: String(branch.phone ?? ''), email: String(branch.email ?? ''), capacity: branch.capacity == null ? '' : String(branch.capacity),
        status: branch.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
        openingTime: String(branchSetting.openingTime ?? '06:00'), closingTime: String(branchSetting.closingTime ?? '22:00'),
      });
    }

    if (settingsData?.settings) {
      const settingMap = settingsData.settings;
      const attendanceSetting = settingMap.attendance && typeof settingMap.attendance === 'object' ? settingMap.attendance as Record<string, unknown> : {};
      const taxSetting = settingMap.tax && typeof settingMap.tax === 'object' ? settingMap.tax as Record<string, unknown> : {};
      const invoiceSetting = settingMap.invoice && typeof settingMap.invoice === 'object' ? settingMap.invoice as Record<string, unknown> : {};
      const memberSetting = settingMap.member && typeof settingMap.member === 'object' ? settingMap.member as Record<string, unknown> : {};
      
      setAttendanceForm({
        autoCheckoutHours: String(attendanceSetting.autoCheckoutHours ?? '3'),
        qrCheckIn: attendanceSetting.qrCheckIn !== false,
        lateCheckoutAlert: attendanceSetting.lateCheckoutAlert !== false,
        allowExpiredCheckin: attendanceSetting.allowExpiredCheckin === true,
      });
      setMemberForm({ daysBeforeInactive: String(memberSetting.daysBeforeInactive ?? '30') });
      setTaxForm({ taxRate: String(taxSetting.taxRate ?? '18'), taxIncluded: taxSetting.taxIncluded !== false });
      setInvoiceForm({
        prefix: String(invoiceSetting.prefix ?? 'GYM'), footer: String(invoiceSetting.footer ?? ''),
        dueDays: String(invoiceSetting.dueDays ?? 0), autoSendOnRenewal: invoiceSetting.autoSendOnRenewal !== false,
      });
      setNotificationsForm({ attachInvoicePdf: invoiceSetting.attachInvoicePdf === true });
      const policy = settingMap['payment-policy'];
      setStrictPaymentPolicy(typeof policy === 'object' && policy !== null && 'strictPaymentPolicy' in policy && policy.strictPaymentPolicy === true);
      const bioSetting = settingMap.biometrics && typeof settingMap.biometrics === 'object' ? settingMap.biometrics as Record<string, unknown> : {};
      setBiometricsForm({ autoSync: bioSetting.autoSync !== false });
    }
  }, [orgData, branchesData, settingsData]);

  const save = async (section: string, action: () => Promise<unknown>, fallback: string) => {
    setSavingSection(section);
    setSettingsError('');
    try {
      await action();
      setSaveSuccess(true);
    } catch (error: unknown) {
      setSettingsError(errorMessage(error, fallback));
    } finally {
      setSavingSection(null);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <PageSkeleton />
      </AppLayout>
    );
  }

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
          <Tab label="Notifications" />
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
                <Button variant="contained" startIcon={<SaveIcon />} disabled={loading || savingSection !== null} onClick={() => save('org', () => updateOrg.mutateAsync(orgForm), 'Could not save gym profile.')}>Save Changes</Button>
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
            <SettingRow label="Days Before Inactive" desc="Number of days after membership expiry before member is marked INACTIVE">
              <TextField size="small" type="number" value={memberForm.daysBeforeInactive} onChange={e => setMemberForm({ ...memberForm, daysBeforeInactive: e.target.value })} disabled={loading} sx={{ width: 100 }} />
            </SettingRow>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" startIcon={<SaveIcon />} disabled={loading || savingSection !== null || !branchForm.name.trim()} onClick={() => {
                save('branch', async () => {
                  let currentBranchId = branchForm.id;
                  if (currentBranchId) {
                    await updateBranch.mutateAsync({ id: currentBranchId, data: { name: branchForm.name, address: branchForm.address, city: branchForm.city, phone: branchForm.phone, email: branchForm.email, capacity: branchForm.capacity ? Number(branchForm.capacity) : 0, status: branchForm.status } });
                  } else {
                    const res = await addBranch.mutateAsync({ name: branchForm.name, address: branchForm.address, capacity: branchForm.capacity ? Number(branchForm.capacity) : 0, status: branchForm.status });
                    currentBranchId = String(res.branch?.id || res.id);
                    setBranchForm(form => ({ ...form, id: currentBranchId }));
                  }
                  await updateSetting.mutateAsync({ key: 'branch', data: { branchId: currentBranchId, openingTime: branchForm.openingTime, closingTime: branchForm.closingTime } });
                  await updateSetting.mutateAsync({ key: 'member', data: { daysBeforeInactive: Number(memberForm.daysBeforeInactive), branchId: currentBranchId } });
                }, 'Could not save branch settings.');
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
            <SettingRow label="Allow Expired Check-in" desc="Allow members with expired plans to check in (shows warning)">
              <Switch checked={attendanceForm.allowExpiredCheckin} onChange={e => setAttendanceForm({ ...attendanceForm, allowExpiredCheckin: e.target.checked })} disabled={loading} />
            </SettingRow>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" startIcon={<SaveIcon />} disabled={loading || savingSection !== null} onClick={() => save('attendance', () => updateSetting.mutateAsync({ key: 'attendance', data: { ...attendanceForm, autoCheckoutHours: Number(attendanceForm.autoCheckoutHours), branchId: branchForm.id || null } }), 'Could not save attendance settings.')}>Save Attendance Settings</Button>
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
              <Button variant="contained" startIcon={<SaveIcon />} disabled={loading || savingSection !== null} onClick={() => save('tax', () => updateSetting.mutateAsync({ key: 'tax', data: { ...taxForm, taxRate: Number(taxForm.taxRate) } }), 'Could not save tax settings.')}>Save Tax Settings</Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Invoice */}
      <TabPanel value={tab} index={4}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 'bold' }}>Invoice Settings</Typography>
            {settingsError && <Alert severity="error" sx={{ mb: 2 }}>{settingsError}</Alert>}
            <SettingRow label="Invoice Prefix" desc="Used for sequential invoice numbers, for example GYM-2026-0001.">
              <TextField size="small" value={invoiceForm.prefix} onChange={e => setInvoiceForm({ ...invoiceForm, prefix: e.target.value.toUpperCase() })} disabled={loading} slotProps={{ htmlInput: { maxLength: 20 } }} sx={{ width: 180 }} />
            </SettingRow>
            <SettingRow label="Payment Due Days" desc="Set 0 for invoices due immediately.">
              <TextField size="small" type="number" value={invoiceForm.dueDays} onChange={e => setInvoiceForm({ ...invoiceForm, dueDays: e.target.value })} disabled={loading} slotProps={{ htmlInput: { min: 0, max: 365 } }} sx={{ width: 100 }} />
            </SettingRow>
            <SettingRow label="Send on Renewal" desc="Send the membership renewal invoice link through Evolution Go automatically.">
              <Switch checked={invoiceForm.autoSendOnRenewal} onChange={e => setInvoiceForm({ ...invoiceForm, autoSendOnRenewal: e.target.checked })} disabled={loading} />
            </SettingRow>
            <Box sx={{ py: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Invoice Footer</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Shown at the bottom of the backend invoice view.</Typography>
              <TextField fullWidth size="small" multiline minRows={3} value={invoiceForm.footer} onChange={e => setInvoiceForm({ ...invoiceForm, footer: e.target.value })} disabled={loading} slotProps={{ htmlInput: { maxLength: 500 } }} placeholder="Thank you for training with us." />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" startIcon={<SaveIcon />} disabled={loading || savingSection !== null || !invoiceForm.prefix.trim()} onClick={() => save('invoice', () => updateSetting.mutateAsync({ key: 'invoice', data: { ...invoiceForm, dueDays: Number(invoiceForm.dueDays) } }), 'Could not save invoice settings.')}>Save Invoice Settings</Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Hardware */}
      <TabPanel value={tab} index={5}>
        <Card elevation={0} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 'bold' }}>Access Control & Group Automation</Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Automatic sync and reconciliation of access groups are currently disabled. You can manually assign pins and toggle access states for members below.
            </Alert>
            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={<Switch checked={biometricsForm.autoSync} onChange={e => setBiometricsForm({ autoSync: e.target.checked })} />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Create Hardware PIN & Map on New Member</Typography>
                    <Typography variant="caption" color="text.secondary">Automatically checks the 'Sync to Biometric Device' toggle in the Add Member dialog</Typography>
                  </Box>
                }
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" startIcon={<SaveIcon />} disabled={loading || savingSection !== null} onClick={() => save('biometrics', () => updateSetting.mutateAsync({ key: 'biometrics', data: biometricsForm }), 'Could not save hardware settings.')}>Save Hardware Settings</Button>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 'bold' }}>Manual Device Sync</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Manually map an existing GymFlow member to a PIN on your ZKTeco device, and queue the access group data to be pushed to the device.
            </Typography>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Select Member" select size="small" fullWidth value={manualSyncForm.memberId} onChange={e => {
                  const mId = e.target.value;
                  const member = membersList.find((m: any) => m.id === mId);
                  const existingIdentity = identities?.find((i: any) => i.memberId === mId);
                  const memberCode = member?.memberNumber || member?.memberId;
                  const autoPin = existingIdentity ? existingIdentity.deviceUserId : gymNumberToPin(memberCode);
                  setManualSyncForm({ memberId: mId, pin: autoPin });
                }} disabled={loading || membersLoading || syncMutation.isPending}>
                  {membersList.map((m: any) => {
                    const existingIdentity = identities?.find((i: any) => i.memberId === m.id);
                    return (
                      <MenuItem key={m.id} value={m.id}>
                        {m.firstName} {m.lastName} ({m.memberId}) {existingIdentity ? `[Mapped to PIN: ${existingIdentity.deviceUserId}]` : ''}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField label="Device PIN (Numeric)" size="small" fullWidth value={manualSyncForm.pin} onChange={e => setManualSyncForm({ ...manualSyncForm, pin: e.target.value.replace(/\D/g, '') })} disabled={loading || syncMutation.isPending} placeholder="e.g. 1001" />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Button variant="contained" disabled={loading || syncMutation.isPending || !manualSyncForm.memberId || !manualSyncForm.pin || !branchForm.id} onClick={async () => {
                  if (!branchForm.id) return setSettingsError('Please create a branch first');
                  setSettingsError('');
                  const member = membersList.find((m: any) => m.id === manualSyncForm.memberId);
                  if (!member) return;
                  try {
                    await syncMutation.mutateAsync({
                      branchId: branchForm.id,
                      memberId: member.id,
                      pin: manualSyncForm.pin,
                      name: `${member.firstName} ${member.lastName}`.trim().substring(0, 24)
                    });
                    setManualSyncForm({ memberId: '', pin: '' });
                    setSaveSuccess(true);
                    refetchIdentities();
                  } catch (err) {
                    setSettingsError(errorMessage(err, 'Failed to sync member'));
                  }
                }}>Sync to Devices</Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Member Biometric Identities Table */}
        <Card elevation={0} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Member Device Permissions & Identities</Typography>
                <Typography variant="caption" color="text.secondary">
                  Real-time synchronization status and assigned access groups across all branch biometric terminals.
                </Typography>
              </Box>
              <Tooltip title="Refresh Identities">
                <IconButton size="small" onClick={() => refetchIdentities()}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={identities || []}
                columns={[
                  {
                    field: 'member',
                    headerName: 'Member',
                    flex: 1,
                    renderCell: (params) => {
                      const member = membersList.find((m: any) => m.id === params.row.memberId);
                      const isFullyActive = member?.status === 'ACTIVE' && (member?.membershipStatus === 'ACTIVE' || member?.membershipStatus === 'EXPIRING');
                      return (
                      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{params.row.memberName || 'Member'}</Typography>
                          {member && (
                            <Chip 
                              label={isFullyActive ? 'ACTIVE' : 'INACTIVE'} 
                              size="small" 
                              color={isFullyActive ? 'success' : 'error'} 
                              sx={{ height: 20, fontSize: '0.65rem' }} 
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">{params.row.memberNumber}</Typography>
                      </Box>
                    )}
                  },
                  { field: 'deviceUserId', headerName: 'PIN', width: 100 },
                  {
                    field: 'device',
                    headerName: 'Device',
                    width: 150,
                    renderCell: (params) => (
                      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                        <Typography variant="body2">{params.row.deviceName || 'Device'}</Typography>
                        <Typography variant="caption" color="text.secondary">{params.row.deviceSerial}</Typography>
                      </Box>
                    )
                  },
                  {
                    field: 'accessGroup',
                    headerName: 'Access State',
                    width: 150,
                    renderCell: (params) => (
                      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <Chip
                          size="small"
                          label={params.row.accessGroup === 1 ? 'Allowed' : 'Denied'}
                          color={params.row.accessGroup === 1 ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </Box>
                    )
                  },
                  {
                    field: 'syncStatus',
                    headerName: 'Sync Status',
                    width: 130,
                    renderCell: (params) => (
                      <Chip
                        size="small"
                        label={params.row.syncStatus || 'PENDING'}
                        color={params.row.syncStatus === 'SYNCED' ? 'success' : params.row.syncStatus === 'FAILED' ? 'error' : 'warning'}
                        variant="outlined"
                      />
                    )
                  },
                  {
                    field: 'lastSyncedAt',
                    headerName: 'Last Synced',
                    width: 180,
                    valueFormatter: (value) => value ? new Date(value).toLocaleString() : 'Pending'
                  },
                  {
                    field: 'actions',
                    headerName: 'Actions',
                    width: 120,
                    sortable: false,
                    renderCell: (params) => (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Force Sync Access Group">
                          <span>
                            <IconButton
                              size="small"
                              color="primary"
                              disabled={syncingMemberId === params.row.memberId || syncMemberAccessMutation.isPending}
                              onClick={async (e) => {
                                e.stopPropagation();
                                setSyncingMemberId(params.row.memberId);
                                try {
                                  await syncMemberAccessMutation.mutateAsync(params.row.memberId);
                                  setSaveSuccess(true);
                                  refetchIdentities();
                                } catch (err) {
                                  setSettingsError(errorMessage(err, 'Failed to force sync member access'));
                                } finally {
                                  setSyncingMemberId(null);
                                }
                              }}
                            >
                              {syncingMemberId === params.row.memberId ? <CircularProgress size={16} /> : <SyncIcon fontSize="small" />}
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Unmap PIN / Delete Identity">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={deleteIdentityMutation.isPending}
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to unmap this member from their PIN? This will wipe the PIN from the physical device.')) {
                                  try {
                                    await deleteIdentityMutation.mutateAsync(params.row.id);
                                    setSaveSuccess(true);
                                  } catch (err) {
                                    setSettingsError(errorMessage(err, 'Failed to unmap identity'));
                                  }
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    )
                  }
                ]}
                pageSizeOptions={[5, 10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10, page: 0 } },
                }}
                disableRowSelectionOnClick
                getRowId={(row) => row.id || `${row.deviceId}-${row.memberId}`}
                sx={{
                  border: 0,
                  '& .MuiDataGrid-columnHeaders': {
                    bgcolor: 'rgba(255,255,255,0.03)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  },
                  '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(255,255,255,0.04)' },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        <Card elevation={0}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Biometric Devices</Typography>
              <Tooltip title="Refresh Device Status">
                <IconButton size="small" onClick={() => refetchDevices()} disabled={devicesLoading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
            {settingsError && <Alert severity="error" sx={{ mb: 2 }}>{settingsError}</Alert>}
            
            <Grid container spacing={2} sx={{ mb: 4, alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 2.5 }}>
                <TextField label="Device Name" size="small" fullWidth value={deviceForm.deviceName} onChange={e => setDeviceForm({ ...deviceForm, deviceName: e.target.value })} disabled={loading || registerDeviceMutation.isPending} placeholder="e.g. Main Entrance" />
              </Grid>
              <Grid size={{ xs: 12, md: 2.5 }}>
                <TextField label="Serial Number" size="small" fullWidth value={deviceForm.serialNumber} onChange={e => setDeviceForm({ ...deviceForm, serialNumber: e.target.value })} disabled={loading || registerDeviceMutation.isPending} placeholder="e.g. ABC123456" />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField label="Type" select size="small" fullWidth value={deviceForm.deviceType} onChange={e => setDeviceForm({ ...deviceForm, deviceType: e.target.value })} disabled={loading || registerDeviceMutation.isPending}>
                  <MenuItem value="F09">ZKTeco F09</MenuItem>
                  <MenuItem value="OTHER">Other ZKTeco</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField label="Purpose" select size="small" fullWidth value={deviceForm.purpose} onChange={e => setDeviceForm({ ...deviceForm, purpose: e.target.value })} disabled={loading || registerDeviceMutation.isPending}>
                  <MenuItem value="ENTRY">Entry</MenuItem>
                  <MenuItem value="EXIT">Exit</MenuItem>
                  <MenuItem value="VIDEO">Video</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Button variant="contained" disabled={loading || registerDeviceMutation.isPending || !deviceForm.serialNumber || !deviceForm.deviceName || !branchForm.id} onClick={async () => {
                  if (!branchForm.id) return setSettingsError('Please create a branch first');
                  setSettingsError('');
                  try {
                    await registerDeviceMutation.mutateAsync({ branchId: branchForm.id, serialNumber: deviceForm.serialNumber, deviceName: deviceForm.deviceName, deviceType: deviceForm.deviceType, purpose: deviceForm.purpose });
                    setDeviceForm({ serialNumber: '', deviceName: '', deviceType: 'F09', purpose: 'ENTRY' });
                    setSaveSuccess(true);
                  } catch (err) {
                    setSettingsError(errorMessage(err, 'Failed to register device'));
                  }
                }}>Register Device</Button>
              </Grid>
            </Grid>

            {devicesLoading ? (
              <Typography variant="body2" color="text.secondary">Loading devices...</Typography>
            ) : devices && devices.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Serial Number</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Purpose</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Seen</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {devices.map(device => (
                    <TableRow key={device.id}>
                      <TableCell>{device.deviceName}</TableCell>
                      <TableCell>{device.serialNumber}</TableCell>
                      <TableCell>{device.deviceType}</TableCell>
                      <TableCell>
                        <Chip size="small" label={device.purpose} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={device.status} color={device.status === 'ONLINE' ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell>{device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : 'Never'}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={async () => {
                          if (confirm('Are you sure you want to delete this device?')) {
                            setSettingsError('');
                            try {
                              await deleteDeviceMutation.mutateAsync(device.id);
                              setSaveSuccess(true);
                            } catch (err) {
                              setSettingsError(errorMessage(err, 'Failed to delete device'));
                            }
                          }
                        }} disabled={deleteDeviceMutation.isPending}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Alert severity="info">No biometric devices registered.</Alert>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Payments */}
      <TabPanel value={tab} index={6}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 'bold' }}>Payment Policy</Typography>
            {settingsError && <Alert severity="error" sx={{ mb: 2 }}>{settingsError}</Alert>}
            <SettingRow
              label="Strict payment access"
              desc="Only members with an active membership and a PAID payment can check in. When off, staff may check in members without a completed payment."
            >
              <Switch
                checked={strictPaymentPolicy}
                disabled={loading || savingSection !== null}
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
                disabled={loading || savingSection !== null}
                onClick={() => save('payment-policy', () => updateSetting.mutateAsync({ key: 'payment-policy', data: { strictPaymentPolicy } }), 'Could not save payment policy.')}
              >
                Save Payment Policy
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Notifications */}
      <TabPanel value={tab} index={7}>
        <Card elevation={0}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 'bold' }}>Notification Settings</Typography>
            {settingsError && <Alert severity="error" sx={{ mb: 2 }}>{settingsError}</Alert>}
            <SettingRow
              label="Attach invoice document"
              desc="When enabled, WhatsApp invoice deliveries send the invoice as a real PDF attachment instead of a link."
            >
              <Switch
                checked={notificationsForm.attachInvoicePdf}
                disabled={loading || savingSection !== null}
                onChange={e => setNotificationsForm({ ...notificationsForm, attachInvoicePdf: e.target.checked })}
                color="success"
              />
            </SettingRow>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading || savingSection !== null}
                onClick={() => save(
                  'notifications',
                  () => updateSetting.mutateAsync({
                    key: 'invoice',
                    data: {
                      ...invoiceForm,
                      dueDays: Number(invoiceForm.dueDays),
                      attachInvoicePdf: notificationsForm.attachInvoicePdf,
                    }
                  }),
                  'Could not save notification settings.'
                )}
              >
                Save Notification Settings
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
