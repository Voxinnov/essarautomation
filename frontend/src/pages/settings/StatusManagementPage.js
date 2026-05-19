import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Button, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    Grid, Chip, Alert, Tooltip
} from '@mui/material';
import { Add, Edit, Delete, Refresh } from '@mui/icons-material';
import { statusService } from '../../services';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StatusManagementPage = () => {
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editStatus, setEditStatus] = useState(null);
    const [form, setForm] = useState({ label: '', color: '#9e9e9e' });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchStatuses = async () => {
        setLoading(true);
        try {
            const res = await statusService.getAll();
            setStatuses(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatuses();
    }, []);

    const handleOpen = (status = null) => {
        setEditStatus(status);
        setForm(status ? { label: status.label, color: status.color } : { label: '', color: '#9e9e9e' });
        setError('');
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        if (!form.label) return;
        setSaving(true);
        try {
            if (editStatus) {
                await statusService.update(editStatus.id, form);
            } else {
                await statusService.create(form);
            }
            setOpenDialog(false);
            fetchStatuses();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save status');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this status?')) return;
        try {
            await statusService.delete(id);
            fetchStatuses();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete status');
        }
    };

    return (
        <Box>
            <PageHeader 
                title="Status Management" 
                subtitle="Manage custom task statuses and their visual styles"
                action={() => handleOpen()}
                actionLabel="Add Status"
            />

            <Card>
                <TableContainer>
                    {loading ? (
                        <LoadingSpinner height="300px" />
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Title / Label</TableCell>
                                    <TableCell>System Name</TableCell>
                                    <TableCell>Preview</TableCell>
                                    <TableCell>Color Code</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {statuses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                                            No custom statuses found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    statuses.map((status, index) => (
                                        <TableRow key={status.id} hover>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {status.label}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <code>{status.name}</code>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={status.label} 
                                                    sx={{ 
                                                        bgcolor: status.color, 
                                                        color: '#fff',
                                                        fontWeight: 700,
                                                        fontSize: '0.75rem'
                                                    }} 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: status.color, border: '1px solid divider' }} />
                                                    <Typography variant="caption">{status.color.toUpperCase()}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Edit">
                                                    <IconButton size="small" onClick={() => handleOpen(status)} color="primary">
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {!status.is_system && (
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" onClick={() => handleDelete(status.id)} color="error">
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>
            </Card>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>{editStatus ? 'Edit Status' : 'Add New Status'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            fullWidth
                            label="Status Title"
                            placeholder="e.g., In Review"
                            value={form.label}
                            onChange={(e) => setForm({ ...form, label: e.target.value })}
                            autoFocus
                        />
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Choose Status Color
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <input
                                    type="color"
                                    value={form.color}
                                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                                    style={{
                                        width: 60,
                                        height: 40,
                                        padding: 0,
                                        border: 'none',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        background: 'none'
                                    }}
                                />
                                <TextField
                                    size="small"
                                    value={form.color.toUpperCase()}
                                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                                    sx={{ width: 120 }}
                                />
                                <Box 
                                    sx={{ 
                                        flex: 1, 
                                        p: 1, 
                                        borderRadius: 1, 
                                        bgcolor: form.color, 
                                        display: 'flex', 
                                        justifyContent: 'center' 
                                    }}
                                >
                                    <Chip label={form.label || 'Preview'} sx={{ color: '#fff', fontWeight: 700 }} />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSubmit} 
                        disabled={saving || !form.label}
                    >
                        {saving ? 'Saving...' : editStatus ? 'Update Status' : 'Create Status'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StatusManagementPage;
