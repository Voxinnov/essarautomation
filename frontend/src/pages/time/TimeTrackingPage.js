import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, TextField, Typography, Pagination, Dialog, DialogTitle, DialogContent, DialogActions,
    Alert, Grid, Chip, Tooltip, InputAdornment, Divider, LinearProgress,
    MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import { PlayArrow, Stop, Add, AccessTime } from '@mui/icons-material';
import { timeService, taskService } from '../../services';
import { formatDateTime } from '../../utils/constants';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TimeTrackingPage = () => {
    const [logs, setLogs] = useState([]);
    const [activelog, setActiveLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [elapsed, setElapsed] = useState(0);
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState('');
    const [description, setDescription] = useState('');
    const [openManual, setOpenManual] = useState(false);
    const [manualForm, setManualForm] = useState({ task_id: '', start_time: '', end_time: '', description: '' });
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [logsRes, activeRes] = await Promise.all([
                timeService.getAll(),
                timeService.getActive(),
            ]);
            setLogs(logsRes.data.data);
            setActiveLog(activeRes.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        taskService.getAll({ limit: 100 }).then(r => setTasks(r.data.data)).catch(console.error);
    }, []);

    // Elapsed timer
    useEffect(() => {
        let interval;
        if (activelog) {
            interval = setInterval(() => {
                setElapsed(Math.floor((Date.now() - new Date(activelog.start_time)) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activelog]);

    const formatElapsed = (secs) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const handleStart = async () => {
        if (!selectedTask) { setError('Please select a task'); return; }
        setError('');
        try {
            await timeService.start({ task_id: selectedTask, description });
            setDescription('');
            fetchData();
        } catch (err) { setError(err.response?.data?.message || 'Failed to start timer'); }
    };

    const handleStop = async () => {
        if (!activelog) return;
        try {
            await timeService.stop(activelog.id);
            setElapsed(0);
            fetchData();
        } catch (err) { setError('Failed to stop timer'); }
    };

    const handleManualEntry = async () => {
        try {
            await timeService.manualEntry(manualForm);
            setOpenManual(false);
            setManualForm({ task_id: '', start_time: '', end_time: '', description: '' });
            fetchData();
        } catch (err) { setError(err.response?.data?.message || 'Failed to add entry'); }
    };

    return (
        <Box>
            <PageHeader title="Time Tracking" subtitle="Track work hours for tasks" />

            {/* Timer Card */}
            <Card sx={{ mb: 3, background: activelog ? 'linear-gradient(135deg, #8a0303, #5a0000)' : 'white', color: activelog ? 'white' : 'inherit' }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={activelog ? 12 : 5}>
                            {activelog ? (
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                                        ⏱ Timer Running — {activelog.task?.title}
                                    </Typography>
                                    <Typography variant="h2" fontWeight={700} fontFamily="monospace">
                                        {formatElapsed(elapsed)}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<Stop />}
                                        onClick={handleStop}
                                        sx={{ mt: 2, bgcolor: '#ef5350', '&:hover': { bgcolor: '#c62828' } }}
                                    >
                                        Stop Timer
                                    </Button>
                                </Box>
                            ) : (
                                <Box>
                                    <Typography variant="h6" fontWeight={600} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AccessTime /> Start Tracking
                                    </Typography>
                                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={5}>
                                            <FormControl fullWidth>
                                                <InputLabel>Select Task *</InputLabel>
                                                <Select value={selectedTask} label="Select Task *" onChange={(e) => setSelectedTask(e.target.value)}>
                                                    {tasks.map(t => <MenuItem key={t.id} value={t.id}>{t.title}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={5}>
                                            <TextField fullWidth label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                                        </Grid>
                                        <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Button fullWidth variant="contained" size="large" startIcon={<PlayArrow />} onClick={handleStart} sx={{ py: 1.8 }}>
                                                Start
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Time Logs</Typography>
                <Button variant="outlined" startIcon={<Add />} onClick={() => setOpenManual(true)}>Manual Entry</Button>
            </Box>

            <Card>
                <TableContainer>
                    {loading ? <LoadingSpinner height="300px" /> : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Task</TableCell>
                                    <TableCell>User</TableCell>
                                    <TableCell>Start Time</TableCell>
                                    <TableCell>End Time</TableCell>
                                    <TableCell>Hours</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Description</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {logs.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>No time logs yet</TableCell></TableRow>
                                ) : logs.map((log) => (
                                    <TableRow key={log.id} hover>
                                        <TableCell><Typography variant="body2" fontWeight={500}>{log.task?.title || '-'}</Typography></TableCell>
                                        <TableCell>{log.user?.name || '-'}</TableCell>
                                        <TableCell><Typography variant="body2">{formatDateTime(log.start_time)}</Typography></TableCell>
                                        <TableCell><Typography variant="body2">{log.end_time ? formatDateTime(log.end_time) : <Chip label="Active" color="success" size="small" />}</Typography></TableCell>
                                        <TableCell>
                                            <Chip label={`${parseFloat(log.total_hours || 0).toFixed(2)}h`} color={log.end_time ? 'primary' : 'warning'} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell><Chip label={log.is_manual ? 'Manual' : 'Timer'} size="small" /></TableCell>
                                        <TableCell>{log.description || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>
            </Card>

            {/* Manual entry dialog */}
            <Dialog open={openManual} onClose={() => setOpenManual(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Manual Time Entry</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Task *</InputLabel>
                                <Select value={manualForm.task_id} label="Task *" onChange={(e) => setManualForm({ ...manualForm, task_id: e.target.value })}>
                                    {tasks.map(t => <MenuItem key={t.id} value={t.id}>{t.title}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="Start Time *" type="datetime-local" InputLabelProps={{ shrink: true }}
                                value={manualForm.start_time} onChange={(e) => setManualForm({ ...manualForm, start_time: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="End Time *" type="datetime-local" InputLabelProps={{ shrink: true }}
                                value={manualForm.end_time} onChange={(e) => setManualForm({ ...manualForm, end_time: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Description" multiline rows={2} value={manualForm.description}
                                onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenManual(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleManualEntry} disabled={!manualForm.task_id || !manualForm.start_time || !manualForm.end_time}>
                        Add Entry
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TimeTrackingPage;
