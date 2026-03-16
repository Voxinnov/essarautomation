import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, TextField, Typography, Pagination, Dialog, DialogTitle,
    DialogContent, DialogActions, Alert, Grid, Tooltip, InputAdornment, CardContent, Button,
} from '@mui/material';
import { Edit, Delete, Search } from '@mui/icons-material';
import { hospitalService } from '../../services';
import { formatDate } from '../../utils/constants';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const emptyForm = { hospital_name: '', location: '', phone: '', email: '' };

const HospitalsPage = () => {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const { user } = useAuth();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await hospitalService.getAll({ page, limit: 10, search });
            setHospitals(res.data.data);
            setTotalPages(res.data.totalPages);
            setTotal(res.data.count);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [page, search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpen = (item = null) => {
        setEditItem(item);
        setForm(item ? { hospital_name: item.hospital_name || '', location: item.location || '', phone: item.phone || '', email: item.email || '' } : emptyForm);
        setError('');
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            if (editItem) await hospitalService.update(editItem.id, form);
            else await hospitalService.create(form);
            setOpenDialog(false);
            fetchData();
        } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this hospital?')) return;
        try { await hospitalService.delete(id); fetchData(); }
        catch { alert('Failed to delete'); }
    };

    return (
        <Box>
            <PageHeader title="Hospital Management" subtitle={`${total} hospitals`} action={() => handleOpen()} actionLabel="New Hospital" />
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ pb: '16px !important' }}>
                    <TextField
                        size="small" placeholder="Search hospitals..." value={search}
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
                                    <TableCell>Hospital Name</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Created By</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {hospitals.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>No hospitals found</TableCell></TableRow>
                                ) : hospitals.map((h, i) => (
                                    <TableRow key={h.id} hover>
                                        <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                                        <TableCell><Typography variant="body2" fontWeight={600}>{h.hospital_name}</Typography></TableCell>
                                        <TableCell>{h.phone || '-'}</TableCell>
                                        <TableCell>{h.email || '-'}</TableCell>
                                        <TableCell>{h.creator?.name || 'System'}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpen(h)} color="info"><Edit fontSize="small" /></IconButton></Tooltip>
                                            {(user?.role === 'admin' || user?.role === 'manager') && (
                                                <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(h.id)} color="error"><Delete fontSize="small" /></IconButton></Tooltip>
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
                <DialogTitle>{editItem ? 'Edit Hospital' : 'Add Hospital'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}><TextField fullWidth label="Hospital Name *" value={form.hospital_name} onChange={(e) => setForm({ ...form, hospital_name: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} multiline rows={2} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={saving || !form.hospital_name}>{saving ? 'Saving...' : editItem ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default HospitalsPage;
