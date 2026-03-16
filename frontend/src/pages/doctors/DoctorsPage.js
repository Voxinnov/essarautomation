import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, TextField, Typography, Pagination, Dialog, DialogTitle,
    DialogContent, DialogActions, Alert, Grid, Tooltip, InputAdornment, CardContent, Button,
    MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import { Edit, Delete, Search } from '@mui/icons-material';
import { doctorService, hospitalService } from '../../services';
import { formatDate } from '../../utils/constants';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const emptyForm = { doctor_name: '', department: '', hospital_id: '', phone: '', email: '' };

const DoctorsPage = () => {
    const [doctors, setDoctors] = useState([]);
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
            const res = await doctorService.getAll({ page, limit: 10, search });
            setDoctors(res.data.data);
            setTotalPages(res.data.totalPages);
            setTotal(res.data.count);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [page, search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        hospitalService.getAll({ limit: 100 }).then(r => setHospitals(r.data.data)).catch(console.error);
    }, []);

    const handleOpen = (item = null) => {
        setEditItem(item);
        setForm(item ? { doctor_name: item.doctor_name || '', department: item.department || '', hospital_id: item.hospital_id || '', phone: item.phone || '', email: item.email || '' } : emptyForm);
        setError('');
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            if (editItem) await doctorService.update(editItem.id, form);
            else await doctorService.create(form);
            setOpenDialog(false);
            fetchData();
        } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this doctor?')) return;
        try { await doctorService.delete(id); fetchData(); }
        catch { alert('Failed to delete'); }
    };

    return (
        <Box>
            <PageHeader title="Doctor Management" subtitle={`${total} doctors`} action={() => handleOpen()} actionLabel="New Doctor" />
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ pb: '16px !important' }}>
                    <TextField
                        size="small" placeholder="Search doctors..." value={search}
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
                                    <TableCell>Doctor Name</TableCell>
                                    <TableCell>Department</TableCell>
                                    <TableCell>Hospital</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {doctors.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>No doctors found</TableCell></TableRow>
                                ) : doctors.map((d, i) => (
                                    <TableRow key={d.id} hover>
                                        <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                                        <TableCell><Typography variant="body2" fontWeight={600}>{d.doctor_name}</Typography></TableCell>
                                        <TableCell>{d.department || '-'}</TableCell>
                                        <TableCell>{d.hospital?.hospital_name || '-'}</TableCell>
                                        <TableCell>{d.phone || '-'}</TableCell>
                                        <TableCell>{d.email || '-'}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpen(d)} color="info"><Edit fontSize="small" /></IconButton></Tooltip>
                                            {(user?.role === 'admin' || user?.role === 'manager') && (
                                                <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(d.id)} color="error"><Delete fontSize="small" /></IconButton></Tooltip>
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
                <DialogTitle>{editItem ? 'Edit Doctor' : 'Add Doctor'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}><TextField fullWidth label="Doctor Name *" value={form.doctor_name} onChange={(e) => setForm({ ...form, doctor_name: e.target.value })} /></Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Hospital</InputLabel>
                                <Select value={form.hospital_id} label="Hospital" fullWidth onChange={(e) => setForm({ ...form, hospital_id: e.target.value })}>
                                    <MenuItem value="">None</MenuItem>
                                    {hospitals.map(h => <MenuItem key={h.id} value={h.id}>{h.hospital_name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}><TextField fullWidth label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={saving || !form.doctor_name}>{saving ? 'Saving...' : editItem ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DoctorsPage;
