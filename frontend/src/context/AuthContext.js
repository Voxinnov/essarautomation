import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setPermissions(parsedUser.permissions || []);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await authService.login({ email, password });
        const { token, data } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        setPermissions(data.permissions || []);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setPermissions([]);
    };

    const updateUser = (userData) => {
        setUser(userData);
        setPermissions(userData.permissions || []);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // Client-side helper check: Admins automatically bypass check for global safety/simplicity
    const hasPermission = (permissionKey) => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        return permissions.includes(permissionKey);
    };

    return (
        <AuthContext.Provider value={{ user, permissions, loading, login, logout, updateUser, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
