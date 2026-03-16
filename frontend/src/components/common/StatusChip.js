import React from 'react';
import { Chip } from '@mui/material';
import { getStatusColor } from '../../utils/constants';

const StatusChip = ({ status, label }) => {
    const displayLabel = label || status?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    return (
        <Chip
            label={displayLabel}
            color={getStatusColor(status)}
            size="small"
            sx={{ fontWeight: 600, textTransform: 'capitalize' }}
        />
    );
};

export default StatusChip;
