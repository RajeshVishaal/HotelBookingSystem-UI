import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Divider,
  MenuItem,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { dummyBookingDetails } from '../data/checkoutData';
import type { CheckoutFormData, RoomInfo } from '../types/checkout';
import { countries } from '../data/countries';
import { reserveBooking, generateIdempotencyKey, getUserByEmail, signup, login } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login: authLogin } = useAuth();
  const bookingState = location.state || { hotelInfo: dummyBookingDetails.hotelInfo, bookingDates: dummyBookingDetails.bookingDates, roomInfo: [] };
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [existingUser, setExistingUser] = useState<any>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [authCompleted, setAuthCompleted] = useState(false);
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    phone: ''
  });

  const [authData, setAuthData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    if (!formData.email || !formData.email.includes('@')) return;
    
    const timer = setTimeout(async () => {
      setCheckingEmail(true);
      const result = await getUserByEmail(formData.email);
      if (result.success && result.user) {
        setExistingUser(result.user);
        setFormData(prev => ({
          ...prev,
          firstName: result.user!.firstName || prev.firstName,
          lastName: result.user!.lastName || prev.lastName
        }));
      } else {
        setExistingUser(null);
      }
      setCheckingEmail(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email]);

  const handleAuthSubmit = async () => {
    setError(null);
    setSuccessMessage(null);
    
    if (authCompleted && authenticatedUserId) {
      setShowAuthDialog(false);
      return;
    }

    setIsSubmitting(true);

    try {
      if (authMode === 'signup') {
        if (authData.password !== authData.confirmPassword) {
          setError('Passwords do not match');
          setIsSubmitting(false);
          return;
        }

        const result = await signup({
          firstName: formData.firstName,
          lastName: formData.lastName,
          emailAddress: formData.email,
          password: authData.password
        });

        if (result.success && result.userId) {
          const loginResult = await login({
            emailAddress: formData.email,
            password: authData.password
          });

          if (loginResult.success && loginResult.user) {
            authLogin(loginResult.token || '', loginResult.user);
            const userId = loginResult.user.userId || loginResult.user.id;
            setAuthenticatedUserId(userId);
            setAuthCompleted(true);
            setSuccessMessage('Registration successful! Now click "Continue" to return to checkout.');
          } else {
            setError('Signup successful but login failed. Please try logging in.');
          }
        } else {
          setError(result.message || 'Signup failed');
        }
      } else {
        const result = await login({
          emailAddress: formData.email,
          password: authData.password
        });

        if (result.success && result.user) {
          authLogin(result.token || '', result.user);
          const userId = result.user.userId || result.user.id;
          setAuthenticatedUserId(userId);
          setAuthCompleted(true);
          setSuccessMessage('Login successful! Now click "Continue" to return to checkout.');
        } else {
          setError(result.message || 'Login failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const proceedWithBooking = async (userId: string) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const checkIn = bookingState.bookingDates.checkIn.date;
      const checkOut = bookingState.bookingDates.checkOut.date;
      
      const rooms = Array.isArray(bookingState.roomInfo) 
        ? bookingState.roomInfo.map((room: RoomInfo) => ({
            roomCategoryId: room.roomTypeId,
            quantity: room.quantity
          }))
        : [];
      
      const totalGuests = bookingState.totalGuests ?? 2;

      const bookingData = {
        hotelId: bookingState.hotelInfo.hotelId,
        userId: userId,
        rooms: rooms,
        guests: totalGuests,
        checkIn: checkIn || new Date().toISOString().split('T')[0],
        checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0]
      };
      
      console.log('Booking request data:', bookingData);
      console.log('Room info from state:', bookingState.roomInfo);
      
      const bookingIdempotencyKey = generateIdempotencyKey();
      console.log('Using idempotency key:', bookingIdempotencyKey);
      
      const response = await reserveBooking(bookingData, bookingIdempotencyKey);
      
      if (response.success) {
        const apiData = response.data || response;
        
        const confirmationData = {
          bookingId: apiData.bookingReference || response.bookingId || 'BOOKING-' + Date.now(),
          hotel: {
            name: apiData.hotelName || bookingState.hotelInfo.hotelName,
            address: bookingState.hotelInfo.location,
            image: apiData.hotelImageUrl || bookingState.hotelInfo.image
          },
          rooms: apiData.rooms?.map((room: any) => ({
            roomType: bookingState.roomInfo.find((r: RoomInfo) => r.roomTypeId === room.roomCategoryId)?.roomType || 'Room',
            quantity: room.quantity,
            price: room.baseRate,
            subtotal: room.subtotal
          })) || bookingState.roomInfo.map((r: RoomInfo) => ({
            roomType: r.roomType,
            quantity: r.quantity,
            price: r.price,
            subtotal: r.price * r.quantity
          })),
          checkIn: apiData.checkIn || bookingState.bookingDates.checkIn.date,
          checkOut: apiData.checkOut || bookingState.bookingDates.checkOut.date,
          guests: apiData.guests || totalGuests,
          totalCost: apiData.totalCost || bookingState.roomInfo.reduce((sum: number, room: RoomInfo) => sum + (room.price * room.quantity), 0),
          createdAt: apiData.createdAt
        };

        navigate('/confirmation', {
          state: {
            bookingData: confirmationData,
            formData
          },
          replace: true
        });
      } else {
        setError(response.message || 'Booking failed. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setCheckingEmail(true);
      const userCheck = await getUserByEmail(formData.email);
      setCheckingEmail(false);

      if (userCheck.success && userCheck.user) {
        setExistingUser(userCheck.user);
        setAuthMode('login');
        setShowAuthDialog(true);
      } else {
        setAuthMode('signup');
        setShowAuthDialog(true);
      }
      return;
    }

    const userId = user.userId || user.id;
    await proceedWithBooking(userId);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Booking Form */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Enter your details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Almost done! Just fill in the * required info
            </Typography>
            <form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="First name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Last name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Email address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    helperText={
                      checkingEmail 
                        ? "Checking email..." 
                        : existingUser 
                          ? `Welcome back, ${existingUser.firstName}!` 
                          : "Confirmation email goes to this address"
                    }
                    InputProps={{
                      endAdornment: checkingEmail ? <CircularProgress size={20} /> : null
                    }}
                  />
                </Col>
                <Col xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Zip/post code (optional)"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    select
                    label="Country/region"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                  >
                    {countries.map((country) => (
                      <MenuItem key={country.code} value={country.code}>
                        {country.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Col>
                <Col xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Phone number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </Col>
                <Col xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={isSubmitting}
                    sx={{ mt: 2, height: 48 }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Complete Booking'
                    )}
                  </Button>
                </Col>
              </Row>
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              {user && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  ✓ You're logged in as {user.name || user.email}. Click "Complete Booking" to finalize your reservation.
                </Alert>
              )}
            </form>
          </Paper>
        </Box>

        {/* Booking Summary */}
        <Box sx={{ width: { xs: '100%', md: '380px' } }}>
          <Card>
            <CardMedia
              component="img"
              height="200"
              image={bookingState.hotelInfo.image}
              alt={bookingState.hotelInfo.hotelName}
            />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {bookingState.hotelInfo.hotelName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={bookingState.hotelInfo.rating} readOnly precision={0.5} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {bookingState.hotelInfo.totalReviews} reviews
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {bookingState.hotelInfo.location}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Check-in
                </Typography>
                <Typography variant="body2">
                  {bookingState.bookingDates.checkIn.date}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {bookingState.bookingDates.checkIn.time}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Check-out
                </Typography>
                <Typography variant="body2">
                  {bookingState.bookingDates.checkOut.date}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {bookingState.bookingDates.checkOut.time}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Room Details
                </Typography>
                {Array.isArray(bookingState.roomInfo) ? (
                  bookingState.roomInfo.map((room: RoomInfo, index: number) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        {room.roomType} x {room.quantity}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        £{room.price.toFixed(2)} per night
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2">
                    No rooms selected
                  </Typography>
                )}
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total price
                  </Typography>
                  <Typography variant="h6" color="primary">
                    £{Array.isArray(bookingState.roomInfo) 
                      ? bookingState.roomInfo.reduce((sum: number, room: RoomInfo) => sum + (room.price * room.quantity), 0).toFixed(2)
                      : "0.00"}
                  </Typography>
                </Box>
              </Box>
              </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onClose={() => !isSubmitting && setShowAuthDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {authMode === 'signup' ? 'Create Account to Complete Booking' : 'Sign In to Continue'}
        </DialogTitle>
        <DialogContent>
          {authMode === 'signup' ? (
            <Box sx={{ pt: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                We need to create an account for you to complete your booking.
              </Alert>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Email: <strong>{formData.email}</strong>
              </Typography>
              <TextField
                fullWidth
                type="password"
                label="Password"
                value={authData.password}
                onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                sx={{ mb: 2 }}
                required
                helperText="Minimum 6 characters"
                disabled={authCompleted}
              />
              <TextField
                fullWidth
                type="password"
                label="Confirm Password"
                value={authData.confirmPassword}
                onChange={(e) => setAuthData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                disabled={authCompleted}
              />
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              {successMessage && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {successMessage}
                </Alert>
              )}
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                We found an existing account with this email. Please sign in to continue.
              </Alert>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Email: <strong>{formData.email}</strong>
              </Typography>
              <TextField
                fullWidth
                type="password"
                label="Password"
                value={authData.password}
                onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                required
                disabled={authCompleted}
              />
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              {successMessage && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {successMessage}
                </Alert>
              )}
              {!authCompleted && (
                <Button
                  variant="text"
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => {
                    setAuthMode('signup');
                    setError(null);
                  }}
                >
                  Don't have an account? Sign up instead
                </Button>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowAuthDialog(false);
              setAuthCompleted(false);
              setAuthenticatedUserId(null);
              setSuccessMessage(null);
              setError(null);
            }} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAuthSubmit} 
            variant="contained" 
            disabled={
              isSubmitting || 
              (!authCompleted && (!authData.password || (authMode === 'signup' && !authData.confirmPassword)))
            }
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : authCompleted ? (
              'Continue'
            ) : (
              authMode === 'signup' ? 'Create Account' : 'Sign In'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CheckoutPage;