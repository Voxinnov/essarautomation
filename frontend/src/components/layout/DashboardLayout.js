import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Drawer, AppBar, Toolbar, List, Typography, Divider,
    IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Avatar, Menu, MenuItem, Chip, Tooltip, useTheme, useMediaQuery,
    Collapse, Badge, Button
} from '@mui/material';
import {
    Dashboard, Assignment, People, LocalHospital, MedicalServices,
    Update, AccessTime, Receipt, AttachMoney, Report, Settings,
    Menu as MenuIcon, Logout, AccountCircle, Notifications,
    ChevronLeft, Business, Inventory, SupervisorAccount, AdminPanelSettings,
    ExpandLess, ExpandMore, ListAlt, AccountBalance, Description, Fingerprint,
    EventNote
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services';

const DRAWER_WIDTH = 260;

const navItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', permission: 'dashboard_view' },
    { text: 'Tasks', icon: <Assignment />, path: '/tasks', permission: 'tasks_view' },
    { text: 'Clients', icon: <People />, path: '/clients', permission: 'clients_view' },
    { text: 'Hospitals', icon: <LocalHospital />, path: '/hospitals', permission: 'hospitals_view' },
    { text: 'Doctors', icon: <MedicalServices />, path: '/doctors', permission: 'doctors_view' },
    { text: 'Work Updates', icon: <Update />, path: '/work-updates', permission: 'work_updates_view' },
    { text: 'Time Tracking', icon: <AccessTime />, path: '/time-tracking', permission: 'time_tracking_view' },
    { text: 'Attendance', icon: <Fingerprint />, path: '/attendance', permission: 'attendance_view' },
    { text: 'Leave Requests', icon: <EventNote />, path: '/leaves', permission: 'leaves_view' },
    { text: 'Billing', icon: <Receipt />, path: '/billing', permission: 'billing_view' },
    { text: 'Proforma Invoices', icon: <Description />, path: '/proforma', permission: 'proforma_view' },
    { text: 'Expenses', icon: <AttachMoney />, path: '/expenses', permission: 'expenses_view' },
    { text: 'Stock Management', icon: <Inventory />, path: '/stock', permission: 'stock_view' },
    { text: 'Reports', icon: <Report />, path: '/reports', permission: 'reports_view' },
    { text: 'Users', icon: <SupervisorAccount />, path: '/users', permission: 'users_manage' },
    { text: 'Roles', icon: <AdminPanelSettings />, path: '/role-management', permission: 'roles_manage' },
    { 
        text: 'Settings', 
        icon: <Settings />, 
        path: '/settings',
        permission: 'settings_view',
        children: [
            { text: 'Profile', icon: <AccountCircle />, path: '/settings' },
            { text: 'Status Management', icon: <ListAlt />, path: '/settings/status', adminOnly: true },
            { text: 'Bank Accounts', icon: <AccountBalance />, path: '/settings/bank-accounts', adminOnly: true },
        ]
    },
];


