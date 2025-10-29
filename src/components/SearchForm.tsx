import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper,
  TextField, 
  Button, 
  InputAdornment, 
  Modal,
  Stack,
  CircularProgress
} from '@mui/material';
import { useSearch } from '../context/SearchContext';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import DatePicker from './DatePicker';
import GuestsDropdown from './GuestsDropdown';
import { searchHotels } from '../services/api';
import type { SearchParams } from '../services/api';

const SearchForm: React.FC = () => {
  const { searchState, setSearchState } = useSearch();
  const [dateAnchorEl, setDateAnchorEl] = useState<null | HTMLElement>(null);
  const [guestsAnchorEl, setGuestsAnchorEl] = useState<null | HTMLElement>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasLoadedFromUrl, setHasLoadedFromUrl] = useState(false);
  
  const handleDateClick = (event: React.MouseEvent<HTMLElement>) => {
    setGuestsAnchorEl(null);
    setDateAnchorEl(dateAnchorEl ? null : event.currentTarget);
  };

  const handleDateClickAway = () => {
    setDateAnchorEl(null);
  };

  const handleDateSelect = (startDate: Date | null, endDate: Date | null) => {
    setSearchState(prev => ({
      ...prev,
      dateRange: { startDate, endDate }
    }));
    if (startDate && endDate) {
      setDateAnchorEl(null);
    }
  };

  const handleGuestsClick = (event: React.MouseEvent<HTMLElement>) => {
    setDateAnchorEl(null);
    setGuestsAnchorEl(event.currentTarget);
  };

  const handleGuestsClose = () => {
    setGuestsAnchorEl(null);
  };

  const handleGuestsSelect = (adults: number, children: number, rooms: number) => {
    setSearchState(prev => ({
      ...prev,
      guestInfo: { adults, children, rooms }
    }));
    setGuestsAnchorEl(null);
  };
  
  const isFormValid = () => {
    return searchState.searchValue.trim() !== '';
  };

  useEffect(() => {
    if (hasLoadedFromUrl) return;

    const urlParams = new URLSearchParams(window.location.search);
    const checkIn = urlParams.get('checkIn');
    const checkOut = urlParams.get('checkOut');
    const guests = urlParams.get('guests');
    const name = urlParams.get('name');

    if (name) {
      const startDate = checkIn ? new Date(checkIn) : null;
      const endDate = checkOut ? new Date(checkOut) : null;
      const totalGuests = guests ? parseInt(guests) : 2;

      setSearchState(prev => ({
        ...prev,
        searchValue: name,
        dateRange: { startDate, endDate },
        guestInfo: {
          ...prev.guestInfo,
          adults: Math.max(1, totalGuests),
          children: 0
        }
      }));

      const searchParams: SearchParams = {
        query: name,
        from: checkIn || new Date().toISOString().split('T')[0],
        to: checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        adults: Math.max(1, totalGuests),
        children: 0
      };

      setIsSearching(true);
      searchHotels(searchParams, 1, 10)
        .then(response => {
          setSearchState(prev => ({
            ...prev,
            searchResults: response.data.items,
            hasSearched: true,
            pagination: {
              totalRecords: response.data.totalRecords,
              pageNo: response.data.pageNo,
              pageSize: response.data.pageSize,
              hasNext: response.data.hasNext,
              hasPrevious: response.data.hasPrevious
            }
          }));
        })
        .catch(error => {
          console.error('Error loading search results from URL:', error);
        })
        .finally(() => {
          setIsSearching(false);
          setHasLoadedFromUrl(true);
        });
    } else {
      setHasLoadedFromUrl(true);
    }
  }, [hasLoadedFromUrl, setSearchState]);

  const handleSearch = async () => {
    if (!isFormValid()) return;
    
    setIsSearching(true);
    
    const formatDateToLocalISOString = (date: Date | null) => {
      if (!date) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const fromDate = formatDateToLocalISOString(searchState.dateRange.startDate);
    const toDate = formatDateToLocalISOString(searchState.dateRange.endDate);
    
    const searchParams: SearchParams = {
      query: searchState.searchValue,
      from: fromDate || new Date().toISOString().split('T')[0],
      to: toDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      adults: searchState.guestInfo.adults,
      children: searchState.guestInfo.children
    };

    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set('name', searchState.searchValue);
    if (fromDate) urlSearchParams.set('checkIn', fromDate);
    if (toDate) urlSearchParams.set('checkOut', toDate);
    urlSearchParams.set('guests', String(searchState.guestInfo.adults + searchState.guestInfo.children));
    window.history.replaceState(null, '', `?${urlSearchParams.toString()}`);
    
    try {
      const response = await searchHotels(searchParams, 1, 10);
      setSearchState(prev => ({
        ...prev,
        searchResults: response.data.items,
        hasSearched: true,
        pagination: {
          totalRecords: response.data.totalRecords,
          pageNo: response.data.pageNo,
          pageSize: response.data.pageSize,
          hasNext: response.data.hasNext,
          hasPrevious: response.data.hasPrevious
        }
      }));
      setDateAnchorEl(null);
      setGuestsAnchorEl(null);
    } catch (error) {
      console.error('Error searching hotels:', error);
      setSearchState(prev => ({
        ...prev,
        searchResults: [],
        hasSearched: true,
        pagination: {
          totalRecords: 0,
          pageNo: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false
        }
      }));
    } finally {
      setIsSearching(false);
    }
  };

  const formatDateRange = () => {
    if (!searchState.dateRange.startDate && !searchState.dateRange.endDate) return 'Check-in — Check-out';
    
    const formatDate = (date: Date | null) => {
      if (!date) return '';
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }).format(date);
    };
    
    if (searchState.dateRange.startDate && searchState.dateRange.endDate) {
      return `${formatDate(searchState.dateRange.startDate)} — ${formatDate(searchState.dateRange.endDate)}`;
    }
    
    return searchState.dateRange.startDate ? `${formatDate(searchState.dateRange.startDate)} — Check-out date` : 'Check-in date — Check-out date';
  };

  const formatGuestInfo = () => {
    const { adults, children, rooms } = searchState.guestInfo;
    return `${adults} ${adults === 1 ? 'adult' : 'adults'} · ${children} ${children === 1 ? 'child' : 'children'} · ${rooms} ${rooms === 1 ? 'room' : 'rooms'}`;
  };

  const dateOpen = Boolean(dateAnchorEl);
  const guestsOpen = Boolean(guestsAnchorEl);

  return (
    <>
      <Paper 
        elevation={4} 
        sx={{ 
          width: '100%',
          maxWidth: '100%',
          position: 'relative',
          zIndex: 1,
          mx: 'auto',
          borderRadius: '8px',
          overflow: 'hidden',
          bgcolor: 'white',
          border: '3px solid #febb02',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)'
        }}
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={0}
          alignItems="stretch"
          sx={{ 
            width: '100%',
            '& > *:not(:last-child)': {
              borderRight: { xs: 'none', sm: '1px solid #e0e0e0' },
              borderBottom: { xs: '1px solid #e0e0e0', sm: 'none' }
            }
          }}
        >
        <Box sx={{ 
          flex: 2, 
          position: 'relative', 
          width: '100%'
        }}>
          <TextField
            fullWidth
            variant="outlined"
            size="medium"
            placeholder="Where are you going?"
            value={searchState.searchValue}
            onChange={(e) => setSearchState(prev => ({ ...prev, searchValue: e.target.value }))}
            required
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                '& fieldset': {
                  border: 'none'
                },
                height: { xs: '56px', sm: '60px' },
                fontSize: { xs: '0.95rem', sm: '1rem' },
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                bgcolor: 'white',
                '&:hover': {
                  bgcolor: '#f5f5f5'
                },
                '&.Mui-focused': {
                  bgcolor: 'white'
                }
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#6b6b6b',
                opacity: 1,
                fontWeight: 400
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon sx={{ color: '#0071c2', fontSize: { xs: '1.3rem', sm: '1.5rem' } }} />
                </InputAdornment>
              )
            }}
          />
        </Box>
        
        <Box sx={{ 
          flex: 2, 
          position: 'relative', 
          width: '100%'
        }}>
          <TextField
            fullWidth
            variant="outlined"
            size="medium"
            required
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                '& fieldset': {
                  border: 'none'
                },
                height: { xs: '56px', sm: '60px' },
                fontSize: { xs: '0.95rem', sm: '1rem' },
                cursor: 'pointer',
                bgcolor: 'white',
                '&:hover': {
                  bgcolor: '#f5f5f5'
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarMonthIcon sx={{ color: '#0071c2' }} />
                </InputAdornment>
              ),
              readOnly: true,
            }}
            value={formatDateRange()}
            onClick={handleDateClick}
          />
          <Modal
            open={dateOpen}
            onClose={handleDateClickAway}
            aria-labelledby="date-picker-modal"
            BackdropProps={{
              onClick: handleDateClickAway,
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
                selectedStartDate={searchState.dateRange.startDate} 
                selectedEndDate={searchState.dateRange.endDate} 
              />
            </Box>
          </Modal>
        </Box>

        <Box sx={{ 
          flex: 2, 
          position: 'relative', 
          width: '100%'
        }}>
          <TextField
            fullWidth
            variant="outlined"
            size="medium"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                '& fieldset': {
                  border: 'none'
                },
                height: { xs: '56px', sm: '60px' },
                fontSize: { xs: '0.95rem', sm: '1rem' },
                cursor: 'pointer',
                bgcolor: 'white',
                '&:hover': {
                  bgcolor: '#f5f5f5'
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: '#0071c2' }} />
                </InputAdornment>
              ),
              readOnly: true,
            }}
            value={formatGuestInfo()}
            onClick={handleGuestsClick}
          />
        </Box>

        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'stretch', 
            justifyContent: 'center',
            width: { xs: '100%', sm: 'auto' },
            flex: { xs: 1, sm: 1 },
            p: { xs: 1.5, sm: 1 }
          }}
        >
          <Button 
            variant="contained" 
            size="large"
            onClick={handleSearch}
            disabled={isSearching || !isFormValid()}
            sx={{ 
              height: { xs: '48px', sm: '100%' },
              borderRadius: '4px',
              px: { xs: 3, sm: 4 },
              fontSize: { xs: '1rem', sm: '1rem' },
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: '#003580',
              color: 'white',
              boxShadow: 'none',
              width: { xs: '100%', sm: '100%' },
              '&:hover': {
                bgcolor: '#002347',
                boxShadow: '0 2px 8px rgba(0, 53, 128, 0.3)'
              },
              '&.Mui-disabled': {
                backgroundColor: '#ccc',
                color: '#666'
              }
            }}
          >
            {isSearching ? <CircularProgress size={24} color="inherit" /> : 'Search'}
          </Button>
        </Box>
        </Stack>
      </Paper>

      <Modal
        open={guestsOpen}
        onClose={handleGuestsClose}
        aria-labelledby="guests-modal"
        aria-describedby="guests-modal-description"
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        }}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          mt: { xs: 2, sm: 10 },
          p: { xs: 1, sm: 0 }
        }}
      >
        <GuestsDropdown 
          onClose={handleGuestsClose}
          onApply={handleGuestsSelect}
          initialAdults={searchState.guestInfo.adults}
          initialChildren={searchState.guestInfo.children}
          initialRooms={searchState.guestInfo.rooms}
        />
      </Modal>
    </>
  );
};

export default SearchForm;