import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Drawer, AppBar, Toolbar, List, Typography, Divider,
    IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Avatar, Menu, MenuItem, Chip, Tooltip, useTheme, useMediaQuery,
} from '@mui/material';
import {
    Dashboard, Assignment, People, LocalHospital, MedicalServices,
    Update, AccessTime, Receipt, AttachMoney, Report, Settings,
    Menu as MenuIcon, Logout, AccountCircle, Notifications,
    ChevronLeft, Business,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;

const navItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Tasks', icon: <Assignment />, path: '/tasks' },
    { text: 'Clients', icon: <People />, path: '/clients' },
    { text: 'Hospitals', icon: <LocalHospital />, path: '/hospitals' },
    { text: 'Doctors', icon: <MedicalServices />, path: '/doctors' },
    { text: 'Work Updates', icon: <Update />, path: '/work-updates' },
    { text: 'Time Tracking', icon: <AccessTime />, path: '/time-tracking' },
    { text: 'Billing', icon: <Receipt />, path: '/billing' },
    { text: 'Expenses', icon: <AttachMoney />, path: '/expenses' },
    { text: 'Reports', icon: <Report />, path: '/reports' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
];

const DashboardLayout = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleLogout = () => { logout(); navigate('/login'); };

    const getRoleColor = (role) => ({ admin: 'error', manager: 'warning', staff: 'primary' })[role] || 'default';

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #8a0303 0%, #5a0000 100%)' }}>
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 100 100" fill="white">
                        <path d="M15,10 H90 V30 H45 V40 H80 V60 H45 V70 H90 V90 H15 Z" />
                    </svg>
                </Box>
                <Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2, fontSize: '1rem' }}>
                        ESSAR
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5 }}>
                        ENGINEERS
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            <Box sx={{ p: 2, mt: 1 }}>
                <Box sx={{ background: 'rgba(255,255,255,0.1)', borderRadius: 2, p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 700 }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>{user?.name}</Typography>
                        <Chip label={user?.role} size="small" color={getRoleColor(user?.role)} sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, mt: 0.3 }} />
                    </Box>
                </Box>
            </Box>

            <List sx={{ flex: 1, px: 1.5, py: 0 }}>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.3 }}>
                            <ListItemButton
                                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                                sx={{
                                    borderRadius: 2,
                                    py: 1,
                                    color: isActive ? '#8a0303' : 'rgba(255,255,255,0.8)',
                                    bgcolor: isActive ? 'white' : 'transparent',
                                    '&:hover': { bgcolor: isActive ? 'white' : 'rgba(255,255,255,0.1)', color: isActive ? '#8a0303' : 'white' },
                                    transition: 'all 0.2s',
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 700 : 500 }} />
                                {isActive && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#8a0303' }} />}
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Box sx={{ p: 2 }}>
                <ListItemButton
                    onClick={handleLogout}
                    sx={{ borderRadius: 2, color: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' } }}
                >
                    <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}><Logout /></ListItemIcon>
                    <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Drawer */}
            <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: 0 }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' } }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' } }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* AppBar */}
                <AppBar
                    position="sticky"
                    elevation={0}
                    sx={{ bgcolor: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)', color: 'text.primary' }}
                >
                    <Toolbar>
                        <IconButton edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, color: '#8a0303' }}>
                            {navItems.find(n => location.pathname.startsWith(n.path))?.text || 'Dashboard'}
                        </Typography>
                        <Tooltip title="Notifications">
                            <IconButton sx={{ mr: 1 }}>
                                <Notifications />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Profile">
                            <IconButton onClick={handleMenuOpen}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#8a0303', fontSize: 14 }}>
                                    {user?.name?.charAt(0).toUpperCase()}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
                            <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
                                <AccountCircle sx={{ mr: 1 }} /> Profile
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                <Logout sx={{ mr: 1 }} /> Logout
                            </MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>

                {/* Page content */}
                <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 3 } }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default DashboardLayout;
