import React, { useState } from 'react';
import { Container, Box, Paper, Typography, TextField, Button, Stack, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({
        emailAddress: email,
        password: password
      });

      if (response.success) {
        setSuccess(true);
        
        authLogin(response.token || '', {
          id: response.user?.id || 'user-id',
          email: email,
          name: response.user?.name || email.split('@')[0]
        });
        
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#003580', py: 8 }}>
      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 2, bgcolor: 'white' }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#003580', mb: 1, fontFamily: 'Inter' }}>
              Sign in
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Use your email and password to access your account
            </Typography>
          </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Login successful! Redirecting...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              size="medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              size="medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <Button 
              variant="contained" 
              color="primary"
              size="large"
              type="submit"
              disabled={loading || success}
              sx={{ 
                bgcolor: '#003580', 
                color: 'white', 
                textTransform: 'none',
                fontWeight: 700,
                py: 1.5,
                borderRadius: '4px',
                '&:hover': {
                  bgcolor: '#00224f'
                }
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign in'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate(-1)}
              disabled={loading}
              sx={{
                borderColor: '#003580',
                color: '#003580',
                textTransform: 'none',
                py: 1.5,
                borderRadius: '4px',
                '&:hover': {
                  borderColor: '#00224f',
                  bgcolor: 'rgba(0, 53, 128, 0.04)'
                }
              }}
            >
              Cancel
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
    </Box>
  );
};

export default SignIn;