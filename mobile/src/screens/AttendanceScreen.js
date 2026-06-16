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
} from 'react-native';
import { attendanceService } from '../services/attendanceService';
import { locationService } from '../services/locationService';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '../utils/theme';

const AttendanceScreen = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const response = await attendanceService.getToday();
      setTodayAttendance(response.data.data);
    } catch (e) {
      console.log('Error fetching attendance', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

      Alert.alert('Success', 'Checked in successfully!');
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isCheckedIn = todayAttendance && !todayAttendance.check_out_time;
  const isCheckedOut = todayAttendance && todayAttendance.check_out_time;

  useEffect(() => {
    let interval;
    if (isCheckedIn) {
      console.log('[Attendance Screen] User is checked in. Starting 30s live location update interval...');
      interval = setInterval(async () => {
        try {
          console.log('[Attendance Screen] Fetching live location coordinates...');
          const loc = await locationService.getCurrentCoords();
          if (loc.error) {
            console.warn('[Attendance Screen] Could not get live coordinates:', loc.error);
          } else {
            console.log('[Attendance Screen] Sending live location update to server...', {
              latitude: loc.latitude,
              longitude: loc.longitude,
            });
            const response = await attendanceService.updateLocation({
              latitude: loc.latitude,
              longitude: loc.longitude,
              address: null, // Keep the existing address to avoid empty geocode
            });
            console.log('[Attendance Screen] Live location updated successfully:', response.data);
          }
        } catch (e) {
          console.error('[Attendance Screen] Error updating live location:', e.message || e);
        }
      }, 30000); // Send update every 30 seconds
    } else {
      console.log('[Attendance Screen] User is not checked in. Live location interval is idle.');
    }
    return () => {
      if (interval) {
        console.log('[Attendance Screen] Clearing live location interval.');
        clearInterval(interval);
      }
    };
  }, [isCheckedIn]);


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