const DashboardLayout = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openSubMenu, setOpenSubMenu] = useState({}); // Tracking which submenu is open
    const { user, logout, hasPermission } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
    const handleNotificationOpen = (e) => setNotificationAnchorEl(e.currentTarget);
    const handleNotificationClose = () => setNotificationAnchorEl(null);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await notificationService.getAll({ limit: 10 });
            setNotifications(res.data.data);
            setUnreadCount(res.data.unreadCount || 0);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    }, [user]);

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.read) {
                await notificationService.markRead(notification.id);
                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            handleNotificationClose();
            
            // Navigate if related to a task
            if (notification.data && notification.data.taskId) {
                navigate(`/tasks`);
            }
        } catch (err) {
            console.error('Failed to read notification', err);
        }
    };

    useEffect(() => {
        if (!user) return;

        fetchNotifications();

        // Check and request native browser notification permissions
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (window.Notification.permission === 'default') {
                window.Notification.requestPermission();
            }
        }

        const streamUrl = notificationService.getStreamUrl();
        const es = new EventSource(streamUrl);

        es.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.connected) return;

            setNotifications(prev => [data, ...prev].slice(0, 10));
            setUnreadCount(prev => prev + 1);

            // Browser desktop push alert
            if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
                new window.Notification(data.title, {
                    body: data.message,
                });
                
                try {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav');
                    audio.volume = 0.5;
                    audio.play();
                } catch(e) {}
            }
        };

        es.onerror = () => {
            console.warn('SSE connection lost, reconnecting...');
        };

        return () => {
            es.close();
        };
    }, [user, fetchNotifications]);
    const handleMenuClose = () => setAnchorEl(null);
    const handleLogout = () => { logout(); navigate('/login'); };

    const toggleSubMenu = (text) => {
        setOpenSubMenu(prev => ({ ...prev, [text]: !prev[text] }));
    };

    const getRoleColor = (role) => ({ admin: 'error', manager: 'warning', staff: 'primary' })[role] || 'default';

    const renderNavItem = (item, isChild = false) => {
        if (item.adminOnly && user?.role !== 'admin') return null;
        if (item.permission && !hasPermission(item.permission)) return null;

        const hasChildren = item.children && item.children.length > 0;
        // Filter out unauthorized children dynamically so parent container acts accordingly
        const authorizedChildren = hasChildren 
            ? item.children.filter(child => (!child.adminOnly || user?.role === 'admin') && (!child.permission || hasPermission(child.permission)))
            : [];
        
        // If parent has children defined but all are unauthorized/hidden, suppress dropdown behavior or hide parent entirely if appropriate
        const actuallyHasChildren = authorizedChildren.length > 0;

        const isOpen = openSubMenu[item.text] || location.pathname.startsWith(item.path);
        const isActive = location.pathname === item.path || (actuallyHasChildren && location.pathname.startsWith(item.path));

        return (
            <React.Fragment key={item.text}>
                <ListItem disablePadding sx={{ mb: 0.3 }}>
                    <ListItemButton
                        onClick={() => {
                            if (actuallyHasChildren) {
                                toggleSubMenu(item.text);
                            } else {
                                navigate(item.path);
                                if (isMobile) setMobileOpen(false);
                            }
                        }}
                        sx={{
                            borderRadius: 2,
                            py: 1,
                            pl: isChild ? 4 : 2,
                            color: isActive ? (isChild ? 'white' : '#8a0303') : 'rgba(255,255,255,0.8)',
                            bgcolor: isActive ? (isChild ? 'rgba(255,255,255,0.1)' : 'white') : 'transparent',
                            '&:hover': { 
                                bgcolor: isActive ? (isChild ? 'rgba(255,255,255,0.2)' : 'white') : 'rgba(255,255,255,0.1)', 
                                color: isActive ? (isChild ? 'white' : '#8a0303') : 'white' 
                            },
                            transition: 'all 0.2s',
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{item.icon}</ListItemIcon>
                        <ListItemText 
                            primary={item.text} 
                            primaryTypographyProps={{ fontSize: isChild ? '0.8rem' : '0.875rem', fontWeight: isActive ? 700 : 500 }} 
                        />
                        {actuallyHasChildren && (isOpen ? <ExpandLess /> : <ExpandMore />)}
                        {isActive && !actuallyHasChildren && !isChild && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#8a0303' }} />}
                    </ListItemButton>
                </ListItem>
                {actuallyHasChildren && (
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {authorizedChildren.map(child => renderNavItem(child, true))}
                        </List>
                    </Collapse>
                )}
            </React.Fragment>
        );
    };

    const drawer = (
        <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* ... (keep branding and user profile sections) ... */}
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
                {navItems.map(item => renderNavItem(item))}
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
                    PaperProps={{
                        sx: {
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            border: 'none',
                            borderRadius: '0 !important',
                            margin: '0 !important',
                            height: '100% !important'
                        }
                    }}
                    sx={{ display: { xs: 'block', md: 'none' } }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    PaperProps={{
                        sx: {
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            border: 'none',
                            borderRadius: '0 !important',
                            margin: '0 !important',
                            height: '100% !important'
                        }
                    }}
                    sx={{ display: { xs: 'none', md: 'block' } }}
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
                            <IconButton sx={{ mr: 1 }} onClick={handleNotificationOpen}>
                                <Badge badgeContent={unreadCount} color="error">
                                    <Notifications />
                                </Badge>
                            </IconButton>
                        </Tooltip>
                        
                        {/* Notifications Dropdown Menu */}
                        <Menu
                            anchorEl={notificationAnchorEl}
                            open={Boolean(notificationAnchorEl)}
                            onClose={handleNotificationClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            PaperProps={{
                                sx: { width: 320, maxHeight: 400, borderRadius: 2, mt: 1.5 }
                            }}
                        >
                            <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle2" fontWeight={700}>Notifications</Typography>
                                {unreadCount > 0 && (
                                    <Button size="small" variant="text" onClick={handleMarkAllRead} sx={{ fontSize: '0.75rem', py: 0 }}>
                                        Mark all read
                                    </Button>
                                )}
                            </Box>
                            <Divider />
                            {notifications.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">No notifications yet</Typography>
                                </Box>
                            ) : (
                                notifications.map((n) => (
                                    <MenuItem
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        sx={{
                                            whiteSpace: 'normal',
                                            bgcolor: n.read ? 'transparent' : 'action.hover',
                                            borderBottom: '1px solid rgba(0,0,0,0.04)',
                                            py: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            gap: 0.3,
                                            '&:hover': { bgcolor: 'action.selected' }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                            <Typography variant="subtitle2" fontWeight={n.read ? 600 : 800} fontSize="0.8rem" color="text.primary">
                                                {n.title}
                                            </Typography>
                                            {!n.read && (
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                            )}
                                        </Box>
                                        <Typography variant="body2" fontSize="0.75rem" color="text.secondary" sx={{ wordBreak: 'break-word', width: '100%' }}>
                                            {n.message}
                                        </Typography>
                                        <Typography variant="caption" fontSize="0.65rem" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {new Date(n.created_at || n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </Typography>
                                    </MenuItem>
                                ))
                            )}
                        </Menu>
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
