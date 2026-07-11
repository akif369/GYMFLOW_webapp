import { AppBar, Toolbar, InputBase, Badge, Avatar, Typography, Box, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function Header() {
  return (
    <AppBar position="sticky" sx={{ width: '100%', zIndex: (theme) => theme.zIndex.drawer - 1 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 2, md: 3 }, minHeight: '56px !important' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'background.paper',
            borderRadius: 8,
            px: 2,
            py: 0.5,
            width: '400px',
            border: '1px solid',
            borderColor: 'divider',
            '&:focus-within': { borderColor: 'primary.main' }
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
          <InputBase
            placeholder="Search members, transactions..."
            sx={{ flex: 1, color: 'text.primary', fontSize: '0.875rem' }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
            <Badge variant="dot" color="primary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
              <Typography variant="body2" fontWeight="medium">Sarah Owner</Typography>
              <Typography variant="caption" color="text.secondary">Super Admin</Typography>
            </Box>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main', 
                width: 40, 
                height: 40, 
                fontWeight: 'bold',
                border: '2px solid #0a0a0a'
              }}
            >
              SO
            </Avatar>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
