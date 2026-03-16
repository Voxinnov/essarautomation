import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, CardContent, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Button, TextField, MenuItem,
    Select, FormControl, InputLabel, Chip, Typography, Pagination,
    Dialog, DialogTitle, DialogContent, DialogActions, Alert,
    Grid, Tooltip, InputAdornment,
} from '@mui/material';
import { Add, Edit, Delete, Visibility, Search, FilterList } from '@mui/icons-material';
import { taskService, clientService, hospitalService, doctorService, authService } from '../../services';
import { TASK_STATUSES, TASK_PRIORITIES, formatDate } from '../../utils/constants';
import StatusChip from '../../components/common/StatusChip';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const emptyForm = { title: '', description: '', client_id: '', hospital_id: '', doctor_id: '', assigned_to: '', status: 'pending', priority: 'medium', due_date: '' };

const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [clients, setClients] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const res = await taskService.getAll({ page, limit: 10, search, status: statusFilter, priority: priorityFilter });
            setTasks(res.data.data);
            setTotalPages(res.data.totalPages);
            setTotal(res.data.count);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [page, search, statusFilter, priorityFilter]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    useEffect(() => {
        const loadDropdowns = async () => {
            const [c, h, d, u] = await Promise.all([
                clientService.getAll({ limit: 100 }),
                hospitalService.getAll({ limit: 100 }),
                doctorService.getAll({ limit: 100 }),
                authService.getUsers(),
            ]);
            setClients(c.data.data);
            setHospitals(h.data.data);
            setDoctors(d.data.data);
            setUsers(u.data.data);
        };
        loadDropdowns();
    }, []);

    const handleOpen = (task = null) => {
        setEditTask(task);
        setForm(task ? {
            title: task.title || '', description: task.description || '',
            client_id: task.client_id || '', hospital_id: task.hospital_id || '',
            doctor_id: task.doctor_id || '', assigned_to: task.assigned_to || '',
            status: task.status || 'pending', priority: task.priority || 'medium',
            due_date: task.due_date ? task.due_date.split('T')[0] : '',
        } : emptyForm);
        setError('');
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            if (editTask) {
                await taskService.update(editTask.id, form);
            } else {
                await taskService.create(form);
            }
            setOpenDialog(false);
            fetchTasks();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save task');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try { await taskService.delete(id); fetchTasks(); }
        catch (err) { alert('Failed to delete task'); }
    };

    return (
        <Box>
            <PageHeader title="Task Management" subtitle={`${total} total tasks`} action={() => handleOpen()} actionLabel="New Task" />

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ pb: '16px !important' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth size="small" placeholder="Search tasks..."
                                value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select value={statusFilter} label="Status" fullWidth onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                                    <MenuItem value="">All</MenuItem>
                                    {TASK_STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Priority</InputLabel>
                                <Select value={priorityFilter} label="Priority" fullWidth onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}>
                                    <MenuItem value="">All</MenuItem>
                                    {TASK_PRIORITIES.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button variant="outlined" fullWidth onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); setPage(1); }}>
                                Clear
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Tasks Table */}
            <Card>
                <TableContainer>
                    {loading ? <LoadingSpinner height="300px" /> : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Client</TableCell>
                                    <TableCell>Hospital</TableCell>
                                    <TableCell>Assigned To</TableCell>
                                    <TableCell>Priority</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Due Date</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tasks.length === 0 ? (
                                    <TableRow><TableCell colSpan={9} align="center" sx={{ py: 5, color: 'text.secondary' }}>No tasks found</TableCell></TableRow>
                                ) : tasks.map((task, i) => (
                                    <TableRow key={task.id} hover>
                                        <TableCell>{(page - 1) * 10 + i + 1}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>{task.title}</Typography>
                                            {task.description && <Typography variant="caption" color="text.secondary">{task.description.substring(0, 50)}...</Typography>}
                                        </TableCell>
                                        <TableCell>{task.client?.patient_name || '-'}</TableCell>
                                        <TableCell>{task.hospital?.hospital_name || '-'}</TableCell>
                                        <TableCell>{task.assignee?.name || '-'}</TableCell>
                                        <TableCell><StatusChip status={task.priority} /></TableCell>
                                        <TableCell><StatusChip status={task.status} /></TableCell>
                                        <TableCell>{formatDate(task.due_date)}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="View Details">
                                                <IconButton size="small" onClick={() => navigate(`/tasks/${task.id}`)} color="primary">
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => handleOpen(task)} color="info">
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {(user?.role === 'admin' || user?.role === 'manager') && (
                                                <Tooltip title="Delete">
                                                    <IconButton size="small" onClick={() => handleDelete(task.id)} color="error">
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
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

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={3} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Client</InputLabel>
                                <Select value={form.client_id} label="Client" onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
                                    <MenuItem value="">None</MenuItem>
                                    {clients.map(c => <MenuItem key={c.id} value={c.id}>{c.patient_name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Hospital</InputLabel>
                                <Select value={form.hospital_id} label="Hospital" fullWidth onChange={(e) => setForm({ ...form, hospital_id: e.target.value })}>
                                    <MenuItem value="">None</MenuItem>
                                    {hospitals.map(h => <MenuItem key={h.id} value={h.id}>{h.hospital_name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Doctor</InputLabel>
                                <Select value={form.doctor_id} label="Doctor" onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}>
                                    <MenuItem value="">None</MenuItem>
                                    {doctors.map(d => <MenuItem key={d.id} value={d.id}>{d.doctor_name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Assign To</InputLabel>
                                <Select value={form.assigned_to} label="Assign To" onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
                                    <MenuItem value="">Unassigned</MenuItem>
                                    {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name} ({u.role})</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select value={form.status} label="Status" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                    {TASK_STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select value={form.priority} label="Priority" onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                                    {TASK_PRIORITIES.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Due Date" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} InputLabelProps={{ shrink: true }} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={saving || !form.title}>
                        {saving ? 'Saving...' : editTask ? 'Update Task' : 'Create Task'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TasksPage;
