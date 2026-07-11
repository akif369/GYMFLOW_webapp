'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { mockLeads } from '@/lib/mockData';

const PIPELINE_STAGES = ['New Lead', 'Contacted', 'Trial Booked', 'Trial Completed', 'Interested', 'Joined', 'Lost'];
const SOURCES = ['Walk-in', 'Instagram', 'Google', 'Referral', 'WhatsApp', 'Website', 'Other'];

const stageColor: Record<string, any> = {
  'New Lead': 'default', 'Contacted': 'info', 'Trial Booked': 'primary', 'Trial Completed': 'secondary',
  'Interested': 'warning', 'Joined': 'success', 'Lost': 'error',
};

export default function LeadsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [leads, setLeads] = useState(mockLeads);

  const byStage = (stage: string) => leads.filter(l => l.status === stage);
  const bySource = SOURCES.map(s => ({ source: s, count: leads.filter(l => l.source === s).length }));

  return (
    <AppLayout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Leads & CRM</Typography>
          <Typography variant="body2" color="text.secondary">{leads.length} total leads · {byStage('Joined').length} converted</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>Add Lead</Button>
      </Box>

      {/* Source Analytics */}
      <Card elevation={0} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight="bold" mb={2}>Lead Sources</Typography>
          <Grid container spacing={1}>
            {bySource.filter(s => s.count > 0).map(s => (
              <Grid item key={s.source}>
                <Box textAlign="center" p={2} sx={{ bgcolor: 'background.default', borderRadius: 2, minWidth: 80 }}>
                  <Typography variant="h5" fontWeight="bold" color="primary">{s.count}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.source}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Pipeline View */}
      <Typography variant="subtitle2" fontWeight="bold" mb={2}>Pipeline</Typography>
      <Box display="flex" gap={2} mb={3} sx={{ overflowX: 'auto', pb: 1 }}>
        {PIPELINE_STAGES.map(stage => (
          <Box key={stage} sx={{ minWidth: 200, flexShrink: 0 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} px={1}>
              <Typography variant="caption" fontWeight="bold">{stage}</Typography>
              <Chip label={byStage(stage).length} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {byStage(stage).map(lead => (
                <Card key={lead.id} elevation={0} sx={{ bgcolor: 'background.default', cursor: 'pointer' }}>
                  <CardContent sx={{ p: '12px !important' }}>
                    <Typography variant="body2" fontWeight="bold">{lead.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{lead.phone}</Typography>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Chip label={lead.source} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
                      <Typography variant="caption" color="text.secondary">{lead.createdAt}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              {byStage(stage).length === 0 && (
                <Box p={2} sx={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Empty</Typography>
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Table View */}
      <Card elevation={0}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight="bold" mb={2}>All Leads</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.map(lead => (
                <TableRow key={lead.id}>
                  <TableCell><Typography variant="body2" fontWeight={600}>{lead.name}</Typography></TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell><Chip label={lead.source} size="small" variant="outlined" /></TableCell>
                  <TableCell><Chip label={lead.status} size="small" color={stageColor[lead.status]} /></TableCell>
                  <TableCell>{lead.createdAt}</TableCell>
                  <TableCell><Typography variant="caption" color="text.secondary">{lead.notes}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Button size="small" variant="text">Update</Button>
                      <Button size="small" variant="text" color="success">Convert</Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Lead Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper' } }}>
        <DialogTitle>Add New Lead</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12}><TextField label="Full Name" fullWidth size="small" /></Grid>
            <Grid item xs={12}><TextField label="Phone Number" fullWidth size="small" /></Grid>
            <Grid item xs={6}>
              <TextField label="Lead Source" select fullWidth size="small">
                {SOURCES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Status" select fullWidth size="small">
                {PIPELINE_STAGES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}><TextField label="Notes" fullWidth size="small" multiline rows={2} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddOpen(false)}>Add Lead</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
