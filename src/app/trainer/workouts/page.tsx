'use client';
import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Chip, Grid,
  Button, Divider, TextField, InputAdornment, alpha,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

const WORKOUT_TEMPLATES = [
  { id: '1', name: 'Full Body Strength', category: 'Strength', exercises: 8,  duration: 60, assignedTo: 12, difficulty: 'Intermediate', tags: ['Compound', 'Free Weights'] },
  { id: '2', name: 'HIIT Cardio Blast', category: 'Cardio',   exercises: 10, duration: 35, assignedTo: 8,  difficulty: 'Advanced',     tags: ['HIIT', 'Bodyweight'] },
  { id: '3', name: 'Core & Stability',  category: 'Core',     exercises: 6,  duration: 30, assignedTo: 15, difficulty: 'Beginner',     tags: ['Core', 'Stability'] },
  { id: '4', name: 'Upper Body Push',   category: 'Strength', exercises: 7,  duration: 50, assignedTo: 6,  difficulty: 'Intermediate', tags: ['Chest', 'Shoulders', 'Triceps'] },
  { id: '5', name: 'Lower Body Power',  category: 'Strength', exercises: 8,  duration: 55, assignedTo: 9,  difficulty: 'Advanced',     tags: ['Quads', 'Glutes', 'Hamstrings'] },
  { id: '6', name: 'Yoga Flow',         category: 'Yoga',     exercises: 12, duration: 45, assignedTo: 4,  difficulty: 'Beginner',     tags: ['Flexibility', 'Mindfulness'] },
  { id: '7', name: 'Athletic Perf.',    category: 'Sports',   exercises: 10, duration: 60, assignedTo: 3,  difficulty: 'Advanced',     tags: ['Speed', 'Power', 'Agility'] },
  { id: '8', name: 'Post-Rehab Gentle', category: 'Rehab',    exercises: 8,  duration: 40, assignedTo: 2,  difficulty: 'Beginner',     tags: ['Low Impact', 'Mobility'] },
];

const CATEGORY_COLORS: Record<string, string> = {
  Strength: '#f59e0b', Cardio: '#10b981', Core: '#06b6d4',
  Yoga: '#8b5cf6', Sports: '#f97316', Rehab: '#ec4899',
};

const DIFF_COLORS: Record<string, { bg: string; color: string }> = {
  Beginner:     { bg: 'rgba(16,185,129,0.1)',  color: '#10b981' },
  Intermediate: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  Advanced:     { bg: 'rgba(244,63,94,0.1)',  color: '#f87171' },
};

export default function TrainerWorkoutsPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('ALL');

  const categories = ['ALL', ...Array.from(new Set(WORKOUT_TEMPLATES.map((w) => w.category)))];

  const filtered = WORKOUT_TEMPLATES.filter((w) => {
    const matchCat = cat === 'ALL' || w.category === cat;
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) || w.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
            Exercise Library
          </Typography>
          <Typography component="h1" sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: 'text.primary' }}>
            Workout Templates
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: '0.85rem', color: 'text.secondary' }}>
            {WORKOUT_TEMPLATES.length} templates · {WORKOUT_TEMPLATES.reduce((acc, w) => acc + w.assignedTo, 0)} total assignments
          </Typography>
        </Box>
        <Button startIcon={<AddRoundedIcon />} variant="contained" size="small"
          sx={{ bgcolor: '#ec4899', '&:hover': { bgcolor: '#be185d' } }}>
          New Template
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
        <TextField
          size="small" placeholder="Search templates…" value={search}
          onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 220 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} /></InputAdornment> } }}
        />
        {categories.map((c) => (
          <Chip key={c} label={c} size="small" onClick={() => setCat(c)} sx={{
            fontWeight: 700, cursor: 'pointer',
            bgcolor: cat === c ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.05)',
            color: cat === c ? '#ec4899' : 'text.secondary',
            border: `1px solid ${cat === c ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.08)'}`,
          }} />
        ))}
      </Box>

      {/* Template grid */}
      <Grid container spacing={2}>
        {filtered.map((tmpl) => {
          const catColor = CATEGORY_COLORS[tmpl.category] ?? '#6b7280';
          const diff = DIFF_COLORS[tmpl.difficulty] ?? DIFF_COLORS.Beginner;
          return (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={tmpl.id}>
              <Card elevation={0} sx={{
                height: '100%', position: 'relative', overflow: 'hidden',
                transition: 'transform 0.18s, border-color 0.18s',
                '&:hover': { transform: 'translateY(-2px)', borderColor: alpha(catColor, 0.3) },
              }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${catColor} 0%, transparent 100%)` }} />
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ width: 38, height: 38, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(catColor, 0.12) }}>
                      <FitnessCenterRoundedIcon sx={{ fontSize: 18, color: catColor }} />
                    </Box>
                    <Chip label={tmpl.difficulty} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: diff?.bg, color: diff?.color }} />
                  </Box>

                  <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary', mb: 0.5 }}>
                    {tmpl.name}
                  </Typography>
                  <Chip label={tmpl.category} size="small" sx={{ bgcolor: alpha(catColor, 0.12), color: catColor, fontWeight: 700, fontSize: '0.68rem', mb: 1.5 }} />

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 1.5 }} />

                  <Grid container spacing={1} sx={{ mb: 1.5 }}>
                    {[
                      { label: 'Exercises', value: tmpl.exercises },
                      { label: 'Duration', value: `${tmpl.duration}m` },
                    ].map((s) => (
                      <Grid size={{ xs: 6 }} key={s.label}>
                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                          <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: 'text.primary' }}>{s.value}</Typography>
                          <Typography sx={{ fontSize: '0.62rem', color: 'text.disabled' }}>{s.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Tags */}
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                    {tmpl.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'rgba(255,255,255,0.05)', color: 'text.disabled' }} />
                    ))}
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 1.5 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <GroupRoundedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                      <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                        {tmpl.assignedTo} clients
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.75 }}>
                      <Button size="small" variant="outlined" sx={{ fontSize: '0.72rem', py: 0.4, px: 1, borderColor: 'rgba(255,255,255,0.1)', color: 'text.secondary' }}>
                        Edit
                      </Button>
                      <Button size="small" variant="outlined" startIcon={<PersonRoundedIcon sx={{ fontSize: 13 }} />}
                        sx={{ fontSize: '0.72rem', py: 0.4, px: 1, borderColor: alpha(catColor, 0.3), color: catColor, '&:hover': { bgcolor: alpha(catColor, 0.06) } }}>
                        Assign
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
