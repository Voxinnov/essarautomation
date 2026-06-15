import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
    Alert, Grid, Chip, Tooltip, CircularProgress, Tab, Tabs, TextField,
    MenuItem, Select, FormControl, InputLabel, Paper,
} from '@mui/material';
import {
    Login, Logout, LocationOn, Fingerprint, CheckCircle,
    Warning, Schedule, TrendingUp, Person,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { attendanceService, authService } from '../../services';
import { formatDateTime } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/**
 * Gets the user's current geolocation via browser API.
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
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });
};

/**
 * Reverse geocode coordinates to a human-readable address using Nominatim.
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
        // Fallback to coordinates
    }
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

const STATUS_CONFIG = {
    present: { label: 'Present', color: 'success', icon: <CheckCircle sx={{ fontSize: 16 }} /> },
    late: { label: 'Late', color: 'warning', icon: <Warning sx={{ fontSize: 16 }} /> },
    half_day: { label: 'Half Day', color: 'info', icon: <Schedule sx={{ fontSize: 16 }} /> },
    absent: { label: 'Absent', color: 'error', icon: <Warning sx={{ fontSize: 16 }} /> },
};

const RecenterMapComponent = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom || 13, { animate: true });
        }
    }, [center, zoom, map]);
    return null;
};

const createRouteMarker = (type, label) => {
    let color = '#0288d1'; // Blue for task
    if (type === 'check-in') color = '#2e7d32'; // Green for check-in
    if (type === 'check-out') color = '#d32f2f'; // Red for check-out

    return L.divIcon({
        className: 'custom-route-marker',
        html: `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background-color: ${color};
                color: white;
                font-weight: bold;
                font-size: 11px;
                border: 2px solid white;
                box-shadow: 0 0 6px rgba(0,0,0,0.3);
            ">
                ${label}
            </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
    });
};

const AttendancePage = () => {
    const { user } = useAuth();
    const [todayRecord, setTodayRecord] = useState(null);
    const [myLogs, setMyLogs] = useState([]);
    const [allLogs, setAllLogs] = useState([]);
    const [summary, setSummary] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locationLoading, setLocationLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [elapsed, setElapsed] = useState(0);
    const [tabValue, setTabValue] = useState(0);

    // Live Locations State
    const [liveLogs, setLiveLogs] = useState([]);
    const [liveLoading, setLiveLoading] = useState(false);
    const [liveError, setLiveError] = useState('');
    const [selectedCoords, setSelectedCoords] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(13);

    // Travel Tracking State
    const [travelLogs, setTravelLogs] = useState([]);
    const [travelLoading, setTravelLoading] = useState(false);
    const [travelError, setTravelError] = useState('');
    const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0]);
    const [travelRate, setTravelRate] = useState(10); // ₹10/km
    const [selectedTravelUser, setSelectedTravelUser] = useState(null);
    const [dialogSelectedCoords, setDialogSelectedCoords] = useState(null);
    const [dialogZoomLevel, setDialogZoomLevel] = useState(14);
    const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);

    // Filters
    const [filterUser, setFilterUser] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    const isAdmin = user?.role === 'admin' || user?.role === 'manager';

    const fetchLiveLogs = useCallback(async () => {
        if (!isAdmin) return;
        setLiveLoading(true);
        setLiveError('');
        try {
            const res = await attendanceService.getLive();
            setLiveLogs(res.data.data);
        } catch (err) {
            setLiveError(err.response?.data?.message || 'Failed to fetch live locations');
        } finally {
            setLiveLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        if (tabValue === 3 && isAdmin) {
            fetchLiveLogs();
            const interval = setInterval(fetchLiveLogs, 30000);
            return () => clearInterval(interval);
        }
    }, [tabValue, isAdmin, fetchLiveLogs]);

    const fetchTravelReport = useCallback(async () => {
        if (!isAdmin) return;
        setTravelLoading(true);
        setTravelError('');
        try {
            const res = await attendanceService.getTravelReport({ date: travelDate });
            setTravelLogs(res.data.data);
        } catch (err) {
            setTravelError(err.response?.data?.message || 'Failed to fetch travel report');
        } finally {
            setTravelLoading(false);
        }
    }, [isAdmin, travelDate]);

    useEffect(() => {
        if (tabValue === 4 && isAdmin) {
            fetchTravelReport();
        }
    }, [tabValue, isAdmin, fetchTravelReport]);

    useEffect(() => {
        if (liveLogs.length > 0 && !selectedCoords) {
            const firstWithCoords = liveLogs.find(l => (l.current_latitude || l.check_in_latitude) && (l.current_longitude || l.check_in_longitude));
            if (firstWithCoords) {
                setSelectedCoords([parseFloat(firstWithCoords.current_latitude || firstWithCoords.check_in_latitude), parseFloat(firstWithCoords.current_longitude || firstWithCoords.check_in_longitude)]);
                setZoomLevel(12);
            }
        }
    }, [liveLogs, selectedCoords]);

    const fetchToday = useCallback(async () => {
        try {
            const res = await attendanceService.getToday();
            setTodayRecord(res.data.data);
        } catch (err) { /* silent */ }
    }, []);

    const fetchMyLogs = useCallback(async () => {
        try {
            const params = {};
            if (filterStartDate) params.start_date = filterStartDate;
            if (filterEndDate) params.end_date = filterEndDate;
            const res = await attendanceService.getMy(params);
            setMyLogs(res.data.data);
        } catch (err) { /* silent */ }
    }, [filterStartDate, filterEndDate]);

    const fetchAllLogs = useCallback(async () => {
        if (!isAdmin) return;
        try {
            const params = {};
            if (filterUser) params.user_id = filterUser;
            if (filterStartDate) params.start_date = filterStartDate;
            if (filterEndDate) params.end_date = filterEndDate;
            const res = await attendanceService.getAll(params);
            setAllLogs(res.data.data);
        } catch (err) { /* silent */ }
    }, [isAdmin, filterUser, filterStartDate, filterEndDate]);

    const fetchSummary = useCallback(async () => {
        if (!isAdmin) return;
        try {
            const res = await attendanceService.getSummary({ month: filterMonth, year: filterYear });
            setSummary(res.data.data);
        } catch (err) { /* silent */ }
    }, [isAdmin, filterMonth, filterYear]);

    const fetchUsers = useCallback(async () => {
        if (!isAdmin) return;
        try {
            const res = await authService.getUsers();
            setUsers(res.data.data);
        } catch (err) { /* silent */ }
    }, [isAdmin]);

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchToday(), fetchMyLogs(), fetchAllLogs(), fetchSummary(), fetchUsers()])
            .finally(() => setLoading(false));
    }, [fetchToday, fetchMyLogs, fetchAllLogs, fetchSummary, fetchUsers]);

    // Elapsed timer for checked-in state
    useEffect(() => {
        let interval;
        if (todayRecord && todayRecord.check_in_time && !todayRecord.check_out_time) {
            interval = setInterval(() => {
                setElapsed(Math.floor((Date.now() - new Date(todayRecord.check_in_time)) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [todayRecord]);

    const formatElapsedTime = (secs) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
    };

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
    };

    const handleCheckIn = async () => {
        setError('');
        setSuccessMsg('');
        setLocationLoading(true);
        try {
            const location = await getCurrentLocation();
            let address = null;
            if (location) {
                address = await reverseGeocode(location.latitude, location.longitude);
            }
            await attendanceService.checkIn({
                latitude: location?.latitude,
                longitude: location?.longitude,
                address,
            });
            setSuccessMsg('Checked in successfully!');
            fetchToday();
            fetchMyLogs();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to check in');
        } finally {
            setLocationLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setError('');
        setSuccessMsg('');
        setLocationLoading(true);
        try {
            const location = await getCurrentLocation();
            let address = null;
            if (location) {
                address = await reverseGeocode(location.latitude, location.longitude);
            }
            await attendanceService.checkOut({
                latitude: location?.latitude,
                longitude: location?.longitude,
                address,
            });
            setSuccessMsg('Checked out successfully!');
            setElapsed(0);
            fetchToday();
            fetchMyLogs();
            if (isAdmin) fetchAllLogs();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to check out');
        } finally {
            setLocationLoading(false);
        }
    };

    const renderStatusChip = (status) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.absent;
        return (
            <Chip
                icon={config.icon}
                label={config.label}
                color={config.color}
                size="small"
                sx={{ fontWeight: 600 }}
            />
        );
    };

    const renderLocation = (lat, lng, address) => {
        if (!lat && !lng) return <Typography variant="body2" color="text.secondary">—</Typography>;
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        const displayText = address || `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
        return (
            <Tooltip title={displayText} arrow placement="top">
                <Chip
                    icon={<LocationOn sx={{ fontSize: 14 }} />}
                    label={displayText.length > 25 ? displayText.substring(0, 25) + '…' : displayText}
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

    const isCheckedIn = todayRecord && todayRecord.check_in_time && !todayRecord.check_out_time;
    const isCheckedOut = todayRecord && todayRecord.check_out_time;
    const notCheckedIn = !todayRecord || !todayRecord.check_in_time;

    if (loading) return <LoadingSpinner />;

    return (
        <Box>
            <PageHeader title="Attendance" subtitle="Track your daily attendance and work hours" />

            {/* Messages */}
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}

            {/* Check-in/Check-out Card */}
            <Card
                sx={{
                    mb: 3,
                    background: isCheckedIn
                        ? 'linear-gradient(135deg, #1b5e20, #2e7d32)'
                        : isCheckedOut
                            ? 'linear-gradient(135deg, #37474f, #546e7a)'
                            : 'linear-gradient(135deg, #8a0303, #5a0000)',
                    color: 'white',
                    overflow: 'visible',
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Fingerprint sx={{ fontSize: 40, opacity: 0.8 }} />
                                <Box>
                                    <Typography variant="h5" fontWeight={700}>
                                        {notCheckedIn ? 'Mark Your Attendance' : isCheckedIn ? 'You Are Checked In' : 'Day Complete'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                                    </Typography>
                                </Box>
                            </Box>

                            {isCheckedIn && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" sx={{ opacity: 0.7, mb: 0.5 }}>
                                        Checked in at {formatTime(todayRecord.check_in_time)}
                                    </Typography>
                                    <Typography variant="h3" fontWeight={700} fontFamily="monospace" sx={{ mb: 1 }}>
                                        {formatElapsedTime(elapsed)}
                                    </Typography>
                                    {todayRecord.status && (
                                        <Chip
                                            label={todayRecord.status === 'late' ? '⚠ Late Check-in' : '✓ On Time'}
                                            size="small"
                                            sx={{
                                                bgcolor: todayRecord.status === 'late' ? 'rgba(255,152,0,0.3)' : 'rgba(76,175,80,0.3)',
                                                color: 'white',
                                                fontWeight: 600,
                                            }}
                                        />
                                    )}
                                    {todayRecord.check_in_address && (
                                        <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.7 }}>
                                            📍 {todayRecord.check_in_address.length > 60 ? todayRecord.check_in_address.substring(0, 60) + '…' : todayRecord.check_in_address}
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {isCheckedOut && (
                                <Box sx={{ mt: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" sx={{ opacity: 0.7 }}>Check-in</Typography>
                                            <Typography variant="body1" fontWeight={600}>{formatTime(todayRecord.check_in_time)}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" sx={{ opacity: 0.7 }}>Check-out</Typography>
                                            <Typography variant="body1" fontWeight={600}>{formatTime(todayRecord.check_out_time)}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" sx={{ opacity: 0.7 }}>Total Hours</Typography>
                                            <Typography variant="body1" fontWeight={600}>{parseFloat(todayRecord.total_hours || 0).toFixed(2)}h</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" sx={{ opacity: 0.7 }}>Status</Typography>
                                            <Box sx={{ mt: 0.3 }}>{renderStatusChip(todayRecord.status)}</Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </Grid>

                        <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
                            {notCheckedIn && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={locationLoading ? <CircularProgress size={24} color="inherit" /> : <Login />}
                                    onClick={handleCheckIn}
                                    disabled={locationLoading}
                                    sx={{
                                        bgcolor: 'white',
                                        color: '#8a0303',
                                        fontWeight: 700,
                                        fontSize: '1.1rem',
                                        px: 5,
                                        py: 2,
                                        borderRadius: 3,
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.9)', transform: 'scale(1.02)' },
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {locationLoading ? 'Getting Location…' : 'Check In'}
                                </Button>
                            )}
                            {isCheckedIn && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={locationLoading ? <CircularProgress size={24} color="inherit" /> : <Logout />}
                                    onClick={handleCheckOut}
                                    disabled={locationLoading}
                                    sx={{
                                        bgcolor: '#ef5350',
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '1.1rem',
                                        px: 5,
                                        py: 2,
                                        borderRadius: 3,
                                        '&:hover': { bgcolor: '#c62828', transform: 'scale(1.02)' },
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {locationLoading ? 'Getting Location…' : 'Check Out'}
                                </Button>
                            )}
                            {isCheckedOut && (
                                <Box sx={{ p: 2 }}>
                                    <CheckCircle sx={{ fontSize: 60, opacity: 0.5 }} />
                                    <Typography variant="body1" sx={{ opacity: 0.7, mt: 1 }}>
                                        Your attendance is recorded for today
                                    </Typography>
                                </Box>
                            )}
                            <Typography variant="caption" sx={{ display: 'block', mt: 1.5, opacity: 0.6 }}>
                                <LocationOn sx={{ fontSize: 12, verticalAlign: 'middle' }} /> Location auto-captured
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                    <Tab label="My Attendance" />
                    {isAdmin && <Tab label="All Employees" />}
                    {isAdmin && <Tab label="Monthly Summary" />}
                    {isAdmin && <Tab label="Live Locations" />}
                    {isAdmin && <Tab label="Travel Tracking" />}
                </Tabs>
            </Box>

            {/* Tab: My Attendance */}
            {tabValue === 0 && (
                <Card>
                    <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <TextField
                            size="small" type="date" label="From" InputLabelProps={{ shrink: true }}
                            value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)}
                        />
                        <TextField
                            size="small" type="date" label="To" InputLabelProps={{ shrink: true }}
                            value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)}
                        />
                        <Button variant="outlined" size="small" onClick={fetchMyLogs}>Filter</Button>
                        <Button variant="text" size="small" onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}>Clear</Button>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Check-in</TableCell>
                                    <TableCell>Check-out</TableCell>
                                    <TableCell>Hours</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Check-in Location</TableCell>
                                    <TableCell>Check-out Location</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {myLogs.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>No attendance records found</TableCell></TableRow>
                                ) : myLogs.map((log) => (
                                    <TableRow key={log.id} hover>
                                        <TableCell><Typography variant="body2" fontWeight={500}>{formatDateDisplay(log.date)}</Typography></TableCell>
                                        <TableCell>{formatTime(log.check_in_time)}</TableCell>
                                        <TableCell>{log.check_out_time ? formatTime(log.check_out_time) : <Chip label="Active" color="success" size="small" />}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={`${parseFloat(log.total_hours || 0).toFixed(2)}h`}
                                                color={parseFloat(log.total_hours || 0) >= 8 ? 'success' : parseFloat(log.total_hours || 0) >= 4 ? 'warning' : 'default'}
                                                size="small" variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>{renderStatusChip(log.status)}</TableCell>
                                        <TableCell>{renderLocation(log.check_in_latitude, log.check_in_longitude, log.check_in_address)}</TableCell>
                                        <TableCell>{renderLocation(log.check_out_latitude, log.check_out_longitude, log.check_out_address)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}

            {/* Tab: All Employees (admin) */}
            {tabValue === 1 && isAdmin && (
                <Card>
                    <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>Filter by User</InputLabel>
                            <Select value={filterUser} label="Filter by User" onChange={(e) => setFilterUser(e.target.value)}>
                                <MenuItem value="">All Users</MenuItem>
                                {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField
                            size="small" type="date" label="From" InputLabelProps={{ shrink: true }}
                            value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)}
                        />
                        <TextField
                            size="small" type="date" label="To" InputLabelProps={{ shrink: true }}
                            value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)}
                        />
                        <Button variant="outlined" size="small" onClick={fetchAllLogs}>Filter</Button>
                        <Button variant="text" size="small" onClick={() => { setFilterUser(''); setFilterStartDate(''); setFilterEndDate(''); }}>Clear</Button>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Employee</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Check-in</TableCell>
                                    <TableCell>Check-out</TableCell>
                                    <TableCell>Hours</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Check-in Location</TableCell>
                                    <TableCell>Check-out Location</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {allLogs.length === 0 ? (
                                    <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.secondary' }}>No records found</TableCell></TableRow>
                                ) : allLogs.map((log) => (
                                    <TableRow key={log.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Person sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                <Typography variant="body2" fontWeight={500}>{log.user?.name || '—'}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell><Typography variant="body2" fontWeight={500}>{formatDateDisplay(log.date)}</Typography></TableCell>
                                        <TableCell>{formatTime(log.check_in_time)}</TableCell>
                                        <TableCell>{log.check_out_time ? formatTime(log.check_out_time) : <Chip label="Active" color="success" size="small" />}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={`${parseFloat(log.total_hours || 0).toFixed(2)}h`}
                                                color={parseFloat(log.total_hours || 0) >= 8 ? 'success' : parseFloat(log.total_hours || 0) >= 4 ? 'warning' : 'default'}
                                                size="small" variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>{renderStatusChip(log.status)}</TableCell>
                                        <TableCell>{renderLocation(log.check_in_latitude, log.check_in_longitude, log.check_in_address)}</TableCell>
                                        <TableCell>{renderLocation(log.check_out_latitude, log.check_out_longitude, log.check_out_address)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}

            {/* Tab: Monthly Summary (admin) */}
            {tabValue === 2 && isAdmin && (
                <Box>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Month</InputLabel>
                            <Select value={filterMonth} label="Month" onChange={(e) => setFilterMonth(e.target.value)}>
                                {[...Array(12)].map((_, i) => (
                                    <MenuItem key={i + 1} value={i + 1}>
                                        {new Date(2000, i).toLocaleString('en', { month: 'long' })}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 100 }}>
                            <InputLabel>Year</InputLabel>
                            <Select value={filterYear} label="Year" onChange={(e) => setFilterYear(e.target.value)}>
                                {[2024, 2025, 2026, 2027].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <Button variant="outlined" size="small" onClick={fetchSummary}>View</Button>
                    </Box>

                    {summary.length === 0 ? (
                        <Card><CardContent><Typography color="text.secondary" textAlign="center" py={3}>No data for this month</Typography></CardContent></Card>
                    ) : (
                        <Grid container spacing={2}>
                            {summary.map((s, idx) => (
                                <Grid item xs={12} md={6} lg={4} key={idx}>
                                    <Card sx={{ height: '100%' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                                <Box sx={{
                                                    width: 40, height: 40, borderRadius: '50%',
                                                    bgcolor: '#8a0303', color: 'white',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 700, fontSize: 14
                                                }}>
                                                    {s.user?.name?.charAt(0).toUpperCase()}
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight={700}>{s.user?.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{s.user?.email}</Typography>
                                                </Box>
                                            </Box>
                                            <Grid container spacing={1}>
                                                <Grid item xs={6}>
                                                    <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#e8f5e9', borderRadius: 2 }}>
                                                        <Typography variant="h5" fontWeight={700} color="success.main">{s.present}</Typography>
                                                        <Typography variant="caption" color="text.secondary">Present</Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#fff3e0', borderRadius: 2 }}>
                                                        <Typography variant="h5" fontWeight={700} color="warning.main">{s.late}</Typography>
                                                        <Typography variant="caption" color="text.secondary">Late</Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#e3f2fd', borderRadius: 2 }}>
                                                        <Typography variant="h5" fontWeight={700} color="info.main">{s.half_day}</Typography>
                                                        <Typography variant="caption" color="text.secondary">Half Day</Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#ffebee', borderRadius: 2 }}>
                                                        <Typography variant="h5" fontWeight={700} color="error.main">{s.absent}</Typography>
                                                        <Typography variant="caption" color="text.secondary">Absent</Typography>
                                                    </Paper>
                                                </Grid>
                                            </Grid>
                                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    <TrendingUp sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                                                    Total: {s.total_hours}h
                                                </Typography>
                                                <Chip label={`${s.working_days} working days`} size="small" variant="outlined" />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            )}

            {/* Tab: Live Locations Map (admin) */}
            {tabValue === 3 && isAdmin && (
                <Box>
                    {liveError && <Alert severity="error" sx={{ mb: 2 }}>{liveError}</Alert>}
                    <Grid container spacing={2}>
                        {/* Sidebar: Checked-in Employees */}
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '550px', display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6" fontWeight={700}>Employees Online</Typography>
                                    <Button variant="outlined" size="small" onClick={fetchLiveLogs} disabled={liveLoading}>
                                        {liveLoading ? <CircularProgress size={16} /> : 'Refresh'}
                                    </Button>
                                </Box>
                                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
                                    {liveLogs.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 5 }}>
                                            No employees checked in today.
                                        </Typography>
                                    ) : (
                                        liveLogs.map((log) => {
                                            const name = log.user?.name || 'Unknown';
                                            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                                            const isActive = !log.check_out_time;
                                            const latStr = log.current_latitude || log.check_in_latitude;
                                            const lngStr = log.current_longitude || log.check_in_longitude;
                                            const hasCoords = latStr && lngStr;

                                            return (
                                                <Box
                                                    key={log.id}
                                                    onClick={() => {
                                                        if (hasCoords) {
                                                            setSelectedCoords([parseFloat(latStr), parseFloat(lngStr)]);
                                                            setZoomLevel(15);
                                                        }
                                                    }}
                                                    sx={{
                                                        p: 1.5,
                                                        mb: 1,
                                                        borderRadius: 2,
                                                        cursor: hasCoords ? 'pointer' : 'default',
                                                        border: '1px solid',
                                                        borderColor: selectedCoords && selectedCoords[0] === parseFloat(log.check_in_latitude) && selectedCoords[1] === parseFloat(log.check_in_longitude) ? 'primary.main' : 'divider',
                                                        bgcolor: selectedCoords && selectedCoords[0] === parseFloat(log.check_in_latitude) && selectedCoords[1] === parseFloat(log.check_in_longitude) ? 'rgba(138, 3, 3, 0.04)' : 'transparent',
                                                        '&:hover': {
                                                            bgcolor: hasCoords ? 'rgba(0,0,0,0.02)' : 'transparent'
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box sx={{
                                                            width: 36, height: 36, borderRadius: '50%',
                                                            bgcolor: isActive ? '#2e7d32' : '#757575',
                                                            color: 'white', display: 'flex', alignItems: 'center',
                                                            justifyContent: 'center', fontWeight: 700, fontSize: 13
                                                        }}>
                                                            {initials}
                                                        </Box>
                                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                            <Typography variant="subtitle2" fontWeight={600} noWrap>{name}</Typography>
                                                            <Typography variant="caption" color="text.secondary" display="block">
                                                                In: {formatTime(log.check_in_time)}
                                                                {log.check_out_time && ` | Out: ${formatTime(log.check_out_time)}`}
                                                            </Typography>
                                                        </Box>
                                                        <Box>
                                                            <Chip
                                                                label={isActive ? 'Active' : 'Out'}
                                                                color={isActive ? 'success' : 'default'}
                                                                size="small"
                                                                sx={{ fontSize: '0.65rem', height: 18 }}
                                                            />
                                                        </Box>
                                                    </Box>
                                                    {log.check_in_address && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, pl: 6.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <LocationOn sx={{ fontSize: 12 }} />
                                                            {log.check_in_address.length > 35 ? log.check_in_address.substring(0, 35) + '…' : log.check_in_address}
                                                        </Typography>
                                                    )}
                                                    {!hasCoords && (
                                                        <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5, pl: 6.5 }}>
                                                            Location services disabled
                                                        </Typography>
                                                    )}
                                                </Box>
                                            );
                                        })
                                    )}
                                </Box>
                            </Card>
                        </Grid>

                        {/* Map Container */}
                        <Grid item xs={12} md={8}>
                            <Card sx={{ height: '550px', p: 1, position: 'relative' }}>
                                <style>{`
                                    @keyframes pulse {
                                        0% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.7); }
                                        70% { box-shadow: 0 0 0 8px rgba(46, 125, 50, 0); }
                                        100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
                                    }
                                    .custom-leaflet-marker {
                                        background: transparent;
                                        border: none;
                                    }
                                `}</style>
                                {liveLogs.filter(l => (l.current_latitude || l.check_in_latitude) && (l.current_longitude || l.check_in_longitude)).length === 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: 'action.hover', borderRadius: 2 }}>
                                        <LocationOn sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary">No Map Coordinates Available</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            None of today's checked-in employees have shared GPS locations.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <MapContainer
                                        center={selectedCoords || [20.5937, 78.9629]}
                                        zoom={zoomLevel}
                                        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        {liveLogs.map((log) => {
                                            const latStr = log.current_latitude || log.check_in_latitude;
                                            const lngStr = log.current_longitude || log.check_in_longitude;
                                            if (!latStr || !lngStr) return null;
                                            const lat = parseFloat(latStr);
                                            const lng = parseFloat(lngStr);
                                            const name = log.user?.name || 'Unknown';
                                            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                                            const isActive = !log.check_out_time;

                                            // Leaflet helper to build marker
                                            const markerIcon = L.divIcon({
                                                className: 'custom-leaflet-marker',
                                                html: `
                                                    <div style="
                                                        display: flex;
                                                        align-items: center;
                                                        justify-content: center;
                                                        width: 32px;
                                                        height: 32px;
                                                        border-radius: 50%;
                                                        background-color: ${isActive ? '#2e7d32' : '#757575'};
                                                        color: white;
                                                        font-weight: bold;
                                                        font-size: 14px;
                                                        border: 2px solid white;
                                                        box-shadow: 0 0 10px rgba(0,0,0,0.4), ${isActive ? '0 0 15px rgba(46,125,50,0.6)' : 'none'};
                                                        position: relative;
                                                        animation: ${isActive ? 'pulse 2s infinite' : 'none'};
                                                    ">
                                                        ${initials}
                                                        <div style="
                                                            position: absolute;
                                                            bottom: -5px;
                                                            left: 50%;
                                                            transform: translateX(-50%);
                                                            width: 0;
                                                            height: 0;
                                                            border-left: 5px solid transparent;
                                                            border-right: 5px solid transparent;
                                                            border-top: 5px solid ${isActive ? '#2e7d32' : '#757575'};
                                                        "></div>
                                                    </div>
                                                `,
                                                iconSize: [32, 32],
                                                iconAnchor: [16, 37],
                                                popupAnchor: [0, -32]
                                            });

                                            return (
                                                <Marker
                                                    key={log.id}
                                                    position={[lat, lng]}
                                                    icon={markerIcon}
                                                >
                                                    <Popup>
                                                        <Box sx={{ minWidth: 200, p: 0.5 }}>
                                                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>{name}</Typography>
                                                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                                                                Role: {log.user?.role || 'User'}
                                                            </Typography>
                                                            
                                                            <Box sx={{ borderTop: '1px solid #eee', pt: 1, mt: 0.5 }}>
                                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
                                                                    Check-in: {formatTime(log.check_in_time)}
                                                                </Typography>
                                                                {log.check_in_address && (
                                                                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                                                        📍 {log.check_in_address}
                                                                    </Typography>
                                                                )}
                                                            </Box>

                                                            {log.check_out_time && (
                                                                <Box sx={{ borderTop: '1px solid #eee', pt: 1, mt: 1 }}>
                                                                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
                                                                        Check-out: {formatTime(log.check_out_time)}
                                                                    </Typography>
                                                                    {log.check_out_address && (
                                                                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                                                            📍 {log.check_out_address}
                                                                        </Typography>
                                                                    )}
                                                                    <Typography variant="caption" display="block" sx={{ mt: 0.5, fontWeight: 600 }}>
                                                                        Hours Worked: {parseFloat(log.total_hours).toFixed(2)}h
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Popup>
                                                </Marker>
                                            );
                                        })}
                                        {selectedCoords && (
                                            <RecenterMapComponent center={selectedCoords} zoom={zoomLevel} />
                                        )}
                                    </MapContainer>
                                )}
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Tab: Travel Tracking (admin) */}
            {tabValue === 4 && isAdmin && (
                <Box>
                    {travelError && <Alert severity="error" sx={{ mb: 2 }}>{travelError}</Alert>}
                    
                    <Card sx={{ mb: 3 }}>
                        <Box sx={{ p: 2, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                            <TextField
                                size="small" type="date" label="Travel Date" InputLabelProps={{ shrink: true }}
                                value={travelDate} onChange={(e) => setTravelDate(e.target.value)}
                            />
                            <TextField
                                size="small" type="number" label="Expense Rate (₹/km)"
                                value={travelRate} onChange={(e) => setTravelRate(Math.max(0, parseFloat(e.target.value) || 0))}
                                InputProps={{ inputProps: { min: 0, step: 0.5 } }}
                            />
                            <Button variant="contained" size="small" color="primary" onClick={fetchTravelReport} disabled={travelLoading}>
                                {travelLoading ? <CircularProgress size={16} color="inherit" /> : 'Search Logs'}
                            </Button>
                        </Box>
                    </Card>

                    <Card>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Employee</TableCell>
                                        <TableCell>Check-in Time</TableCell>
                                        <TableCell>Check-out Time</TableCell>
                                        <TableCell align="center">Location Points</TableCell>
                                        <TableCell align="center">Total Distance</TableCell>
                                        <TableCell align="center">Travel Expense</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {travelLogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                                                No travel records found for this date.
                                            </TableCell>
                                        </TableRow>
                                    ) : travelLogs.map((log, idx) => {
                                        const expense = (log.totalDistanceKm || 0) * travelRate;
                                        return (
                                            <TableRow key={idx} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Person sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600}>{log.user?.name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{log.user?.email}</Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{formatTime(log.attendance?.check_in_time)}</TableCell>
                                                <TableCell>
                                                    {log.attendance?.check_out_time ? (
                                                        formatTime(log.attendance?.check_out_time)
                                                    ) : (
                                                        <Chip label="Active / Not Checked-out" color="success" size="small" variant="outlined" />
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip label={log.points?.length || 0} size="small" color="info" />
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700 }}>
                                                    {log.totalDistanceKm || 0} km
                                                </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700, color: 'success.main' }}>
                                                    ₹{expense.toFixed(2)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Button
                                                        variant="outlined" size="small" startIcon={<LocationOn />}
                                                        disabled={!log.points || log.points.length === 0}
                                                        onClick={() => {
                                                            setSelectedTravelUser(log);
                                                            if (log.points && log.points.length > 0) {
                                                                setDialogSelectedCoords([log.points[0].lat, log.points[0].lng]);
                                                                setDialogZoomLevel(14);
                                                            }
                                                            setIsRouteDialogOpen(true);
                                                        }}
                                                    >
                                                        View Route Map
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </Box>
            )}

            {/* Route Map & Timeline Dialog */}
            <Dialog
                open={isRouteDialogOpen}
                onClose={() => {
                    setIsRouteDialogOpen(false);
                    setSelectedTravelUser(null);
                    setDialogSelectedCoords(null);
                }}
                maxWidth="lg"
                fullWidth
            >
                {selectedTravelUser && (
                    <>
                        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    Travel Route - {selectedTravelUser.user?.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Date: {formatDateDisplay(travelDate)} | Total Distance: {selectedTravelUser.totalDistanceKm} km | Expense: ₹{((selectedTravelUser.totalDistanceKm || 0) * travelRate).toFixed(2)}
                                </Typography>
                            </Box>
                            <Button size="small" onClick={() => {
                                setIsRouteDialogOpen(false);
                                setSelectedTravelUser(null);
                                setDialogSelectedCoords(null);
                            }}>
                                Close
                            </Button>
                        </DialogTitle>
                        <DialogContent dividers sx={{ p: 1 }}>
                            <Grid container spacing={2}>
                                {/* Timeline column */}
                                <Grid item xs={12} md={4} sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ px: 2, py: 1, borderBottom: '1px solid #eee' }}>
                                        Chronological Timeline
                                    </Typography>
                                    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                                        {selectedTravelUser.points.map((pt, index) => (
                                            <Box
                                                key={index}
                                                onClick={() => {
                                                    setDialogSelectedCoords([pt.lat, pt.lng]);
                                                    setDialogZoomLevel(16);
                                                }}
                                                sx={{
                                                    display: 'flex',
                                                    gap: 2,
                                                    mb: 3,
                                                    cursor: 'pointer',
                                                    p: 1,
                                                    borderRadius: 1,
                                                    border: '1px solid',
                                                    borderColor: dialogSelectedCoords && dialogSelectedCoords[0] === pt.lat && dialogSelectedCoords[1] === pt.lng ? 'primary.main' : 'transparent',
                                                    bgcolor: dialogSelectedCoords && dialogSelectedCoords[0] === pt.lat && dialogSelectedCoords[1] === pt.lng ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <Box sx={{
                                                        width: 26, height: 26, borderRadius: '50%',
                                                        bgcolor: pt.type === 'check-in' ? '#2e7d32' : pt.type === 'check-out' ? '#d32f2f' : '#0288d1',
                                                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: 700, fontSize: 10
                                                    }}>
                                                        {pt.type === 'check-in' ? 'In' : pt.type === 'check-out' ? 'Out' : index}
                                                    </Box>
                                                    {index < selectedTravelUser.points.length - 1 && (
                                                        <Box sx={{ width: '2px', flexGrow: 1, bgcolor: '#e0e0e0', my: 0.5 }} />
                                                    )}
                                                </Box>
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                                        {pt.description}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        Time: {formatTime(pt.time)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                        📍 {pt.address}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Grid>

                                {/* Map column */}
                                <Grid item xs={12} md={8}>
                                    <Box sx={{ height: '500px', width: '100%', position: 'relative' }}>
                                        <style>{`
                                            .custom-route-marker {
                                                background: transparent;
                                                border: none;
                                            }
                                        `}</style>
                                        <MapContainer
                                            center={dialogSelectedCoords || [selectedTravelUser.points[0].lat, selectedTravelUser.points[0].lng]}
                                            zoom={dialogZoomLevel}
                                            style={{ height: '100%', width: '100%', borderRadius: '8px' }}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            />
                                            {/* Draw route path line */}
                                            <Polyline
                                                positions={selectedTravelUser.points.map(p => [p.lat, p.lng])}
                                                color="#1976d2"
                                                weight={4}
                                                opacity={0.8}
                                                dashArray="5, 5"
                                            />

                                            {/* Render markers */}
                                            {selectedTravelUser.points.map((pt, index) => (
                                                <Marker
                                                    key={index}
                                                    position={[pt.lat, pt.lng]}
                                                    icon={createRouteMarker(pt.type, pt.type === 'check-in' ? 'In' : pt.type === 'check-out' ? 'Out' : String(index))}
                                                >
                                                    <Popup>
                                                        <Box sx={{ p: 0.5, minWidth: 150 }}>
                                                            <Typography variant="subtitle2" fontWeight={700}>
                                                                {pt.type === 'check-in' ? 'Check-in Location' : pt.type === 'check-out' ? 'Check-out Location' : `Task Point ${index}`}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                                {pt.description}
                                                            </Typography>
                                                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                                                Time: {formatTime(pt.time)}
                                                            </Typography>
                                                            <Typography variant="caption" display="block" color="text.secondary">
                                                                📍 {pt.address}
                                                            </Typography>
                                                        </Box>
                                                    </Popup>
                                                </Marker>
                                            ))}
                                            {dialogSelectedCoords && (
                                                <RecenterMapComponent center={dialogSelectedCoords} zoom={dialogZoomLevel} />
                                            )}
                                        </MapContainer>
                                    </Box>
                                </Grid>
                            </Grid>
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default AttendancePage;
