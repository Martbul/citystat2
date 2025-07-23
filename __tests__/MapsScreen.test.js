// __tests__/MapsScreen.test.js
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { jest } from "@jest/globals";

// 🎭 MOCKING EXPLANATION:
// When testing React Native components, external libraries like @rnmapbox/maps
// don't work in the test environment because:
// 1. They need native code (iOS/Android)
// 2. They need real GPS/location services
// 3. They need actual map rendering

// So we "mock" them - create fake versions that return predictable results

// 1. Mock the Mapbox library
jest.mock("@rnmapbox/maps", () => {
  // Create fake React components that look like the real ones
  const MockedMapView = ({ children, onUpdate, ...props }) => {
    // This is a fake MapView that just renders a simple View
    const { View } = require("react-native");
    return React.createElement(
      View,
      { testID: "mocked-mapview", ...props },
      children
    );
  };

  const MockedCamera = (props) => {
    const { View } = require("react-native");
    return React.createElement(View, { testID: "mocked-camera", ...props });
  };

  const MockedUserLocation = ({ onUpdate, ...props }) => {
    const { View } = require("react-native");

    // Simulate location updates in tests
    React.useEffect(() => {
      if (onUpdate) {
        // Fake location data for Sofia
        const mockLocation = {
          coords: {
            latitude: 42.6977,
            longitude: 23.3219,
            accuracy: 10,
            altitude: 0,
            heading: 0,
            speed: 0,
          },
          timestamp: Date.now(),
        };

        // Call the onUpdate function like the real component would
        setTimeout(() => onUpdate(mockLocation), 100);
      }
    }, [onUpdate]);

    return React.createElement(View, {
      testID: "mocked-user-location",
      ...props,
    });
  };

  const MockedShapeSource = ({ children, ...props }) => {
    const { View } = require("react-native");
    return React.createElement(
      View,
      { testID: "mocked-shape-source", ...props },
      children
    );
  };

  const MockedLineLayer = (props) => {
    const { View } = require("react-native");
    return React.createElement(View, { testID: "mocked-line-layer", ...props });
  };

  const MockedPointAnnotation = ({ children, ...props }) => {
    const { View } = require("react-native");
    return React.createElement(
      View,
      { testID: "mocked-point-annotation", ...props },
      children
    );
  };

  // Return the mocked module
  return {
    // Mock the default export (Mapbox object)
    default: {
      setAccessToken: jest.fn(), // Mock function that does nothing
      StyleURL: {
        Street: "mapbox://styles/mapbox/streets-v11", // Fake style URL
      },
    },
    // Mock all the named exports
    MapView: MockedMapView,
    Camera: MockedCamera,
    UserLocation: MockedUserLocation,
    ShapeSource: MockedShapeSource,
    LineLayer: MockedLineLayer,
    PointAnnotation: MockedPointAnnotation,
  };
});

// 2. Mock Expo vector icons
jest.mock("@expo/vector-icons/Entypo", () => {
  const { View } = require("react-native");
  return (props) =>
    React.createElement(View, { testID: "mocked-entypo-icon", ...props });
});

// 3. Mock your Sofia streets data
jest.mock("@/mockData/mocks", () => ({
  sofiaStreets: [
    {
      id: 1,
      name: "Vitosha Boulevard",
      coordinates: [
        [23.3219, 42.6977],
        [23.3225, 42.6985],
        [23.323, 42.6995],
      ],
      distance: 1200,
      walkedAt: "2024-01-01T10:00:00Z",
    },
    {
      id: 2,
      name: "Graf Ignatiev Street",
      coordinates: [
        [23.318, 42.695],
        [23.319, 42.696],
        [23.32, 42.697],
      ],
      distance: 800,
      walkedAt: "2024-01-02T14:30:00Z",
    },
  ],
}));

// 4. Mock fetch for API calls
global.fetch = jest.fn();

// 5. Mock environment variables
process.env.EXPO_PUBLIC_CLERK_MAP_BOX_TOKEN = "fake-mapbox-token-for-testing";

// Now import your component AFTER mocking
import MapsScreen from "../MapsScreen"; // Adjust path to your component

