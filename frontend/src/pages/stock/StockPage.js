import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab, Container, Typography } from '@mui/material';
import { Assessment, Inventory, History } from '@mui/icons-material';
import StockDashboard from './StockDashboard';
import ProductList from './ProductList';
import StockTransactions from './StockTransactions';

const StockPage = () => {
    const [tab, setTab] = useState(0);

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            bgcolor: '#f8fafc',
            pb: 4 
        }}>
            {/* Custom Header Area */}
            <Box sx={{ 
                background: 'linear-gradient(135deg, #8a0303 0%, #4a0000 100%)',
                pt: 4, 
                pb: 8,
                px: 3,
                color: 'white',
                borderRadius: '0 0 40px 40px',
                boxShadow: '0 10px 30px rgba(138, 3, 3, 0.2)'
            }}>
                <Container maxWidth="xl">
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                        Stock Management
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400 }}>
                        Real-time inventory tracking & analytical insights
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ mt: -5 }}>
                <Paper sx={{ 
                    borderRadius: 4, 
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(255,255,255,0.8)',
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    mb: 4,
                }}>
                    <Tabs 
                        value={tab} 
                        onChange={(event, newValue) => {
                            console.log('Tab changing to:', newValue);
                            setTab(newValue);
                        }} 
                        variant="fullWidth"
                        sx={{
                            '& .MuiTab-root': { 
                                py: 3, 
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                color: '#64748b',
                                transition: 'all 0.2s ease',
                                '&.Mui-selected': {
                                    color: '#8a0303',
                                },
                                '&:hover': {
                                    bgcolor: 'rgba(138, 3, 3, 0.04)'
                                }
                            },
                            '& .MuiTabs-indicator': {
                                height: 4,
                                borderRadius: '4px 4px 0 0',
                                bgcolor: '#8a0303'
                            }
                        }}
                    >
                        <Tab 
                            icon={<Assessment sx={{ fontSize: 24 }} />} 
                            iconPosition="start" 
                            label="ANALYTICS" 
                            id="tab-0" 
                        />
                        <Tab 
                            icon={<Inventory sx={{ fontSize: 24 }} />} 
                            iconPosition="start" 
                            label="INVENTORY" 
                            id="tab-1" 
                        />
                        <Tab 
                            icon={<History sx={{ fontSize: 24 }} />} 
                            iconPosition="start" 
                            label="TRANSACTIONS" 
                            id="tab-2" 
                        />
                    </Tabs>
                </Paper>

                <Box sx={{ 
                    animation: 'fadeIn 0.5s ease-out',
                    '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateY(20px)' },
                        to: { opacity: 1, transform: 'translateY(0)' }
                    }
                }}>
                    {tab === 0 && <StockDashboard />}
                    {tab === 1 && <ProductList />}
                    {tab === 2 && <StockTransactions />}
                </Box>
            </Container>
        </Box>
    );
};

export default StockPage;
