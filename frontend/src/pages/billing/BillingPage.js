import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, TextField, Typography, Pagination, Dialog, DialogTitle,
    DialogContent, DialogActions, Alert, Grid, Tooltip, InputAdornment, CardContent, Button,
    MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { billingService, taskService, clientService } from '../../services';
import { formatDate, formatCurrency, BILLING_TYPES, BILLING_STATUSES } from '../../utils/constants';
import StatusChip from '../../components/common/StatusChip';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const emptyForm = { task_id: '', client_id: '', amount: '', billing_type: 'fixed', status: 'pending', notes: '', due_date: '' };

const BillingPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [clients, setClients] = useState([]);
    const { user } = useAuth();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await billingService.getAll({ page, limit: 10, status: statusFilter });
            setItems(res.data.data);
            setTotalPages(res.data.totalPages);
            setTotal(res.data.count);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [page, statusFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        Promise.all([taskService.getAll({ limit: 100 }), clientService.getAll({ limit: 100 })]).then(([t, c]) => {
            setTasks(t.data.data);
            setClients(c.data.data);
        });
    }, []);

    const handleOpen = (item = null) => {
        setEditItem(item);
        setForm(item ? { task_id: item.task_id || '', client_id: item.client_id || '', amount: item.amount || '', billing_type: item.billing_type || 'fixed', status: item.status || 'pending', notes: item.notes || '', due_date: item.due_date ? item.due_date.split('T')[0] : '' } : emptyForm);
        setError('');
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            if (editItem) await billingService.update(editItem.id, form);
            else await billingService.create(form);
            setOpenDialog(false);
            fetchData();
        } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this billing record?')) return;
        try { await billingService.delete(id); fetchData(); }
        catch { alert('Failed to delete'); }
    };

    return (
        <Box>
            <PageHeader title="Billing & Invoices" subtitle={`${total} billing records`}
                action={user?.role !== 'staff' ? () => handleOpen() : null} actionLabel="New Invoice" />
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ pb: '16px !important' }}>
                    <FormControl size="small">
                        <InputLabel>Filter by Status</InputLabel>
                        <Select value={statusFilter} label="Filter by Status" fullWidth onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                            <MenuItem value="">All Statuses</MenuItem>
                            {BILLING_STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                        </Select>
                    </FormControl>
                </CardContent>
            </Card>
            <Card>
                <TableContainer>
                    {loading ? <LoadingSpinner height="300px" /> : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Invoice #</TableCell>
                                    <TableCell>Task</TableCell>
                                    <TableCell>Client</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Due Date</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow><TableCell colSpan={9} align="center" sx={{ py: 5, color: 'text.secondary' }}>No billing records found</TableCell></TableRow>
                                ) : items.map((item, i) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                                        <TableCell><Typography variant="body2" fontWeight={600} color="primary">{item.invoice_number}</Typography></TableCell>
                                        <TableCell>{item.task?.title || '-'}</TableCell>
                                        <TableCell>{item.client?.patient_name || '-'}</TableCell>
                                        <TableCell><Typography fontWeight={700}>{formatCurrency(item.amount)}</Typography></TableCell>
                                        <TableCell><Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{item.billing_type}</Typography></TableCell>
                                        <TableCell><StatusChip status={item.status} /></TableCell>
                                        <TableCell>{formatDate(item.due_date)}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpen(item)} color="info"><Edit fontSize="small" /></IconButton></Tooltip>
                                            {user?.role === 'admin' && (
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
                <DialogTitle>{editItem ? 'Edit Billing' : 'Create Invoice'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Task</InputLabel>
                                <Select value={form.task_id} label="Task" fullWidth onChange={(e) => setForm({ ...form, task_id: e.target.value })}>
                                    <MenuItem value="">None</MenuItem>
                                    {tasks.map(t => <MenuItem key={t.id} value={t.id}>{t.title}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Client</InputLabel>
                                <Select value={form.client_id} label="Client" onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
                                    <MenuItem value="">None</MenuItem>
                                    {clients.map(c => <MenuItem key={c.id} value={c.id}>{c.patient_name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}><TextField fullWidth label="Amount *" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Billing Type</InputLabel>
                                <Select value={form.billing_type} label="Billing Type" onChange={(e) => setForm({ ...form, billing_type: e.target.value })}>
                                    {BILLING_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select value={form.status} label="Status" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                    {BILLING_STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}><TextField fullWidth label="Due Date" type="date" InputLabelProps={{ shrink: true }} value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Notes" multiline rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={saving || !form.amount}>{saving ? 'Saving...' : editItem ? 'Update' : 'Create Invoice'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BillingPage;
