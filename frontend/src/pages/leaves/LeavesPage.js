import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, TextField, Typography, Pagination, Dialog, DialogTitle,
    DialogContent, DialogActions, Alert, Grid, Tooltip, InputAdornment, CardContent, Button,
    MenuItem, Select, FormControl, InputLabel, Chip, Tabs, Tab, Checkbox, FormControlLabel,
    Avatar, Paper, Divider
} from '@mui/material';
import {
    Add, Edit, Delete, Search, CheckCircle, Cancel, HourglassEmpty,
    EventNote, DateRange, HelpOutline, FilterList, Clear
} from '@mui/icons-material';
import { leaveService, authService } from '../../services';
import { formatDate, LEAVE_TYPES, LEAVE_STATUSES, getStatusColor } from '../../utils/constants';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const emptyForm = {
    leaveType: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    halfDay: 'none',
    reason: ''
};

const LeavesPage = () => {
    const { user, hasPermission } = useAuth();
    const isApprover = user?.role === 'admin' || user?.role === 'manager';

    // Tabs
    const [tab, setTab] = useState(0);

    // Lists & Pagination
    const [myLeaves, setMyLeaves] = useState([]);
    const [empLeaves, setEmpLeaves] = useState([]);
    const [myLoading, setMyLoading] = useState(true);
    const [empLoading, setEmpLoading] = useState(true);
    const [myPage, setMyPage] = useState(1);
    const [empPage, setEmpPage] = useState(1);
    const [myTotalPages, setMyTotalPages] = useState(1);
    const [empTotalPages, setEmpTotalPages] = useState(1);

    // Stats
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    // Users List for filtering
    const [users, setUsers] = useState([]);

    // Filters
    const [myFilters, setMyFilters] = useState({ status: '', leaveType: '' });
    const [empFilters, setEmpFilters] = useState({ userId: '', status: '', leaveType: '', start_date: '', end_date: '' });

    // Dialogs
    const [openRequestDialog, setOpenRequestDialog] = useState(false);
    const [openApproveDialog, setOpenApproveDialog] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [selectedLeave, setSelectedLeave] = useState(null);

    // Forms
    const [requestForm, setRequestForm] = useState(emptyForm);
    const [approvalComment, setApprovalComment] = useState('');
    const [saving, setSaving] = useState(false);
    const [submittingApproval, setSubmittingApproval] = useState(false);
    const [error, setError] = useState('');
    const [approvalError, setApprovalError] = useState('');

    // Fetch personal leaves
    const fetchMyLeaves = useCallback(async () => {
        setMyLoading(true);
        try {
            const res = await leaveService.getMy({
                page: myPage,
                limit: 10,
                status: myFilters.status,
                leaveType: myFilters.leaveType
            });
            setMyLeaves(res.data.data);
            setMyTotalPages(res.data.totalPages);
        } catch (err) {
            console.error('Failed to load my leaves', err);
        } finally {
            setMyLoading(false);
        }
    }, [myPage, myFilters]);

    // Fetch employee leaves (Admins/Managers)
    const fetchEmpLeaves = useCallback(async () => {
        if (!isApprover) return;
        setEmpLoading(true);
        try {
            const res = await leaveService.getAll({
                page: empPage,
                limit: 10,
                userId: empFilters.userId,
                status: empFilters.status,
                leaveType: empFilters.leaveType,
                start_date: empFilters.start_date,
                end_date: empFilters.end_date
            });
            setEmpLeaves(res.data.data);
            setEmpTotalPages(res.data.totalPages);
        } catch (err) {
            console.error('Failed to load employee leaves', err);
        } finally {
            setEmpLoading(false);
        }
    }, [empPage, empFilters, isApprover]);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const res = await leaveService.getStats();
            setStats(res.data.data);
        } catch (err) {
            console.error('Failed to load statistics', err);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    // Fetch users for manager filtering
    const fetchUsers = useCallback(async () => {
        if (!isApprover) return;
        try {
            const res = await authService.getUsers();
            setUsers(res.data.data);
        } catch (err) {
            console.error('Failed to load users list', err);
        }
    }, [isApprover]);

    useEffect(() => {
        fetchMyLeaves();
        fetchStats();
        if (isApprover) {
            fetchEmpLeaves();
            fetchUsers();
        }
    }, [fetchMyLeaves, fetchEmpLeaves, fetchStats, fetchUsers, isApprover]);

    // Listen to real-time events for updating stats/lists
    useEffect(() => {
        if (!user) return;
        
        const streamUrl = leaveService.getStats ? `${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/notifications/stream?token=${localStorage.getItem('token')}` : '';
        if (!streamUrl) return;

        const es = new EventSource(streamUrl);
        es.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'leave') {
                // Refresh data dynamically
                fetchStats();
                fetchMyLeaves();
                if (isApprover) fetchEmpLeaves();
            }
        };

        return () => es.close();
    }, [user, fetchMyLeaves, fetchEmpLeaves, fetchStats, isApprover]);

    const handleOpenRequest = (item = null) => {
        setEditItem(item);
        if (item) {
            setRequestForm({
                leaveType: item.leaveType,
                startDate: item.startDate,
                endDate: item.endDate,
                halfDay: item.halfDay || 'none',
                reason: item.reason
            });
        } else {
            setRequestForm(emptyForm);
        }
        setError('');
        setOpenRequestDialog(true);
    };

    const handleRequestSubmit = async () => {
        if (!requestForm.leaveType || !requestForm.startDate || !requestForm.endDate || !requestForm.reason) {
            setError('Please fill in all required fields.');
            return;
        }

        if (new Date(requestForm.startDate) > new Date(requestForm.endDate)) {
            setError('End Date must be on or after Start Date.');
            return;
        }

        setSaving(true);
        setError('');
        try {
            if (editItem) {
                await leaveService.update(editItem.id, requestForm);
            } else {
                await leaveService.create(requestForm);
            }
            setOpenRequestDialog(false);
            fetchMyLeaves();
            fetchStats();
            if (isApprover) fetchEmpLeaves();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit leave request');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelRequest = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
        try {
            await leaveService.delete(id);
            fetchMyLeaves();
            fetchStats();
            if (isApprover) fetchEmpLeaves();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel request');
        }
    };

    const handleOpenApprove = (leave) => {
        setSelectedLeave(leave);
        setApprovalComment('');
        setApprovalError('');
        setOpenApproveDialog(true);
    };

    const handleApprovalSubmit = async (status) => {
        setSubmittingApproval(true);
        setApprovalError('');
        try {
            await leaveService.approve(selectedLeave.id, {
                status,
                comment: approvalComment
            });
            setOpenApproveDialog(false);
            fetchEmpLeaves();
            fetchStats();
            fetchMyLeaves();
        } catch (err) {
            setApprovalError(err.response?.data?.message || 'Failed to process approval');
        } finally {
            setSubmittingApproval(false);
        }
    };

    const clearMyFilters = () => {
        setMyFilters({ status: '', leaveType: '' });
        setMyPage(1);
    };

    const clearEmpFilters = () => {
        setEmpFilters({ userId: '', status: '', leaveType: '', start_date: '', end_date: '' });
        setEmpPage(1);
    };

    const getLeaveTypeLabel = (val) => {
        const t = LEAVE_TYPES.find(item => item.value === val);
        return t ? t.label : val;
    };

    return (
        <Box>
            <PageHeader
                title="Leave Management"
                subtitle="Request leaves and view approval logs"
                action={hasPermission('leaves_request') ? () => handleOpenRequest() : null}
                actionLabel="Apply Leave"
            />

            {/* Statistics Cards */}
            {!statsLoading && stats && (
                <Grid container spacing={3} mb={3}>
                    {isApprover && stats.company && (
                        <>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ background: 'linear-gradient(135deg, #FFF8E1 0%, #FFE082 100%)', boxShadow: 2 }}>
                                    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: '20px !important' }}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" fontWeight={600}>Pending Approvals</Typography>
                                            <Typography variant="h4" fontWeight={700} color="warning.dark" mt={1}>{stats.company.pending}</Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}><HourglassEmpty /></Avatar>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ background: 'linear-gradient(135deg, #E8F5E9 0%, #A5D6A7 100%)', boxShadow: 2 }}>
                                    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: '20px !important' }}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" fontWeight={600}>On Leave Today</Typography>
                                            <Typography variant="h4" fontWeight={700} color="success.dark" mt={1}>{stats.company.onLeaveToday}</Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}><EventNote /></Avatar>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </>
                    )}
                    <Grid item xs={12} sm={6} md={isApprover ? 3 : 6}>
                        <Card sx={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #90CAF9 100%)', boxShadow: 2 }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: '20px !important' }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" fontWeight={600}>My Approved Days (This Year)</Typography>
                                    <Typography variant="h4" fontWeight={700} color="primary.dark" mt={1}>{stats.personal?.approvedDaysThisYear || 0}</Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}><CheckCircle /></Avatar>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={isApprover ? 3 : 6}>
                        <Card sx={{ background: 'linear-gradient(135deg, #F3E5F5 0%, #CE93D8 100%)', boxShadow: 2 }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: '20px !important' }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" fontWeight={600}>My Pending Requests</Typography>
                                    <Typography variant="h4" fontWeight={700} color="secondary.dark" mt={1}>{stats.personal?.pending || 0}</Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}><HourglassEmpty /></Avatar>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Main Tabs layout */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tab} onChange={(e, val) => setTab(val)} textColor="primary" indicatorColor="primary">
                    <Tab label="My Leave Requests" />
                    {isApprover && <Tab label="Employee Leave Requests" />}
                </Tabs>
            </Box>

            {/* Tab Panel 1: My Leaves */}
            {tab === 0 && (
                <Box>
                    {/* Filters Panel */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent sx={{ py: '16px !important' }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={myFilters.status}
                                            label="Status"
                                            onChange={(e) => { setMyFilters({ ...myFilters, status: e.target.value }); setMyPage(1); }}
                                        >
                                            <MenuItem value="">All Statuses</MenuItem>
                                            {LEAVE_STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Leave Type</InputLabel>
                                        <Select
                                            value={myFilters.leaveType}
                                            label="Leave Type"
                                            onChange={(e) => { setMyFilters({ ...myFilters, leaveType: e.target.value }); setMyPage(1); }}
                                        >
                                            <MenuItem value="">All Leave Types</MenuItem>
                                            {LEAVE_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Button variant="outlined" fullWidth onClick={clearMyFilters} startIcon={<Clear />}>Clear Filters</Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Leaves Table */}
                    <Card>
                        <TableContainer component={Paper} elevation={0}>
                            {myLoading ? <LoadingSpinner height="250px" /> : (
                                <Table>
                                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                                        <TableRow>
                                            <TableCell>Leave Type</TableCell>
                                            <TableCell>Duration</TableCell>
                                            <TableCell>Total Days</TableCell>
                                            <TableCell>Reason</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Approver</TableCell>
                                            <TableCell>Comment</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {myLeaves.length === 0 ? (
                                            <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>No leave requests found</TableCell></TableRow>
                                        ) : myLeaves.map((item) => (
                                            <TableRow key={item.id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600} color="text.primary">
                                                        {getLeaveTypeLabel(item.leaveType)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {formatDate(item.startDate)} to {formatDate(item.endDate)}
                                                    </Typography>
                                                    {item.halfDay !== 'none' && (
                                                        <Chip label={`Half Day (${item.halfDay === 'first_half' ? '1st Half' : '2nd Half'})`} size="small" variant="outlined" color="primary" sx={{ mt: 0.5, height: 18, fontSize: '0.65rem' }} />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography fontWeight={700}>{parseFloat(item.totalDays)} day(s)</Typography>
                                                </TableCell>
                                                <TableCell sx={{ maxWidth: 200, wordBreak: 'break-word' }}>
                                                    {item.reason}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={item.status.toUpperCase()} size="small" color={getStatusColor(item.status)} sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                                                </TableCell>
                                                <TableCell>{item.approver?.name || '-'}</TableCell>
                                                <TableCell sx={{ maxWidth: 150, wordBreak: 'break-word', fontStyle: 'italic' }}>
                                                    {item.comment || '-'}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {item.status === 'pending' && (
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                            <Tooltip title="Edit">
                                                                <IconButton size="small" color="info" onClick={() => handleOpenRequest(item)}><Edit fontSize="small" /></IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Cancel Request">
                                                                <IconButton size="small" color="error" onClick={() => handleCancelRequest(item.id)}><Delete fontSize="small" /></IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    )}
                                                    {item.status !== 'pending' && '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </TableContainer>
                        {myTotalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <Pagination count={myTotalPages} page={myPage} onChange={(e, val) => setMyPage(val)} color="primary" />
                            </Box>
                        )}
                    </Card>
                </Box>
            )}

            {/* Tab Panel 2: Employee Leaves (Approver View) */}
            {tab === 1 && isApprover && (
                <Box>
                    {/* Filters Panel */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Employee</InputLabel>
                                        <Select
                                            value={empFilters.userId}
                                            label="Employee"
                                            onChange={(e) => { setEmpFilters({ ...empFilters, userId: e.target.value }); setEmpPage(1); }}
                                        >
                                            <MenuItem value="">All Employees</MenuItem>
                                            {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name} ({u.role})</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={empFilters.status}
                                            label="Status"
                                            onChange={(e) => { setEmpFilters({ ...empFilters, status: e.target.value }); setEmpPage(1); }}
                                        >
                                            <MenuItem value="">All Statuses</MenuItem>
                                            {LEAVE_STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Leave Type</InputLabel>
                                        <Select
                                            value={empFilters.leaveType}
                                            label="Leave Type"
                                            onChange={(e) => { setEmpFilters({ ...empFilters, leaveType: e.target.value }); setEmpPage(1); }}
                                        >
                                            <MenuItem value="">All Leave Types</MenuItem>
                                            {LEAVE_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={2.5}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        type="date"
                                        label="From Date"
                                        InputLabelProps={{ shrink: true }}
                                        value={empFilters.start_date}
                                        onChange={(e) => { setEmpFilters({ ...empFilters, start_date: e.target.value }); setEmpPage(1); }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={2.5}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        type="date"
                                        label="To Date"
                                        InputLabelProps={{ shrink: true }}
                                        value={empFilters.end_date}
                                        onChange={(e) => { setEmpFilters({ ...empFilters, end_date: e.target.value }); setEmpPage(1); }}
                                    />
                                </Grid>
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                    <Button variant="outlined" size="small" onClick={clearEmpFilters} startIcon={<Clear />}>Clear Filters</Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Employee Leaves Table */}
                    <Card>
                        <TableContainer component={Paper} elevation={0}>
                            {empLoading ? <LoadingSpinner height="250px" /> : (
                                <Table>
                                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                                        <TableRow>
                                            <TableCell>Employee</TableCell>
                                            <TableCell>Leave Type</TableCell>
                                            <TableCell>Duration</TableCell>
                                            <TableCell>Total Days</TableCell>
                                            <TableCell>Reason</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Reviewed By</TableCell>
                                            <TableCell>Comment</TableCell>
                                            <TableCell align="center">Review</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {empLeaves.length === 0 ? (
                                            <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>No employee leave requests found</TableCell></TableRow>
                                        ) : empLeaves.map((item) => (
                                            <TableRow key={item.id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 13 }}>
                                                            {item.user?.name?.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600}>{item.user?.name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{item.user?.role?.toUpperCase()}</Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {getLeaveTypeLabel(item.leaveType)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {formatDate(item.startDate)} to {formatDate(item.endDate)}
                                                    </Typography>
                                                    {item.halfDay !== 'none' && (
                                                        <Chip label={`Half Day (${item.halfDay === 'first_half' ? '1st' : '2nd'} Half)`} size="small" variant="outlined" color="primary" sx={{ mt: 0.5, height: 18, fontSize: '0.65rem' }} />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography fontWeight={700}>{parseFloat(item.totalDays)} day(s)</Typography>
                                                </TableCell>
                                                <TableCell sx={{ maxWidth: 180, wordBreak: 'break-word' }}>
                                                    {item.reason}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={item.status.toUpperCase()} size="small" color={getStatusColor(item.status)} sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                                                </TableCell>
                                                <TableCell>{item.approver?.name || '-'}</TableCell>
                                                <TableCell sx={{ maxWidth: 150, wordBreak: 'break-word', fontStyle: 'italic' }}>
                                                    {item.comment || '-'}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {item.status === 'pending' ? (
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            onClick={() => handleOpenApprove(item)}
                                                            sx={{ borderRadius: 1.5, py: 0.5, textTransform: 'none', fontSize: '0.75rem' }}
                                                        >
                                                            Review
                                                        </Button>
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary">Reviewed</Typography>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </TableContainer>
                        {empTotalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <Pagination count={empTotalPages} page={empPage} onChange={(e, val) => setEmpPage(val)} color="primary" />
                            </Box>
                        )}
                    </Card>
                </Box>
            )}

            {/* Dialog 1: Apply / Edit Leave Request */}
            <Dialog open={openRequestDialog} onClose={() => setOpenRequestDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {editItem ? 'Edit Leave Request' : 'Apply For Leave'}
                </DialogTitle>
                <DialogContent dividers>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Leave Type</InputLabel>
                                <Select
                                    value={requestForm.leaveType}
                                    label="Leave Type"
                                    onChange={(e) => setRequestForm({ ...requestForm, leaveType: e.target.value })}
                                >
                                    {LEAVE_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                type="date"
                                label="Start Date"
                                InputLabelProps={{ shrink: true }}
                                value={requestForm.startDate}
                                onChange={(e) => setRequestForm({ ...requestForm, startDate: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                type="date"
                                label="End Date"
                                InputLabelProps={{ shrink: true }}
                                value={requestForm.endDate}
                                onChange={(e) => setRequestForm({ ...requestForm, endDate: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Half Day Option</InputLabel>
                                <Select
                                    value={requestForm.halfDay}
                                    label="Half Day Option"
                                    onChange={(e) => setRequestForm({ ...requestForm, halfDay: e.target.value })}
                                >
                                    <MenuItem value="none">None (Full Day)</MenuItem>
                                    <MenuItem value="first_half">First Half</MenuItem>
                                    <MenuItem value="second_half">Second Half</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Reason for Leave"
                                placeholder="Explain your reason..."
                                multiline
                                rows={3}
                                value={requestForm.reason}
                                onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpenRequestDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleRequestSubmit}
                        disabled={saving || !requestForm.leaveType || !requestForm.reason}
                    >
                        {saving ? 'Submitting...' : editItem ? 'Save Changes' : 'Submit Application'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog 2: Review/Approve Employee Leave */}
            <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Review Leave Request</DialogTitle>
                <DialogContent dividers>
                    {approvalError && <Alert severity="error" sx={{ mb: 2 }}>{approvalError}</Alert>}
                    {selectedLeave && (
                        <Box sx={{ mb: 2 }}>
                            <Grid container spacing={1.5} mb={2}>
                                <Grid item xs={4}><Typography variant="subtitle2" color="text.secondary">Employee:</Typography></Grid>
                                <Grid item xs={8}><Typography fontWeight={600}>{selectedLeave.user?.name}</Typography></Grid>
                                
                                <Grid item xs={4}><Typography variant="subtitle2" color="text.secondary">Leave Type:</Typography></Grid>
                                <Grid item xs={8}><Typography>{getLeaveTypeLabel(selectedLeave.leaveType)}</Typography></Grid>
                                
                                <Grid item xs={4}><Typography variant="subtitle2" color="text.secondary">Duration:</Typography></Grid>
                                <Grid item xs={8}><Typography fontWeight={500}>{formatDate(selectedLeave.startDate)} to {formatDate(selectedLeave.endDate)} ({parseFloat(selectedLeave.totalDays)} days)</Typography></Grid>
                                
                                <Grid item xs={4}><Typography variant="subtitle2" color="text.secondary">Reason:</Typography></Grid>
                                <Grid item xs={8}><Typography sx={{ wordBreak: 'break-word' }}>{selectedLeave.reason}</Typography></Grid>
                            </Grid>
                            <Divider sx={{ my: 2 }} />
                            <TextField
                                fullWidth
                                label="Approval/Rejection Comments (Optional)"
                                placeholder="Add any feedback, terms or comments..."
                                multiline
                                rows={2}
                                value={approvalComment}
                                onChange={(e) => setApprovalComment(e.target.value)}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={() => setOpenApproveDialog(false)} color="inherit">Cancel</Button>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<Cancel />}
                            disabled={submittingApproval}
                            onClick={() => handleApprovalSubmit('rejected')}
                        >
                            Reject
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            disabled={submittingApproval}
                            onClick={() => handleApprovalSubmit('approved')}
                        >
                            Approve
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LeavesPage;
