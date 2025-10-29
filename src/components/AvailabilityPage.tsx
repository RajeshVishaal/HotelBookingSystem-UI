import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import { getHotelById, checkRoomAvailability } from '../services/api';
import type { HotelDetails as ApiHotelDetails, CheckAvailabilityRequest } from '../services/api';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Divider,
  Stack,
  Button,
  ImageList,
  ImageListItem,
  IconButton,
  Alert,
  Paper,
  Modal,
  CircularProgress,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WifiIcon from '@mui/icons-material/Wifi';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import PetsIcon from '@mui/icons-material/Pets';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import PoolIcon from '@mui/icons-material/Pool';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DatePicker from './DatePicker';

const facilityIcons: { [key: string]: React.ReactElement } = {
  'Free Wi-Fi': <WifiIcon />,
  'On-site Parking': <LocalParkingIcon />,
  'Restaurant & Bar': <RestaurantIcon />,
  'Air Conditioning': <AcUnitIcon />,
  'Pet Friendly': <PetsIcon />,
  'Airport Shuttle': <AirportShuttleIcon />,
  'Gym': <FitnessCenterIcon />,
  'Laundry Service': <LocalLaundryServiceIcon />,
  'Indoor Pool': <PoolIcon />,
};

interface LocationState {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  guests: string;
}

const AvailabilityPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchState, setSearchState } = useSearch();
  const state = location.state as LocationState;

  const [hotelDetails, setHotelDetails] = useState<ApiHotelDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRooms, setSelectedRooms] = useState<Array<{
    roomType: string;
    price: number;
    quantity: number;
    roomTypeId: string;
    maxGuests: number;
  }>>([]);
  
  const [totalGuests, setTotalGuests] = useState(0);
  const [localCheckIn, setLocalCheckIn] = useState<Date | null>(null);
  const [localCheckOut, setLocalCheckOut] = useState<Date | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [fetchingRooms, setFetchingRooms] = useState(false);
  const [hasDates, setHasDates] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  
  useEffect(() => {
    setSearchState(prev => ({
      ...prev,
      selectedRooms: [],
      currentHotelId: null
    }));
    
    setSelectedRooms([]);
  }, []);
  
  const getRoomId = (room: any, index: number): string => {
    return room?.id || room?.roomCategoryId || room?.roomTypeId || `room-${index}`;
  };

  const getAccommodatedGuests = () => {
    return selectedRooms.reduce((sum, room) => sum + (room.maxGuests * room.quantity), 0);
  };

  const getRemainingGuests = () => {
    return Math.max(0, totalGuests - getAccommodatedGuests());
  };

  const allGuestsAccommodated = () => {
    return getAccommodatedGuests() >= totalGuests;
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleDateSelect = (startDate: Date | null, endDate: Date | null) => {
    setLocalCheckIn(startDate);
    setLocalCheckOut(endDate);
    
    if (startDate && endDate) {
      setDatePickerOpen(false);
    }
  };

  const handleCheckAvailability = () => {
    if (localCheckIn && localCheckOut) {
      const urlParams = new URLSearchParams(window.location.search);
      const hotelId = state?.hotelId || urlParams.get('hotelId');
      
      if (hotelId) {
        const checkInStr = localCheckIn.toISOString().split('T')[0];
        const checkOutStr = localCheckOut.toISOString().split('T')[0];
        const guests = String(totalGuests || 2);
        
        fetchRoomsWithDates(hotelId, checkInStr, checkOutStr, guests);
      }
    }
  };

  const formatDateRange = () => {
    if (!localCheckIn && !localCheckOut) return 'Check-in — Check-out';
    
    const formatDate = (date: Date | null) => {
      if (!date) return '';
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric'
      }).format(date);
    };
    
    if (localCheckIn && localCheckOut) {
      return `${formatDate(localCheckIn)} — ${formatDate(localCheckOut)}`;
    }
    
    return localCheckIn ? `${formatDate(localCheckIn)} — Check-out` : 'Check-in — Check-out';
  };

  const fetchRoomsWithDates = async (hotelId: string, checkIn: string, checkOut: string, guests: string) => {
    setFetchingRooms(true);
    try {
      const response = await getHotelById(hotelId, checkIn, checkOut, guests);
      console.log('data', response);
      if (response && response.data) {
        setHotelDetails(response.data);
        setHasDates(true);
        
        const urlParams = new URLSearchParams(window.location.search);
        const previousCheckIn = urlParams.get('checkIn');
        const previousCheckOut = urlParams.get('checkOut');
        
        urlParams.set('checkIn', checkIn);
        urlParams.set('checkOut', checkOut);
        urlParams.set('guests', guests);
        window.history.replaceState(null, '', `?${urlParams.toString()}`);
        
        if (searchState.currentHotelId === hotelId && 
            searchState.selectedRooms.length > 0 &&
            previousCheckIn === checkIn &&
            previousCheckOut === checkOut) {
          setSelectedRooms(searchState.selectedRooms);
        } else {
          setSelectedRooms([]);
        }
      } else {
        setError('Invalid hotel data received');
      }
    } catch (err) {
      setError('Failed to fetch hotel details');
    } finally {
      setFetchingRooms(false);
    }
  };

  useEffect(() => {
    const fetchHotelDetails = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hotelId = state?.hotelId || urlParams.get('hotelId');
      const checkIn = state?.checkIn || urlParams.get('checkIn') || searchState.dateRange.startDate?.toISOString().split('T')[0];
      const checkOut = state?.checkOut || urlParams.get('checkOut') || searchState.dateRange.endDate?.toISOString().split('T')[0];
      const guests = state?.guests || urlParams.get('guests') || String(searchState.guestInfo.adults + searchState.guestInfo.children);

      setTotalGuests(parseInt(guests) || 2);

      if (!hotelId) {
        setError('Hotel ID is required');
        setLoading(false);
        return;
      }

      if (checkIn) setLocalCheckIn(new Date(checkIn));
      if (checkOut) setLocalCheckOut(new Date(checkOut));

      if (checkIn && checkOut) {
        try {
          await fetchRoomsWithDates(hotelId, checkIn, checkOut, guests || '2');
        } catch (err) {
          setError('Failed to fetch hotel details');
        } finally {
          setLoading(false);
        }
      } else {
        try {
          const defaultCheckIn = new Date().toISOString().split('T')[0];
          const defaultCheckOut = new Date(Date.now() + 86400000).toISOString().split('T')[0];
          const response = await getHotelById(hotelId, defaultCheckIn, defaultCheckOut, guests || '2');
          
          if (response && response.data) {
            setHotelDetails(response.data);
            setHasDates(false);
          } else {
            setError('Invalid hotel data received');
          }
        } catch (err) {
          setError('Failed to fetch hotel details');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchHotelDetails();
  }, [state, searchState.dateRange, searchState.guestInfo]);

  if (loading) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading hotel details...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
          <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
            Back to search
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="text"
          color="primary"
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
          sx={{ 
            textTransform: 'none',
            fontWeight: 'medium',
            fontSize: '1rem'
          }}
        >
          Back to search results
        </Button>
      </Box>

      {}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2, color: '#1a1a1a' }}>
          {hotelDetails?.hotelName || 'Hotel Details'}
        </Typography>
        {hotelDetails && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOnIcon sx={{ mr: 1, color: '#616161' }} />
              <Typography sx={{ color: '#424242', fontWeight: 400 }}>
                {hotelDetails.addressLine || ''}{hotelDetails.city ? `, ${hotelDetails.city}` : ''}{hotelDetails.country ? `, ${hotelDetails.country}` : ''}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={`${hotelDetails.averageRating ? hotelDetails.averageRating.toFixed(1) : '0.0'}/10`}
                color="primary"
                sx={{ fontWeight: 700 }}
              />
              <Typography variant="body2" sx={{ color: '#424242', fontWeight: 500 }}>
                {hotelDetails.totalReviews || 0} reviews
              </Typography>
            </Box>
          </>
        )}
      </Box>

      {}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mb: 4,
          border: '3px solid #febb02',
          bgcolor: 'white'
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch">
          <Box sx={{ flex: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setDatePickerOpen(true)}
              startIcon={<CalendarMonthIcon />}
              sx={{ 
                height: '56px',
                justifyContent: 'flex-start',
                textAlign: 'left',
                textTransform: 'none',
                fontSize: '1rem',
                color: '#424242',
                borderColor: '#e0e0e0',
                '&:hover': {
                  borderColor: '#0071c2',
                  bgcolor: 'transparent'
                }
              }}
            >
              {formatDateRange()}
            </Button>
          </Box>
          
          <Box sx={{ flex: 'none' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleCheckAvailability}
              disabled={!localCheckIn || !localCheckOut || fetchingRooms}
              sx={{ 
                height: '56px',
                px: 4,
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: '#0071c2',
                minWidth: '180px',
                '&:hover': {
                  bgcolor: '#005999'
                },
                '&.Mui-disabled': {
                  backgroundColor: '#ccc',
                  color: '#666'
                }
              }}
            >
              {fetchingRooms ? <CircularProgress size={24} color="inherit" /> : 'Check Availability'}
            </Button>
          </Box>
        </Stack>
        
        {!hasDates && !fetchingRooms && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Select your dates and click "Check Availability" to see available rooms and pricing
          </Alert>
        )}
        
        <Modal
          open={datePickerOpen}
          onClose={() => setDatePickerOpen(false)}
          aria-labelledby="date-picker-modal"
          BackdropProps={{
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
          }}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            mt: 10
          }}
        >
          <Box 
            onClick={(e) => e.stopPropagation()}
            sx={{ 
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            <DatePicker 
              onSelectDate={handleDateSelect} 
              selectedStartDate={localCheckIn} 
              selectedEndDate={localCheckOut} 
            />
          </Box>
        </Modal>
      </Paper>

      {}
      {hotelDetails && (
        <>
          <Box sx={{ mb: 4 }}>
            <ImageList
              sx={{
                width: '100%',
                height: 450,
                borderRadius: 2,
                overflow: 'hidden',
              }}
              variant="quilted"
              cols={4}
              rowHeight={225}
            >
              <ImageListItem cols={2} rows={2}>
                <img
                  src={hotelDetails.imageUrl}
                  alt={hotelDetails.hotelName || 'Hotel Image'}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </ImageListItem>
              {[1, 2, 3].map((index) => (
                <ImageListItem key={index}>
                  <img
                    src={hotelDetails.imageUrl}
                    alt={`Room ${index}`}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Box>

          {}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a1a1a' }}>
              Popular Facilities
            </Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr',
                lg: '1fr 1fr 1fr 1fr'
              },
              gap: 2
            }}>
              {hotelDetails.facilities && hotelDetails.facilities.map((facility, index) => (
                <Chip
                  key={index}
                  icon={facilityIcons[facility]}
                  label={facility}
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                />
              ))}
            </Box>
          </Box>

          <Divider sx={{ mb: 6 }} />
        </>
      )}

      {}
      {hasDates && hotelDetails && (
        <>

      {}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
          Available Rooms
        </Typography>
        
        {}
        {totalGuests > 0 && (
          <Paper 
            elevation={2}
            sx={{ 
              px: 3, 
              py: 2, 
              bgcolor: allGuestsAccommodated() ? '#e8f5e9' : '#fff3e0',
              border: `2px solid ${allGuestsAccommodated() ? '#4caf50' : '#ff9800'}`,
              borderRadius: 2,
              minWidth: 280
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {allGuestsAccommodated() ? (
                <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 24 }} />
              ) : (
                <PeopleIcon sx={{ color: '#ff9800', fontSize: 24 }} />
              )}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {allGuestsAccommodated() 
                  ? '✓ All guests accommodated!' 
                  : `Accommodating ${totalGuests} guest${totalGuests > 1 ? 's' : ''}`
                }
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, fontSize: '0.95rem' }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Selected:</strong> {getAccommodatedGuests()} guest{getAccommodatedGuests() !== 1 ? 's' : ''}
              </Typography>
              {!allGuestsAccommodated() && getRemainingGuests() > 0 && (
                <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                  <strong>Remaining:</strong> {getRemainingGuests()} more needed
                </Typography>
              )}
            </Box>
          </Paper>
        )}
      </Box>

      {}
      {totalGuests > 0 && !allGuestsAccommodated() && selectedRooms.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You still need to accommodate <strong>{getRemainingGuests()} more guest{getRemainingGuests() > 1 ? 's' : ''}</strong>. 
          Please select additional rooms to accommodate all guests.
        </Alert>
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {hotelDetails.rooms && Array.isArray(hotelDetails.rooms) && hotelDetails.rooms.map((room, index) => (
          <Card key={index} sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height="200"
              image={hotelDetails.imageUrl || ''}
              alt={room.roomTypeName || `Room ${index + 1}`}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                {room.roomTypeName || `Room ${index + 1}`}
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ color: '#424242', fontWeight: 500 }}>
                Max guests: {room.maximumGuests || 2}
              </Typography>
              {room.info && (
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ color: '#616161' }}>
                  {room.info}
                </Typography>
              )}
              
              {}
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 1, fontWeight: 700, color: '#1a1a1a' }}>
                Bed Options:
              </Typography>
              {room.beds.map((bed, idx) => (
                <Typography key={idx} variant="body2" sx={{ color: '#424242' }}>
                  {bed.bedCount}x {bed.bedTypeName}
                </Typography>
              ))}

              {}
              <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                {room.facilities.map((facility, idx) => (
                  <Chip
                    key={idx}
                    label={facility}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>

              {}
              <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" color="primary">
                    ${room.baseRate.toFixed(2)}
                  </Typography>
                  <Typography variant="caption">per night</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {(selectedRooms.find(r => r.roomTypeId === getRoomId(room, index))?.quantity || 0) > 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton 
                        size="small"
                        onClick={() => {
                          setSelectedRooms(prev => {
                            const existing = prev.find(r => r.roomTypeId === getRoomId(room, index));
                            if (existing && existing.quantity > 1) {
                              return prev.map(r => r.roomTypeId === getRoomId(room, index) ? 
                                {...r, quantity: r.quantity - 1} : r);
                            } else {
                              return prev.filter(r => r.roomTypeId !== getRoomId(room, index));
                            }
                          });
                        }}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography sx={{ mx: 1 }}>
                        {selectedRooms.find(r => r.roomTypeId === getRoomId(room, index))?.quantity || 0}
                      </Typography>
                      <IconButton 
                        size="small"
                        onClick={() => {
                          setSelectedRooms(prev => {
                            const existing = prev.find(r => r.roomTypeId === getRoomId(room, index));
                            if (existing) {
                              return prev.map(r => r.roomTypeId === getRoomId(room, index) ? 
                                {...r, quantity: r.quantity + 1} : r);
                            } else {
                              return [...prev, {
                                roomType: room.roomTypeName,
                                price: room.baseRate,
                                quantity: 1,
                                roomTypeId: getRoomId(room, index),
                                maxGuests: room.maximumGuests || 2
                              }];
                            }
                          });
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => {
                        setSelectedRooms(prev => [...prev, {
                          roomType: room.roomTypeName,
                          price: room.baseRate,
                          quantity: 1,
                          roomTypeId: getRoomId(room, index),
                          maxGuests: room.maximumGuests || 2
                        }]);
                      }}
                    >
                      Add
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {}
      {availabilityError && (
        <Alert severity="error" sx={{ mt: 3 }} onClose={() => setAvailabilityError(null)}>
          {availabilityError}
        </Alert>
      )}

      {}
      {selectedRooms.length > 0 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Box sx={{ mr: 3 }}>
            <Typography variant="h6">
              Total: ${selectedRooms.reduce((sum, room) => sum + (room.price * room.quantity), 0).toFixed(2)}
            </Typography>
            <Typography variant="caption">
              {selectedRooms.reduce((sum, room) => sum + room.quantity, 0)} room(s) selected
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary"
            size="large"
            disabled={selectedRooms.length === 0 || checkingAvailability}
            onClick={async () => {
              setAvailabilityError(null);
              setCheckingAvailability(true);

              try {
                const urlParams = new URLSearchParams(window.location.search);
                const hotelId = state?.hotelId || urlParams.get('hotelId');
                const checkInDate = localCheckIn?.toISOString().split('T')[0] || state?.checkIn || '';
                const checkOutDate = localCheckOut?.toISOString().split('T')[0] || state?.checkOut || '';

                if (!hotelId || !checkInDate || !checkOutDate) {
                  setAvailabilityError('Missing booking information');
                  setCheckingAvailability(false);
                  return;
                }

                const roomCategoryIds = selectedRooms.map(room => room.roomTypeId);

                const availabilityRequest: CheckAvailabilityRequest = {
                  hotelId: hotelId,
                  roomCategoryIds: roomCategoryIds,
                  guests: totalGuests,
                  checkIn: checkInDate,
                  checkOut: checkOutDate
                };

                const availabilityResponse = await checkRoomAvailability(hotelId, availabilityRequest);

                if (!availabilityResponse.data.available) {
                  setAvailabilityError('Sorry, the selected rooms are no longer available. They might have been booked by another customer. Please select different rooms or dates.');
                  setCheckingAvailability(false);
                  return;
                }

                setSearchState(prev => ({
                  ...prev,
                  selectedRooms: selectedRooms,
                  currentHotelId: hotelId
                }));
                
                navigate('/checkout', {
                  state: {
                    hotelInfo: {
                      hotelId: hotelDetails.hotelId,
                      hotelName: hotelDetails.hotelName,
                      location: `${hotelDetails.addressLine}, ${hotelDetails.city}, ${hotelDetails.country}`,
                      rating: 4.5,
                      totalReviews: hotelDetails.reviews ? hotelDetails.reviews.length : 0,
                      image: hotelDetails.imageUrl
                    },
                    bookingDates: {
                      checkIn: {
                        date: checkInDate,
                        time: '15:00'
                      },
                      checkOut: {
                        date: checkOutDate,
                        time: '11:00'
                      }
                    },
                    roomInfo: selectedRooms
                  }
                });
              } catch (error) {
                console.error('Error checking availability:', error);
                setAvailabilityError('Failed to check room availability. Please try again.');
              } finally {
                setCheckingAvailability(false);
              }
            }}
          >
            {checkingAvailability ? <CircularProgress size={24} color="inherit" /> : 'Reserve'}
          </Button>
        </Box>
      )}
        </>
      )}

      {}
      {hotelDetails && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: '#1a1a1a' }}>
            Guest Reviews
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {hotelDetails.reviews && Array.isArray(hotelDetails.reviews) && hotelDetails.reviews.map((review, index) => (
              <Card key={index}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2">
                        Guest Review {index + 1}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                      <Rating value={(review.rating || 0) / 2} precision={0.5} readOnly size="small" />
                    </Box>
                  </Box>
                  <Typography variant="body2">
                    {review.comment || `Rating: ${review.rating}/10`}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default AvailabilityPage;