import React, { useState, useEffect } from 'react';
import { 
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, Typography, Box, TextField, InputAdornment, Chip, 
    Avatar, TablePagination 
} from '@mui/material';
import { Search, History, ArrowUpward, ArrowDownward, SyncAlt } from '@mui/icons-material';
import { stockService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/constants';

const StockTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const res = await stockService.getTransactions();
                setTransactions(res.data.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchTransactions();
    }, []);

    const filteredTx = transactions.filter(tx => 
        tx.product?.name.toLowerCase().includes(search.toLowerCase()) ||
        tx.reference_id?.toLowerCase().includes(search.toLowerCase()) ||
        tx.user?.name.toLowerCase().includes(search.toLowerCase())
    );

    const getTxIcon = (type) => {
        switch(type) {
            case 'IN': return <ArrowUpward fontSize="small" />;
            case 'OUT': return <ArrowDownward fontSize="small" />;
            default: return <SyncAlt fontSize="small" />;
        }
    };

    const getTxColor = (type) => {
        switch(type) {
            case 'IN': return { bg: '#ecfdf5', text: '#10b981' };
            case 'OUT': return { bg: '#fff1f2', text: '#ef4444' };
            default: return { bg: '#f1f5f9', text: '#64748b' };
        }
    };

    return (
        <Box>
            <Paper sx={{ 
                mb: 4, 
                p: 2, 
                borderRadius: 4, 
                boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center'
            }}>
                <TextField
                    fullWidth 
                    size="medium" 
                    placeholder="Search motions by product, user, or reference ID..."
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: '#f8fafc',
                            '& fieldset': { border: 'none' },
                        }
                    }}
                    InputProps={{ 
                        startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment> 
                    }}
                />
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: 5, boxShadow: '0 20px 40px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {loading ? <LoadingSpinner height="400px" /> : (
                    <>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 800, py: 3 }}>DATE & TIME</TableCell>
                                    <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 800 }}>TYPE</TableCell>
                                    <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 800 }}>PRODUCT</TableCell>
                                    <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 800 }} align="center">QUANTITY</TableCell>
                                    <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 800 }}>PERFORMED BY</TableCell>
                                    <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 800 }}>REFERENCE & NOTES</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredTx.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((tx) => {
                                    const colors = getTxColor(tx.type);
                                    return (
                                        <TableRow key={tx.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ py: 3 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(tx.createdAt)}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    icon={getTxIcon(tx.type)} 
                                                    label={tx.type} 
                                                    sx={{ 
                                                        bgcolor: colors.bg, 
                                                        color: colors.text, 
                                                        fontWeight: 800,
                                                        borderRadius: 2,
                                                        '& .MuiChip-icon': { color: 'inherit' }
                                                    }} 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{tx.product?.name || 'Deleted Product'}</Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body1" sx={{ fontWeight: 800, color: colors.text }}>
                                                    {tx.type === 'OUT' ? '-' : tx.type === 'IN' ? '+' : ''}{tx.quantity}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: '#e2e8f0', color: '#475569' }}>
                                                        {tx.user?.name?.charAt(0)}
                                                    </Avatar>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{tx.user?.name}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{tx.reference_id || '-'}</Typography>
                                                <Typography variant="caption" color="text.secondary">{tx.notes || 'No additional notes'}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filteredTx.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                            <Typography color="text.secondary">No transaction records found matching your search.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component="div"
                            count={filteredTx.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(e, p) => setPage(p)}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            sx={{ bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}
                        />
                    </>
                )}
            </TableContainer>
        </Box>
    );
};

export default StockTransactions;
