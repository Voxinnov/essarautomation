import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';

const PageHeader = ({ title, subtitle, action, actionLabel, actionIcon }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main">{title}</Typography>
            {subtitle && <Typography variant="body2" color="text.secondary" mt={0.5}>{subtitle}</Typography>}
        </Box>
        {action && (
            <Button
                variant="contained"
                startIcon={actionIcon || <Add />}
                onClick={action}
                sx={{ px: 3 }}
            >
                {actionLabel || 'Add New'}
            </Button>
        )}
    </Box>
);

export default PageHeader;
