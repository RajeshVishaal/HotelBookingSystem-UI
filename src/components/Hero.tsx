import React, { useState, useMemo } from 'react';
import { Box, Container, Typography, Select, MenuItem, FormControl, InputLabel, Pagination } from '@mui/material';
import SearchForm from './SearchForm';
import HotelCard from './HotelCard';
import { useSearch } from '../context/SearchContext';
import { searchHotels } from '../services/api';
import type { Hotel, SearchParams } from '../services/api';

const Hero: React.FC = () => {
  const { searchState, setSearchState } = useSearch();
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'rating-high' | 'rating-low'>('price-low');

  const sortedResults = useMemo(() => {
    if (searchState.searchResults.length === 0) return [];

    return [...searchState.searchResults].sort((a: Hotel, b: Hotel) => {
      if (sortBy === 'price-low') {
        const priceA = a.roomCategories.reduce((min, room) => Math.min(min, room.baseRate), Infinity);
        const priceB = b.roomCategories.reduce((min, room) => Math.min(min, room.baseRate), Infinity);
        return priceA - priceB;
      } else if (sortBy === 'price-high') {
        const priceA = a.roomCategories.reduce((min, room) => Math.min(min, room.baseRate), Infinity);
        const priceB = b.roomCategories.reduce((min, room) => Math.min(min, room.baseRate), Infinity);
        return priceB - priceA;
      } else if (sortBy === 'rating-high') {
        return b.averageRating - a.averageRating;
      } else {
        return a.averageRating - b.averageRating;
      }
    });
  }, [searchState.searchResults, sortBy]);

  const totalPages = Math.ceil(searchState.pagination.totalRecords / searchState.pagination.pageSize);

  const handleSortChange = (event: any) => {
    setSortBy(event.target.value);
  };

  const handlePageChange = async (_event: React.ChangeEvent<unknown>, value: number) => {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name') || searchState.searchValue;
    const checkIn = urlParams.get('checkIn') || searchState.dateRange.startDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
    const checkOut = urlParams.get('checkOut') || searchState.dateRange.endDate?.toISOString().split('T')[0] || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const guests = urlParams.get('guests') || String(searchState.guestInfo.adults + searchState.guestInfo.children);

    const searchParams: SearchParams = {
      query: name,
      from: checkIn,
      to: checkOut,
      adults: parseInt(guests) || 2,
      children: 0
    };

    try {
      const response = await searchHotels(searchParams, value, searchState.pagination.pageSize);
      setSearchState(prev => ({
        ...prev,
        searchResults: response.data.items,
        pagination: {
          totalRecords: response.data.totalRecords,
          pageNo: response.data.pageNo,
          pageSize: response.data.pageSize,
          hasNext: response.data.hasNext,
          hasPrevious: response.data.hasPrevious
        }
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error fetching page:', error);
    }
  };

  return (
    <>
      <Box 
        sx={{
          bgcolor: '#003580',
          minHeight: searchState.searchResults.length === 0 ? 'calc(100vh - 80px)' : 'auto',
          pb: { xs: 4, sm: 6 },
          pt: searchState.searchResults.length === 0 
            ? { xs: '10vh', sm: '12vh', md: '15vh' } 
            : { xs: 3, sm: 4 },
          display: 'flex',
          alignItems: 'flex-start'
        }}
      >
        <Container 
          maxWidth="lg" 
          sx={{ 
            px: { xs: 2, sm: 3 }
          }}
        >
          <Box sx={{ 
            textAlign: 'center',
            mb: { xs: 3, sm: 4 }
          }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontSize: { xs: '2rem', sm: '2.8rem', md: '3.5rem' },
                mb: 1.5,
                fontWeight: 800,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                color: 'white !important',
                lineHeight: 1.2
              }}
            >
              Find your next stay
            </Typography>
            <Typography 
              variant="h6"
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.15rem', md: '1.35rem' },
                fontWeight: 400,
                opacity: 0.98,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                color: 'white !important',
                lineHeight: 1.4
              }}
            >
              Search deals on hotels, homes, and much more...
            </Typography>
          </Box>
          
          <Box sx={{ 
            position: 'relative',
            zIndex: 2
          }}>
            <SearchForm />
          </Box>

          {}
          {searchState.hasSearched && searchState.searchResults.length === 0 && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Box sx={{ 
                bgcolor: 'white',
                borderRadius: 2,
                p: { xs: 3, sm: 4 },
                maxWidth: '800px',
                mx: 'auto',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 2 }}>
                  No properties found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontSize: '1.1rem' }}>
                  We couldn't find any available properties for <strong>"{searchState.searchValue}"</strong>
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '1.1rem' }}>
                  {searchState.dateRange.startDate && searchState.dateRange.endDate 
                    ? `on your selected dates.` 
                    : '.'}
                </Typography>
                
                <Box sx={{ 
                  bgcolor: '#fff3cd', 
                  border: '1px solid #ffc107',
                  borderRadius: 2, 
                  p: 3, 
                  mb: 3
                }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#856404', mb: 1.5 }}>
                    💡 Try these tips:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#856404', mb: 0.5, textAlign: 'left' }}>
                    • Try different dates - properties may be available at other times
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#856404', mb: 0.5, textAlign: 'left' }}>
                    • Check your spelling or try a nearby city
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#856404', mb: 0.5, textAlign: 'left' }}>
                    • Adjust the number of guests or rooms
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#856404', textAlign: 'left' }}>
                    • Search for a broader area or region
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Keep searching - your perfect stay is waiting! 🏨
                </Typography>
              </Box>
            </Box>
          )}
        </Container>
      </Box>
      
      {}
      {searchState.searchResults.length > 0 && (
        <Box sx={{ bgcolor: '#f5f5f5', py: 4, minHeight: '50vh' }}>
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              flexWrap: 'wrap',
              gap: 2
            }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
              {searchState.pagination.totalRecords} properties found
            </Typography>
              
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="sort-by-label">Sort by</InputLabel>
                <Select
                  labelId="sort-by-label"
                  id="sort-by"
                  value={sortBy}
                  label="Sort by"
                  onChange={handleSortChange}
                  sx={{ bgcolor: 'white' }}
                >
                  <MenuItem value="price-low">Price (Low to High)</MenuItem>
                  <MenuItem value="price-high">Price (High to Low)</MenuItem>
                  <MenuItem value="rating-high">Rating (High to Low)</MenuItem>
                  <MenuItem value="rating-low">Rating (Low to High)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box>
              {sortedResults.map((hotel) => (
                <HotelCard key={hotel.hotelId} hotel={hotel} />
              ))}
            </Box>

            {}
            {totalPages > 1 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 4,
                mb: 2
              }}>
                <Pagination 
                  count={totalPages} 
                  page={searchState.pagination.pageNo} 
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Container>
        </Box>
      )}
    </>
  );
};

export default Hero;