import React, { useState, useEffect } from 'react';
import {
    Grid, Card, CardContent, Typography, Box, Chip, Avatar,
    CircularProgress, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper,
} from '@mui/material';
import {
    Assignment, CheckCircle, HourglassEmpty, Pause,
    AttachMoney, TrendingUp, People, AccessTime,
} from '@mui/icons-material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { dashboardService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/constants';
import StatusChip from '../../components/common/StatusChip';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StatCard = ({ icon, title, value, subtitle, color, gradient }) => (
    <Card sx={{ height: '100%', overflow: 'hidden', position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '0 0 0 100%', background: `${gradient || color}22` }} />
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
                    <Typography variant="h4" fontWeight={700} mt={1} color={color || 'primary.main'}>{value}</Typography>
                    {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
                </Box>
                <Avatar sx={{ bgcolor: `${color}22` || 'primary.light', width: 52, height: 52 }}>
                    {React.cloneElement(icon, { sx: { color: color || '#8a0303', fontSize: 26 } })}
                </Avatar>
            </Box>
        </CardContent>
    </Card>
);

const COLORS = ['#FF9800', '#2196F3', '#4CAF50', '#9E9E9E'];

const DashboardPage = () => {
    const { hasPermission } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await dashboardService.getStats();
                setData(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <LoadingSpinner />;
    if (!data) return <Typography>Failed to load dashboard data.</Typography>;

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main" mb={3}>
                Dashboard Overview
            </Typography>

            {/* Stat Cards */}
            <Grid container spacing={3} mb={3}>
                {hasPermission('dashboard_tasks_stats') && (
                    <>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard icon={<Assignment />} title="Total Tasks" value={data.tasks.total} color="#8a0303" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard icon={<HourglassEmpty />} title="Pending Tasks" value={data.tasks.pending} color="#F57C00" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard icon={<CheckCircle />} title="Completed Tasks" value={data.tasks.completed} color="#2E7D32" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard icon={<Pause />} title="In Progress" value={data.tasks.inProgress} color="#1565C0" />
                        </Grid>
                    </>
                )}
                {hasPermission('dashboard_billing_stats') && (
                    <>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard icon={<AttachMoney />} title="Total Billing" value={formatCurrency(data.billing.total)} color="#6A1B9A" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard icon={<CheckCircle />} title="Paid Billing" value={formatCurrency(data.billing.paid)} color="#2E7D32" />
                        </Grid>
                    </>
                )}
                {hasPermission('dashboard_expenses_stats') && (
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard icon={<TrendingUp />} title="Total Expenses" value={formatCurrency(data.expenses.total)} color="#C62828" />
                    </Grid>
                )}
                {hasPermission('dashboard_clients_stats') && (
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard icon={<People />} title="Total Clients" value={data.totals.clients} color="#00838F" />
                    </Grid>
                )}
            </Grid>

            {(hasPermission('dashboard_task_status_chart') || hasPermission('dashboard_task_trend_chart')) && (
                <Grid container spacing={3} mb={3}>
                    {/* Task Status Pie Chart */}
                    {hasPermission('dashboard_task_status_chart') && (
                        <Grid item xs={12} md={hasPermission('dashboard_task_trend_chart') ? 5 : 12}>
                            <Card sx={{ height: 380 }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} mb={2}>Task Status Distribution</Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie data={data.taskStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={5} dataKey="value">
                                                {data.taskStatusData.map((entry, index) => (
                                                    <Cell key={index} fill={entry.color || COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [value, 'Tasks']} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* Monthly Task Trend */}
                    {hasPermission('dashboard_task_trend_chart') && (
                        <Grid item xs={12} md={hasPermission('dashboard_task_status_chart') ? 7 : 12}>
                            <Card sx={{ height: 380 }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} mb={2}>Monthly Task Trend (Last 6 Months)</Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={data.monthlyTasks}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#8a0303" radius={[6, 6, 0, 0]} name="Tasks" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            )}

            {(hasPermission('dashboard_recent_tasks') || hasPermission('dashboard_employee_hours')) && (
                <Grid container spacing={3}>
                    {/* Recent Tasks */}
                    {hasPermission('dashboard_recent_tasks') && (
                        <Grid item xs={12} md={hasPermission('dashboard_employee_hours') ? 7 : 12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} mb={2}>Recent Tasks</Typography>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Title</TableCell>
                                                    <TableCell>Assigned To</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Date</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.recentTasks.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>No tasks yet</TableCell>
                                                    </TableRow>
                                                ) : data.recentTasks.map((task) => (
                                                    <TableRow key={task.id} hover>
                                                        <TableCell><Typography variant="body2" fontWeight={500}>{task.title}</Typography></TableCell>
                                                        <TableCell><Typography variant="body2">{task.assignee?.name || 'Unassigned'}</Typography></TableCell>
                                                        <TableCell><StatusChip status={task.status} /></TableCell>
                                                        <TableCell><Typography variant="caption">{formatDate(task.created_at)}</Typography></TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* Employee Hours */}
                    {hasPermission('dashboard_employee_hours') && (
                        <Grid item xs={12} md={hasPermission('dashboard_recent_tasks') ? 5 : 12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} mb={2}>
                                        <AccessTime sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
                                        Employee Work Hours
                                    </Typography>
                                    {data.employeeHours.length === 0 ? (
                                        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                                            <AccessTime sx={{ fontSize: 40, mb: 1 }} />
                                            <Typography variant="body2">No time logs yet</Typography>
                                        </Box>
                                    ) : data.employeeHours.map((emp, i) => (
                                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, pb: 2, borderBottom: i < data.employeeHours.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#8a0303', fontSize: 13 }}>
                                                    {emp.user?.name?.charAt(0)}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={500}>{emp.user?.name}</Typography>
                                            </Box>
                                            <Chip label={`${parseFloat(emp.dataValues?.total_hours || 0).toFixed(1)}h`} size="small" color="primary" variant="outlined" />
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            )}
        </Box>
    );
};

export default DashboardPage;
