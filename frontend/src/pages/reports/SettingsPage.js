import React, { useState } from 'react';
import {
    Box, Card, CardContent, TextField, Button, Typography, Alert, Grid,
    Divider, Avatar, Chip,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { authService } from '../../services';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', password: '', confirmPassword: '' });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password && form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const payload = { name: form.name, phone: form.phone };
            if (form.password) payload.password = form.password;
            const res = await authService.updateProfile(payload);
            updateUser(res.data.data);
            setSuccess('Profile updated successfully!');
            setForm(f => ({ ...f, password: '', confirmPassword: '' }));
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main" mb={3}>Settings</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center', p: 4 }}>
                            <Avatar sx={{ width: 80, height: 80, bgcolor: '#8a0303', fontSize: 32, mx: 'auto', mb: 2 }}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="h6" fontWeight={600}>{user?.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                            <Chip label={user?.role} color="primary" sx={{ mt: 1 }} />
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ textAlign: 'left' }}>
                                {[['Email', user?.email], ['Phone', user?.phone || '-'], ['Role', user?.role], ['Status', user?.status]].map(([k, v]) => (
                                    <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f0f0f0' }}>
                                        <Typography variant="body2" color="text.secondary">{k}:</Typography>
                                        <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>{v}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={600} mb={3}>Update Profile</Typography>
                            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Email" value={user?.email} disabled helperText="Email cannot be changed" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12}><Divider><Typography variant="caption" color="text.secondary">Change Password (optional)</Typography></Divider></Grid>
                                    <Grid item xs={6}>
                                        <TextField fullWidth label="New Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField fullWidth label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving} sx={{ px: 4 }}>
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SettingsPage;