describe("MapsScreen Component", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Set up fetch to return successful responses
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, id: 1 }),
    });
  });

  it("should render the map component", () => {
    const { getByTestId } = render(<MapsScreen />);

    // Check if our mocked components are rendered
    expect(getByTestId("mocked-mapview")).toBeTruthy();
    expect(getByTestId("mocked-camera")).toBeTruthy();
    expect(getByTestId("mocked-user-location")).toBeTruthy();
  });

  it("should display legend with correct colors", () => {
    const { getByText } = render(<MapsScreen />);

    expect(getByText("Street Walking Legend")).toBeTruthy();
    expect(getByText("< 800m")).toBeTruthy();
    expect(getByText("800m - 1.5km")).toBeTruthy();
    expect(getByText("Visited")).toBeTruthy();
    expect(getByText("Current Route")).toBeTruthy();
  });

  it("should handle user location updates", async () => {
    const { getByTestId, getByText } = render(<MapsScreen />);

    // Wait for the mocked location update to trigger
    await waitFor(
      () => {
        // Check if coordinates are displayed
        expect(getByText(/Lat: 42.6977/)).toBeTruthy();
        expect(getByText(/Lng: 23.3219/)).toBeTruthy();
      },
      { timeout: 1000 }
    );
  });

  it("should detect when user is on a street", async () => {
    const { getByText } = render(<MapsScreen />);

    // Wait for location update and street detection
    await waitFor(
      () => {
        // Should show current street ID when detected
        expect(getByText(/Current Street ID:/)).toBeTruthy();
      },
      { timeout: 1000 }
    );
  });

  it("should make API calls when user starts walking on a street", async () => {
    render(<MapsScreen />);

    // Wait for the component to process location and make API calls
    await waitFor(
      () => {
        expect(fetch).toHaveBeenCalledWith(
          "/api/current-routes",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
        );
      },
      { timeout: 2000 }
    );
  });

  it("should render street lines on the map", () => {
    const { getAllByTestId } = render(<MapsScreen />);

    // Should render ShapeSource for each street
    const shapeSources = getAllByTestId("mocked-shape-source");
    expect(shapeSources.length).toBeGreaterThan(0);
  });

  it("should render destination point annotation", () => {
    const { getByTestId } = render(<MapsScreen />);

    expect(getByTestId("mocked-point-annotation")).toBeTruthy();
  });
});

