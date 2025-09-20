// src/Providers/__tests__/LocationTrackingProvider.test.tsx
import React from "react";
import { render, act, waitFor } from "@testing-library/react-native";
import { View, Text } from "react-native";
import {
  LocationTrackingProvider,
  useLocationTracking,
} from "../Providers/LocationTrackingProvider";
import { LocationTrackingService } from "@/services/LocationTrackingService";

// Test component to access provider context
const TestConsumer: React.FC = () => {
  const {
    userLocation,
    currentStreetId,
    isTracking,
    hasBackgroundPermission,
    startTracking,
    stopTracking,
    getMostVisitedStreets,
  } = useLocationTracking();

  return (
    <View>
      <Text testID="user-location">
        {userLocation
          ? `${userLocation.latitude},${userLocation.longitude}`
          : "No location"}
      </Text>
      <Text testID="current-street">{currentStreetId || "No street"}</Text>
      <Text testID="is-tracking">
        {isTracking ? "Tracking" : "Not tracking"}
      </Text>
      <Text testID="has-permission">
        {hasBackgroundPermission ? "Has permission" : "No permission"}
      </Text>
    </View>
  );
};

describe("LocationTrackingProvider", () => {
  let mockService: jest.Mocked<LocationTrackingService>;

  beforeEach(() => {
    // Reset singleton and create fresh mock
    (LocationTrackingService as any).instance = null;
    mockService = {
      addLocationUpdateListener: jest.fn(),
      removeLocationUpdateListener: jest.fn(),
      addStreetChangeListener: jest.fn(),
      removeStreetChangeListener: jest.fn(),
      addVisitCountUpdateListener: jest.fn(),
      removeVisitCountUpdateListener: jest.fn(),
      addActiveHoursUpdateListener: jest.fn(),
      removeActiveHoursUpdateListener: jest.fn(),
      addPermissionStatusListener: jest.fn(),
      removePermissionStatusListener: jest.fn(),
      addPermissionRequestNeededListener: jest.fn(),
      removePermissionRequestNeededListener: jest.fn(),
      startLocationTracking: jest.fn(),
      stopLocationTracking: jest.fn(),
      initializeData: jest.fn(),
      requestBackgroundLocationPermissions: jest.fn(),
      getCurrentStreetId: jest.fn(() => null),
      getStreetData: jest.fn(() => null),
      getVisitedStreets: jest.fn(() => []),
      getAllVisitedStreetIds: jest.fn(() => new Set()),
      getTotalActiveHours: jest.fn(() => 0),
      getCurrentSessionDuration: jest.fn(() => 0),
      getMostVisitedStreets: jest.fn(() => []),
      getStreetsByTimeSpent: jest.fn(() => []),
      getDailyActiveTime: jest.fn(() => 0),
      getWeeklyActiveTime: jest.fn(() => 0),
      getMonthlyActiveTime: jest.fn(() => 0),
      getStreetVisitData: jest.fn(() => null),
      getAllStreetVisitData: jest.fn(() => new Map()),
      isTracking: jest.fn(() => false),
      destroy: jest.fn(),
    } as any;

    jest
      .spyOn(LocationTrackingService, "getInstance")
      .mockReturnValue(mockService);
  });

  test("should provide location tracking context", () => {
    const { getByTestId } = render(
      <LocationTrackingProvider>
        <TestConsumer />
      </LocationTrackingProvider>
    );

    expect(getByTestId("user-location").props.children).toBe("No location");
    expect(getByTestId("current-street").props.children).toBe("No street");
    expect(getByTestId("is-tracking").props.children).toBe("Not tracking");
  });

  test("should handle location updates from service", async () => {
    let locationUpdateCallback: (location: any) => void;

    mockService.addLocationUpdateListener.mockImplementation((callback) => {
      locationUpdateCallback = callback;
    });

    const { getByTestId } = render(
      <LocationTrackingProvider>
        <TestConsumer />
      </LocationTrackingProvider>
    );

    // Simulate location update from service
    await act(async () => {
      if (locationUpdateCallback) {
        locationUpdateCallback({
          latitude: 42.6977,
          longitude: 23.3219,
        });
      }
    });

    await waitFor(() => {
      expect(getByTestId("user-location").props.children).toBe(
        "42.6977,23.3219"
      );
    });
  });

  test("should handle street changes from service", async () => {
    let streetChangeCallback: (streetId: string | null, coords: any) => void;

    mockService.addStreetChangeListener.mockImplementation((callback) => {
      streetChangeCallback = callback;
    });

    const { getByTestId } = render(
      <LocationTrackingProvider>
        <TestConsumer />
      </LocationTrackingProvider>
    );

    // Simulate street change from service
    await act(async () => {
      if (streetChangeCallback) {
        streetChangeCallback("street_123", {
          latitude: 42.6977,
          longitude: 23.3219,
        });
      }
    });

    await waitFor(() => {
      expect(getByTestId("current-street").props.children).toBe("street_123");
    });
  });

  test("should start tracking successfully", async () => {
    mockService.startLocationTracking.mockResolvedValue(undefined);
    mockService.isTracking.mockReturnValue(true);

    const TestComponent = () => {
      const { startTracking, isTracking } = useLocationTracking();

      React.useEffect(() => {
        startTracking(true);
      }, []);

      return (
        <Text testID="tracking-status">
          {isTracking ? "Active" : "Inactive"}
        </Text>
      );
    };

    const { getByTestId } = render(
      <LocationTrackingProvider>
        <TestComponent />
      </LocationTrackingProvider>
    );

    await waitFor(() => {
      expect(mockService.startLocationTracking).toHaveBeenCalledWith(true);
    });
  });

  test("should handle permission status updates", async () => {
    let permissionCallback: (hasPermission: boolean) => void;

    mockService.addPermissionStatusListener.mockImplementation((callback) => {
      permissionCallback = callback;
    });

    const { getByTestId } = render(
      <LocationTrackingProvider>
        <TestConsumer />
      </LocationTrackingProvider>
    );

    // Simulate permission granted
    await act(async () => {
      if (permissionCallback) {
        permissionCallback(true);
      }
    });

    await waitFor(() => {
      expect(getByTestId("has-permission").props.children).toBe(
        "Has permission"
      );
    });
  });

  test("should clean up listeners on unmount", () => {
    const { unmount } = render(
      <LocationTrackingProvider>
        <TestConsumer />
      </LocationTrackingProvider>
    );

    unmount();

    expect(mockService.removeLocationUpdateListener).toHaveBeenCalled();
    expect(mockService.removeStreetChangeListener).toHaveBeenCalled();
    expect(mockService.removeVisitCountUpdateListener).toHaveBeenCalled();
    expect(mockService.removeActiveHoursUpdateListener).toHaveBeenCalled();
    expect(mockService.removePermissionStatusListener).toHaveBeenCalled();
  });
});
