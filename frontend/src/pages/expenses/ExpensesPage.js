import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, TextField, Typography, Pagination, Dialog, DialogTitle,
    DialogContent, DialogActions, Alert, Grid, Tooltip, InputAdornment, CardContent, Button,
    MenuItem, Select, FormControl, InputLabel, Chip,
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { expenseService } from '../../services';
import { formatDate, formatCurrency, EXPENSE_CATEGORIES } from '../../utils/constants';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const emptyForm = { title: '', amount: '', category: '', date: new Date().toISOString().split('T')[0], notes: '' };

const ExpensesPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const { user } = useAuth();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await expenseService.getAll({ page, limit: 10, search, category: categoryFilter });
            setItems(res.data.data);
            setTotalPages(res.data.totalPages);
            setTotal(res.data.count);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [page, search, categoryFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpen = (item = null) => {
        setEditItem(item);
        setForm(item ? { title: item.title || '', amount: item.amount || '', category: item.category || '', date: item.date || '', notes: item.notes || '' } : emptyForm);
        setError('');
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            if (editItem) await expenseService.update(editItem.id, form);
            else await expenseService.create(form);
            setOpenDialog(false);
            fetchData();
        } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this expense?')) return;
        try { await expenseService.delete(id); fetchData(); }
        catch { alert('Failed to delete'); }
    };

    const totalAmount = items.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);

    return (
        <Box>
            <PageHeader title="Expense Management" subtitle={`${total} expenses | This page: ${formatCurrency(totalAmount)}`} action={() => handleOpen()} actionLabel="Add Expense" />
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ pb: '16px !important' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={5}>
                            <TextField size="small" fullWidth placeholder="Search expenses..." value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Category</InputLabel>
                                <Select value={categoryFilter} label="Category" fullWidth onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
                                    <MenuItem value="">All Categories</MenuItem>
                                    {EXPENSE_CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button variant="outlined" fullWidth onClick={() => { setSearch(''); setCategoryFilter(''); setPage(1); }}>Clear Filters</Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <Card>
                <TableContainer>
                    {loading ? <LoadingSpinner height="300px" /> : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Added By</TableCell>
                                    <TableCell>Notes</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.secondary' }}>No expenses found</TableCell></TableRow>
                                ) : items.map((item, i) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                                        <TableCell><Typography variant="body2" fontWeight={600}>{item.title}</Typography></TableCell>
                                        <TableCell><Typography fontWeight={700} color="error.main">{formatCurrency(item.amount)}</Typography></TableCell>
                                        <TableCell>{item.category ? <Chip label={item.category} size="small" variant="outlined" /> : '-'}</TableCell>
                                        <TableCell>{formatDate(item.date)}</TableCell>
                                        <TableCell>{item.creator?.name || '-'}</TableCell>
                                        <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>{item.notes || '-'}</Typography></TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpen(item)} color="info"><Edit fontSize="small" /></IconButton></Tooltip>
                                            {(user?.role === 'admin' || user?.role === 'manager') && (
                                                <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(item.id)} color="error"><Delete fontSize="small" /></IconButton></Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" />
                    </Box>
                )}
            </Card>
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editItem ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}><TextField fullWidth label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Amount *" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select value={form.category} label="Category" fullWidth onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                    <MenuItem value="">None</MenuItem>
                                    {EXPENSE_CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}><TextField fullWidth label="Date" type="date" InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Notes" multiline rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={saving || !form.title || !form.amount}>{saving ? 'Saving...' : editItem ? 'Update' : 'Add Expense'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ExpensesPage;
