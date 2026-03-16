import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
    Alert, Grid, Tooltip, Button, MenuItem, Select, FormControl, InputLabel, Chip,
} from '@mui/material';
import { Add, Edit, Delete, Update } from '@mui/icons-material';
import { workUpdateService, taskService } from '../../services';
import { formatDateTime } from '../../utils/constants';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const emptyForm = { task_id: '', size: '', model: '', update_note: '' };

const WorkUpdatesPage = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState('');
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        taskService.getAll({ limit: 100 }).then(r => setTasks(r.data.data)).catch(console.error);
    }, []);

    const fetchUpdates = useCallback(async () => {
        if (!selectedTask) return;
        setLoading(true);
        try {
            const res = await workUpdateService.getByTask(selectedTask);
            setUpdates(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [selectedTask]);

    useEffect(() => { fetchUpdates(); }, [fetchUpdates]);

    const handleOpen = (item = null) => {
        setEditItem(item);
        setForm(item ? { task_id: item.task_id || selectedTask, size: item.size || '', model: item.model || '', update_note: item.update_note || '' } : { ...emptyForm, task_id: selectedTask });
        setError('');
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            if (editItem) await workUpdateService.update(editItem.id, form);
            else await workUpdateService.create(form);
            setOpenDialog(false);
            fetchUpdates();
        } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this update?')) return;
        try { await workUpdateService.delete(id); fetchUpdates(); }
        catch { alert('Failed to delete'); }
    };

    return (
        <Box>
            <PageHeader title="Work Updates" subtitle="Track work progress on tasks" action={selectedTask ? () => handleOpen() : null} actionLabel="Add Update" />

            <Card sx={{ mb: 3 }}>
                <Box sx={{ p: 2 }}>
                    <FormControl fullWidth sx={{ maxWidth: 400 }}>
                        <InputLabel>Select Task to View Updates</InputLabel>
                        <Select value={selectedTask} label="Select Task to View Updates" onChange={(e) => setSelectedTask(e.target.value)}>
                            <MenuItem value="">Select a task...</MenuItem>
                            {tasks.map(t => <MenuItem key={t.id} value={t.id}>{t.title}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Box>
            </Card>

            {selectedTask && (
                <Card>
                    <TableContainer>
                        {loading ? <LoadingSpinner height="300px" /> : (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>Size</TableCell>
                                        <TableCell>Model</TableCell>
                                        <TableCell>Update Note</TableCell>
                                        <TableCell>Updated By</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {updates.length === 0 ? (
                                        <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>No updates for this task</TableCell></TableRow>
                                    ) : updates.map((u, i) => (
                                        <TableRow key={u.id} hover>
                                            <TableCell>{i + 1}</TableCell>
                                            <TableCell>{u.size ? <Chip label={u.size} size="small" /> : '-'}</TableCell>
                                            <TableCell>{u.model ? <Chip label={u.model} size="small" color="secondary" /> : '-'}</TableCell>
                                            <TableCell><Typography variant="body2">{u.update_note || '-'}</Typography></TableCell>
                                            <TableCell>{u.updater?.name || '-'}</TableCell>
                                            <TableCell>{formatDateTime(u.created_at)}</TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpen(u)} color="info"><Edit fontSize="small" /></IconButton></Tooltip>
                                                <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(u.id)} color="error"><Delete fontSize="small" /></IconButton></Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </TableContainer>
                </Card>
            )}

            {!selectedTask && (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <Update sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h6">Select a task to view work updates</Typography>
                </Box>
            )}

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editItem ? 'Edit Work Update' : 'Add Work Update'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={6}><TextField fullWidth label="Size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Update Note" multiline rows={3} value={form.update_note} onChange={(e) => setForm({ ...form, update_note: e.target.value })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update' : 'Add'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WorkUpdatesPage;
