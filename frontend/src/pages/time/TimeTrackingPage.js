import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
    Alert, Grid, Chip, Tooltip,
    MenuItem, Select, FormControl, InputLabel, CircularProgress,
} from '@mui/material';
import { PlayArrow, Stop, Add, AccessTime, LocationOn } from '@mui/icons-material';
import { timeService, taskService } from '../../services';
import { formatDateTime } from '../../utils/constants';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/**
 * Gets the user's current geolocation (latitude, longitude) via browser API.
 * Returns { latitude, longitude } or null if unavailable/denied.
 */
const getCurrentLocation = () => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            () => {
                // User denied or error — resolve null, don't block the action
                resolve(null);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });
};

/**
 * Reverse geocode coordinates to a human-readable address using Nominatim (OpenStreetMap).
 * Returns the address string or a coordinate fallback.
 */
const reverseGeocode = async (latitude, longitude) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
        );
        const data = await response.json();
        if (data && data.display_name) {
            return data.display_name;
        }
    } catch (e) {
        // Fallback to coordinates if reverse geocode fails
    }
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

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
    const [locationLoading, setLocationLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [logsRes, activeRes] = await Promise.all([
                timeService.getAll(),
                timeService.getActive(),
            ]);
            setLogs(logsRes.data.data);
            setActiveLog(activeRes.data.data);
        } catch (err) { /* Error handled silently */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        taskService.getAll({ limit: 100 }).then(r => setTasks(r.data.data)).catch(() => {});
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
        setLocationLoading(true);
        try {
            // Get current location
            const location = await getCurrentLocation();
            let address = null;
            if (location) {
                address = await reverseGeocode(location.latitude, location.longitude);
            }
            await timeService.start({
                task_id: selectedTask,
                description,
                latitude: location?.latitude,
                longitude: location?.longitude,
                address,
            });
            setDescription('');
            fetchData();
        } catch (err) { setError(err.response?.data?.message || 'Failed to start timer'); }
        finally { setLocationLoading(false); }
    };

    const handleStop = async () => {
        if (!activelog) return;
        setLocationLoading(true);
        try {
            // Get current location
            const location = await getCurrentLocation();
            let address = null;
            if (location) {
                address = await reverseGeocode(location.latitude, location.longitude);
            }
            await timeService.stop(activelog.id, {
                latitude: location?.latitude,
                longitude: location?.longitude,
                address,
            });
            setElapsed(0);
            fetchData();
        } catch (err) { setError('Failed to stop timer'); }
        finally { setLocationLoading(false); }
    };

    const handleManualEntry = async () => {
        try {
            await timeService.manualEntry(manualForm);
            setOpenManual(false);
            setManualForm({ task_id: '', start_time: '', end_time: '', description: '' });
            fetchData();
        } catch (err) { setError(err.response?.data?.message || 'Failed to add entry'); }
    };

    const renderLocation = (lat, lng, address) => {
        if (!lat && !lng) return <Typography variant="body2" color="text.secondary">—</Typography>;
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        const displayText = address || `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
        return (
            <Tooltip title={displayText} arrow placement="top">
                <Chip
                    icon={<LocationOn sx={{ fontSize: 14 }} />}
                    label={displayText.length > 30 ? displayText.substring(0, 30) + '…' : displayText}
                    size="small"
                    variant="outlined"
                    color="info"
                    component="a"
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    clickable
                    sx={{ maxWidth: 200, fontSize: '0.7rem' }}
                />
            </Tooltip>
        );
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
                                    {activelog.start_address && (
                                        <Chip
                                            icon={<LocationOn sx={{ color: 'rgba(255,255,255,0.7) !important' }} />}
                                            label={`Started at: ${activelog.start_address.length > 50 ? activelog.start_address.substring(0, 50) + '…' : activelog.start_address}`}
                                            size="small"
                                            sx={{ mt: 1, color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}
                                            variant="outlined"
                                        />
                                    )}
                                    <Box sx={{ mt: 2 }}>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            startIcon={locationLoading ? <CircularProgress size={20} color="inherit" /> : <Stop />}
                                            onClick={handleStop}
                                            disabled={locationLoading}
                                            sx={{ bgcolor: '#ef5350', '&:hover': { bgcolor: '#c62828' } }}
                                        >
                                            {locationLoading ? 'Getting Location…' : 'Stop Timer'}
                                        </Button>
                                    </Box>
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
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                size="large"
                                                startIcon={locationLoading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                                                onClick={handleStart}
                                                disabled={locationLoading}
                                                sx={{ py: 1.8 }}
                                            >
                                                {locationLoading ? 'Locating…' : 'Start'}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <LocationOn sx={{ fontSize: 14 }} /> Your location will be auto-saved on start & stop
                                    </Typography>
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
                                    <TableCell>Start Location</TableCell>
                                    <TableCell>Stop Location</TableCell>
                                    <TableCell>Description</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {logs.length === 0 ? (
                                    <TableRow><TableCell colSpan={9} align="center" sx={{ py: 5, color: 'text.secondary' }}>No time logs yet</TableCell></TableRow>
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
                                        <TableCell>{renderLocation(log.start_latitude, log.start_longitude, log.start_address)}</TableCell>
                                        <TableCell>{renderLocation(log.stop_latitude, log.stop_longitude, log.stop_address)}</TableCell>
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
