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
};
