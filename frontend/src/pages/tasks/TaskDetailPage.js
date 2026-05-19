import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Card, CardContent, Grid, Typography, Chip, Button, TextField,
    Divider, Alert, Avatar, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { ArrowBack, Add, Delete, Place } from '@mui/icons-material';
import { taskService, workUpdateService, remarkService, statusService, taskProductService, stockService } from '../../services';
import { formatDate, formatDateTime, TASK_STATUSES, TASK_PRIORITIES } from '../../utils/constants';
import StatusChip from '../../components/common/StatusChip';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const TaskDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [task, setTask] = useState(null);
    const [remarks, setRemarks] = useState([]);
    const [workUpdates, setWorkUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newRemark, setNewRemark] = useState('');
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const [updateForm, setUpdateForm] = useState({ size: '', model: '', update_note: '', update_date: new Date().toISOString().split('T')[0] });
    const [statusUpdate, setStatusUpdate] = useState('');
    const [dynamicStatuses, setDynamicStatuses] = useState([]);
    
    const [taskProducts, setTaskProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [openProductDialog, setOpenProductDialog] = useState(false);
    const [productForm, setProductForm] = useState({ product_id: '', quantity_required: 1 });

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [taskRes, remarkRes, updateRes, statusRes, tpRes, prodRes] = await Promise.all([
                    taskService.getById(id),
                    remarkService.getByTask(id),
                    workUpdateService.getByTask(id),
                    statusService.getAll(),
                    taskProductService.getByTask(id),
                    stockService.getProducts()
                ]);
                setTask(taskRes.data.data);
                setStatusUpdate(taskRes.data.data.status);
                setRemarks(remarkRes.data.data);
                setWorkUpdates(updateRes.data.data);
                setDynamicStatuses(statusRes.data.data);
                setTaskProducts(tpRes.data.data);
                setAllProducts(prodRes.data.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, [id]);

    const handleAddRemark = async () => {
        if (!newRemark.trim()) return;
        
        // Staff policy check: Add to work updates automatically with live staff location tracking
        if (user?.role === 'staff') {
            const saveStaffUpdate = async (geoPayload = {}) => {
                try {
                    await workUpdateService.create({ 
                        task_id: id, 
                        update_note: newRemark, 
                        update_date: new Date().toISOString().split('T')[0],
                        ...geoPayload
                    });
                    const res = await workUpdateService.getByTask(id);
                    setWorkUpdates(res.data.data);
                    setNewRemark('');
                } catch (err) { alert('Failed to add staff work update'); }
            };

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        let location_address = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
                        try {
                            // Reverse geocode softly to extract human readable location tags
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                            const data = await res.json();
                            if (data && data.display_name) {
                                // Shorten address string elegantly
                                location_address = data.display_name.split(',').slice(0, 3).join(', ');
                            }
                        } catch (e) { /* fallback to coords string safely */ }
                        
                        saveStaffUpdate({ latitude: String(latitude), longitude: String(longitude), location_address });
                    },
                    (error) => {
                        // Fallback submission if GPS is rejected or inaccessible
                        saveStaffUpdate();
                    },
                    { enableHighAccuracy: true, timeout: 8000 }
                );
            } else {
                saveStaffUpdate();
            }
            return;
        }

        // Standard direct remark submission for admins/managers
        try {
            const res = await remarkService.create({ task_id: id, remark: newRemark });
            setRemarks([res.data.data, ...remarks]);
            setNewRemark('');
        } catch (err) { alert('Failed to add remark'); }
    };

    const handleDeleteRemark = async (remarkId) => {
        if (!window.confirm('Delete this remark?')) return;
        await remarkService.delete(remarkId);
        setRemarks(remarks.filter(r => r.id !== remarkId));
    };

    const handleAddWorkUpdate = async () => {
        const executeUpdateSubmit = async (geoPayload = {}) => {
            try {
                await workUpdateService.create({ ...updateForm, task_id: id, ...geoPayload });
                const res = await workUpdateService.getByTask(id);
                setWorkUpdates(res.data.data);
                setOpenUpdateDialog(false);
                setUpdateForm({ size: '', model: '', update_note: '', update_date: new Date().toISOString().split('T')[0] });
            } catch (err) { alert('Failed to add work update'); }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    let location_address = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await res.json();
                        if (data && data.display_name) location_address = data.display_name.split(',').slice(0, 3).join(', ');
                    } catch (e) {}
                    executeUpdateSubmit({ latitude: String(latitude), longitude: String(longitude), location_address });
                },
                () => executeUpdateSubmit(),
                { enableHighAccuracy: true, timeout: 8000 }
            );
        } else {
            executeUpdateSubmit();
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setStatusUpdate(newStatus);
        await taskService.update(id, { ...task, status: newStatus });
        setTask({ ...task, status: newStatus });
    };

    const handleAddProduct = async () => {
        try {
            await taskProductService.create(id, productForm);
            const tpRes = await taskProductService.getByTask(id);
            setTaskProducts(tpRes.data.data);
            setOpenProductDialog(false);
            setProductForm({ product_id: '', quantity_required: 1 });
        } catch (err) { alert('Failed to add product: ' + (err.response?.data?.message || err.message)); }
    };

    if (loading) return <LoadingSpinner />;
    if (!task) return <Alert severity="error">Task not found</Alert>;

    return (
        <Box>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/tasks')} sx={{ mb: 2 }}>Back to Tasks</Button>

            <Grid container spacing={3}>
                {/* Task Details */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h5" fontWeight={700}>{task.title}</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <StatusChip status={task.priority} />
                                    <FormControl size="small" sx={{ minWidth: 130 }}>
                                        <Select value={statusUpdate} onChange={(e) => handleStatusUpdate(e.target.value)}>
                                            {dynamicStatuses.map(s => <MenuItem key={s.name} value={s.name}>{s.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>
                            {task.description && <Typography color="text.secondary" mb={2}>{task.description}</Typography>}
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                {[
                                    { label: 'Client', value: task.client?.patient_name },
                                    { label: 'Hospital', value: task.hospital?.hospital_name },
                                    { label: 'Doctor', value: task.doctor?.doctor_name },
                                    { label: 'Assigned To', value: task.assignee?.name },
                                    { label: 'Created By', value: task.creator?.name },
                                    { label: 'Created', value: formatDate(task.created_at) },
                                    { label: 'Due Date', value: formatDate(task.due_date) },
                                ].map(({ label, value }) => value && (
                                    <Grid item xs={6} md={4} key={label}>
                                        <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                                        <Typography variant="body2" fontWeight={500}>{value || '-'}</Typography>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Work Updates */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={600}>Work Updates</Typography>
                                <Button size="small" variant="outlined" startIcon={<Add />} onClick={() => setOpenUpdateDialog(true)}>
                                    Add Update
                                </Button>
                            </Box>
                            {workUpdates.length === 0 ? (
                                <Typography color="text.secondary" variant="body2">No work updates yet.</Typography>
                            ) : workUpdates.map((u) => (
                                <Box key={u.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1, alignItems: 'center' }}>
                                        {u.size && <Chip label={`Size: ${u.size}`} size="small" variant="outlined" />}
                                        {u.model && <Chip label={`Model: ${u.model}`} size="small" variant="outlined" color="info" />}
                                        {u.update_date && <Chip label={`Date: ${formatDate(u.update_date)}`} size="small" variant="outlined" color="primary" />}
                                        {(u.location_address || u.latitude) && (
                                            <Chip 
                                                icon={<Place sx={{ fontSize: '1rem !important', color: '#e53935' }} />} 
                                                label={u.location_address || `${u.latitude}, ${u.longitude}`} 
                                                size="small" 
                                                sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 500 }} 
                                            />
                                        )}
                                    </Box>
                                    {u.update_note && <Typography variant="body2">{u.update_note}</Typography>}
                                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                        By {u.updater?.name} — {formatDateTime(u.created_at)}
                                    </Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Products Used */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={600}>Products & Inventory</Typography>
                                <Button size="small" variant="outlined" startIcon={<Add />} onClick={() => setOpenProductDialog(true)}>
                                    Request Product
                                </Button>
                            </Box>
                            {taskProducts.length === 0 ? (
                                <Typography color="text.secondary" variant="body2">No products requested.</Typography>
                            ) : (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Product Name</TableCell>
                                                <TableCell>Required Qty</TableCell>
                                                <TableCell>Fulfilled Qty</TableCell>
                                                <TableCell>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {taskProducts.map((tp) => (
                                                <TableRow key={tp.id}>
                                                    <TableCell>{tp.product?.name}</TableCell>
                                                    <TableCell>{tp.quantity_required}</TableCell>
                                                    <TableCell>{tp.quantity_fulfilled}</TableCell>
                                                    <TableCell><Chip label={tp.status} size="small" color={tp.status === 'fulfilled' ? 'success' : (tp.status === 'backordered' ? 'warning' : 'default')} /></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Remarks */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} mb={2}>Remarks</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <TextField
                                    fullWidth size="small" 
                                    placeholder="Add a remark..."
                                    value={newRemark} onChange={(e) => setNewRemark(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddRemark()}
                                />
                                <Button variant="contained" onClick={handleAddRemark} disabled={!newRemark.trim()}>
                                    Add
                                </Button>
                            </Box>
                            {remarks.length === 0 ? (
                                <Typography color="text.secondary" variant="body2">No remarks yet.</Typography>
                            ) : remarks.map((r) => (
                                <Box key={r.id} sx={{ display: 'flex', gap: 2, mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#8a0303', fontSize: 13, flexShrink: 0 }}>
                                        {r.user?.name?.charAt(0)}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" fontWeight={600}>{r.user?.name}</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">{formatDateTime(r.created_at)}</Typography>
                                                {user?.role !== 'staff' && (user?.id === r.user_id || user?.role === 'admin') && (
                                                    <IconButton size="small" onClick={() => handleDeleteRemark(r.id)} color="error">
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" mt={0.5}>{r.remark}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Sidebar */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} mb={2}>Task Summary</Typography>
                            {[
                                { label: 'Status', node: <StatusChip status={task.status} color={dynamicStatuses.find(s => s.name === task.status)?.color} /> },
                                { label: 'Priority', node: <StatusChip status={task.priority} /> },
                                { label: 'Work Updates', value: workUpdates.length },
                                { label: 'Remarks', value: remarks.length },
                            ].map(({ label, value, node }) => (
                                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f0f0f0' }}>
                                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                                    {node || <Typography variant="body2" fontWeight={500}>{value}</Typography>}
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Work Update Dialog */}
            <Dialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Work Update</DialogTitle>
                <DialogContent sx={{ pt: '30px !important' }}>
                    <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                        <Grid item xs={6}>
                            <Typography variant="caption" fontWeight={600} color="#546e7a" sx={{ mb: 0.5, display: 'block', ml: 0.5 }}>Size</Typography>
                            <TextField fullWidth placeholder="e.g., XL" value={updateForm.size} onChange={(e) => setUpdateForm({ ...updateForm, size: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" fontWeight={600} color="#546e7a" sx={{ mb: 0.5, display: 'block', ml: 0.5 }}>Model</Typography>
                            <TextField fullWidth placeholder="e.g., M-123" value={updateForm.model} onChange={(e) => setUpdateForm({ ...updateForm, model: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={600} color="#546e7a" sx={{ mb: 0.5, display: 'block', ml: 0.5 }}>Update Date</Typography>
                            <TextField fullWidth type="date" value={updateForm.update_date} onChange={(e) => setUpdateForm({ ...updateForm, update_date: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={600} color="#546e7a" sx={{ mb: 0.5, display: 'block', ml: 0.5 }}>Update Note</Typography>
                            <TextField fullWidth placeholder="Enter details..." multiline rows={3} value={updateForm.update_note} onChange={(e) => setUpdateForm({ ...updateForm, update_note: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUpdateDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddWorkUpdate}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Product Request Dialog */}
            <Dialog open={openProductDialog} onClose={() => setOpenProductDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Request Product for Task</DialogTitle>
                <DialogContent sx={{ pt: '20px !important' }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Product</InputLabel>
                        <Select
                            value={productForm.product_id}
                            label="Product"
                            onChange={(e) => setProductForm({ ...productForm, product_id: e.target.value })}
                        >
                            {allProducts.map(p => (
                                <MenuItem key={p.id} value={p.id}>
                                    {p.name} (In Stock: {p.current_stock})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        type="number"
                        label="Quantity Required"
                        value={productForm.quantity_required}
                        onChange={(e) => setProductForm({ ...productForm, quantity_required: e.target.value })}
                        InputProps={{ inputProps: { min: 1 } }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenProductDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddProduct} disabled={!productForm.product_id || productForm.quantity_required < 1}>
                        Submit Request
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TaskDetailPage;
