import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserBookings } from '../services/api';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

interface Booking {
  bookingReference: string;
  hotelId: string;
  hotelName: string;
  hotelImageUrl?: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalCost: number;
  createdAt: string;
  rooms?: any[];
}

const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.userId && !user?.id) {
        setError('Please log in to view your bookings');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userId = user.userId || user.id;
        const response = await getUserBookings(userId);
        
        if (response.success && response.bookings) {
          setBookings(response.bookings);
          setError(null);
        } else {
          setError(response.message || 'Failed to load bookings');
        }
      } catch (err) {
        setError('An error occurred while fetching bookings');
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

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
      return dateString;
    }
  };

  const getBookingStatus = (checkIn: string, checkOut: string) => {
    const today = new Date();
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (today < checkInDate) {
      return { label: 'Upcoming', color: 'primary' as const };
    } else if (today >= checkInDate && today <= checkOutDate) {
      return { label: 'Active', color: 'success' as const };
    } else {
      return { label: 'Completed', color: 'default' as const };
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please log in to view your bookings.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1a1a1a' }}>
          My Bookings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your hotel reservations
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {bookings.length === 0 && !error && (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            bgcolor: '#f5f5f5',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" gutterBottom color="text.secondary">
            No bookings found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You haven't made any bookings yet. Start exploring hotels!
          </Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/')}>
            Search Hotels
          </Button>
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {bookings.map((booking) => {
          const status = getBookingStatus(booking.checkIn, booking.checkOut);
          
          return (
            <Box key={booking.bookingReference}>
              <Card 
                sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  '&:hover': {
                    boxShadow: 6
                  },
                  transition: 'box-shadow 0.3s'
                }}
              >
                {booking.hotelImageUrl && (
                  <CardMedia
                    component="img"
                    sx={{ 
                      width: { xs: '100%', sm: 280 },
                      height: { xs: 200, sm: 'auto' },
                      objectFit: 'cover'
                    }}
                    image={booking.hotelImageUrl}
                    alt={booking.hotelName}
                  />
                )}
                
                <CardContent sx={{ flex: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
                        {booking.hotelName}
                      </Typography>
                      <Chip 
                        label={status.label} 
                        color={status.color} 
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                        ${(booking.totalCost || 0).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Cost
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <ConfirmationNumberIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Booking Reference:
                        </Typography>
                      </Stack>
                      <Typography variant="body1" sx={{ fontWeight: 700, ml: 3.5 }}>
                        {booking.bookingReference}
                      </Typography>
                    </Box>

                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <CalendarTodayIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Check-in / Check-out:
                        </Typography>
                      </Stack>
                      <Typography variant="body1" sx={{ ml: 3.5 }}>
                        {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                      </Typography>
                    </Box>

                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Guests:
                        </Typography>
                      </Stack>
                      <Typography variant="body1" sx={{ ml: 3.5 }}>
                        {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                      </Typography>
                    </Box>

                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <AttachMoneyIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Booked on:
                        </Typography>
                      </Stack>
                      <Typography variant="body1" sx={{ ml: 3.5 }}>
                        {formatDate(booking.createdAt)}
                      </Typography>
                    </Box>
                  </Box>

                  {booking.rooms && booking.rooms.length > 0 && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Rooms Booked:
                      </Typography>
                      {booking.rooms.map((room: any, index: number) => (
                        <Typography key={index} variant="body2" sx={{ ml: 2, fontWeight: 500, color: '#1a1a1a' }}>
                          • {room.quantity}x Room - ${room.baseRate?.toFixed(2) || (room.subtotal / room.quantity).toFixed(2)} per night
                        </Typography>
                      ))}
                    </Box>
                  )}

                  <Box sx={{ mt: 3 }}>
                    <Button 
                      variant="contained" 
                      size="medium"
                      onClick={() => {
                        const urlParams = new URLSearchParams();
                        urlParams.set('hotelId', booking.hotelId);
                        urlParams.set('checkIn', booking.checkIn);
                        urlParams.set('checkOut', booking.checkOut);
                        urlParams.set('guests', booking.guests.toString());
                        
                        navigate(`/availability?${urlParams.toString()}`, {
                          state: {
                            hotelId: booking.hotelId,
                            checkIn: booking.checkIn,
                            checkOut: booking.checkOut,
                            guests: booking.guests
                          }
                        });
                      }}
                      sx={{
                        bgcolor: '#003580',
                        color: 'white',
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: '#00224f'
                        }
                      }}
                    >
                      View Hotel
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>
    </Container>
  );
};

export default MyBookingsPage;

