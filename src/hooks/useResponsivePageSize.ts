import { useMediaQuery, useTheme } from '@mui/material';

export function useResponsivePageSize() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return isMobile ? 10 : 25;
}