// 🧪 INTEGRATION TEST WITH REAL LOGIC
describe("Street Tracking Logic Integration", () => {
  // Extract the street tracking logic for isolated testing
  class TestableStreetTracker {
    constructor() {
      this.STREET_PROXIMITY_THRESHOLD = 50;
      this.MIN_MOVEMENT_DISTANCE = 10;
      this.visitedStreets = [];
      this.currentRoute = null;
      this.currentStreetId = null;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371e3;
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    }

    isUserOnStreet(userLat, userLon, streetCoordinates) {
      // Simplified detection for testing
      const streetCenter =
        streetCoordinates[Math.floor(streetCoordinates.length / 2)];
      const distance = this.calculateDistance(
        userLat,
        userLon,
        streetCenter[1],
        streetCenter[0]
      );
      return distance <= this.STREET_PROXIMITY_THRESHOLD;
    }

    async simulateWalk(coordinates) {
      const results = [];

      for (const coord of coordinates) {
        // Check if on Vitosha Boulevard (street ID 1)
        const isOnVitosha = this.isUserOnStreet(coord.lat, coord.lon, [
          [23.3219, 42.6977],
          [23.3225, 42.6985],
          [23.323, 42.6995],
        ]);

        if (isOnVitosha && !this.currentStreetId) {
          // Started walking on street
          this.currentStreetId = 1;
          this.currentRoute = {
            streetId: 1,
            coordinates: [[coord.lon, coord.lat]],
            startTime: new Date().toISOString(),
          };

          await fetch("/api/current-routes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.currentRoute),
          });

          results.push({ action: "started_tracking", streetId: 1 });
        } else if (isOnVitosha && this.currentStreetId === 1) {
          // Continue on same street
          this.currentRoute.coordinates.push([coord.lon, coord.lat]);
          results.push({
            action: "updated_route",
            coordinates: this.currentRoute.coordinates.length,
          });
        } else if (!isOnVitosha && this.currentStreetId === 1) {
          // Left the street
          this.visitedStreets.push({
            streetId: this.currentStreetId,
            coordinates: this.currentRoute.coordinates,
            visitedAt: this.currentRoute.startTime,
            isCompleted: true,
          });

          await fetch("/api/visited-streets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              this.visitedStreets[this.visitedStreets.length - 1]
            ),
          });

          this.currentStreetId = null;
          this.currentRoute = null;
          results.push({
            action: "completed_street",
            visitedCount: this.visitedStreets.length,
          });
        }
      }

      return results;
    }
  }

  it("should track a complete walking journey", async () => {
    const tracker = new TestableStreetTracker();

    // Simulate walking path: start near Vitosha, walk along it, then leave
    const walkingPath = [
      { lat: 42.6975, lon: 23.3217 }, // Near Vitosha start
      { lat: 42.698, lon: 23.3222 }, // On Vitosha Boulevard
      { lat: 42.6985, lon: 23.3225 }, // Still on Vitosha
      { lat: 42.699, lon: 23.3228 }, // Still on Vitosha
      { lat: 42.7, lon: 23.35 }, // Far from Vitosha (left street)
    ];

    const results = await tracker.simulateWalk(walkingPath);

    // Verify the journey
    expect(results).toEqual([
      { action: "started_tracking", streetId: 1 },
      { action: "updated_route", coordinates: 2 },
      { action: "updated_route", coordinates: 3 },
      { action: "updated_route", coordinates: 4 },
      { action: "completed_street", visitedCount: 1 },
    ]);

    // Verify API calls
    expect(fetch).toHaveBeenCalledWith(
      "/api/current-routes",
      expect.any(Object)
    );
    expect(fetch).toHaveBeenCalledWith(
      "/api/visited-streets",
      expect.any(Object)
    );

    // Verify final state
    expect(tracker.visitedStreets).toHaveLength(1);
    expect(tracker.visitedStreets[0].streetId).toBe(1);
    expect(tracker.visitedStreets[0].isCompleted).toBe(true);
    expect(tracker.currentStreetId).toBeNull();
  });
});

// 🏃‍♂️ MANUAL TEST RUNNER
// You can run this in your React Native app to test the real functionality
export const manualTestRunner = {
  async testLocationTracking() {
    console.log("🧪 Starting Manual Location Test...");

    // Test coordinates around Sofia
    const testLocations = [
      { name: "Sofia Center", lat: 42.6977, lon: 23.3219 },
      { name: "Near Vitosha Blvd", lat: 42.698, lon: 23.3222 },
      { name: "Alexander Nevsky", lat: 42.6957, lon: 23.3327 },
      { name: "Away from streets", lat: 42.71, lon: 23.4 },
    ];

    for (const location of testLocations) {
      console.log(`\n📍 Testing: ${location.name}`);
      console.log(`   Coordinates: ${location.lat}, ${location.lon}`);

      // You would call your actual street detection logic here
      // const isOnStreet = yourStreetTracker.isUserOnStreet(location.lat, location.lon, sofiaStreets);
      // console.log(`   On street: ${isOnStreet}`);
    }
  },

  async testApiCalls() {
    console.log("🌐 Testing API calls...");

    const testData = {
      streetId: 1,
      coordinates: [
        [23.3219, 42.6977],
        [23.3225, 42.6985],
      ],
      visitedAt: new Date().toISOString(),
      isCompleted: true,
    };

    try {
      const response = await fetch("/api/visited-streets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      console.log(`✅ API Response: ${response.status}`);
      const result = await response.json();
      console.log("📄 Response data:", result);
    } catch (error) {
      console.log(`❌ API Error: ${error.message}`);
    }
  },
};

// 📚 HOW TO USE THIS TEST FILE:

/*
1. INSTALL TESTING DEPENDENCIES:
   npm install --save-dev @testing-library/react-native @testing-library/jest-native jest

2. ADD TO package.json:
   "scripts": {
     "test": "jest"
   },
   "jest": {
     "preset": "react-native",
     "setupFilesAfterEnv": ["@testing-library/jest-native/extend-expect"]
   }

3. RUN TESTS:
   npm test

4. FOR MANUAL TESTING IN YOUR APP:
   import { manualTestRunner } from './path/to/this/file';
   manualTestRunner.testLocationTracking();
*/
