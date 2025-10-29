import React, { useState } from 'react';
import { Container, Box, Paper, Typography, TextField, Button, Stack, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signup } from '../services/api';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!firstName.trim()) return 'First name is required';
    if (!lastName.trim()) return 'Last name is required';
    if (!email.trim()) return 'Email is required';
    if (!password) return 'Password is required';
    if (password !== confirmPassword) return 'Passwords do not match';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await signup({
        firstName,
        lastName,
        emailAddress: email,
        password
      });

      if (response.success) {
        setSuccess(true);
        
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#003580', py: 8 }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 2, bgcolor: 'white' }}>
          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={3}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#003580', mb: 1, fontFamily: 'Inter' }}>
                Create your account
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign up to start booking your perfect stay
              </Typography>
            </Box>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Registration successful! Redirecting to login...</Alert>}

          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField 
                label="First name" 
                variant="outlined" 
                fullWidth 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <TextField 
                label="Last name" 
                variant="outlined" 
                fullWidth 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </Stack>
            <TextField 
              label="Email" 
              type="email" 
              variant="outlined" 
              fullWidth 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField 
              label="Password" 
              type="password" 
              variant="outlined" 
              fullWidth 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <TextField 
              label="Confirm password" 
              type="password" 
              variant="outlined" 
              fullWidth 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading || success}
              sx={{
                backgroundColor: '#003580',
                color: '#FFFFFF',
                textTransform: 'none',
                fontWeight: 700,
                py: 1.5,
                borderRadius: '4px',
                '&:hover': { backgroundColor: '#00224f' },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={() => navigate('/signin')}
              disabled={loading}
              sx={{
                color: '#003580',
                borderColor: '#003580',
                textTransform: 'none',
                py: 1.5,
                borderRadius: '4px',
                '&:hover': { 
                  backgroundColor: 'rgba(0, 53, 128, 0.04)',
                  borderColor: '#00224f'
                },
              }}
            >
              Already have an account? Sign in
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
    </Box>
  );
};

export default SignUp;