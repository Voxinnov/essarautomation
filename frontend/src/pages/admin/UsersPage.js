import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    MenuItem, Chip, Alert, CircularProgress, Grid
} from '@mui/material';
import { Add, Edit, Delete, Person } from '@mui/icons-material';
import { authService, roleService } from '../../services';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', role: 'staff', roleId: '', status: 'active'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, rolesRes] = await Promise.all([
                authService.getUsers(),
                roleService.getAll()
            ]);
            setUsers(usersRes.data.data);
            setRoles(rolesRes.data.data);
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (user = null) => {
        if (user) {
            setEditMode(true);
            setCurrentUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '', // Don't show password
                phone: user.phone || '',
                role: user.role,
                roleId: user.roleId || '',
                status: user.status || 'active'
            });
        } else {
            setEditMode(false);
            setFormData({ name: '', email: '', password: '', phone: '', role: 'staff', roleId: '', status: 'active' });
        }
        setOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            if (editMode) {
                await authService.updateUser(currentUser.id, formData);
                setSuccess('User updated successfully');
            } else {
                await authService.createUser(formData);
                setSuccess('User created successfully');
            }
            fetchData();
            setOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setError('');
            setSuccess('');
            try {
                await authService.deleteUser(id);
                setSuccess('User deleted successfully');
                fetchData();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight={700} color="primary.main">User Management</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add User</Button>
            </Box>

            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Person color="action" />
                                        <Typography variant="body2" fontWeight={500}>{user.name}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={user.roleData?.name || user.role} 
                                        size="small" 
                                        color={user.role === 'admin' ? 'error' : user.role === 'manager' ? 'warning' : 'primary'}
                                        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={user.status} 
                                        size="small" 
                                        variant="outlined"
                                        color={user.status === 'active' ? 'success' : 'default'}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleOpen(user)}><Edit fontSize="small" /></IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(user.id)}><Delete fontSize="small" /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editMode ? 'Edit User' : 'Add New User'}</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                        </Grid>
                        {!editMode && (
                            <Grid item xs={12}>
                                <TextField fullWidth label="Password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                select 
                                label="Select Role" 
                                value={formData.roleId} 
                                onChange={(e) => {
                                    const selectedRole = roles.find(r => r.id === e.target.value);
                                    setFormData({...formData, roleId: e.target.value, role: selectedRole.name.toLowerCase()});
                                }}
                                required
                            >
                                {roles.map((role) => (
                                    <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        {editMode && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Status"
                                    value={formData.status || 'active'}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    required
                                >
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                </TextField>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>{editMode ? 'Update' : 'Create User'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UsersPage;
