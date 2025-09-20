// src/services/__tests__/LocationTrackingService.test.ts
import { LocationTrackingService } from '../services/LocationTrackingService';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';
import * as turf from '@turf/turf';

const MOCK_STREET_DATA = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      id: 'street_123',
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [23.3219, 42.6977],
          [23.3225, 42.6983],
        ],
      },
      properties: {
        name: 'Test Street',
        highway: 'residential',
      },
    },
    {
      type: 'Feature' as const,
      id: 'street_456',
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [23.3240, 42.6990],
          [23.3246, 42.6996],
        ],
      },
      properties: {
        name: 'Another Street',
        highway: 'secondary',
      },
    },
  ],
};

const MOCK_COORDS = {
  onStreet123: { latitude: 42.6977, longitude: 23.3219 },
  onStreet456: { latitude: 42.6990, longitude: 23.3240 },
  betweenStreets: { latitude: 42.6985, longitude: 23.3230 },
};

describe('LocationTrackingService', () => {
  let service: LocationTrackingService;
  
  beforeEach(() => {
    // Reset singleton
    (LocationTrackingService as any).instance = null;
    service = LocationTrackingService.getInstance();
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock responses
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    
    (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    
    (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    
    (apiService.fetchUser as jest.Mock).mockResolvedValue({ activeHours: 0 });
    (apiService.fetchVisitedStreets as jest.Mock).mockResolvedValue({
      status: 'success',
      data: [],
    });
    (apiService.getLocationPermission as jest.Mock).mockResolvedValue(null);
  });

  afterEach(async () => {
    await service.destroy();
  });

  describe('Initialization', () => {
    test('should create singleton instance', () => {
      const instance1 = LocationTrackingService.getInstance();
      const instance2 = LocationTrackingService.getInstance();
      expect(instance1).toBe(instance2);
    });

    test('should initialize data successfully', async () => {
      await service.initializeData('mock-token');
      
      expect(apiService.fetchUser).toHaveBeenCalledWith('mock-token');
      expect(apiService.fetchVisitedStreets).toHaveBeenCalledWith('mock-token');
      expect(apiService.getLocationPermission).toHaveBeenCalledWith('mock-token');
    });

    test('should handle initialization without token', async () => {
      await service.initializeData(null);
      
      expect(apiService.fetchUser).not.toHaveBeenCalled();
      expect(apiService.fetchVisitedStreets).not.toHaveBeenCalled();
    });

    test('should load persisted data from AsyncStorage', async () => {
      const mockStreetData = JSON.stringify(MOCK_STREET_DATA);
      const mockVisitCounts = JSON.stringify({ street_123: { visitCount: 5 } });
      
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(mockStreetData) // STREET_DATA_STORAGE_KEY
        .mockResolvedValueOnce(mockVisitCounts) // VISIT_COUNTS_STORAGE_KEY
        .mockResolvedValueOnce('[]') // PENDING_STREETS_STORAGE_KEY
        .mockResolvedValueOnce('{}') // CURRENT_SESSION_STORAGE_KEY
        .mockResolvedValueOnce('{}'); // ACTIVE_HOURS_STORAGE_KEY

      await service.loadPersistedData();
      
      expect(service.getStreetData()).toEqual(MOCK_STREET_DATA);
    });
  });

  describe('Permission Management', () => {
    test('should request background permissions successfully', async () => {
      const result = await service.requestBackgroundLocationPermissions();
      
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      expect(Location.requestBackgroundPermissionsAsync).toHaveBeenCalled();
      expect(result).toEqual({
        backgroundGranted: true,
        success: true,
      });
    });

    test('should handle foreground permission denial', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await service.requestBackgroundLocationPermissions();
      
      expect(result).toEqual({
        backgroundGranted: false,
        success: false,
      });
      expect(Location.requestBackgroundPermissionsAsync).not.toHaveBeenCalled();
    });

    test('should handle background permission denial gracefully', async () => {
      (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await service.requestBackgroundLocationPermissions();
      
      expect(result).toEqual({
        backgroundGranted: false,
        success: true, // Still success because foreground was granted
      });
    });

    test('should check existing permissions correctly', async () => {
      (apiService.getLocationPermission as jest.Mock).mockResolvedValue(true);

      const result = await service.checkExistingPermissions('mock-token');
      
      expect(result).toEqual({
        hasStoredPermission: true,
        hasSystemPermission: true,
        hasBackgroundPermission: true,
        needsPermissionRequest: false,
      });
    });
  });

  describe('Location Tracking', () => {
    beforeEach(() => {
      // Set up service with mock street data
      (service as any).streetData = MOCK_STREET_DATA;
    });

    test('should start location tracking successfully', async () => {
      const mockSubscription = { remove: jest.fn() };
      (Location.watchPositionAsync as jest.Mock).mockResolvedValue(mockSubscription);

      await service.startLocationTracking(true);
      
      expect(service.isTracking()).toBe(true);
      expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
      expect(Location.watchPositionAsync).toHaveBeenCalled();
    });

    test('should stop location tracking successfully', async () => {
      const mockSubscription = { remove: jest.fn() };
      (service as any).locationSubscription = mockSubscription;

      await service.stopLocationTracking('mock-token');
      
      expect(mockSubscription.remove).toHaveBeenCalled();
      expect(service.isTracking()).toBe(false);
    });

    test('should handle location updates correctly', () => {
      const locationUpdateListener = jest.fn();
      service.addLocationUpdateListener(locationUpdateListener);

      const mockLocation = global.mockLocation(MOCK_COORDS.onStreet123);
      (service as any).handleLocationUpdate(mockLocation);

      expect(locationUpdateListener).toHaveBeenCalledWith(MOCK_COORDS.onStreet123);
    });

    test('should throttle rapid location updates', () => {
      const locationUpdateListener = jest.fn();
      service.addLocationUpdateListener(locationUpdateListener);

      const mockLocation = global.mockLocation(MOCK_COORDS.onStreet123);
      
      // Send multiple rapid updates
      (service as any).handleLocationUpdate(mockLocation);
      (service as any).handleLocationUpdate(mockLocation);
      (service as any).handleLocationUpdate(mockLocation);

      // Should only process one due to throttling
      expect(locationUpdateListener).toHaveBeenCalledTimes(1);
    });

    test('should ignore updates with minimal movement', () => {
      const locationUpdateListener = jest.fn();
      service.addLocationUpdateListener(locationUpdateListener);

      // Set initial location
      const location1 = global.mockLocation(MOCK_COORDS.onStreet123);
      (service as any).handleLocationUpdate(location1);
      
      // Set time to bypass throttling
      (service as any).lastLocationUpdate = 0;
      
      // Send location with minimal movement (same coordinates)
      const location2 = global.mockLocation(MOCK_COORDS.onStreet123);
      (service as any).handleLocationUpdate(location2);

      expect(locationUpdateListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Street Proximity Detection', () => {
    beforeEach(() => {
      (service as any).streetData = MOCK_STREET_DATA;
      // Mock turf to return close distance for street_123
      (turf.pointToLineDistance as jest.Mock).mockImplementation((point, line) => {
        // Simulate being close to street_123
        return 0.02; // 20 meters in km
      });
    });

    test('should detect when user enters a street', () => {
      const streetChangeListener = jest.fn();
      service.addStreetChangeListener(streetChangeListener);

      (service as any).checkStreetProximity(MOCK_COORDS.onStreet123);

      expect(streetChangeListener).toHaveBeenCalledWith(
        'street_123',
        MOCK_COORDS.onStreet123
      );
      expect(service.getCurrentStreetId()).toBe('street_123');
    });

    test('should detect when user leaves a street', () => {
      const streetChangeListener = jest.fn();
      service.addStreetChangeListener(streetChangeListener);

      // First, put user on a street
      (service as any).currentStreetId = 'street_123';
      (service as any).streetEntryTime = Date.now() - 30000; // 30 seconds ago
      
      // Mock being far from any street
      (turf.pointToLineDistance as jest.Mock).mockReturnValue(0.1); // 100m away

      (service as any).checkStreetProximity(MOCK_COORDS.betweenStreets);

      expect(streetChangeListener).toHaveBeenCalledWith(
        null,
        MOCK_COORDS.betweenStreets
      );
      expect(service.getCurrentStreetId()).toBe(null);
    });

    test('should update visit statistics when leaving street', () => {
      const visitUpdateListener = jest.fn();
      service.addVisitCountUpdateListener(visitUpdateListener);

      // Set up initial state
      (service as any).currentStreetId = 'street_123';
      (service as any).streetEntryTime = Date.now() - 60000; // 1 minute ago
      (service as any).streetVisitCounts.set('street_123', {
        visitCount: 1,
        firstVisit: Date.now() - 120000,
        lastVisit: Date.now() - 120000,
        totalTimeSpent: 0,
        averageTimeSpent: 0,
      });

      // Mock being far from street (user leaves)
      (turf.pointToLineDistance as jest.Mock).mockReturnValue(0.1);

      (service as any).checkStreetProximity(MOCK_COORDS.betweenStreets);

      expect(visitUpdateListener).toHaveBeenCalled();
      const visitData = service.getStreetVisitData('street_123');
      expect(visitData?.totalTimeSpent).toBeGreaterThan(0);
    });

    test('should handle multiple street transitions correctly', () => {
      const streetChangeListener = jest.fn();
      service.addStreetChangeListener(streetChangeListener);

      // Enter street_123
      (turf.pointToLineDistance as jest.Mock).mockReturnValue(0.02);
      (service as any).checkStreetProximity(MOCK_COORDS.onStreet123);

      // Move to street_456
      (turf.pointToLineDistance as jest.Mock).mockImplementation((point) => {
        const coords = point.coordinates;
        if (coords[0] === MOCK_COORDS.onStreet456.longitude) {
          return 0.02; // Close to street_456
        }
        return 0.1; // Far from street_123
      });

      (service as any).checkStreetProximity(MOCK_COORDS.onStreet456);

      expect(streetChangeListener).toHaveBeenCalledTimes(2);
      expect(service.getCurrentStreetId()).toBe('street_456');
    });
  });

  describe('Visit Data Management', () => {
    test('should track visit counts correctly', () => {
      const visitUpdateListener = jest.fn();
      service.addVisitCountUpdateListener(visitUpdateListener);

      // Simulate entering street
      (service as any).updateStreetVisitCount('street_123');

      expect(visitUpdateListener).toHaveBeenCalled();
      const visitData = service.getStreetVisitData('street_123');
      expect(visitData?.visitCount).toBe(1);
    });

    test('should increment visit counts for repeat visits', () => {
      // Set up existing visit data
      (service as any).streetVisitCounts.set('street_123', {
        visitCount: 2,
        firstVisit: Date.now() - 86400000, // 1 day ago
        lastVisit: Date.now() - 3600000, // 1 hour ago
        totalTimeSpent: 300, // 5 minutes
        averageTimeSpent: 150, // 2.5 minutes average
      });

      (service as any).updateStreetVisitCount('street_123');

      const visitData = service.getStreetVisitData('street_123');
      expect(visitData?.visitCount).toBe(3);
    });

    test('should calculate time spent correctly', () => {
      const existingData = {
        visitCount: 1,
        firstVisit: Date.now() - 120000,
        lastVisit: Date.now() - 120000,
        totalTimeSpent: 60, // 1 minute
        averageTimeSpent: 60,
      };
      
      (service as any).streetVisitCounts.set('street_123', existingData);

      // Simulate 2 minutes spent on street
      (service as any).updateStreetVisitStats('street_123', 120);

      const visitData = service.getStreetVisitData('street_123');
      expect(visitData?.totalTimeSpent).toBe(180); // 60 + 120 = 180 seconds
      expect(visitData?.averageTimeSpent).toBe(180); // 180/1 = 180 seconds per visit
    });

    test('should return most visited streets in correct order', () => {
      // Set up multiple streets with different visit counts
      (service as any).streetVisitCounts.set('street_1', { visitCount: 5 });
      (service as any).streetVisitCounts.set('street_2', { visitCount: 10 });
      (service as any).streetVisitCounts.set('street_3', { visitCount: 3 });

      const mostVisited = service.getMostVisitedStreets(2);

      expect(mostVisited).toHaveLength(2);
      expect(mostVisited[0].streetId).toBe('street_2');
      expect(mostVisited[1].streetId).toBe('street_1');
    });

    test('should return streets by time spent in correct order', () => {
      (service as any).streetVisitCounts.set('street_1', { totalTimeSpent: 300 });
      (service as any).streetVisitCounts.set('street_2', { totalTimeSpent: 600 });
      (service as any).streetVisitCounts.set('street_3', { totalTimeSpent: 150 });

      const byTime = service.getStreetsByTimeSpent(2);

      expect(byTime).toHaveLength(2);
      expect(byTime[0].streetId).toBe('street_2');
      expect(byTime[1].streetId).toBe('street_1');
    });
  });

  describe('Active Hours Tracking', () => {
    test('should start active hours tracking when location tracking starts', async () => {
      const mockSubscription = { remove: jest.fn() };
      (Location.watchPositionAsync as jest.Mock).mockResolvedValue(mockSubscription);

      await service.startLocationTracking(true);

      expect((service as any).activeHoursData.currentSessionStart).toBeTruthy();
      expect((service as any).activeHoursInterval).toBeTruthy();
    });

    test('should stop active hours tracking when location tracking stops', async () => {
      // Set up active tracking
      (service as any).activeHoursInterval = setInterval(() => {}, 1000);
      (service as any).activeHoursData.currentSessionStart = Date.now();

      await service.stopLocationTracking('mock-token');

      expect((service as any).activeHoursData.currentSessionStart).toBe(null);
      expect((service as any).activeHoursInterval).toBe(null);
    });

    test('should calculate daily active time correctly', () => {
      const today = new Date().toISOString().split('T')[0];
      (service as any).activeHoursData.dailyActiveTime.set(today, 7200); // 2 hours in seconds

      const dailyTime = service.getDailyActiveTime();
      expect(dailyTime).toBe(7200); // 2 hours in seconds
    });

    test('should return current session duration', () => {
      const sessionStart = Date.now() - 3600000; // 1 hour ago
      (service as any).activeHoursData.currentSessionStart = sessionStart;

      const sessionDuration = service.getCurrentSessionDuration();
      expect(sessionDuration).toBeCloseTo(1, 1); // Approximately 1 hour
    });
  });

  describe('Data Persistence', () => {
    test('should save visited streets to database', async () => {
      // Set up visited streets
      (service as any).visitedStreets = [
        {
          streetId: 'street_123',
          streetName: 'Test Street',
          timestamp: Date.now(),
          coordinates: MOCK_COORDS.onStreet123,
          duration: 120,
        },
      ];

      (apiService.saveVisitedStreets as jest.Mock).mockResolvedValue({
        status: 'success',
      });

      await service.saveVisitedStreetsToDatabase('mock-token');

      expect(apiService.saveVisitedStreets).toHaveBeenCalled();
      expect((service as any).visitedStreets).toHaveLength(0); // Should clear after save
    });

    test('should handle database save failures', async () => {
      (service as any).visitedStreets = [
        {
          streetId: 'street_123',
          streetName: 'Test Street',
          timestamp: Date.now(),
          coordinates: MOCK_COORDS.onStreet123,
        },
      ];

      (apiService.saveVisitedStreets as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.saveVisitedStreetsToDatabase('mock-token')
      ).rejects.toThrow('Network error');
    });

    test('should save active hours to database', async () => {
      (service as any).activeHoursData.totalActiveHours = 10.5;
      
      (apiService.updateUserActiveHours as jest.Mock).mockResolvedValue({
        status: 'success',
      });

      await service.saveActiveHoursToDatabase('mock-token');

      expect(apiService.updateUserActiveHours).toHaveBeenCalledWith(
        { activeHours: 10.5 },
        'mock-token'
      );
    });

    test('should persist data to AsyncStorage', async () => {
      (service as any).streetData = MOCK_STREET_DATA;
      (service as any).currentStreetId = 'street_123';

      await (service as any).persistData();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('street_data'),
        JSON.stringify(MOCK_STREET_DATA)
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid coordinates gracefully', () => {
      const invalidLocation = global.mockLocation({
        latitude: NaN,
        longitude: Infinity,
      });

      expect(() => {
        (service as any).handleLocationUpdate(invalidLocation);
      }).not.toThrow();
    });

    test('should handle missing street data in proximity check', () => {
      (service as any).streetData = null;

      expect(() => {
        (service as any).checkStreetProximity(MOCK_COORDS.onStreet123);
      }).not.toThrow();
    });

    test('should handle API service failures during initialization', async () => {
      (apiService.fetchVisitedStreets as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );

      await expect(service.initializeData('mock-token')).rejects.toThrow();
    });

    test('should handle background task registration failures', async () => {
      (Location.startLocationUpdatesAsync as jest.Mock).mockRejectedValue(
        new Error('Background task failed')
      );

      // Should not throw, just log the error
      await expect(
        (service as any).startBackgroundLocationUpdates()
      ).rejects.toThrow();
    });
  });

  describe('Event Listeners', () => {
    test('should add and remove location update listeners correctly', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      service.addLocationUpdateListener(listener1);
      service.addLocationUpdateListener(listener2);

      const mockLocation = global.mockLocation(MOCK_COORDS.onStreet123);
      (service as any).handleLocationUpdate(mockLocation);

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();

      service.removeLocationUpdateListener(listener1);
      jest.clearAllMocks();

      (service as any).lastLocationUpdate = 0; // Reset throttle
      (service as any).handleLocationUpdate(mockLocation);

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    test('should clear all listeners on destroy', async () => {
      const locationListener = jest.fn();
      const streetChangeListener = jest.fn();

      service.addLocationUpdateListener(locationListener);
      service.addStreetChangeListener(streetChangeListener);

      await service.destroy('mock-token');

      expect((service as any).locationUpdateListeners).toHaveLength(0);
      expect((service as any).streetChangeListeners).toHaveLength(0);
    });
  });

  describe('Cleanup and Memory Management', () => {
    test('should properly destroy service and cleanup resources', async () => {
      const mockSubscription = { remove: jest.fn() };
      (service as any).locationSubscription = mockSubscription;
      (service as any).activeHoursInterval = setInterval(() => {}, 1000);

      await service.destroy('mock-token');

      expect(mockSubscription.remove).toHaveBeenCalled();
      expect((service as any).activeHoursInterval).toBe(null);
      expect((LocationTrackingService as any).instance).toBe(null);
    });

    test('should handle destroy without token gracefully', async () => {
      const mockSubscription = { remove: jest.fn() };
      (service as any).locationSubscription = mockSubscription;

      await service.destroy(null);

      expect(mockSubscription.remove).toHaveBeenCalled();
      expect(apiService.saveVisitedStreets).not.toHaveBeenCalled();
    });
  });
});