'use client';
import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, Avatar, Stack, Chip,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import { useAuthStore } from '@/store/useAuthStore';

export default function MemberProfilePage() {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName:  user?.lastName ?? '',
    phone:     user?.phone ?? '+91 98765 43210',
    email:     user?.email ?? '',
    dob:       '1995-06-15',
    gender:    'MALE',
    address:   '42 MG Road, Koramangala, Bangalore - 560034',
    bloodGroup:'O+',
    emergency: { name: 'Rajesh Mehta', phone: '+91 87654 32109', relation: 'Father' },
  });

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'ME';

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
            Account
          </Typography>
          <Typography component="h1" sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: 'text.primary' }}>
            My Profile
          </Typography>
        </Box>
        <Button
          variant={editing ? 'contained' : 'outlined'}
          size="small"
          startIcon={editing ? <SaveRoundedIcon /> : <EditRoundedIcon />}
          onClick={() => setEditing((e) => !e)}
          sx={editing
            ? { bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, fontWeight: 700 }
            : { borderColor: 'rgba(16,185,129,0.3)', color: '#10b981', '&:hover': { borderColor: '#10b981', bgcolor: 'rgba(16,185,129,0.06)' } }
          }
        >
          {editing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Profile header */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={0}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
              <Avatar sx={{
                width: 72, height: 72, fontSize: '1.5rem', fontWeight: 800,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', flexShrink: 0,
              }}>
                {initials}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: 'text.primary' }}>
                  {form.firstName} {form.lastName}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 0.75 }}>
                  {form.email}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="Member" size="small" sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700 }} />
                  <Chip label="Premium Plan" size="small" sx={{ bgcolor: 'rgba(139,92,246,0.1)', color: '#a78bfa', fontWeight: 700 }} />
                  <Chip label="GYM-1024" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary', fontWeight: 600 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Personal info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PersonRoundedIcon sx={{ fontSize: 18, color: '#10b981' }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>Personal Information</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField label="First Name" value={form.firstName} size="small" fullWidth disabled={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField label="Last Name" value={form.lastName} size="small" fullWidth disabled={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Date of Birth" value={form.dob} type="date" size="small" fullWidth disabled={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                    slotProps={{ inputLabel: { shrink: true } }} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Address" value={form.address} size="small" fullWidth multiline rows={2} disabled={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField label="Blood Group" value={form.bloodGroup} size="small" fullWidth disabled={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, bloodGroup: e.target.value }))} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact + Emergency */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Card elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PhoneRoundedIcon sx={{ fontSize: 18, color: '#10b981' }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>Contact</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField label="Phone" value={form.phone} size="small" fullWidth disabled={!editing}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField label="Email" value={form.email} size="small" fullWidth disabled />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LocalHospitalRoundedIcon sx={{ fontSize: 18, color: '#f43f5e' }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>Emergency Contact</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField label="Name" value={form.emergency.name} size="small" fullWidth disabled={!editing}
                      onChange={(e) => setForm((f) => ({ ...f, emergency: { ...f.emergency, name: e.target.value } }))} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField label="Phone" value={form.emergency.phone} size="small" fullWidth disabled={!editing}
                      onChange={(e) => setForm((f) => ({ ...f, emergency: { ...f.emergency, phone: e.target.value } }))} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField label="Relation" value={form.emergency.relation} size="small" fullWidth disabled={!editing}
                      onChange={(e) => setForm((f) => ({ ...f, emergency: { ...f.emergency, relation: e.target.value } }))} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Change password */}
            <Card elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <LockRoundedIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>Security</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mb: 1.5 }}>
                  Change your account password.
                </Typography>
                <Button variant="outlined" size="small" fullWidth
                  sx={{ borderColor: 'rgba(139,92,246,0.3)', color: '#a78bfa', '&:hover': { borderColor: '#8b5cf6', bgcolor: 'rgba(139,92,246,0.06)' } }}>
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
