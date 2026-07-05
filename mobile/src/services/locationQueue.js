import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'location_sync_queue';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://essaram.bvox.in/api';
let isSyncing = false;

export const locationQueue = {
  /**
   * Queue a location update for syncing.
   * Coordinates are stored as numbers.
   * Timestamp is in ISO format.
   */
  queueLocation: async (latitude, longitude) => {
    try {
      const latNum = parseFloat(latitude);
      const lngNum = parseFloat(longitude);

      if (isNaN(latNum) || isNaN(lngNum)) {
        console.warn('[Location Queue] Invalid coordinates, ignoring queue attempt:', latitude, longitude);
        return;
      }

      const item = {
        latitude: latNum,
        longitude: lngNum,
        timestamp: new Date().toISOString(),
      };

      const existingStr = await AsyncStorage.getItem(QUEUE_KEY);
      const queue = existingStr ? JSON.parse(existingStr) : [];
      queue.push(item);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      
      console.log('[Location Queue] Queued location update:', item);
      console.log(`[Location Queue] Queue length is now: ${queue.length}`);

      // Attempt to sync
      await locationQueue.syncQueue();
    } catch (error) {
      console.error('[Location Queue] Error queueing location:', error);
    }
  },

  /**
   * Synchronize the queued location updates with the backend sequentially.
   * If offline or server is down, stops processing to preserve order.
   * Drops items that fail with client validation error (400) to avoid blocking the queue.
   */
  syncQueue: async () => {
    if (isSyncing) {
      console.log('[Location Queue] Sync already in progress, skipping.');
      return;
    }

    isSyncing = true;
    console.log('[Location Queue] Starting queue sync...');

    try {
      let run = true;
      while (run) {
        const existingStr = await AsyncStorage.getItem(QUEUE_KEY);
        const queue = existingStr ? JSON.parse(existingStr) : [];

        if (queue.length === 0) {
          console.log('[Location Queue] Sync complete. Queue is empty.');
          run = false;
          break;
        }

        const item = queue[0];
        console.log(`[Location Queue] Syncing oldest item (${queue.length} left):`, item);

        try {
          // Send location update directly using fetch (NOT axios/api.js) so it works in background tasks
          // where SecureStore is unavailable. Token is read from AsyncStorage instead.
          const token = await AsyncStorage.getItem('userToken');
          if (!token) {
            console.warn('[Location Queue] No auth token found in AsyncStorage. Skipping sync.');
            run = false;
            break;
          }

          const response = await fetch(`${BASE_URL}/attendance/update-location`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              latitude: item.latitude,
              longitude: item.longitude,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const err = { response: { status: response.status, data: errorData } };
            throw err;
          }

          console.log('[Location Queue] Successfully synced location item.');

          // Successfully synced, remove from queue
          queue.shift();
          await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
        } catch (error) {
          console.error('[Location Queue] API sync failed for item:', item, error.message);

          if (error.response) {
            const status = error.response.status;
            console.error(`[Location Queue] Server responded with status: ${status}`, error.response.data);

            // 400 Bad Request, 422 Unprocessable, or 404: non-recoverable client/validation error.
            // Also handle 401 Unauthorized if the user's session is expired, but we shouldn't discard
            // unless they logout. However, if it's 400 validation error (like incorrect coordinates range
            // or NOT checked in), we discard to avoid blocking.
            if (status === 400 || status === 422 || status === 404) {
              console.warn('[Location Queue] Non-recoverable error. Dropping item to prevent blocking.');
              queue.shift();
              await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
              continue; // Process next item
            }
          }

          // Otherwise, it is a network error (offline, timeout) or 5xx server error.
          // Stop queue processing immediately to preserve chronological order!
          console.log('[Location Queue] Halting sync processing to preserve chronological order.');
          run = false;
          break;
        }
      }
    } catch (e) {
      console.error('[Location Queue] Critical error during sync:', e);
    } finally {
      isSyncing = false;
    }
  },

  /**
   * Helper to check the current queue length.
   */
  getQueueLength: async () => {
    try {
      const existingStr = await AsyncStorage.getItem(QUEUE_KEY);
      const queue = existingStr ? JSON.parse(existingStr) : [];
      return queue.length;
    } catch (e) {
      return 0;
    }
  },

  /**
   * Clear the local queue (e.g. on logout or reset)
   */
  clearQueue: async () => {
    try {
      await AsyncStorage.removeItem(QUEUE_KEY);
      console.log('[Location Queue] Local location queue cleared.');
    } catch (e) {
      console.error('[Location Queue] Error clearing queue:', e);
    }
  }
};
