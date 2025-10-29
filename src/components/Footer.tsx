import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: 'auto',
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #e0e0e0',
        textAlign: 'center'
      }}
    >
      <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#424242', fontWeight: 500 }}>
        Built by Vishaal
      </Typography>
    </Box>
  );
};

export default Footer;

