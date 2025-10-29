import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Button, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from 'react-router-dom';
import type { Hotel } from '../services/api';

interface HotelCardProps {
  hotel: Hotel;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  const navigate = useNavigate();
  
  const cheapestRoom = hotel.roomCategories.reduce((min, room) => 
    room.baseRate < min.baseRate ? room : min
  );

  const handleSeeAvailability = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');
    
    const urlParams = new URLSearchParams();
    urlParams.set('hotelId', hotel.hotelId);
    urlParams.set('checkIn', checkIn || '');
    urlParams.set('checkOut', checkOut || '');
    urlParams.set('guests', guests || '');
    
    navigate(`/availability?${urlParams.toString()}`, {
      state: {
        hotelId: hotel.hotelId,
        checkIn,
        checkOut,
        guests
      }
    });
  };

  return (
    <Card sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' },
      mb: 3,
      overflow: 'visible',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'relative',
      width: '100%',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }
    }}>
      {}
      <Box sx={{ 
        position: 'absolute', 
        top: 8, 
        left: 8, 
        zIndex: 1,
        display: 'flex',
        gap: 1
      }}>
        <Chip 
          label="Featured" 
          size="small"
          sx={{ 
            bgcolor: 'white',
            fontWeight: 'bold',
            fontSize: '0.75rem'
          }} 
        />
      </Box>

      {}
      <Box sx={{ 
        position: 'absolute', 
        top: 16, 
        right: 16, 
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 0.5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          {hotel.comment && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                textAlign: 'right',
                maxWidth: 180,
                fontSize: '0.75rem',
                lineHeight: 1.3,
                mt: 0.5
              }}
            >
              {hotel.comment}
            </Typography>
          )}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            bgcolor: '#003580',
            px: 1.5,
            py: 0.75,
            borderRadius: '4px 4px 4px 0',
            minWidth: 45
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'white !important' }}>
              {hotel.averageRating}
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', fontSize: '0.75rem' }}>
          {hotel.totalReviews} reviews
        </Typography>
      </Box>

      <Box sx={{ 
        position: 'relative',
        width: { xs: '100%', sm: '30%' },
        minWidth: { sm: 280 }
      }}>
        <CardMedia
          component="img"
          sx={{ 
            width: '100%',
            height: { xs: 200, sm: 280 },
            objectFit: 'cover'
          }}
          image={hotel.imageUrl}
          alt={hotel.name}
        />
      </Box>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'space-between',
        width: { xs: '100%', sm: '70%' },
        position: 'relative'
      }}>
        <CardContent sx={{ flex: '1 0 auto', p: 3, pr: { xs: 3, sm: 25 } }}>
          {}
          <Chip 
            label="Limited-time Deal" 
            size="small"
            sx={{ 
              bgcolor: '#008009',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              mb: 1
            }} 
          />

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOnIcon color="primary" sx={{ fontSize: '1rem', mr: 0.5 }} />
              <Typography variant="body2" color="primary" sx={{ fontWeight: 500, color: '#0071c2' }}>
                {hotel.addressLine}, {hotel.city}, {hotel.country}
              </Typography>
            </Box>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#003580', fontSize: '1.25rem' }}>
            {hotel.name || 'Hotel Name Not Available'}
          </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#424242' }}>
                {cheapestRoom.roomTypeName} • {cheapestRoom.info}
              </Typography>
            </Box>
        </CardContent>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end',
          p: 3,
          pt: 0
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Includes taxes and charges
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  textDecoration: 'line-through',
                  color: 'text.secondary'
                }}
              >
                £{(cheapestRoom.baseRate * 1.2).toFixed(0)}
              </Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                £{cheapestRoom.baseRate.toFixed(0)}
              </Typography>
            </Box>
          </Box>
          
          {}
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSeeAvailability}
            sx={{ 
              borderRadius: 1,
              textTransform: 'none',
              px: 3,
              py: 1,
              bgcolor: '#0071c2',
              fontWeight: 700,
              '&:hover': {
                bgcolor: '#005999'
              }
            }}
          >
            See availability
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default HotelCard;