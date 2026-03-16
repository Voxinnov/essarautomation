import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Card, CardContent, Grid, Typography, Chip, Button, TextField,
    Divider, Alert, Avatar, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import { ArrowBack, Add, Delete } from '@mui/icons-material';
import { taskService, workUpdateService, remarkService } from '../../services';
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
    const [updateForm, setUpdateForm] = useState({ size: '', model: '', update_note: '' });
    const [statusUpdate, setStatusUpdate] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [taskRes, remarkRes, updateRes] = await Promise.all([
                    taskService.getById(id),
                    remarkService.getByTask(id),
                    workUpdateService.getByTask(id),
                ]);
                setTask(taskRes.data.data);
                setStatusUpdate(taskRes.data.data.status);
                setRemarks(remarkRes.data.data);
                setWorkUpdates(updateRes.data.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, [id]);

    const handleAddRemark = async () => {
        if (!newRemark.trim()) return;
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
        try {
            await workUpdateService.create({ ...updateForm, task_id: id });
            const res = await workUpdateService.getByTask(id);
            setWorkUpdates(res.data.data);
            setOpenUpdateDialog(false);
            setUpdateForm({ size: '', model: '', update_note: '' });
        } catch (err) { alert('Failed to add work update'); }
    };

    const handleStatusUpdate = async (newStatus) => {
        setStatusUpdate(newStatus);
        await taskService.update(id, { ...task, status: newStatus });
        setTask({ ...task, status: newStatus });
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
                                            {TASK_STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
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
                                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                        {u.size && <Chip label={`Size: ${u.size}`} size="small" variant="outlined" />}
                                        {u.model && <Chip label={`Model: ${u.model}`} size="small" variant="outlined" color="secondary" />}
                                    </Box>
                                    {u.update_note && <Typography variant="body2">{u.update_note}</Typography>}
                                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                        By {u.updater?.name} — {formatDateTime(u.created_at)}
                                    </Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Remarks */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} mb={2}>Remarks</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <TextField
                                    fullWidth size="small" placeholder="Add a remark..."
                                    value={newRemark} onChange={(e) => setNewRemark(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddRemark()}
                                />
                                <Button variant="contained" onClick={handleAddRemark} disabled={!newRemark.trim()}>Add</Button>
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
                                                {(user?.id === r.user_id || user?.role === 'admin') && (
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
                                { label: 'Status', node: <StatusChip status={task.status} /> },
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
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={6}>
                            <TextField fullWidth label="Size" value={updateForm.size} onChange={(e) => setUpdateForm({ ...updateForm, size: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="Model" value={updateForm.model} onChange={(e) => setUpdateForm({ ...updateForm, model: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Update Note" multiline rows={3} value={updateForm.update_note} onChange={(e) => setUpdateForm({ ...updateForm, update_note: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUpdateDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddWorkUpdate}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TaskDetailPage;
