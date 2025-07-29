// import React from 'react';
// import { render, waitFor, act } from '@testing-library/react-native';
// import * as Location from 'expo-location';
// import StreetTrackingMap from '../app/(tabs)/mapscreen';

// // Mock Mapbox
// jest.mock('@rnmapbox/maps', () => ({
//   setAccessToken: jest.fn(),
//   MapView: 'MapView',
//   Camera: 'Camera',
//   PointAnnotation: 'PointAnnotation',
//   ShapeSource: 'ShapeSource',
//   LineLayer: 'LineLayer',
//   StyleURL: {
//     Street: 'mapbox://styles/mapbox/streets-v11'
//   }
// }));

// // Mock expo-location
// jest.mock('expo-location', () => ({
//   requestForegroundPermissionsAsync: jest.fn(),
//   getCurrentPositionAsync: jest.fn(),
//   watchPositionAsync: jest.fn(),
//   Accuracy: {
//     High: 6
//   }
// }));

// // Mock turf
// jest.mock('@turf/turf', () => ({
//   point: jest.fn((coords) => ({ type: 'Point', coordinates: coords })),
//   lineString: jest.fn((coords) => ({ type: 'LineString', coordinates: coords })),
//   pointToLineDistance: jest.fn(),
//   distance: jest.fn()
// }));

// // Mock fetch for Overpass API
// global.fetch = jest.fn();

// // Mock constants
// jest.mock('@/constants/Location', () => ({
//   MIN_MOVEMENT_DISTANCE_METERS: 10
// }));

// // Mock environment variable
// process.env.EXPO_PUBLIC_CLERK_MAP_BOX_TOKEN = 'mock_token';

// describe('StreetTrackingMap', () => {
//   const mockLocationSubscription = {
//     remove: jest.fn()
//   };

//   // Helper function to create mock LocationObject
//   const createMockLocation = (
//     latitude: number,
//     longitude: number,
//     timestamp: number = Date.now(),
//     accuracy: number = 5,
//     mocked: boolean = false
//   ): Location.LocationObject => ({
//     coords: {
//       latitude,
//       longitude,
//       altitude: 100,
//       accuracy,
//       altitudeAccuracy: 5,
//       heading: 0,
//       speed: 0
//     },
//     timestamp,
//     mocked
//   });

//   // Mock street data that would be returned from Overpass API
//   const mockOverpassResponse = {
//     elements: [
//       {
//         type: 'way',
//         id: 12345,
//         tags: { name: 'Main Street', highway: 'primary' },
//         geometry: [
//           { lat: 42.6977, lon: 23.3219 },
//           { lat: 42.6978, lon: 23.3220 },
//           { lat: 42.6979, lon: 23.3221 }
//         ]
//       },
//       {
//         type: 'way',
//         id: 67890,
//         tags: { name: 'Second Street', highway: 'secondary' },
//         geometry: [
//           { lat: 42.6975, lon: 23.3215 },
//           { lat: 42.6976, lon: 23.3216 },
//           { lat: 42.6977, lon: 23.3217 }
//         ]
//       }
//     ]
//   };

//   beforeEach(() => {
//     jest.clearAllMocks();
    
//     // Mock successful location permission
//     (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
//       status: 'granted'
//     });

//     // Mock fetch for Overpass API
//     (global.fetch as jest.Mock).mockResolvedValue({
//       json: () => Promise.resolve(mockOverpassResponse)
//     });

//     // Mock turf functions
//     const turf = require('@turf/turf');
//     turf.pointToLineDistance.mockReturnValue(0.015); // 15 meters
//     turf.distance.mockReturnValue(0.1); // 100 meters
//   });

//   describe('User Movement Simulation', () => {
//     test('should handle initial location and start tracking', async () => {
//       const initialLocation = createMockLocation(42.6977, 23.3219);
      
//       (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(initialLocation);
//       (Location.watchPositionAsync as jest.Mock).mockResolvedValue(mockLocationSubscription);

//       const { getByTestId } = render(<StreetTrackingMap />);

//       await waitFor(() => {
//         expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({
//           accuracy: Location.Accuracy.High,
//           timeInterval: 5000
//         });
//       });

//       expect(Location.watchPositionAsync).toHaveBeenCalledWith(
//         {
//           accuracy: Location.Accuracy.High,
//           timeInterval: 7000,
//           distanceInterval: 15
//         },
//         expect.any(Function)
//       );
//     });

//     test('should simulate user walking along a street path', async () => {
//       const mockWatchPosition = jest.fn();
//       let locationCallback: ((location: Location.LocationObject) => void) | null = null;

