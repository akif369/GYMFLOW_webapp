'use client';

import type { ElementType, ReactNode } from 'react';
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  TableContainer,
  Typography,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}

interface SectionCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  contentSx?: SxProps<Theme>;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  caption?: string;
  icon?: ElementType;
  accent?: string;
  trend?: number;
  highlight?: boolean;
}

interface PageToolbarProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

interface ScrollTableProps {
  children: ReactNode;
  minWidth?: number;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
}: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}}
      gap={2}
     sx={{ alignItems: { xs: 'flex-start', lg: 'center' , justifyContent: 'space-between' }}>
      <Box>
        {eyebrow && (
          <Typography
            sx={{
              mb: 1,
              color: 'primary.main',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: '1.9rem', md: '2.6rem' },
            lineHeight: 1,
            letterSpacing: '-0.06em',
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            variant="body1"
            sx={{
              mt: 1,
              maxWidth: 760,
              color: 'text.secondary',
              fontSize: { xs: '0.95rem', md: '1rem' },
            }}
          >
            {description}
          </Typography>
        )}
        {meta && <Box sx={{ mt: 1.5 }}>{meta}</Box>}
      </Box>

      {actions && (
        <Stack
          direction="row"
          gap={1}}
         sx={{ justifyContent: { xs: 'flex-start', lg: 'flex-end' , flexWrap: 'wrap' }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  contentSx,
}: SectionCardProps) {
  return (
    <Card elevation={0} sx={{ height: '100%' }}>
      <CardContent sx={{ p: 0 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}}
          gap={1.5}
          sx={{
            px: { xs: 2, md: 2.5 },
            py: 2.25,
            borderBottom: (theme) = sx={{ alignItems: { xs: 'flex-start', sm: 'center' , justifyContent: 'space-between' }}> `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1rem', letterSpacing: '-0.03em' }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                {description}
              </Typography>
            )}
          </Box>
          {action}
        </Stack>
        <Box sx={{ p: { xs: 2, md: 2.5 }, ...contentSx }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

export function MetricCard({
  label,
  value,
  caption,
  icon: Icon,
  accent = '#10b981',
  trend,
  highlight = false,
}: MetricCardProps) {
  const isUp = (trend ?? 0) >= 0;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderColor: highlight ? alpha(accent, 0.5) : undefined,
        bgcolor: 'background.paper',
        borderStyle: 'solid',
        borderWidth: highlight ? 1 : 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: alpha(accent, 0.8),
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ position: 'relative', p: 2.25 }}>
        <Stack direction="row" gap={2} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Stack direction="row" gap={1.25} sx={{ alignItems: 'center' }}>
            {Icon && (
              <Avatar
                variant="rounded"
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: alpha(accent, 0.14),
                  color: accent,
                }}
              >
                <Icon fontSize="small" />
              </Avatar>
            )}
            <Box>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  mt: 0.7,
                  fontSize: { xs: '1.55rem', md: '1.8rem' },
                  letterSpacing: '-0.05em',
                }}
              >
                {value}
              </Typography>
            </Box>
          </Stack>

          {trend !== undefined && (
            <Chip
              size="small"
              icon={isUp ? <TrendingUpRoundedIcon /> : <TrendingDownRoundedIcon />}
              label={`${Math.abs(trend)}%`}
              sx={{
                bgcolor: alpha(isUp ? '#54d98c' : '#ff8a7a', 0.14),
                color: isUp ? '#78e3a1' : '#ff9d90',
                '& .MuiChip-icon': {
                  color: 'inherit',
                },
              }}
            />
          )}
        </Stack>

        {caption && (
          <Typography variant="body2" sx={{ mt: 2.25, color: 'text.secondary' }}>
            {caption}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export function PageToolbar({ title, description, actions }: PageToolbarProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}}
      gap={2}
      sx={{ mb: 3, alignItems: { xs: 'flex-start', md: 'center' , justifyContent: 'space-between' }}
    >
      <Box>
        <Typography variant="h5" sx={{ color: '#f0f6fc', fontWeight: 800 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {description}
          </Typography>
        )}
      </Box>

      {actions && (
        <Stack direction="row" gap={1} sx={{ flexWrap: 'wrap' }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}

export function ScrollTable({ children, minWidth = 720 }: ScrollTableProps) {
  return (
    <TableContainer
      sx={{
        overflowX: 'auto',
        '& table': {
          minWidth,
        },
      }}
    >
      {children}
    </TableContainer>
  );
}
