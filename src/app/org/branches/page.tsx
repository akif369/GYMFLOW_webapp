'use client';
import {
  Box, Card, CardContent, Typography, Chip, Grid, Button,
  LinearProgress, Avatar, Divider, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

import { useBranches, useBranchMutations } from '@/hooks/queries/branches';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function OrgBranchesPage() {
  const { data, isLoading } = useBranches();
  const { addBranch, updateBranch } = useBranchMutations();
  const branches = data?.branches || [];

  const [openAdd, setOpenAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', city: '', address: '', phone: '', capacity: 1000 });
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addBranch.mutateAsync(formData);
      setOpenAdd(false);
      setFormData({ name: '', city: '', address: '', phone: '', capacity: 1000 });
    } catch (e) {
      console.error(e);
      toast.error('Failed to add branch');
    } finally {
      setAdding(false);
    }
  };

  const [editBranch, setEditBranch] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleEdit = async () => {
    if (!editBranch) return;
    setEditing(true);
    try {
      await updateBranch.mutateAsync({
        id: editBranch.id,
        data: {
          name: editBranch.name,
          city: editBranch.city,
          address: editBranch.address,
          phone: editBranch.phone,
          capacity: editBranch.capacity,
        }
      });
      setEditOpen(false);
      setEditBranch(null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to edit branch');
    } finally {
      setEditing(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
            Network
          </Typography>
          <Typography component="h1" sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: 'text.primary' }}>
            All Branches
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: '0.85rem', color: 'text.secondary' }}>
            {isLoading ? 'Loading...' : `${branches.length} branches · All operational`}
          </Typography>
        </Box>
        <Button startIcon={<AddRoundedIcon />} variant="contained" size="small" onClick={() => setOpenAdd(true)}
          sx={{ bgcolor: '#f59e0b', color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#d97706' } }}>
          Add Branch
        </Button>
      </Box>

      {isLoading ? (
        <Grid container spacing={2}>
          {[1, 2, 3].map(i => (
            <Grid size={{ xs: 12, md: 6 }} key={i}>
              <Skeleton variant="rounded" height={250} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {branches.map((branch: any) => {
            const occupancy = Math.round(((branch.members ?? 0) / (branch.capacity || 1)) * 100);
            const growthUp = (branch.growth ?? 0) >= 0;
            return (
              <Grid size={{ xs: 12, md: 6 }} key={branch.id}>
                <Card elevation={0} sx={{
                  height: '100%', transition: 'transform 0.18s, border-color 0.18s',
                  '&:hover': { transform: 'translateY(-2px)', borderColor: 'rgba(245,158,11,0.25)' },
                  position: 'relative', overflow: 'hidden',
                }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #f59e0b 0%, transparent 100%)' }} />
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                      <Avatar sx={{ width: 44, height: 44, bgcolor: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                        {branch.name[0]}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>{branch.name}</Typography>
                          {branch.isMain && <Chip label="Main" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(245,158,11,0.15)', color: '#f59e0b' }} />}
                          <Chip label={branch.status} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981' }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{branch.address}, {branch.city}</Typography>
                      </Box>
                    </Box>

                    {/* Revenue + Growth */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', mb: 0.25 }}>Monthly Revenue</Typography>
                        <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: 'text.primary', letterSpacing: '-0.04em' }}>
                          ₹{((branch.revenue ?? 0) / 1000).toFixed(0)}K
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, alignSelf: 'center', px: 1, py: 0.5, borderRadius: 1.5, bgcolor: growthUp ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)' }}>
                        {growthUp ? <ArrowUpwardRoundedIcon sx={{ fontSize: 13, color: '#4ade80' }} /> : <ArrowDownwardRoundedIcon sx={{ fontSize: 13, color: '#f87171' }} />}
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: growthUp ? '#4ade80' : '#f87171' }}>{Math.abs(branch.growth ?? 0)}%</Typography>
                      </Box>
                    </Box>

                    {/* Capacity */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>Capacity: {branch.members ?? 0}/{branch.capacity} members</Typography>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: occupancy >= 70 ? '#10b981' : occupancy >= 50 ? '#f59e0b' : '#f87171' }}>{occupancy}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={Math.min(occupancy, 100)} sx={{
                        height: 6, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.07)',
                        '& .MuiLinearProgress-bar': { bgcolor: occupancy >= 70 ? '#10b981' : occupancy >= 50 ? '#f59e0b' : '#f87171', borderRadius: 4 },
                      }} />
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 1.5 }} />

                    {/* Staff stats */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                      <Box>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: 'text.primary' }}>{branch.staff ?? 0}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>Staff</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: 'text.primary' }}>{branch.trainers ?? 0}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>Trainers</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: 'text.primary' }}>{branch.members ?? 0}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>Members</Typography>
                      </Box>
                    </Box>

                    <Button variant="outlined" size="small" fullWidth
                      onClick={() => { setEditBranch({ ...branch }); setEditOpen(true); }}
                      sx={{ borderColor: 'rgba(245,158,11,0.25)', color: '#f59e0b', '&:hover': { borderColor: '#f59e0b', bgcolor: 'rgba(245,158,11,0.06)' } }}>
                      Manage Branch
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add Branch Modal */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} slotProps={{ paper: { sx: { bgcolor: '#0f172a', backgroundImage: 'none', minWidth: 400 } } }}>
        <DialogTitle sx={{ color: '#fff' }}>Add New Branch</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Branch Name" size="small" fullWidth value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <TextField label="City" size="small" fullWidth value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
            <TextField label="Address" size="small" fullWidth multiline rows={2} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
            <TextField label="Phone" size="small" fullWidth value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            <TextField label="Capacity (Members)" type="number" size="small" fullWidth value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1000 })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenAdd(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" disabled={adding || !formData.name || !formData.city} onClick={handleAdd}
            sx={{ bgcolor: '#f59e0b', color: '#000', '&:hover': { bgcolor: '#d97706' } }}>
            {adding ? 'Adding...' : 'Add Branch'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Branch Modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} slotProps={{ paper: { sx: { bgcolor: '#0f172a', backgroundImage: 'none', minWidth: 400 } } }}>
        <DialogTitle sx={{ color: '#fff' }}>Edit Branch</DialogTitle>
        <DialogContent>
          {editBranch && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Branch Name" size="small" fullWidth value={editBranch.name} onChange={e => setEditBranch({ ...editBranch, name: e.target.value })} />
              <TextField label="City" size="small" fullWidth value={editBranch.city} onChange={e => setEditBranch({ ...editBranch, city: e.target.value })} />
              <TextField label="Address" size="small" fullWidth multiline rows={2} value={editBranch.address} onChange={e => setEditBranch({ ...editBranch, address: e.target.value })} />
              <TextField label="Phone" size="small" fullWidth value={editBranch.phone || ''} onChange={e => setEditBranch({ ...editBranch, phone: e.target.value })} />
              <TextField label="Capacity (Members)" type="number" size="small" fullWidth value={editBranch.capacity} onChange={e => setEditBranch({ ...editBranch, capacity: parseInt(e.target.value) || 1000 })} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setEditBranch(null)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" disabled={editing || !editBranch?.name || !editBranch?.city} onClick={handleEdit}
            sx={{ bgcolor: '#f59e0b', color: '#000', '&:hover': { bgcolor: '#d97706' } }}>
            {editing ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
