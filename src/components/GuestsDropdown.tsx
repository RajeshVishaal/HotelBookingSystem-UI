import React, { useState } from 'react';
import { Box, Typography, IconButton, Divider, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface GuestsDropdownProps {
  onClose: () => void;
  onApply: (adults: number, children: number, rooms: number) => void;
  initialAdults?: number;
  initialChildren?: number;
  initialRooms?: number;
}

const GuestsDropdown: React.FC<GuestsDropdownProps> = ({
  onClose,
  onApply,
  initialAdults = 2,
  initialChildren = 0,
  initialRooms = 1
}) => {
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [rooms, setRooms] = useState(initialRooms);

  const handleIncrement = (type: 'adults' | 'children' | 'rooms') => {
    if (type === 'adults') {
      setAdults(prev => Math.min(prev + 1, 30));
    } else if (type === 'children') {
      setChildren(prev => Math.min(prev + 1, 10));
    } else {
      setRooms(prev => Math.min(prev + 1, 30));
    }
  };

  const handleDecrement = (type: 'adults' | 'children' | 'rooms') => {
    if (type === 'adults') {
      setAdults(prev => Math.max(prev - 1, 1));
    } else if (type === 'children') {
      setChildren(prev => Math.max(prev - 1, 0));
    } else {
      setRooms(prev => Math.max(prev - 1, 1));
    }
  };

  const handleDone = () => {
    onApply(adults, children, rooms);
    onClose();
  };

  return (
    <Box sx={{ 
      width: { xs: '100%', sm: 320 }, 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      p: { xs: 1, sm: 2 },
      maxHeight: { xs: '80vh', sm: 'auto' },
      overflowY: 'auto'
    }}>
      {}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1">Adults</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            size="small" 
            onClick={() => handleDecrement('adults')}
            disabled={adults <= 1}
            sx={{ 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              p: 0.5,
              color: adults <= 1 ? '#ccc' : '#333'
            }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ mx: 2, minWidth: '20px', textAlign: 'center' }}>{adults}</Typography>
          <IconButton 
            size="small" 
            onClick={() => handleIncrement('adults')}
            disabled={adults >= 30}
            sx={{ 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              p: 0.5,
              color: adults >= 30 ? '#ccc' : '#333'
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1">Children</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            size="small" 
            onClick={() => handleDecrement('children')}
            disabled={children <= 0}
            sx={{ 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              p: 0.5,
              color: children <= 0 ? '#ccc' : '#333'
            }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ mx: 2, minWidth: '20px', textAlign: 'center' }}>{children}</Typography>
          <IconButton 
            size="small" 
            onClick={() => handleIncrement('children')}
            disabled={children >= 10}
            sx={{ 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              p: 0.5,
              color: children >= 10 ? '#ccc' : '#333'
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button 
          variant="contained" 
          fullWidth
          onClick={handleDone}
          sx={{ 
            backgroundColor: '#006ce4',
            '&:hover': {
              backgroundColor: '#00509e'
            }
          }}
        >
          Done
        </Button>
      </Box>
    </Box>
  );
};

export default GuestsDropdown;