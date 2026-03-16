import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Card, CardContent, TextField, Button, Typography,
    InputAdornment, IconButton, Alert, CircularProgress,
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Business } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form.email, form.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #8a0303 0%, #5a0000 40%, #455a64 100%)',
            p: 2,
        }}>
            {/* Background decoration */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 }}>
                {[...Array(5)].map((_, i) => (
                    <Box key={i} sx={{
                        position: 'absolute',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)',
                        width: `${(i + 1) * 120}px`,
                        height: `${(i + 1) * 120}px`,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        transform: 'translate(-50%, -50%)',
                    }} />
                ))}
            </Box>

            <Card sx={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1, borderRadius: 3, overflow: 'hidden' }}>
                {/* Top accent bar */}
                <Box sx={{ height: 6, background: 'linear-gradient(90deg, #8a0303, #455a64)' }} />

                <CardContent sx={{ p: 4 }}>
                    {/* Logo section */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box sx={{
                            width: 72, height: 72, borderRadius: 3,
                            background: 'linear-gradient(135deg, #8a0303, #c13b2b)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            mx: 'auto', mb: 2, boxShadow: '0 8px 24px rgba(26,35,126,0.3)',
                        }}>
                            <svg width="40" height="40" viewBox="0 0 100 100" fill="white">
                                <path d="M15,10 H90 V30 H45 V40 H80 V60 H45 V70 H90 V90 H15 Z" />
                            </svg>
                        </Box>
                        <Typography variant="h4" fontWeight={700} color="primary.main">Welcome</Typography>
                        <Typography variant="body2" color="text.secondary" mt={0.5} sx={{ letterSpacing: 1 }}>
                            ESSAR ENGINEERS
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            sx={{ mb: 2.5 }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Email color="primary" /></InputAdornment>,
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPass ? 'text' : 'password'}
                            value={form.password}
                            onChange={handleChange}
                            required
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Lock color="primary" /></InputAdornment>,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                                            {showPass ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                py: 1.5, fontSize: '1rem',
                                background: 'linear-gradient(90deg, #8a0303, #c13b2b)',
                                '&:hover': { background: 'linear-gradient(90deg, #5a0000, #8a0303)' },
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>
                    </form>

                    <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(26,35,126,0.05)', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Default Admin Credentials:</Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                            Email: admin@office.com &nbsp;|&nbsp; Password: admin123
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default LoginPage;
