import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  IconButton,
  Stack,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Box
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import BookingsIcon from '@mui/icons-material/BookOnline';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { setSearchState } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [githubAnchorEl, setGithubAnchorEl] = useState<null | HTMLElement>(null);
  
  const open = Boolean(anchorEl);
  const githubOpen = Boolean(githubAnchorEl);
  
  const isActive = (path: string) => location.pathname === path;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGithubClick = (event: React.MouseEvent<HTMLElement>) => {
    setGithubAnchorEl(event.currentTarget);
  };

  const handleGithubClose = () => {
    setGithubAnchorEl(null);
  };

  const handleLogoClick = () => {
    setSearchState(prev => ({
      ...prev,
      searchResults: [],
      searchValue: '',
      dateRange: { startDate: null, endDate: null },
      hasSearched: false
    }));
    window.history.replaceState(null, '', '/');
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#003580', padding: { xs: '8px 0', sm: '12px 0' } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              onClick={handleLogoClick}
              sx={{ 
                fontSize: { xs: '1.3rem', sm: '1.5rem' }, 
                color: 'white', 
                cursor: 'pointer',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                '&:hover': {
                  opacity: 0.9
                }
              }}
            >
              OverBooked.com
            </Typography>
            <Typography 
              sx={{ 
                color: 'white',
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '0.5px'
              }}
            >
              UK
            </Typography>
          </Box>
          <Stack direction="row" spacing={{ xs: 2, sm: 3 }} alignItems="center">
            {}
            <Link 
              to="/" 
              style={{ textDecoration: 'none' }}
              onClick={handleLogoClick}
            >
              <Typography
                sx={{
                  color: 'white',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 700,
                  fontFamily: 'Inter',
                  cursor: 'pointer',
                  position: 'relative',
                  py: 0.5,
                  borderBottom: isActive('/') ? '2px solid white' : '2px solid transparent',
                  '&:hover': {
                    borderBottom: '2px solid white',
                  },
                  transition: 'border-color 0.3s',
                  display: 'inline-block',
                  lineHeight: '1.5'
                }}
              >
                Search
              </Typography>
            </Link>

            {}
            <Box 
              onClick={handleGithubClick}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                cursor: 'pointer',
                px: 1.5,
                py: 0.5,
                borderRadius: '4px',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <GitHubIcon sx={{ fontSize: '1.2rem', color: 'white' }} />
              <Typography 
                sx={{ 
                  color: 'white', 
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  fontFamily: 'Inter'
                }}
              >
                GitHub
              </Typography>
            </Box>
            <Menu
              anchorEl={githubAnchorEl}
              open={githubOpen}
              onClose={handleGithubClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.5,
                  minWidth: 200
                }
              }}
            >
              <MenuItem 
                onClick={() => {
                  window.open('https://github.com/RajeshVishaal/HotelBookingSystem-UI', '_blank');
                  handleGithubClose();
                }}
              >
                <ListItemIcon>
                  <CodeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Frontend Code</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  window.open('https://github.com/RajeshVishaal/HotelBookingSystem', '_blank');
                  handleGithubClose();
                }}
              >
                <ListItemIcon>
                  <StorageIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Backend Code</ListItemText>
              </MenuItem>
            </Menu>
            
            {isAuthenticated ? (
              <>
                <IconButton 
                  onClick={handleClick}
                  size="small"
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                  sx={{ 
                    ml: 1,
                    bgcolor: 'white',
                    '&:hover': { bgcolor: '#f1f1f1' }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: '#003580',
                      color: 'white',
                      fontSize: '0.875rem'
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  id="account-menu"
                  open={open}
                  onClose={handleClose}
                  onClick={handleClose}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={() => { handleClose(); navigate('/my-bookings'); }}>
                    <BookingsIcon fontSize="small" sx={{ mr: 1 }} /> My Bookings
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Link to="/signup" style={{ textDecoration: 'none' }}>
                  <Typography
                    sx={{
                      color: 'white',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      fontWeight: 700,
                      fontFamily: 'Inter',
                      cursor: 'pointer',
                      position: 'relative',
                      py: 0.5,
                      borderBottom: isActive('/signup') ? '2px solid white' : '2px solid transparent',
                      '&:hover': {
                        borderBottom: '2px solid white',
                      },
                      transition: 'border-color 0.3s',
                      display: 'inline-block',
                      lineHeight: '1.5'
                    }}
                  >
                    Register
                  </Typography>
                </Link>
                <Link to="/signin" style={{ textDecoration: 'none' }}>
                  <Typography
                    sx={{
                      color: 'white',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      fontWeight: 700,
                      fontFamily: 'Inter',
                      cursor: 'pointer',
                      position: 'relative',
                      py: 0.5,
                      borderBottom: isActive('/signin') ? '2px solid white' : '2px solid transparent',
                      '&:hover': {
                        borderBottom: '2px solid white',
                      },
                      transition: 'border-color 0.3s',
                      display: 'inline-block',
                      lineHeight: '1.5'
                    }}
                  >
                    Login
                  </Typography>
                </Link>
              </>
            )}
          </Stack>
        </Toolbar>
        
      </Container>
    </AppBar>
  );
};

export default Navbar;