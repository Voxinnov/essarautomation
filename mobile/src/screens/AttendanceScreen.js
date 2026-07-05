import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
  AppState,
  Platform,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { attendanceService } from '../services/attendanceService';
import { locationService } from '../services/locationService';
import { backgroundLocationService } from '../services/backgroundLocationService';
import { locationQueue } from '../services/locationQueue';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '../utils/theme';

const AttendanceScreen = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTodayAttendance();

    // Monitor AppState to sync queued location updates when app returns to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('[Attendance Screen] App returned to foreground. Syncing queued locations...');
        locationQueue.syncQueue();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const response = await attendanceService.getToday();
      const attendance = response.data.data;
      setTodayAttendance(attendance);

      // Save local check-in status for the background task to reference
      const isCheckedIn = attendance && !attendance.check_out_time;
      await AsyncStorage.setItem('isCheckedIn', isCheckedIn ? 'true' : 'false');

      if (isCheckedIn) {
        // Trigger background location task start if not already active
        await startBackgroundTrackingFlow();
      } else {
        // Stop background location updates
        await backgroundLocationService.stopTracking();
      }
    } catch (e) {
      console.log('Error fetching attendance', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const startBackgroundTrackingFlow = async () => {
    const hasPermission = await locationService.requestBackgroundLocationPermissions();
    if (hasPermission) {
      await backgroundLocationService.startTracking();
      // Try to sync any remaining queued locations
      locationQueue.syncQueue();
    } else {
      Alert.alert(
        'Background Location Required',
        'Allowing background location access "All the time" is required to track your attendance during your shift. Please update this in the application settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            } 
          }
        ]
      );
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTodayAttendance();
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const loc = await locationService.getCurrentLocation();
      if (loc.error) {
        Alert.alert('Location Error', loc.error);
        setActionLoading(false);
        return;
      }

      await attendanceService.checkIn({
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.location_address,
      });

      // Save local check-in status
      await AsyncStorage.setItem('isCheckedIn', 'true');

      Alert.alert('Success', 'Checked in successfully!');
      
      // Start background tracking
      await startBackgroundTrackingFlow();
      
      fetchTodayAttendance();
    } catch (e) {
      console.log('Error checking in', e);
      Alert.alert('Error', e.response?.data?.message || 'Failed to check in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const loc = await locationService.getCurrentLocation();
      if (loc.error) {
        Alert.alert('Location Error', loc.error);
        setActionLoading(false);
        return;
      }

      await attendanceService.checkOut({
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.location_address,
      });

      // Save local check-in status
      await AsyncStorage.setItem('isCheckedIn', 'false');

      // Stop background tracking
      await backgroundLocationService.stopTracking();

      // Clear sync queue since shift ended
      await locationQueue.clearQueue();

      Alert.alert('Success', 'Checked out successfully!');
      fetchTodayAttendance();
    } catch (e) {
      console.log('Error checking out', e);
      Alert.alert('Error', e.response?.data?.message || 'Failed to check out');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Derived state — must be computed before any hooks
  const isCheckedIn = todayAttendance && !todayAttendance.check_out_time;
  const isCheckedOut = todayAttendance && todayAttendance.check_out_time;

  // Foreground watcher — must be declared before early return to comply with Rules of Hooks
  useEffect(() => {
    let subscription;

    const startForegroundWatching = async () => {
      try {
        console.log('[Attendance Screen] Starting foreground position watcher...');
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 30000, // 30 seconds
            distanceInterval: 0, // Update even if stationary
          },
          (location) => {
            const { latitude, longitude } = location.coords;
            console.log('[Attendance Screen Foreground] Received coordinates:', latitude, longitude);
            locationQueue.queueLocation(latitude, longitude);
          }
        );
      } catch (err) {
        console.warn('[Attendance Screen] Error starting foreground watcher:', err);
      }
    };

    if (isCheckedIn) {
      startForegroundWatching();
    }

    return () => {
      if (subscription) {
        console.log('[Attendance Screen] Removing foreground position watcher...');
        subscription.remove();
      }
    };
  }, [isCheckedIn]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Attendance</Text>
        <Text style={styles.dateText}>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>

        <View style={styles.statusRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Check In</Text>
            <Text style={styles.timeValue}>{todayAttendance ? formatTime(todayAttendance.check_in_time) : '--:--'}</Text>
            {todayAttendance?.check_in_address && (
              <Text style={styles.addressText} numberOfLines={2}>📍 {todayAttendance.check_in_address}</Text>
            )}
          </View>

          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Check Out</Text>
            <Text style={styles.timeValue}>{todayAttendance?.check_out_time ? formatTime(todayAttendance.check_out_time) : '--:--'}</Text>
            {todayAttendance?.check_out_address && (
              <Text style={styles.addressText} numberOfLines={2}>📍 {todayAttendance.check_out_address}</Text>
            )}
          </View>
        </View>

        {todayAttendance?.total_hours && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Hours Today:</Text>
            <Text style={styles.summaryValue}>{parseFloat(todayAttendance.total_hours).toFixed(2)} hrs</Text>
          </View>
        )}
      </View>

      <View style={styles.actionContainer}>
        {!isCheckedIn && !isCheckedOut && (
          <TouchableOpacity 
            style={[styles.button, styles.checkInButton, actionLoading && styles.buttonDisabled]} 
            onPress={handleCheckIn}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color={COLORS.textWhite} />
            ) : (
              <Text style={styles.buttonText}>Check In</Text>
            )}
          </TouchableOpacity>
        )}

        {isCheckedIn && (
          <TouchableOpacity 
            style={[styles.button, styles.checkOutButton, actionLoading && styles.buttonDisabled]} 
            onPress={handleCheckOut}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color={COLORS.textWhite} />
            ) : (
              <Text style={styles.buttonText}>Check Out</Text>
            )}
          </TouchableOpacity>
        )}

        {isCheckedOut && (
          <View style={styles.completedMessage}>
            <Text style={styles.completedText}>You have completed your attendance for today.</Text>
          </View>
        )}
      </View>
      <Text style={styles.locationHint}>
        📍 Your location is captured automatically on check-in and check-out.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  timeBlock: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  addressText: {
    fontSize: 10,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.success,
  },
  actionContainer: {
    marginBottom: SPACING.lg,
  },
  button: {
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  checkInButton: {
    backgroundColor: COLORS.success,
  },
  checkOutButton: {
    backgroundColor: COLORS.error,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: '800',
  },
  completedMessage: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  completedText: {
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  locationHint: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.lg,
  },
});

export default AttendanceScreen;
