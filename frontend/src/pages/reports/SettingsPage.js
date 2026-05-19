import React, { useState } from 'react';
import {
    Box, Card, CardContent, TextField, Button, Typography, Alert, Grid,
    Divider, Avatar, Chip,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { authService, companyProfileService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { FormControlLabel, Switch, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const SettingsPage = () => {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', password: '', confirmPassword: '' });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const [companyProfile, setCompanyProfile] = useState({
        company_name: '', country: '', city: '', pin_code: '', email: '', phone: '',
        service_tax_no: '', tax_inclusive_rates: false, default_currency: 'INR',
        state: '', address_line_1: '', address_line_2: '', website: '', taxation_type: '', contact_name: ''
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [savingCompany, setSavingCompany] = useState(false);
    
    React.useEffect(() => {
        const fetchCompanyProfile = async () => {
            try {
                const res = await companyProfileService.get();
                if (res.data.data) {
                    setCompanyProfile(res.data.data);
                    if (res.data.data.logo) {
                        setLogoPreview(`${(process.env.REACT_APP_API_URL || '/api')}/uploads/${res.data.data.logo}`);
                    }
                }
            } catch (err) {
                console.error("Failed to load company profile", err);
            }
        };
        fetchCompanyProfile();
    }, []);

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

    const handleCompanySubmit = async (e) => {
        e.preventDefault();
        setSavingCompany(true);
        setError('');
        try {
            const formData = new FormData();
            Object.keys(companyProfile).forEach(key => {
                if (key !== 'logo' && companyProfile[key] !== null) {
                    formData.append(key, companyProfile[key]);
                }
            });
            if (logoFile) {
                formData.append('logo', logoFile);
            }
            
            const res = await companyProfileService.update(formData);
            if (res.data.data.logo) {
                setLogoPreview(`${(process.env.REACT_APP_API_URL || '/api')}/uploads/${res.data.data.logo}`);
            }
            setSuccess('Company profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update company profile');
        } finally {
            setSavingCompany(false);
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

                    {/* Company Settings */}
                    <Card sx={{ mt: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={600} mb={3}>Company Profile</Typography>
                            <form onSubmit={handleCompanySubmit}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth size="small" label="Company name" placeholder="Enter name" value={companyProfile.company_name || ''} onChange={(e) => setCompanyProfile({ ...companyProfile, company_name: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Default currency</InputLabel>
                                            <Select label="Default currency" value={companyProfile.default_currency || 'INR'} onChange={(e) => setCompanyProfile({ ...companyProfile, default_currency: e.target.value })}>
                                                <MenuItem value="INR">INR</MenuItem>
                                                <MenuItem value="USD">USD</MenuItem>
                                                <MenuItem value="EUR">EUR</MenuItem>
                                                <MenuItem value="AED">AED</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth size="small" label="Country" value={companyProfile.country || ''} onChange={(e) => setCompanyProfile({ ...companyProfile, country: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth size="small" label="State" value={companyProfile.state || ''} onChange={(e) => setCompanyProfile({ ...companyProfile, state: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth size="small" label="City" value={companyProfile.city || ''} onChange={(e) => setCompanyProfile({ ...companyProfile, city: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth size="small" label="Address line 1" multiline rows={2} value={companyProfile.address_line_1 || ''} onChange={(e) => setCompanyProfile({ ...companyProfile, address_line_1: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth size="small" label="PIN / ZIP Code" value={companyProfile.pin_code || ''} onChange={(e) => setCompanyProfile({ ...companyProfile, pin_code: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth size="small" label="Address line 2" multiline rows={2} value={companyProfile.address_line_2 || ''} onChange={(e) => setCompanyProfile({ ...companyProfile, address_line_2: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth size="small" label="Email" placeholder="Enter email" value={companyProfile.email || ''} onChange={(e) => setCompanyProfile({ ...companyProfile, email: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth size="small" label="Website" placeholder="Enter website" value={companyProfile.website || ''} onChange={(e) => setCompanyProfile({ ...companyProfile, website: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth size="small" label="Phone" placeholder="Enter phone" value={companyProfile.phone || ''} onChange={(e) => setCompanyProfile({ ...companyProfile, phone: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Taxation type</InputLabel>
                                            <Select label="Taxation type" value={companyProfile.taxation_type || ''} onChange={(e) => setCompanyProfile({ ...companyProfile, taxation_type: e.target.value })}>
                                                <MenuItem value="GST">GST</MenuItem>
                                                <MenuItem value="Non-GST (International)">Non-GST (International)</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth size="small" label="Service Tax No." placeholder="Enter service tax" value={companyProfile.service_tax_no || ''} onChange={(e) => setCompanyProfile({ ...companyProfile, service_tax_no: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth size="small" label="Contact name" placeholder="Enter contact name" value={companyProfile.contact_name || ''} onChange={(e) => setCompanyProfile({ ...companyProfile, contact_name: e.target.value })} />
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <FormControlLabel
                                            control={<Switch checked={companyProfile.tax_inclusive_rates} onChange={(e) => setCompanyProfile({ ...companyProfile, tax_inclusive_rates: e.target.checked })} />}
                                            label="Tax inclusive rates"
                                        />
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body2" color="text.secondary" mb={1}>Upload Logo</Typography>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    setLogoFile(e.target.files[0]);
                                                    setLogoPreview(URL.createObjectURL(e.target.files[0]));
                                                }
                                            }}
                                            style={{ display: 'block', marginBottom: '10px' }}
                                        />
                                        {logoPreview && (
                                            <Box sx={{ mt: 2 }}>
                                                <img src={logoPreview} alt="Logo Preview" style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain' }} />
                                            </Box>
                                        )}
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Button type="submit" variant="contained" startIcon={<Save />} disabled={savingCompany} sx={{ px: 4, mt: 2 }}>
                                            {savingCompany ? 'Saving...' : 'Save Company Profile'}
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
