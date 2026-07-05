import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { locationQueue } from './locationQueue';

export const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('[Background Location Task] Error:', error);
    return;
  }
  
  if (!data) return;
  
  try {
    // 1. Read check-in state and token from AsyncStorage (SecureStore is NOT available in background tasks)
    const token = await AsyncStorage.getItem('userToken');
    const isCheckedIn = await AsyncStorage.getItem('isCheckedIn');
    
    // If not checked in or not logged in, stop the background tracking to save battery!
    if (!token || isCheckedIn !== 'true') {
      console.log('[Background Location Task] User is not checked in or not authenticated. Stopping background location updates...');
      try {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
        if (hasStarted) {
          await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
          console.log('[Background Location Task] Background tracking stopped successfully.');
        }
      } catch (stopError) {
        console.error('[Background Location Task] Error stopping background location updates:', stopError);
      }
      return;
    }

    const { locations } = data;
    if (locations && locations.length > 0) {
      const location = locations[0];
      const { latitude, longitude } = location.coords;
      console.log('[Background Location Task] Captured location:', { latitude, longitude, timestamp: location.timestamp });
      
      // Send location update to the queue (which handles queueing and background syncing)
      await locationQueue.queueLocation(latitude, longitude);
    }
  } catch (err) {
    console.error('[Background Location Task] General error in background task:', err);
  }
});

export const backgroundLocationService = {
  /**
   * Start tracking in the background
   */
  startTracking: async () => {
    try {
      // Check if already tracking
      const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (isTracking) {
        console.log('[Background Location Service] Background location updates already started.');
        return true;
      }

      console.log('[Background Location Service] Starting background location updates...');
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 30000, // 30 seconds tracking interval
        distanceInterval: 0,  // Update even if stationary
        foregroundService: {
          notificationTitle: 'Essar Tracker Active',
          notificationBody: 'Tracking location for attendance in the background.',
          notificationColor: '#007bff',
        },
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
      });

      console.log('[Background Location Service] Background location updates started successfully.');
      return true;
    } catch (e) {
      console.error('[Background Location Service] Failed to start background location updates:', e);
      return false;
    }
  },

  /**
   * Stop tracking in the background
   */
  stopTracking: async () => {
    try {
      const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (!isTracking) {
        console.log('[Background Location Service] Background location updates not active.');
        return true;
      }

      console.log('[Background Location Service] Stopping background location updates...');
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('[Background Location Service] Background location updates stopped successfully.');
      return true;
    } catch (e) {
      console.error('[Background Location Service] Failed to stop background location updates:', e);
      return false;
    }
  },

  /**
   * Check if tracking is active
   */
  isTrackingActive: async () => {
    try {
      return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    } catch (e) {
      return false;
    }
  }
};
