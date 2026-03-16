import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Button, TextField, Typography, Pagination, Dialog, DialogTitle,
    DialogContent, DialogActions, Alert, Grid, Tooltip, InputAdornment, CardContent,
} from '@mui/material';
import { Add, Edit, Delete, Search, People } from '@mui/icons-material';
import { clientService } from '../../services';
import { formatDate } from '../../utils/constants';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const emptyForm = { patient_name: '', phone: '', email: '', address: '', notes: '' };

const ClientsPage = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editClient, setEditClient] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const { user } = useAuth();

    const fetchClients = useCallback(async () => {
        setLoading(true);
        try {
            const res = await clientService.getAll({ page, limit: 10, search });
            setClients(res.data.data);
            setTotalPages(res.data.totalPages);
            setTotal(res.data.count);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [page, search]);

    useEffect(() => { fetchClients(); }, [fetchClients]);

    const handleOpen = (client = null) => {
        setEditClient(client);
        setForm(client ? { patient_name: client.patient_name || '', phone: client.phone || '', email: client.email || '', address: client.address || '', notes: client.notes || '' } : emptyForm);
        setError('');
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            if (editClient) await clientService.update(editClient.id, form);
            else await clientService.create(form);
            setOpenDialog(false);
            fetchClients();
        } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this client?')) return;
        try { await clientService.delete(id); fetchClients(); }
        catch { alert('Failed to delete'); }
    };

    return (
        <Box>
            <PageHeader title="Client Management" subtitle={`${total} clients registered`} action={() => handleOpen()} actionLabel="New Client" />
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ pb: '16px !important' }}>
                    <TextField
                        size="small" placeholder="Search clients..." value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                        sx={{ width: 320 }}
                    />
                </CardContent>
            </Card>
            <Card>
                <TableContainer>
                    {loading ? <LoadingSpinner height="300px" /> : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Patient Name</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Address</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {clients.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>No clients found</TableCell></TableRow>
                                ) : clients.map((c, i) => (
                                    <TableRow key={c.id} hover>
                                        <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                                        <TableCell><Typography variant="body2" fontWeight={600}>{c.patient_name}</Typography></TableCell>
                                        <TableCell>{c.phone || '-'}</TableCell>
                                        <TableCell>{c.email || '-'}</TableCell>
                                        <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>{c.address || '-'}</Typography></TableCell>
                                        <TableCell>{formatDate(c.created_at)}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpen(c)} color="info"><Edit fontSize="small" /></IconButton></Tooltip>
                                            {(user?.role === 'admin' || user?.role === 'manager') && (
                                                <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(c.id)} color="error"><Delete fontSize="small" /></IconButton></Tooltip>
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
                <DialogTitle>{editClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Patient Name *" value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} required />
                        </Grid>
                        <Grid item xs={6}><TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} multiline rows={2} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} multiline rows={2} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={saving || !form.patient_name}>{saving ? 'Saving...' : editClient ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ClientsPage;
