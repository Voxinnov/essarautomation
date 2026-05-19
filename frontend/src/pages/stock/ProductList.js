import React, { useState, useEffect } from 'react';
import {
    Card, CardContent, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Typography, TextField,
    InputAdornment, Box, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, Alert, Tooltip, Paper,
    LinearProgress, Avatar, TablePagination
} from '@mui/material';
import { Search, Add, Remove, SyncAlt, Label, Delete } from '@mui/icons-material';
import { stockService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [openTx, setOpenTx] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [txType, setTxType] = useState('IN');
    const [txForm, setTxForm] = useState({ quantity: '', reference_id: '', notes: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [openAddProduct, setOpenAddProduct] = useState(false);
    const [addProductForm, setAddProductForm] = useState({
        name: '', brand_name: '', category_name: '', product_code: '', 
        hsn_code: '', units_per_box: '', mrp: '', ptr: '', tax_rate: '5', reorder_level: '10'
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await stockService.getProducts();
            setProducts(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProducts(); }, []);

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.product_code.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Reset page to 0 when searching
    useEffect(() => {
        setPage(0);
    }, [search]);

    const handleOpenAddProduct = () => {
        setAddProductForm({
            name: '', brand_name: '', category_name: '', product_code: '', 
            hsn_code: '', units_per_box: '', mrp: '', ptr: '', tax_rate: '5', reorder_level: '10'
        });
        setError('');
        setOpenAddProduct(true);
    };

    const handleAddProductSubmit = async () => {
        if (!addProductForm.name || !addProductForm.product_code || !addProductForm.brand_name) {
            setError('Product Name, Code, and Brand are required');
            return;
        }
        setSaving(true);
        try {
            await stockService.createProduct(addProductForm);
            setOpenAddProduct(false);
            fetchProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create product');
        } finally { setSaving(false); }
    };

    const handleOpenTx = (prod, type) => {
        setSelectedProduct(prod);
        setTxType(type);
        setTxForm({ quantity: '', reference_id: '', notes: '' });
        setError('');
        setOpenTx(true);
    };

    const handleTxSubmit = async () => {
        if (!txForm.quantity || parseInt(txForm.quantity) <= 0) {
            setError('Please enter a valid quantity');
            return;
        }
        setSaving(true);
        try {
            await stockService.createTransaction({
                product_id: selectedProduct.id,
                type: txType,
                ...txForm,
                reference_type: 'MANUAL'
            });
            setOpenTx(false);
            fetchProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to record transaction');
        } finally { setSaving(false); }
    };

    const getStockColor = (current, reorder) => {
        if (current <= 0) return '#ef4444';
        if (current <= reorder) return '#f59e0b';
        return '#10b981';
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await stockService.deleteProduct(id);
            fetchProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete product. It may be in use.');
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
                alignItems: 'center',
                gap: 2
            }}>
                <TextField
                    fullWidth 
                    size="medium" 
                    placeholder="Search by product name, code, or brand..."
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: '#f8fafc',
                            '& fieldset': { border: 'none' },
                            '&:hover fieldset': { border: 'none' },
                            '&.Mui-focused fieldset': { border: 'none' },
                        }
                    }}
                    InputProps={{ 
                        startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment> 
                    }}
                />
                <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={handleOpenAddProduct}
                    sx={{ 
                        borderRadius: 3, 
                        px: 3, 
                        py: 1.5,
                        whiteSpace: 'nowrap',
                        bgcolor: '#8a0303',
                        '&:hover': { bgcolor: '#4a0000' }
                    }}
                >
                    Add New Product
                </Button>
            </Paper>

            {error && !openTx && !openAddProduct && (
                <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 3 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper} sx={{ borderRadius: 5, boxShadow: '0 20px 40px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                {loading ? <LoadingSpinner height="400px" /> : (
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 800, py: 3 }}>PRODUCT INFORMATION</TableCell>
                                <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 800 }}>BRAND / CATEGORY</TableCell>
                                <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 800 }}>SPECS</TableCell>
                                <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 800 }}>UNIT PRICE</TableCell>
                                <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 800 }} align="center">AVAILABILITY</TableCell>
                                <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 800 }} align="center">STOCK ACTIONS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProducts
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((prod) => (
                                <TableRow key={prod.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ py: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: '#f1f5f9', color: '#1e293b', borderRadius: 2 }}>
                                                {prod.name.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b' }}>{prod.name}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>ID: {prod.product_code} • HSN: {prod.hsn_code}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{prod.brand?.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{prod.category?.name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{prod.size || '-'}</Typography>
                                        <Typography variant="caption" color="text.secondary">{prod.units_per_box ? `${prod.units_per_box} units/box` : ''}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b' }}>₹{prod.ptr || prod.mrp}</Typography>
                                        <Typography variant="caption" color="text.secondary">MRP: ₹{prod.mrp}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ minWidth: 120 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: getStockColor(prod.current_stock, prod.reorder_level) }}>
                                                    {prod.current_stock} Units
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">Goal: {prod.reorder_level * 2}</Typography>
                                            </Box>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={Math.min((prod.current_stock / (prod.reorder_level * 2)) * 100, 100)} 
                                                sx={{ 
                                                    height: 8, 
                                                    borderRadius: 4,
                                                    bgcolor: '#f1f5f9',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: getStockColor(prod.current_stock, prod.reorder_level),
                                                        borderRadius: 4
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <Tooltip title="Add Inventory">
                                                <IconButton 
                                                    component={Paper} 
                                                    elevation={0}
                                                    sx={{ bgcolor: '#ecfdf5', color: '#10b981', '&:hover': { bgcolor: '#10b981', color: 'white' } }}
                                                    onClick={() => handleOpenTx(prod, 'IN')}
                                                >
                                                    <Add fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Deduct Inventory">
                                                <IconButton 
                                                    component={Paper}
                                                    elevation={0}
                                                    sx={{ bgcolor: '#fff1f2', color: '#ef4444', '&:hover': { bgcolor: '#ef4444', color: 'white' } }}
                                                    onClick={() => handleOpenTx(prod, 'OUT')}
                                                >
                                                    <Remove fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Adjust Balance">
                                                <IconButton 
                                                    component={Paper}
                                                    elevation={0}
                                                    sx={{ bgcolor: '#f8fafc', color: '#64748b', '&:hover': { bgcolor: '#1e293b', color: 'white' } }}
                                                    onClick={() => handleOpenTx(prod, 'ADJUSTMENT')}
                                                >
                                                    <SyncAlt fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Product">
                                                <IconButton 
                                                    component={Paper}
                                                    elevation={0}
                                                    sx={{ bgcolor: '#fff1f2', color: '#ef4444', '&:hover': { bgcolor: '#dc2626', color: 'white' }, ml: 1 }}
                                                    onClick={() => handleDeleteProduct(prod.id)}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component={Box}
                sx={{ 
                    mt: 2, 
                    borderRadius: 4, 
                    bgcolor: 'white',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    minHeight: 64,
                    color: '#64748b',
                    '& .MuiTablePagination-toolbar': {
                        width: '100%',
                        paddingLeft: 2
                    },
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows, & .MuiTablePagination-select, & .MuiTablePagination-selectIcon, & .MuiIconButton-root': {
                        color: '#475569 !important',
                        fontWeight: 700,
                        opacity: 1
                    },
                    '& .Mui-disabled': {
                        opacity: 0.3
                    }
                }}
                count={filteredProducts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <Dialog 
                open={openTx} 
                onClose={() => setOpenTx(false)} 
                maxWidth="xs" 
                fullWidth
                PaperProps={{ sx: { borderRadius: 5, p: 1 } }}
            >
                <DialogTitle sx={{ pb: 1, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        {txType === 'IN' ? 'Inventory Inbound' : txType === 'OUT' ? 'Inventory Outbound' : 'Balance Adjustment'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{selectedProduct?.name}</Typography>
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}
                    <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                label={txType === 'ADJUSTMENT' ? 'Corrected Units' : 'Quantity to Move'} 
                                type="number" 
                                variant="outlined"
                                value={txForm.quantity} 
                                onChange={(e) => setTxForm({ ...txForm, quantity: e.target.value })} 
                                required 
                                autoFocus
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                label="Reference (Optional)" 
                                placeholder="e.g. Invoice #, GRN Code" 
                                variant="outlined"
                                value={txForm.reference_id} 
                                onChange={(e) => setTxForm({ ...txForm, reference_id: e.target.value })} 
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                label="Movement Notes" 
                                multiline 
                                rows={2} 
                                variant="outlined"
                                value={txForm.notes} 
                                onChange={(e) => setTxForm({ ...txForm, notes: e.target.value })} 
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 4, pt: 1, justifyContent: 'center' }}>
                    <Button onClick={() => setOpenTx(false)} variant="text" sx={{ fontWeight: 700, color: 'text.secondary' }}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleTxSubmit} 
                        disabled={saving} 
                        size="large"
                        sx={{ 
                            px: 5, 
                            borderRadius: 3,
                            boxShadow: 3,
                            bgcolor: txType === 'IN' ? '#10b981' : txType === 'OUT' ? '#ef4444' : '#1e293b',
                            '&:hover': { bgcolor: txType === 'IN' ? '#059669' : txType === 'OUT' ? '#dc2626' : '#0f172a' }
                        }}
                    >
                        {saving ? 'Processing...' : 'Complete Motion'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add New Product Dialog */}
            <Dialog 
                open={openAddProduct} 
                onClose={() => setOpenAddProduct(false)} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{ sx: { borderRadius: 5, p: 1 } }}
            >
                <DialogTitle sx={{ pb: 1, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Add New Product</Typography>
                    <Typography variant="body2" color="text.secondary">Create a new entry in the inventory catalog</Typography>
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} md={8}>
                            <TextField fullWidth label="Product Name" variant="outlined" value={addProductForm.name} onChange={(e) => setAddProductForm({ ...addProductForm, name: e.target.value })} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Product Code" variant="outlined" value={addProductForm.product_code} onChange={(e) => setAddProductForm({ ...addProductForm, product_code: e.target.value })} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Brand Name" variant="outlined" value={addProductForm.brand_name} onChange={(e) => setAddProductForm({ ...addProductForm, brand_name: e.target.value })} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Category Name" variant="outlined" value={addProductForm.category_name} onChange={(e) => setAddProductForm({ ...addProductForm, category_name: e.target.value })} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField fullWidth label="HSN Code" variant="outlined" value={addProductForm.hsn_code} onChange={(e) => setAddProductForm({ ...addProductForm, hsn_code: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField fullWidth label="Units/Box" type="number" variant="outlined" value={addProductForm.units_per_box} onChange={(e) => setAddProductForm({ ...addProductForm, units_per_box: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField fullWidth label="MRP" type="number" variant="outlined" value={addProductForm.mrp} onChange={(e) => setAddProductForm({ ...addProductForm, mrp: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField fullWidth label="PTR" type="number" variant="outlined" value={addProductForm.ptr} onChange={(e) => setAddProductForm({ ...addProductForm, ptr: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                        </Grid>
                        <Grid item xs={6} md={6}>
                            <TextField fullWidth label="Tax Rate (%)" type="number" variant="outlined" value={addProductForm.tax_rate} onChange={(e) => setAddProductForm({ ...addProductForm, tax_rate: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                        </Grid>
                        <Grid item xs={6} md={6}>
                            <TextField fullWidth label="Reorder Level" type="number" variant="outlined" value={addProductForm.reorder_level} onChange={(e) => setAddProductForm({ ...addProductForm, reorder_level: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 4, pt: 1, justifyContent: 'center' }}>
                    <Button onClick={() => setOpenAddProduct(false)} variant="text" sx={{ fontWeight: 700, color: 'text.secondary' }}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleAddProductSubmit} 
                        disabled={saving} 
                        size="large"
                        sx={{ 
                            px: 5, 
                            borderRadius: 3,
                            boxShadow: 3,
                            bgcolor: '#1e293b',
                            '&:hover': { bgcolor: '#0f172a' }
                        }}
                    >
                        {saving ? 'Creating...' : 'Create Product'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProductList;
