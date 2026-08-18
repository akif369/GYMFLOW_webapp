'use client';
import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Avatar, Grid,
  TextField, Button, Chip, Divider, Stack,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { useAuthStore } from '@/store/useAuthStore';

const SPECIALIZATIONS = ['Strength Training', 'HIIT', 'Cardio', 'Yoga', 'Athletic Performance', 'Post-Rehab'];
const CERTIFICATIONS  = ['ACE Personal Trainer', 'NSCA-CSCS', 'Functional Movement Specialist'];

export default function TrainerProfilePage() {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName:  user?.firstName ?? '',
    lastName:   user?.lastName ?? '',
    email:      user?.email ?? '',
    phone:      user?.phone ?? '+91 98765 43210',
    experience: '5 years',
    bio:        'Certified personal trainer specializing in strength training and athletic performance. Helped 200+ clients achieve their fitness goals.',
    rating:     4.8,
    totalReviews: 38,
  });

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'TR';

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
            Trainer Account
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
            ? { bgcolor: '#ec4899', '&:hover': { bgcolor: '#be185d' }, fontWeight: 700 }
            : { borderColor: 'rgba(236,72,153,0.3)', color: '#ec4899', '&:hover': { borderColor: '#ec4899', bgcolor: 'rgba(236,72,153,0.06)' } }
          }
        >
          {editing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Profile header */}
        <Grid item xs={12}>
          <Card elevation={0}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
              <Avatar sx={{
                width: 72, height: 72, fontSize: '1.5rem', fontWeight: 800,
                background: 'linear-gradient(135deg, #ec4899, #be185d)',
                color: '#fff', flexShrink: 0,
              }}>
                {initials}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: 'text.primary' }}>
                  {form.firstName} {form.lastName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                  <StarRoundedIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#f59e0b' }}>{form.rating}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>({form.totalReviews} reviews)</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="Trainer" size="small" sx={{ bgcolor: 'rgba(236,72,153,0.1)', color: '#ec4899', fontWeight: 700 }} />
                  <Chip label={form.experience} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary', fontWeight: 600 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Edit form */}
        <Grid item xs={12} md={6}>
          <Card elevation={0}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary', mb: 2 }}>Personal Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField label="First Name" value={form.firstName} size="small" fullWidth disabled={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Last Name" value={form.lastName} size="small" fullWidth disabled={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Email" value={form.email} size="small" fullWidth disabled />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Phone" value={form.phone} size="small" fullWidth disabled={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Bio / About" value={form.bio} size="small" fullWidth multiline rows={3} disabled={!editing}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Specializations + Certs */}
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Card elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary', mb: 1.5 }}>Specializations</Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {SPECIALIZATIONS.map((s) => (
                    <Chip key={s} label={s} size="small" sx={{ bgcolor: 'rgba(236,72,153,0.1)', color: '#ec4899', fontWeight: 600 }} />
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Card elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary', mb: 1.5 }}>Certifications</Typography>
                <Stack divider={<Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}>
                  {CERTIFICATIONS.map((cert) => (
                    <Box key={cert} sx={{ py: 1 }}>
                      <Typography sx={{ fontSize: '0.82rem', color: 'text.primary' }}>{cert}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <LockRoundedIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>Security</Typography>
                </Box>
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
