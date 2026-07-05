import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in
  const checkLogin = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        // Fetch user profile
        const response = await api.get('/auth/profile');
        setUser(response.data.data);
      }
    } catch (e) {
      console.log('Error checking login', e);
      // Token might be invalid
      await SecureStore.deleteItemAsync('userToken');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('Login API response:', response.data);
      const token = response.data.token;
      // The live server might return user data in .data or .user
      const userData = response.data.data || response.data.user || { email, role: 'staff' };
      
      console.log('Saving token...');
      if (token) {
        await SecureStore.setItemAsync('userToken', token);
        // Mirror to AsyncStorage so background tasks can access it
        await AsyncStorage.setItem('userToken', token);
      }
      console.log('Setting user state...', userData);
      setUser(userData);
      console.log('Login function complete');
      return { success: true };
    } catch (e) {
      console.log('Login error caught in AuthContext:', e);
      return { success: false, error: e.response?.data?.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      // Clear AsyncStorage mirror too
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('isCheckedIn');
      setUser(null);
    } catch (e) {
      console.log('Logout error', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