//       (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
//         createMockLocation(42.6977, 23.3219)
//       );

//       (Location.watchPositionAsync as jest.Mock).mockImplementation((options, callback) => {
//         locationCallback = callback;
//         return Promise.resolve(mockLocationSubscription);
//       });

//       // Mock turf to simulate being on a street
//       const turf = require('@turf/turf');
//       turf.pointToLineDistance.mockReturnValue(0.005); // 5 meters - on street

//       render(<StreetTrackingMap />);

//       await waitFor(() => {
//         expect(locationCallback).toBeTruthy();
//       });

//       // Simulate user walking along Main Street
//       const walkingPath = [
//         { lat: 42.6977, lng: 23.3219, timestamp: Date.now() },
//         { lat: 42.6978, lng: 23.3220, timestamp: Date.now() + 5000 },
//         { lat: 42.6979, lng: 23.3221, timestamp: Date.now() + 10000 },
//         { lat: 42.6980, lng: 23.3222, timestamp: Date.now() + 15000 }
//       ];

//       for (const point of walkingPath) {
//         act(() => {
//           locationCallback!(createMockLocation(
//             point.lat,
//             point.lng,
//             point.timestamp,
//             5,
//             true // mocked for testing
//           ));
//         });

//         // Small delay to simulate real movement
//         await new Promise(resolve => setTimeout(resolve, 100));
//       }

//       // Verify fetch was called to get street data
//       expect(global.fetch).toHaveBeenCalledWith(
//         'https://overpass-api.de/api/interpreter',
//         expect.objectContaining({
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded'
//           }
//         })
//       );
//     });

//     test('should detect street changes during movement', async () => {
//       let locationCallback: ((location: Location.LocationObject) => void) | null = null;

//       (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
//         createMockLocation(42.6977, 23.3219)
//       );

//       (Location.watchPositionAsync as jest.Mock).mockImplementation((options, callback) => {
//         locationCallback = callback;
//         return Promise.resolve(mockLocationSubscription);
//       });

//       const turf = require('@turf/turf');
      
//       render(<StreetTrackingMap />);

//       await waitFor(() => {
//         expect(locationCallback).toBeTruthy();
//       });

//       // First location - on Main Street
//       turf.pointToLineDistance.mockReturnValueOnce(0.005); // 5m from Main Street
//       turf.pointToLineDistance.mockReturnValueOnce(0.050); // 50m from Second Street

//       act(() => {
//         locationCallback!(createMockLocation(42.6977, 23.3219, Date.now(), 5, true));
//       });

//       await new Promise(resolve => setTimeout(resolve, 100));

//       // Second location - moved to Second Street
//       turf.pointToLineDistance.mockReturnValueOnce(0.050); // 50m from Main Street
//       turf.pointToLineDistance.mockReturnValueOnce(0.005); // 5m from Second Street

//       act(() => {
//         locationCallback!(createMockLocation(42.6975, 23.3215, Date.now() + 10000, 5, true));
//       });

//       await new Promise(resolve => setTimeout(resolve, 100));

//       // Should have called pointToLineDistance for street proximity checks
//       expect(turf.pointToLineDistance).toHaveBeenCalled();
//     });

//     test('should throttle rapid location updates', async () => {
//       let locationCallback: ((location: Location.LocationObject) => void) | null = null;
//       const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

//       (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
//         createMockLocation(42.6977, 23.3219)
//       );

//       (Location.watchPositionAsync as jest.Mock).mockImplementation((options, callback) => {
//         locationCallback = callback;
//         return Promise.resolve(mockLocationSubscription);
//       });

//       render(<StreetTrackingMap />);

//       await waitFor(() => {
//         expect(locationCallback).toBeTruthy();
//       });

//       const baseTime = Date.now();

//       // Send rapid updates (within 2 second throttle)
//       act(() => {
//         locationCallback!(createMockLocation(42.6977, 23.3219, baseTime, 5, true));
//       });

//       act(() => {
//         locationCallback!(createMockLocation(42.6978, 23.3220, baseTime + 1000, 5, true)); // 1 second later
//       });

//       act(() => {
//         locationCallback!(createMockLocation(42.6979, 23.3221, baseTime + 3000, 5, true)); // 3 seconds later
//       });

//       // Only the first and third updates should be processed due to throttling
//       await waitFor(() => {
//         const processedLocationCalls = mockConsoleLog.mock.calls.filter(
//           call => call[0] === 'Processing location update:'
//         );
//         expect(processedLocationCalls.length).toBe(2); // First and third only
//       });

