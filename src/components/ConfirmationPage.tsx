import React from 'react';
import { Container, Box, Typography, Paper, Button } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';

const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSearchState } = useSearch();
  
  const defaultBookingData = {
    bookingId: 'BOOKING-123456',
    hotel: {
      name: 'Sample Hotel',
      address: '123 Main Street, City, Country',
      image: 'https://via.placeholder.com/400x300?text=Hotel+Image'
    },
    rooms: [
      { roomType: 'Deluxe Room', quantity: 1, price: 150, subtotal: 150 }
    ],
    checkIn: new Date().toISOString(),
    checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    guests: {
      adults: 2,
      children: 0
    },
    totalCost: 150,
    createdAt: new Date().toISOString()
  };

  const defaultFormData = {
    firstName: 'Guest',
    lastName: 'User',
    email: 'guest@example.com',
    phone: '+1234567890',
    specialRequests: ''
  };

  const bookingData = location.state?.bookingData || defaultBookingData;
  const formData = location.state?.formData || defaultFormData;

  const roomsArray = Array.isArray(bookingData.rooms) 
    ? bookingData.rooms 
    : bookingData.rooms ? [bookingData.rooms] : [];
  
  const isUsingDefaults = !location.state?.bookingData;

  const handleBackToHome = () => {
    setSearchState(prev => ({
      ...prev,
      searchValue: '',
      dateRange: {
        startDate: null,
        endDate: null
      },
      guestInfo: {
        adults: 2,
        children: 0,
        rooms: 1
      },
      searchResults: [],
      selectedRooms: [],
      currentHotelId: null,
      hasSearched: false,
      pagination: {
        totalRecords: 0,
        pageNo: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false
      }
    }));
    
    navigate('/', { replace: true });
    window.history.replaceState(null, '', '/');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      {isUsingDefaults && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#fff3e0', border: '1px solid #ff9800', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            ⚠️ <strong>Note:</strong> This is a demo confirmation page. Actual booking data was not received.
          </Typography>
        </Box>
      )}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <CheckCircleOutlineIcon 
          color="success" 
          sx={{ fontSize: 64, mb: 2 }} 
        />
        
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700 }}>
          Booking Confirmed!
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary" sx={{ mb: 1 }}>
          Your booking has been confirmed. Thank you for choosing us!
        </Typography>
        
        <Typography variant="body2" align="center" color="text.secondary">
          A confirmation email has been sent to <strong>{formData.email}</strong>
        </Typography>
        
        <Box 
          sx={{ 
            width: '100%', 
            mt: 4, 
            p: 3, 
            bgcolor: '#e8f5e9', 
            border: '2px solid #4caf50',
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="overline" sx={{ color: '#2e7d32', fontWeight: 700 }}>
            Booking Reference
          </Typography>
          <Typography variant="h4" sx={{ color: '#1b5e20', fontWeight: 700, letterSpacing: 1 }}>
            {bookingData.bookingId}
          </Typography>
          <Typography variant="caption" sx={{ color: '#2e7d32', mt: 1, display: 'block' }}>
            Please save this reference number for your records
          </Typography>
        </Box>

        <Box sx={{ width: '100%', mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Hotel Details
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4 }}>
            <Box 
              component="img"
              src={bookingData.hotel.image}
              alt={bookingData.hotel.name}
              sx={{ 
                width: { xs: '100%', sm: 200 },
                height: { xs: 200, sm: 150 },
                objectFit: 'cover',
                borderRadius: 1
              }}
            />
            
            <Box>
              <Typography variant="h6">{bookingData.hotel.name}</Typography>
              <Typography variant="body1" color="text.secondary">
                {bookingData.hotel.address}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Check-in:</strong> {formatDate(bookingData.checkIn)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Check-out:</strong> {formatDate(bookingData.checkOut)}
                </Typography>
                {bookingData.createdAt && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Booked on:</strong> {formatDate(bookingData.createdAt)}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
          
          <Typography variant="h5" gutterBottom>
            Room Details
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            {roomsArray.map((room: { roomType: string; quantity: number; price: number; subtotal?: number }, index: number) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  p: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {room.roomType} x {room.quantity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    £{room.price.toFixed(2)} per night
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  £{(room.subtotal || room.price * room.quantity).toFixed(2)}
                </Typography>
              </Box>
            ))}
            
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                bgcolor: '#f5f5f5',
                borderRadius: 1,
                mt: 2
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Guests
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {bookingData.guests} Guest{bookingData.guests === 1 ? '' : 's'}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Cost
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  £{typeof bookingData.totalCost === 'number' ? bookingData.totalCost.toFixed(2) : bookingData.totalCost}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Typography variant="h5" gutterBottom>
            Guest Information
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="body1">
              <strong>Name:</strong> {formData.firstName} {formData.lastName}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {formData.email}
            </Typography>
            <Typography variant="body1">
              <strong>Phone:</strong> {formData.phone}
            </Typography>
            
            {formData.specialRequests && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Special Requests:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {formData.specialRequests}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={handleBackToHome}
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Paper>
    </Container>
  );
};

export default ConfirmationPage;