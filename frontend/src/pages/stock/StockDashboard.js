import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, List, ListItem, ListItemText, Divider, Chip, Avatar, Paper } from '@mui/material';
import { Warning, ArrowUpward, ArrowDownward, History, Inventory, SwapHoriz, AssignmentLate } from '@mui/icons-material';
import { stockService, taskProductService } from '../../services';
import { Button } from '@mui/material';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/constants';

const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ 
        height: '100%', 
        borderRadius: 4, 
        boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.05)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
        }
    }}>
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1.2 }}>
                        {title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: '#1e293b' }}>
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <Avatar sx={{ 
                    bgcolor: `${color}15`, 
                    color: color, 
                    width: 56, 
                    height: 56,
                    borderRadius: 3
                }}>
                    {icon}
                </Avatar>
            </Box>
        </CardContent>
        <Box sx={{ 
            height: 4, 
            width: '100%', 
            bgcolor: color, 
            opacity: 0.6,
            position: 'absolute',
            bottom: 0
        }} />
    </Card>
);

const StockDashboard = () => {
    const [data, setData] = useState(null);
    const [backorders, setBackorders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await stockService.getDashboard();
                setData(res.data.data);
                const boRes = await taskProductService.getBackorders();
                setBackorders(boRes.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const handleResolveBackorders = async () => {
        try {
            await taskProductService.resolveBackorders();
            const boRes = await taskProductService.getBackorders();
            setBackorders(boRes.data.data);
            const res = await stockService.getDashboard();
            setData(res.data.data);
            alert('Backorders resolution process completed.');
        } catch (err) {
            alert('Failed to resolve backorders.');
        }
    };

    if (loading) return <LoadingSpinner height="300px" />;

    const totalProducts = data.totalProducts || 0;
    const lowStockCount = data.lowStock.length;

    return (
        <Box>
            {/* Stats Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Total Products" 
                        value={totalProducts} 
                        icon={<Inventory sx={{ fontSize: 32 }} />} 
                        color="#8a0303"
                        subtitle="Across all categories"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Low Stock Alerts" 
                        value={lowStockCount} 
                        icon={<Warning sx={{ fontSize: 32 }} />} 
                        color={lowStockCount > 0 ? '#ef4444' : '#10b981'}
                        subtitle="Below reorder levels"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Recent Activity" 
                        value={data.recentTransactions.length} 
                        icon={<SwapHoriz sx={{ fontSize: 32 }} />} 
                        color="#3b82f6"
                        subtitle="Transactions in last 7 days"
                    />
                </Grid>
            </Grid>

            {/* Backorders Section */}
            {backorders.length > 0 && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{ bgcolor: '#fff7ed', color: '#ea580c' }}>
                                        <AssignmentLate />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Pending Backorders</Typography>
                                        <Typography variant="caption" color="text.secondary">{backorders.length} items awaiting stock fulfillment</Typography>
                                    </Box>
                                </Box>
                                <Button variant="contained" color="warning" onClick={handleResolveBackorders}>
                                    Resolve Backorders
                                </Button>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {backorders.map((bo) => (
                                    <Box key={bo.id} sx={{ p: 2, borderRadius: 3, border: '1px solid #fed7aa', background: '#fffbeb', width: '250px' }}>
                                        <Typography sx={{ fontWeight: 700 }}>{bo.product?.name}</Typography>
                                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                            Task: {bo.task?.title}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                            <Typography variant="caption">Req: {bo.quantity_required}</Typography>
                                            <Typography variant="caption" color="error">Need: {bo.quantity_required - bo.quantity_fulfilled}</Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            <Grid container spacing={3}>
                {/* Low Stock Detailed Alerts */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: '#fff1f2', color: '#e11d48' }}>
                                <Warning />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>Critical Stock Levels</Typography>
                                <Typography variant="caption" color="text.secondary">Items requiring immediate attention</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ maxHeight: 400, overflow: 'auto', pr: 1 }}>
                            {data.lowStock.length === 0 ? (
                                <Box sx={{ py: 4, textAlign: 'center' }}>
                                    <Typography color="text.secondary">All products are within healthy stock levels.</Typography>
                                </Box>
                            ) : data.lowStock.map((prod, idx) => (
                                <Box key={prod.id} sx={{ 
                                    mb: 2, 
                                    p: 2, 
                                    borderRadius: 3, 
                                    border: '1px solid #f1f5f9',
                                    background: '#f8fafc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    '&:hover': { background: '#f1f5f9', transition: '0.2s' }
                                }}>
                                    <Box>
                                        <Typography sx={{ fontWeight: 700 }}>{prod.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {prod.brand?.name} • Code: {prod.product_code}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="h6" sx={{ color: '#e11d48', fontWeight: 800, lineHeight: 1 }}>
                                            {prod.current_stock}
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#e11d48' }}>
                                            Units Left
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Recent Transactions Timeline */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: '#eff6ff', color: '#2563eb' }}>
                                <History />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>Activity Log</Typography>
                                <Typography variant="caption" color="text.secondary">Recent inventory movements</Typography>
                            </Box>
                        </Box>
                        <List sx={{ p: 0 }}>
                            {data.recentTransactions.length === 0 ? (
                                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No recent activity to show.</Typography>
                            ) : data.recentTransactions.map((tx, idx) => (
                                <React.Fragment key={tx.id}>
                                    <ListItem sx={{ px: 0, py: 2 }}>
                                        <Box sx={{ 
                                            width: 40, 
                                            height: 40, 
                                            borderRadius: '50%', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            bgcolor: tx.type === 'IN' ? '#ecfdf5' : tx.type === 'OUT' ? '#fff1f2' : '#f1f5f9',
                                            color: tx.type === 'IN' ? '#10b981' : tx.type === 'OUT' ? '#ef4444' : '#64748b',
                                            mr: 2,
                                            flexShrink: 0
                                        }}>
                                            {tx.type === 'IN' ? <ArrowUpward fontSize="small" /> : tx.type === 'OUT' ? <ArrowDownward fontSize="small" /> : <SwapHoriz fontSize="small" />}
                                        </Box>
                                        <ListItemText 
                                            primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>{tx.product?.name}</Typography>} 
                                            secondary={
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    {tx.type} • {tx.quantity} Units • By {tx.user?.name}
                                                </Typography>
                                            } 
                                        />
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                            {formatDate(tx.createdAt)}
                                        </Typography>
                                    </ListItem>
                                    {idx < data.recentTransactions.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default StockDashboard;