//       mockConsoleLog.mockRestore();
//     });

//     test('should ignore updates with insufficient movement distance', async () => {
//       let locationCallback: ((location: Location.LocationObject) => void) | null = null;

//       (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
//         createMockLocation(42.6977, 23.3219)
//       );

//       (Location.watchPositionAsync as jest.Mock).mockImplementation((options, callback) => {
//         locationCallback = callback;
//         return Promise.resolve(mockLocationSubscription);
//       });

//       render(<StreetTrackingMap />);

//       await waitFor(() => {
//         expect(locationCallback).toBeTruthy();
//       });

//       const baseTime = Date.now();

//       // First location
//       act(() => {
//         locationCallback!(createMockLocation(42.6977, 23.3219, baseTime, 5, true));
//       });

//       await new Promise(resolve => setTimeout(resolve, 2100)); // Wait for throttle

//       // Very small movement (less than MIN_MOVEMENT_DISTANCE_METERS)
//       act(() => {
//         locationCallback!(createMockLocation(
//           42.6977001, // Tiny movement
//           23.3219001,
//           baseTime + 3000,
//           5,
//           true
//         ));
//       });

//       // Movement should be ignored due to insufficient distance
//       // You would need to verify this through component state or console logs
//     });

//     test('should handle location permission denial', async () => {
//       (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
//         status: 'denied'
//       });

//       const mockAlert = jest.spyOn(require('react-native').Alert, 'alert').mockImplementation();

//       render(<StreetTrackingMap />);

//       await waitFor(() => {
//         expect(mockAlert).toHaveBeenCalledWith(
//           'Permission Denied',
//           'Location permission is required for street tracking.'
//         );
//       });

//       expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
//     });

//     test('should handle invalid coordinates gracefully', async () => {
//       let locationCallback: ((location: Location.LocationObject) => void) | null = null;
//       const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

//       (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
//         createMockLocation(42.6977, 23.3219)
//       );

//       (Location.watchPositionAsync as jest.Mock).mockImplementation((options, callback) => {
//         locationCallback = callback;
//         return Promise.resolve(mockLocationSubscription);
//       });

//       render(<StreetTrackingMap />);

//       await waitFor(() => {
//         expect(locationCallback).toBeTruthy();
//       });

//       // Send invalid coordinates
//       act(() => {
//         locationCallback!({
//           coords: {
//             latitude: NaN,
//             longitude: Infinity,
//             altitude: 100,
//             accuracy: 5,
//             altitudeAccuracy: 5,
//             heading: 0,
//             speed: 0
//           },
//           timestamp: Date.now(),
//           mocked: true
//         });
//       });

//       await waitFor(() => {
//         expect(mockConsoleWarn).toHaveBeenCalledWith(
//           'Invalid coordinates received:',
//           { latitude: NaN, longitude: Infinity }
//         );
//       });

//       mockConsoleWarn.mockRestore();
//     });

//     test('should cleanup location subscription on unmount', async () => {
//       (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
//         createMockLocation(42.6977, 23.3219)
//       );

//       (Location.watchPositionAsync as jest.Mock).mockResolvedValue(mockLocationSubscription);

//       const { unmount } = render(<StreetTrackingMap />);

//       await waitFor(() => {
//         expect(Location.watchPositionAsync).toHaveBeenCalled();
//       });

//       unmount();

//       expect(mockLocationSubscription.remove).toHaveBeenCalled();
//     });
//   });

//   describe('Street Data Integration', () => {
//     test('should refresh street data when user moves significantly', async () => {
//       let locationCallback: ((location: Location.LocationObject) => void) | null = null;

//       (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
//         createMockLocation(42.6977, 23.3219)
//       );

//       (Location.watchPositionAsync as jest.Mock).mockImplementation((options, callback) => {
//         locationCallback = callback;
//         return Promise.resolve(mockLocationSubscription);
//       });

//       const turf = require('@turf/turf');
//       turf.distance.mockReturnValue(0.6); // 600 meters - should trigger refresh

//       render(<StreetTrackingMap />);

//       await waitFor(() => {
//         expect(locationCallback).toBeTruthy();
//       });

//       // Clear initial fetch call
//       (global.fetch as jest.Mock).mockClear();

//       // Move significantly
//       act(() => {
//         locationCallback!(createMockLocation(42.7000, 23.3300, Date.now(), 5, true));
//       });

//       await waitFor(() => {
//         expect(global.fetch).toHaveBeenCalledWith(
//           'https://overpass-api.de/api/interpreter',
//           expect.any(Object)
//         );
//       });
//     });
//   });
// });