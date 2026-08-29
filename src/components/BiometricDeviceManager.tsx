'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useBranches } from '@/hooks/queries/branches';
import {
  useBiometricDevices,
  useDeleteBiometricDevice,
  useRegisterBiometricDevice,
} from '@/hooks/queries/biometrics';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string; error?: { message?: string } } } }).response;
    const message = response?.data?.error?.message ?? response?.data?.message;
    if (message) return message;
  }
  return fallback;
}

export default function BiometricDeviceManager() {
  const user = useAuthStore((state) => state.user);
  const activeBranchId = useAppStore((state) => state.branchId);
  const { data: branchesData, isLoading: branchesLoading } = useBranches();
  const { data: devices, isLoading: devicesLoading, refetch: refetchDevices } = useBiometricDevices();
  const registerMutation = useRegisterBiometricDevice();
  const deleteMutation = useDeleteBiometricDevice();
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [form, setForm] = useState({ serialNumber: '', deviceName: '', deviceType: 'F09', purpose: 'ENTRY' });
  const [error, setError] = useState('');

  const branches = useMemo(() => branchesData?.branches ?? [], [branchesData?.branches]);

  useEffect(() => {
    if (!branches.length) return;
    setSelectedBranchId((current) => {
      if (branches.some((branch: { id: string }) => branch.id === current)) return current;
      return (
        branches.find((branch: { id: string }) => branch.id === activeBranchId)?.id
        ?? branches.find((branch: { id: string }) => branch.id === user?.branchId)?.id
        ?? branches[0]?.id
        ?? ''
      );
    });
  }, [activeBranchId, branches, user?.branchId]);

  const registerDevice = async () => {
    const serialNumber = form.serialNumber.trim();
    const deviceName = form.deviceName.trim();
    if (!selectedBranchId) {
      setError('Please create a branch before registering a device.');
      return;
    }
    if (!serialNumber || !deviceName) {
      setError('Device name and serial number are required.');
      return;
    }

    setError('');
    try {
      await registerMutation.mutateAsync({
        branchId: selectedBranchId,
        serialNumber,
        deviceName,
        deviceType: form.deviceType,
        purpose: form.purpose,
      });
      setForm({ serialNumber: '', deviceName: '', deviceType: 'F09', purpose: 'ENTRY' });
    } catch (registrationError) {
      setError(errorMessage(registrationError, 'Failed to register device.'));
    }
  };

  const deleteDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to delete this device?')) return;
    setError('');
    try {
      await deleteMutation.mutateAsync(deviceId);
    } catch (deletionError) {
      setError(errorMessage(deletionError, 'Failed to delete device.'));
    }
  };

  return (
    <Card elevation={0}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Biometric Devices</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Register ZKTeco terminals for each gym branch and monitor their connection status.
            </Typography>
          </Box>
          <Tooltip title="Refresh device status">
            <IconButton size="small" onClick={() => refetchDevices()} disabled={devicesLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

        <Grid container spacing={2} sx={{ mt: 1, mb: 3, alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Branch"
              select
              size="small"
              fullWidth
              value={selectedBranchId}
              onChange={(event) => setSelectedBranchId(event.target.value)}
              disabled={branchesLoading || registerMutation.isPending}
            >
              {branches.map((branch: { id: string; name: string }) => (
                <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 2.5 }}>
            <TextField label="Device Name" size="small" fullWidth value={form.deviceName} onChange={(event) => setForm({ ...form, deviceName: event.target.value })} disabled={registerMutation.isPending} placeholder="e.g. Main Entrance" />
          </Grid>
          <Grid size={{ xs: 12, md: 2.5 }}>
            <TextField label="Serial Number" size="small" fullWidth value={form.serialNumber} onChange={(event) => setForm({ ...form, serialNumber: event.target.value })} disabled={registerMutation.isPending} placeholder="e.g. ABC123456" />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField label="Type" select size="small" fullWidth value={form.deviceType} onChange={(event) => setForm({ ...form, deviceType: event.target.value })} disabled={registerMutation.isPending}>
              <MenuItem value="F09">ZKTeco F09</MenuItem>
              <MenuItem value="OTHER">Other ZKTeco</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField label="Purpose" select size="small" fullWidth value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })} disabled={registerMutation.isPending}>
              <MenuItem value="ENTRY">Entry</MenuItem>
              <MenuItem value="EXIT">Exit</MenuItem>
              <MenuItem value="VIDEO">Video</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button variant="contained" onClick={registerDevice} disabled={branchesLoading || registerMutation.isPending || !selectedBranchId || !form.serialNumber.trim() || !form.deviceName.trim()}>
              {registerMutation.isPending ? 'Registering…' : 'Register Device'}
            </Button>
          </Grid>
        </Grid>

        {devicesLoading ? (
          <Typography variant="body2" color="text.secondary">Loading devices…</Typography>
        ) : devices && devices.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Serial Number</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Seen</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>{device.deviceName}</TableCell>
                  <TableCell>{branches.find((branch: { id: string }) => branch.id === device.branchId)?.name ?? 'Branch'}</TableCell>
                  <TableCell>{device.serialNumber}</TableCell>
                  <TableCell>{device.deviceType || '—'}</TableCell>
                  <TableCell><Chip size="small" label={device.purpose} variant="outlined" /></TableCell>
                  <TableCell><Chip size="small" label={device.status} color={device.status === 'ONLINE' ? 'success' : 'default'} /></TableCell>
                  <TableCell>{device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : 'Never'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => deleteDevice(device.id)} disabled={deleteMutation.isPending}>
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
  );
}
