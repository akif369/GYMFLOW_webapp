'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Tabs, Tab,
  Table, TableBody, TableCell, TableHead, TableRow, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { api } from '@/lib/api';
import { useExercises, useWorkoutTemplates } from '@/hooks/queries/workouts';

type ExerciseRow = { id: string; name: string; muscleGroup: string; equipment: string; difficulty: string; active: boolean; description: string };
type WorkoutTemplateRow = { id: string; name: string; exercises: number; trainer: string; members: number; description: string };

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>;
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
const difficultyColor: Record<string, ChipColor> = { Beginner: 'success', Intermediate: 'warning', Advanced: 'error' };

export default function WorkoutsPage() {
  const [tab, setTab] = useState(0);
  const [addExOpen, setAddExOpen] = useState(false);

  const { data: exercisesData } = useExercises({ pageSize: '100' });
  const { data: templatesData } = useWorkoutTemplates({ pageSize: '50' });

  const exercises = (exercisesData?.data ?? exercisesData?.items ?? []).map((e: Record<string, unknown>) => ({
    id: String(e.id),
    name: String(e.name ?? ''),
    difficulty: String(e.difficulty ?? 'Intermediate'),
    muscleGroup: String(e.muscleGroup ?? e.muscle ?? ''),
    equipment: String(e.equipment ?? ''),
    description: String(e.description ?? ''),
    active: e.active !== false,
  }));

  const templates = (templatesData?.data ?? templatesData?.items ?? []).map((t: Record<string, unknown>) => ({
    id: String(t.id),
    name: String(t.name ?? ''),
    trainer: String(t.createdByName ?? t.createdBy ?? ''),
    exercises: Number(t.exerciseCount ?? (Array.isArray(t.exercises) ? t.exercises.length : 0)),
    difficulty: String(t.difficulty ?? 'Intermediate'),
    members: Number(t.memberCount ?? t.members ?? 0),
    description: String(t.description ?? ''),
  }));

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', mb: 3, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Workout Management</Typography>
          <Typography variant="body2" color="text.secondary">Exercise library, templates, and workout plans</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddExOpen(true)}>Add Exercise</Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab label="Exercise Library" />
          <Tab label="Workout Templates" />
        </Tabs>
      </Box>

      {/* Tab 0: Exercise Library */}
      <TabPanel value={tab} index={0}>
        <Card elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Exercise Name</TableCell>
                <TableCell>Muscle Group</TableCell>
                <TableCell>Equipment</TableCell>
                <TableCell>Difficulty</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exercises.map(ex => (
                <TableRow key={ex.id}>
                  <TableCell><Typography variant="body2" fontWeight={600}>{ex.name}</Typography></TableCell>
                  <TableCell><Chip label={ex.muscleGroup} size="small" variant="outlined" /></TableCell>
                  <TableCell><Typography variant="caption">{ex.equipment}</Typography></TableCell>
                  <TableCell><Chip label={ex.difficulty} size="small" color={difficultyColor[ex.difficulty]} /></TableCell>
                  <TableCell><Chip label={ex.active ? 'Active' : 'Inactive'} size="small" color={ex.active ? 'success' : 'default'} /></TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Button size="small" variant="text">Edit</Button>
                      <Button size="small" variant="text" color="error">Disable</Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </TabPanel>

      {/* Tab 1: Workout Templates */}
      <TabPanel value={tab} index={1}>
        <Box sx={{ display: 'flex', mb: 2, justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
          <Button variant="outlined" startIcon={<AddIcon />} size="small" fullWidth sx={{ width: { xs: '100%', sm: 'auto' } }}>New Template</Button>
        </Box>
        <Grid container spacing={2}>
          {templates.map(template => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={template.id}>
              <Card elevation={0} sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' }, transition: 'border-color 0.2s' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">{template.name}</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mt: 1.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="text.secondary">Exercises</Typography>
                      <Typography variant="caption" fontWeight={600}>{template.exercises}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="text.secondary">Created by</Typography>
                      <Typography variant="caption" fontWeight={600}>{template.trainer}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="text.secondary">Members using</Typography>
                      <Typography variant="caption" fontWeight={600}>{template.members}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button size="small" variant="outlined" fullWidth>View</Button>
                    <Button size="small" variant="outlined" fullWidth>Edit</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Add Exercise Dialog */}
      <Dialog open={addExOpen} onClose={() => setAddExOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}>
        <DialogTitle>Add Exercise to Library</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}><TextField label="Exercise Name" fullWidth size="small" /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Muscle Group" select fullWidth size="small">
                {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Equipment" fullWidth size="small" /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Difficulty" select fullWidth size="small">
                {['Beginner', 'Intermediate', 'Advanced'].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={12}><TextField label="Instructions" fullWidth size="small" multiline rows={3} /></Grid>
            <Grid size={12}><TextField label="Video/Image URL" fullWidth size="small" /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAddExOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddExOpen(false)}>Add Exercise</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
