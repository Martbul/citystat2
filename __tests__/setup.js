import { jest } from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock React Native modules
jest.mock("react-native", () => ({
  ...jest.requireActual("react-native"),
  Alert: {
    alert: jest.fn(),
  },
  AppState: {
    currentState: "active",
    addEventListener: jest.fn(),
  },
  Platform: {
    OS: "ios",
  },
}));

// Mock expo-location
const mockLocationObject = {
  coords: {
    latitude: 42.6977,
    longitude: 23.3219,
    altitude: null,
    accuracy: 10,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp: Date.now(),
};

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  requestBackgroundPermissionsAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  getBackgroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve(mockLocationObject)),
  watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
  startLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
  stopLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
  Accuracy: {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
  },
}));

// Mock expo-task-manager
jest.mock("expo-task-manager", () => ({
  defineTask: jest.fn(),
  isTaskDefined: jest.fn(() => true),
  TaskManager: {
    defineTask: jest.fn(),
    isTaskDefined: jest.fn(() => true),
  },
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock @rnmapbox/maps
jest.mock("@rnmapbox/maps", () => ({
  setAccessToken: jest.fn(),
  MapView: "MapView",
  Camera: "Camera",
  ShapeSource: "ShapeSource",
  LineLayer: "LineLayer",
  SymbolLayer: "SymbolLayer",
  Images: "Images",
  StyleURL: {
    Street: "mapbox://styles/mapbox/streets-v11",
  },
}));

// Mock @turf/turf
jest.mock("@turf/turf", () => ({
  point: jest.fn((coords) => ({ type: "Point", coordinates: coords })),
  lineString: jest.fn((coords) => ({
    type: "LineString",
    coordinates: coords,
  })),
  pointToLineDistance: jest.fn(() => 0.05), // 50 meters
  distance: jest.fn(() => 0.1), // 100 meters
}));

// Mock API service
jest.mock("@/services/api", () => ({
  apiService: {
    fetchUser: jest.fn(),
    fetchVisitedStreets: jest.fn(),
    saveVisitedStreets: jest.fn(),
    updateUserActiveHours: jest.fn(),
    saveStreetVisitStats: jest.fn(),
    getLocationPermission: jest.fn(),
    saveLocationPermission: jest.fn(),
  },
}));

// Mock Clerk auth
jest.mock("@clerk/clerk-expo", () => ({
  useAuth: jest.fn(() => ({
    getToken: jest.fn(() => Promise.resolve("mock-token")),
  })),
}));

// Global test utilities
global.mockLocation = (coords, timestamp = Date.now()) => ({
  coords: {
    ...coords,
    altitude: null,
    accuracy: 10,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp,
});

global.waitFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Setup console for tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};
