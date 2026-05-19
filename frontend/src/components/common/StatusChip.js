import React from 'react';
import { Chip } from '@mui/material';
import { getStatusColor } from '../../utils/constants';

const StatusChip = ({ status, label, color }) => {
    const displayLabel = label || status?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    const chipSx = { 
        fontWeight: 600, 
        textTransform: 'capitalize' 
    };

    if (color) {
        chipSx.bgcolor = color;
        chipSx.color = '#fff'; // Ensure readability on custom colors
    }

    return (
        <Chip
            label={displayLabel}
            color={!color ? getStatusColor(status) : undefined}
            size="small"
            sx={chipSx}
        />
    );
};

export default StatusChip;
