import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, CardContent, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Button, TextField, MenuItem,
    Select, FormControl, InputLabel, Chip, Typography, Pagination,
    Dialog, DialogTitle, DialogContent, DialogActions, Alert,
    Grid, Tooltip, InputAdornment,
} from '@mui/material';
import { Add, Edit, Delete, Visibility, Search, FilterList, List } from '@mui/icons-material';
import { taskService, clientService, hospitalService, doctorService, authService, stockService, statusService } from '../../services';
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
    const [products, setProducts] = useState([]);
    const [dynamicStatuses, setDynamicStatuses] = useState([]);
    const [isManualTitle, setIsManualTitle] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [openClientDialog, setOpenClientDialog] = useState(false);
    const [clientForm, setClientForm] = useState({ patient_name: '', phone: '', email: '', address: '' });
    const [addingClient, setAddingClient] = useState(false);
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

    const fetchDropdowns = useCallback(async () => {
        try {
            const [c, h, d, u, p, s] = await Promise.all([
                clientService.getAll({ limit: 100 }),
                hospitalService.getAll({ limit: 100 }),
                doctorService.getAll({ limit: 100 }),
                authService.getUsers(),
                stockService.getProducts(),
                statusService.getAll(),
            ]);
            setClients(c.data.data);
            setHospitals(h.data.data);
            setDoctors(d.data.data);
            setUsers(u.data.data);
            setProducts(p.data.data);
            setDynamicStatuses(s.data.data);
        } catch (err) { console.error(err); }
    }, []);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);
    useEffect(() => { fetchDropdowns(); }, [fetchDropdowns]);

    const handleQuickAddClient = async () => {
        if (!clientForm.patient_name) return;
        setAddingClient(true);
        try {
            const res = await clientService.create(clientForm);
            const newClient = res.data.data; // Backend returns { success: true, data: client }
            
            // Refresh clients list
            const updatedClients = await clientService.getAll({ limit: 100 });
            setClients(updatedClients.data.data);
            
            // Select the new client in the task form
            setForm(prev => ({ ...prev, client_id: newClient.id }));
            
            setOpenClientDialog(false);
            setClientForm({ patient_name: '', phone: '', email: '', address: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add client');
        } finally {
            setAddingClient(false);
        }
    };

    const handleOpen = (task = null) => {
        setEditTask(task);
        setForm(task ? {
            title: task.title || '', description: task.description || '',
            client_id: task.client_id || '', hospital_id: task.hospital_id || '',
            doctor_id: task.doctor_id || '', assigned_to: task.assigned_to || '',
            status: task.status || 'pending', priority: task.priority || 'medium',
            due_date: task.due_date ? task.due_date.split('T')[0] : '',
        } : emptyForm);
        setIsManualTitle(false);
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
                                    {dynamicStatuses.map(s => <MenuItem key={s.name} value={s.name}>{s.label}</MenuItem>)}
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
                                        <TableCell><StatusChip status={task.status} color={dynamicStatuses.find(s => s.name === task.status)?.color} /></TableCell>
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
                            <Typography variant="caption" fontWeight={600} color="#546e7a" sx={{ mb: 0.5, display: 'block', ml: 0.5 }}>Title (Select Product)</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {isManualTitle ? (
                                    <TextField fullWidth placeholder="Enter Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                                ) : (
                                    <FormControl fullWidth required>
                                        <Select
                                            value={form.title}
                                            displayEmpty
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        >
                                            <MenuItem value=""><em>Select Product</em></MenuItem>
                                            {products.map(prod => (
                                                <MenuItem key={prod.id} value={prod.name}>{prod.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                                <Tooltip title={isManualTitle ? "Select from Products" : "Enter Title Manually"}>
                                    <IconButton 
                                        onClick={() => { setIsManualTitle(!isManualTitle); setForm({ ...form, title: '' }); }} 
                                        color="primary" 
                                        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                                    >
                                        {isManualTitle ? <List /> : <Add />}
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={600} color="#546e7a" sx={{ mb: 0.5, display: 'block', ml: 0.5 }}>Description</Typography>
                            <TextField fullWidth placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={3} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="caption" fontWeight={600} color="#546e7a" sx={{ mb: 0.5, display: 'block', ml: 0.5 }}>Client</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FormControl fullWidth>
                                    <Select value={form.client_id} displayEmpty onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
                                        <MenuItem value="">None</MenuItem>
                                        {clients.map(c => <MenuItem key={c.id} value={c.id}>{c.patient_name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                                <Tooltip title="Add New Client">
                                    <IconButton 
                                        onClick={() => setOpenClientDialog(true)} 
                                        color="primary" 
                                        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                                    >
                                        <Add />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="caption" fontWeight={600} color="#546e7a" sx={{ mb: 0.5, display: 'block', ml: 0.5 }}>Hospital</Typography>
                            <FormControl fullWidth>
                                <Select 
                                    value={form.hospital_id} 
                                    displayEmpty
                                    fullWidth 
                                    onChange={(e) => setForm({ ...form, hospital_id: e.target.value, doctor_id: '' })}
                                >
                                    <MenuItem value="">None</MenuItem>
                                    {hospitals.map(h => <MenuItem key={h.id} value={h.id}>{h.hospital_name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="caption" fontWeight={600} color="#546e7a" sx={{ mb: 0.5, display: 'block', ml: 0.5 }}>Doctor</Typography>
                            <FormControl fullWidth>
                                <Select value={form.doctor_id} displayEmpty onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}>
                                    <MenuItem value="">None</MenuItem>
                                    {doctors
                                        .filter(d => !form.hospital_id || d.hospital_id === form.hospital_id)
                                        .map(d => <MenuItem key={d.id} value={d.id}>{d.doctor_name}</MenuItem>)
                                    }
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="caption" fontWeight={600} color="#546e7a" sx={{ mb: 0.5, display: 'block', ml: 0.5 }}>Assign To</Typography>
                            <FormControl fullWidth>
                                <Select value={form.assigned_to} displayEmpty onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}>
                                    <MenuItem value="">Unassigned</MenuItem>
                                    {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name} ({u.role})</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="caption" fontWeight={600} color="#546e7a" sx={{ mb: 0.5, display: 'block', ml: 0.5 }}>Status</Typography>
                            <FormControl fullWidth>
                                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                    {dynamicStatuses.map(s => <MenuItem key={s.name} value={s.name}>{s.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="caption" fontWeight={600} color="#546e7a" sx={{ mb: 0.5, display: 'block', ml: 0.5 }}>Priority</Typography>
                            <FormControl fullWidth>
                                <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                                    {TASK_PRIORITIES.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="caption" fontWeight={600} color="#546e7a" sx={{ mb: 0.5, display: 'block', ml: 0.5 }}>Due Date</Typography>
                            <TextField fullWidth type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
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

            {/* Quick Add Client Dialog */}
            <Dialog open={openClientDialog} onClose={() => setOpenClientDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Quick Add Client</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box>
                            <Typography variant="caption" fontWeight={600} color="#546e7a" sx={{ mb: 0.5, display: 'block', ml: 0.5 }}>Client/Patient Name</Typography>
                            <TextField 
                                fullWidth placeholder="Enter Name" 
                                value={clientForm.patient_name} 
                                onChange={(e) => setClientForm({ ...clientForm, patient_name: e.target.value })} 
                                autoFocus
                            />
                        </Box>
                        <Box>
                            <Typography variant="caption" fontWeight={600} color="#546e7a" sx={{ mb: 0.5, display: 'block', ml: 0.5 }}>Phone</Typography>
                            <TextField 
                                fullWidth placeholder="Phone Number" 
                                value={clientForm.phone} 
                                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} 
                            />
                        </Box>
                        <Box>
                            <Typography variant="caption" fontWeight={600} color="#546e7a" sx={{ mb: 0.5, display: 'block', ml: 0.5 }}>Email</Typography>
                            <TextField 
                                fullWidth placeholder="Email Address" type="email"
                                value={clientForm.email} 
                                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} 
                            />
                        </Box>
                        <Box>
                            <Typography variant="caption" fontWeight={600} color="#546e7a" sx={{ mb: 0.5, display: 'block', ml: 0.5 }}>Address</Typography>
                            <TextField 
                                fullWidth placeholder="Address" multiline rows={2}
                                value={clientForm.address} 
                                onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })} 
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenClientDialog(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleQuickAddClient} 
                        disabled={addingClient || !clientForm.patient_name}
                    >
                        {addingClient ? 'Adding...' : 'Add Client'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TasksPage;
