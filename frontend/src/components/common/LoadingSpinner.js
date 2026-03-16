import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const LoadingSpinner = ({ height = '400px' }) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress color="primary" />
    </Box>
);

export default LoadingSpinner;
