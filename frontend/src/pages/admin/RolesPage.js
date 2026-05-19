import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Checkbox, FormControlLabel, Grid, Alert, CircularProgress, Divider, Chip
} from '@mui/material';
import { Add, Edit, Delete, Security, Refresh } from '@mui/icons-material';
import { roleService } from '../../services';

const RolesPage = () => {
    const [roles, setRoles] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const [permissionGroups, setPermissionGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentRole, setCurrentRole] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', permissions: [] });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => { 
        fetchData(); 
        fetchPermissions();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await roleService.getAll();
            setRoles(res.data.data);
        } catch (err) { setError('Failed to fetch roles'); }
        finally { setLoading(false); }
    };

    const fetchPermissions = async () => {
        try {
            const res = await roleService.getPermissions();
            setAllPermissions(res.data.data || []);
            if (res.data.groups) {
                setPermissionGroups(res.data.groups);
            }
        } catch (err) { console.error('Failed to fetch permissions', err); }
    };

    const handleOpen = (role = null) => {
        if (role) {
            setEditMode(true);
            setCurrentRole(role);
            setFormData({ name: role.name, description: role.description || '', permissions: role.permissions || [] });
        } else {
            setEditMode(false);
            setFormData({ name: '', description: '', permissions: [] });
        }
        setOpen(true);
    };

    const handlePermissionToggle = (key) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(key) 
                ? prev.permissions.filter(p => p !== key) 
                : [...prev.permissions, key]
        }));
    };

    const handleGroupToggle = (groupKeys, selectAll) => {
        setFormData(prev => {
            const base = prev.permissions.filter(p => !groupKeys.includes(p));
            return {
                ...prev,
                permissions: selectAll ? [...base, ...groupKeys] : base
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editMode) {
                await roleService.update(currentRole.id, formData);
                setSuccess('Role updated successfully');
            } else {
                await roleService.create(formData);
                setSuccess('Role created successfully');
            }
            fetchData();
            setOpen(false);
        } catch (err) { setError(err.response?.data?.message || 'Operation failed'); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this role?')) {
            try {
                await roleService.delete(id);
                setSuccess('Role deleted successfully');
                fetchData();
            } catch (err) { setError('Failed to delete role'); }
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color="primary.main">Role & Permission Management</Typography>
                    <Typography variant="body2" color="text.secondary">Manage user roles and their granular access permissions</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<Refresh />} onClick={() => { fetchData(); fetchPermissions(); }}>Refresh</Button>
                    <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add Role</Button>
                </Box>
            </Box>

            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {roles.map((role) => (
                    <Card key={role.id} sx={{ flex: '1 1 300px', minWidth: 300, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none', borderRadius: 2 }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>{role.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{role.description || 'No description'}</Typography>
                                </Box>
                                <Security color="primary" />
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                Permissions ({role.permissions?.length || 0})
                            </Typography>
                            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 150, overflowY: 'auto', p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                                {role.permissions?.map(p => (
                                    <Chip key={p} label={p} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                                ))}
                                {role.permissions?.length === 0 && <Typography variant="caption">No permissions assigned</Typography>}
                                {role.name === 'Admin' && role.permissions?.length === 0 && <Typography variant="caption" color="primary">Super Admin has all access</Typography>}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button size="small" variant="outlined" startIcon={<Edit />} fullWidth onClick={() => handleOpen(role)}>Edit Role</Button>
                                {role.name !== 'Admin' && <IconButton size="small" color="error" onClick={() => handleDelete(role.id)}><Delete fontSize="small" /></IconButton>}
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>{editMode ? 'Edit Role' : 'Add New Role'}</DialogTitle>
                <DialogContent dividers sx={{ pt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label="Role Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required sx={{ mb: 2 }} />
                            <TextField fullWidth label="Description" multiline rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                            <Box sx={{ mt: 2, p: 2, bgcolor: '#fff9c4', borderRadius: 1 }}>
                                <Typography variant="caption" color="warning.dark">
                                    <b>Note:</b> New functionalities added to the system will automatically appear in the permission list on the right.
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Select Granular Permissions</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button size="small" onClick={() => handleGroupToggle(allPermissions.map(p => p.key), true)}>Select All</Button>
                                    <Button size="small" color="inherit" onClick={() => handleGroupToggle(allPermissions.map(p => p.key), false)}>Clear All</Button>
                                </Box>
                            </Box>
                            <Box sx={{ maxHeight: 440, overflowY: 'auto', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, p: 2, bgcolor: '#fdfdfd' }}>
                                {permissionGroups.length > 0 ? (
                                    permissionGroups.map((group) => {
                                        const groupKeys = group.permissions.map(p => p.key);
                                        const allSelected = groupKeys.every(k => formData.permissions.includes(k));
                                        const someSelected = groupKeys.some(k => formData.permissions.includes(k));
                                        
                                        return (
                                            <Box key={group.module} sx={{ mb: 3, p: 2, border: '1px solid #edf2f7', borderRadius: 2, bgcolor: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', pb: 1, mb: 1.5 }}>
                                                    <Typography variant="body2" fontWeight={700} color="primary.main">{group.module}</Typography>
                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                        {!allSelected ? (
                                                            <Button size="small" sx={{ fontSize: '0.65rem', minWidth: 'auto', py: 0.2 }} onClick={() => handleGroupToggle(groupKeys, true)}>All</Button>
                                                        ) : (
                                                            <Button size="small" color="inherit" sx={{ fontSize: '0.65rem', minWidth: 'auto', py: 0.2 }} onClick={() => handleGroupToggle(groupKeys, false)}>None</Button>
                                                        )}
                                                    </Box>
                                                </Box>
                                                <Grid container spacing={1}>
                                                    {group.permissions.map((perm) => (
                                                        <Grid item xs={12} sm={6} key={perm.key}>
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox 
                                                                        size="small" 
                                                                        checked={formData.permissions.includes(perm.key)} 
                                                                        onChange={() => handlePermissionToggle(perm.key)} 
                                                                    />
                                                                }
                                                                label={<Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{perm.label}</Typography>}
                                                            />
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </Box>
                                        );
                                    })
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100 }}>
                                        <Typography color="text.secondary">Loading structured permissions...</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>{editMode ? 'Update Role' : 'Create Role'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RolesPage;
