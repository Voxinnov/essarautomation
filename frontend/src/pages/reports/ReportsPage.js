import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, Grid, Button, TextField, Alert,
    Divider, Chip,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { taskService, billingService, expenseService, timeService } from '../../services';
import { formatCurrency, formatDate } from '../../utils/constants';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const COLORS = ['#FF9800', '#2196F3', '#4CAF50', '#9E9E9E', '#9C27B0'];

const ReportsPage = () => {
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [billings, setBillings] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [timeLogs, setTimeLogs] = useState([]);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [t, b, e, tl] = await Promise.all([
                    taskService.getAll({ limit: 1000 }),
                    billingService.getAll({ limit: 1000 }),
                    expenseService.getAll({ limit: 1000, start_date: dateRange.start, end_date: dateRange.end }),
                    timeService.getReport({ limit: 1000, start_date: dateRange.start, end_date: dateRange.end }),
                ]);
                setTasks(t.data.data);
                setBillings(b.data.data);
                setExpenses(e.data.data);
                setTimeLogs(tl.data.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, [dateRange]);

    const totalBilling = billings.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
    const paidBilling = billings.filter(b => b.status === 'paid').reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const profit = paidBilling - totalExpenses;

    const taskByStatus = [
        { name: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: '#FF9800' },
        { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#2196F3' },
        { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#4CAF50' },
        { name: 'On Hold', value: tasks.filter(t => t.status === 'on_hold').length, color: '#9E9E9E' },
    ].filter(d => d.value > 0);

    const expenseByCategory = Object.entries(
        expenses.reduce((acc, e) => { acc[e.category || 'Other'] = (acc[e.category || 'Other'] || 0) + parseFloat(e.amount || 0); return acc; }, {})
    ).map(([name, value]) => ({ name, value }));

    const userHours = timeLogs.reduce((acc, log) => {
        const name = log.user?.name || 'Unknown';
        acc[name] = (acc[name] || 0) + parseFloat(log.total_hours || 0);
        return acc;
    }, {});
    const employeeData = Object.entries(userHours).map(([name, hours]) => ({ name, hours: parseFloat(hours.toFixed(2)) }));

    if (loading) return <LoadingSpinner />;

    return (
        <Box>
            <PageHeader title="Reports & Analytics" subtitle="Business performance overview" />

            {/* Date filter */}
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ pb: '16px !important' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                            <TextField size="small" label="Start Date" type="date" InputLabelProps={{ shrink: true }}
                                value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
                        </Grid>
                        <Grid item>
                            <TextField size="small" label="End Date" type="date" InputLabelProps={{ shrink: true }}
                                value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Financial Summary */}
            <Grid container spacing={3} mb={3}>
                {[
                    { label: 'Total Billing', value: formatCurrency(totalBilling), color: '#8a0303' },
                    { label: 'Paid Billing', value: formatCurrency(paidBilling), color: '#2e7d32' },
                    { label: 'Total Expenses', value: formatCurrency(totalExpenses), color: '#c62828' },
                    { label: 'Net Profit/Loss', value: formatCurrency(profit), color: profit >= 0 ? '#2e7d32' : '#c62828' },
                ].map(({ label, value, color }) => (
                    <Grid item xs={6} md={3} key={label}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">{label}</Typography>
                                <Typography variant="h5" fontWeight={700} color={color} mt={1}>{value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} mb={3}>
                {/* Task Distribution */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: 340 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} mb={2}>Task Distribution</Typography>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={taskByStatus} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                                        {taskByStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Expenses by Category */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: 340 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} mb={2}>Expenses by Category</Typography>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={expenseByCategory} cx="50%" cy="50%" outerRadius={90} dataKey="value">
                                        {expenseByCategory.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Employee Hours */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: 340 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} mb={2}>Employee Hours</Typography>
                            {employeeData.length === 0 ? (
                                <Typography color="text.secondary" variant="body2">No time logs in this period.</Typography>
                            ) : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={employeeData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" tick={{ fontSize: 11 }} />
                                        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                                        <Tooltip formatter={(v) => [`${v}h`, 'Hours']} />
                                        <Bar dataKey="hours" fill="#8a0303" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Billing Table */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={2}>Billing Report</Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Invoice #</TableCell>
                                    <TableCell>Task</TableCell>
                                    <TableCell>Client</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {billings.slice(0, 10).map((b) => (
                                    <TableRow key={b.id} hover>
                                        <TableCell><Chip label={b.invoice_number} size="small" color="primary" variant="outlined" /></TableCell>
                                        <TableCell>{b.task?.title || '-'}</TableCell>
                                        <TableCell>{b.client?.patient_name || '-'}</TableCell>
                                        <TableCell><strong>{formatCurrency(b.amount)}</strong></TableCell>
                                        <TableCell>{b.billing_type}</TableCell>
                                        <TableCell><Chip label={b.status} size="small" color={b.status === 'paid' ? 'success' : 'warning'} /></TableCell>
                                        <TableCell>{formatDate(b.created_at)}</TableCell>
                                    </TableRow>
                                ))}
                                {billings.length === 0 && (
                                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>No billing records</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ReportsPage;
