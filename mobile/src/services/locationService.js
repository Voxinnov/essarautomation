import * as Location from 'expo-location';

export const locationService = {
  /**
   * Request location permission and get current location coordinates + address description.
   * Falls back gracefully if permission is denied or if network requests fail.
   */
  getCurrentLocation: async () => {
    try {
      // 1. Request foreground permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission was denied');
        return {
          latitude: null,
          longitude: null,
          location_address: null,
          error: 'Permission denied',
        };
      }

      // 2. Fetch current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      let location_address = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

      // 3. Reverse geocode using OpenStreetMap Nominatim
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          {
            headers: {
              'User-Agent': 'EssarAutomationMobile/1.0',
            },
          }
        );
        const data = await response.json();
        if (data && data.display_name) {
          // Simplify address string by taking the first 3 comma-separated elements
          location_address = data.display_name.split(',').slice(0, 3).join(', ').trim();
        }
      } catch (err) {
        console.warn('OSM Reverse geocoding failed, using coordinates string:', err);
      }

      return {
        latitude: String(latitude),
        longitude: String(longitude),
        location_address,
        error: null,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return {
        latitude: null,
        longitude: null,
        location_address: null,
        error: error.message || 'Failed to get location',
      };
    }
  },

  /**
   * Fast, lightweight coordinate fetcher for interval updates.
   * Uses existing permissions and cached/last known position first.
   * Does NOT perform reverse geocoding to avoid rate limits and save data/battery.
   */
  getCurrentCoords: async () => {
    try {
      // 1. Check if permission is already granted (do NOT request or prompt)
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        return {
          latitude: null,
          longitude: null,
          error: 'Permission not granted',
        };
      }

      // 2. Get last known location first (extremely fast, no GPS wait)
      let location = await Location.getLastKnownPositionAsync();

      // 3. Fallback to current position if cached is unavailable
      if (!location) {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      if (!location || !location.coords) {
        return {
          latitude: null,
          longitude: null,
          error: 'No coordinates available',
        };
      }

      return {
        latitude: String(location.coords.latitude),
        longitude: String(location.coords.longitude),
        error: null,
      };
    } catch (error) {
      console.warn('Error fetching quick coordinates:', error);
      return {
        latitude: null,
        longitude: null,
        error: error.message || 'Failed to get coordinates',
      };
    }
  },
};

