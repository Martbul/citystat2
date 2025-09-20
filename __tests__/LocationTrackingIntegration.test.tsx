// src/__tests__/integration/LocationTrackingIntegration.test.tsx
import React from "react";
import { render, act, waitFor } from "@testing-library/react-native";
import { LocationTrackingProvider } from "@/Providers/LocationTrackingProvider";
import StreetTrackingMap from "@/app/(tabs)/world";
import { LocationTrackingService } from "@/services/LocationTrackingService";
import { useUserData } from "@/Providers/UserDataProvider";
import { apiService } from "@/services/api";

jest.mock("@/Providers/UserDataProvider");

const mockUseUserData = useUserData as jest.MockedFunction<typeof useUserData>;

describe("Location Tracking Integration", () => {
  beforeEach(() => {
    // Reset singleton
    (LocationTrackingService as any).instance = null;

    mockUseUserData.mockReturnValue({
      isLoading: false,
      userData: {
        id: "user123",
        name: "Test User",
        activeHours: 0,
      },
    });
  });

  test("should complete full initialization flow", async () => {
    const { queryByText } = render(
      <LocationTrackingProvider>
        <StreetTrackingMap />
      </LocationTrackingProvider>
    );

    // Wait for initialization to complete
    await waitFor(
      () => {
        expect(queryByText("Initializing...")).toBeNull();
      },
      { timeout: 5000 }
    );

    // Verify service was initialized
    const service = LocationTrackingService.getInstance();
    expect(service).toBeDefined();
  });

  test("should handle location updates and street detection flow", async () => {
    // Mock street data in service
    const mockStreetData = {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          id: "test_street",
          geometry: {
            type: "LineString" as const,
            coordinates: [
              [23.3219, 42.6977],
              [23.3225, 42.6983],
            ],
          },
          properties: {
            name: "Test Street",
            highway: "residential",
          },
        },
      ],
    };

    const component = render(
      <LocationTrackingProvider>
        <StreetTrackingMap />
      </LocationTrackingProvider>
    );

    await waitFor(() => {
      expect(component.queryByText("Loading map...")).toBeNull();
    });

    // Simulate location update that should trigger street detection
    const service = LocationTrackingService.getInstance();

    // Set up street data
    (service as any).streetData = mockStreetData;

    // Simulate location update
    await act(async () => {
      const mockLocation = global.mockLocation({
        latitude: 42.6977,
        longitude: 23.3219,
      });

      (service as any).handleLocationUpdate(mockLocation);
    });

    // Verify street detection occurred
    await waitFor(() => {
      // Street should be detected based on proximity
      expect((service as any).currentStreetId).toBeTruthy();
    });
  });

  test("should handle permission flow correctly", async () => {
    // Mock permission denied initially
    (apiService.getLocationPermission as jest.Mock).mockResolvedValue(null);

    const { queryByText } = render(
      <LocationTrackingProvider>
        <StreetTrackingMap />
      </LocationTrackingProvider>
    );

    // Should show permission panel
    await waitFor(() => {
      expect(
        queryByText(/permission/i) || queryByText(/location/i)
      ).toBeTruthy();
    });

    // Simulate permission granted
    await act(async () => {
      (apiService.getLocationPermission as jest.Mock).mockResolvedValue(true);

      const service = LocationTrackingService.getInstance();
      await service.requestBackgroundLocationPermissions();
    });

    // Permission panel should disappear
    await waitFor(() => {
      expect(queryByText(/grant.*permission/i)).toBeNull();
    });
  });

  test("should save and sync data correctly", async () => {
    const service = LocationTrackingService.getInstance();

    // Set up some visited streets
    (service as any).visitedStreets = [
      {
        streetId: "street_123",
        streetName: "Test Street",
        timestamp: Date.now(),
        coordinates: { latitude: 42.6977, longitude: 23.3219 },
        duration: 120,
      },
    ];

    (apiService.saveVisitedStreets as jest.Mock).mockResolvedValue({
      status: "success",
    });

    // Trigger save
    await act(async () => {
      await service.saveVisitedStreetsToDatabase("mock-token");
    });

    expect(apiService.saveVisitedStreets).toHaveBeenCalledWith(
      expect.objectContaining({
        visitedStreets: expect.arrayContaining([
          expect.objectContaining({
            streetId: "street_123",
            streetName: "Test Street",
            durationSeconds: 120,
          }),
        ]),
      }),
      "mock-token"
    );
  });
});

// src/__tests__/utils/LocationTestRunner.ts - Test utility for manual testing
export class LocationTestRunner {
  private scenarios: Array<{
    name: string;
    run: () => Promise<void>;
  }> = [];

  addScenario(name: string, testFunction: () => Promise<void>) {
    this.scenarios.push({ name, run: testFunction });
  }

  async runAll(): Promise<TestRunnerResults> {
    const results: TestRunnerResults = {
      total: this.scenarios.length,
      passed: 0,
      failed: 0,
      results: [],
    };

    for (const scenario of this.scenarios) {
      console.log(`Running scenario: ${scenario.name}`);

      try {
        const startTime = Date.now();
        await scenario.run();
        const duration = Date.now() - startTime;

        results.passed++;
        results.results.push({
          name: scenario.name,
          status: "passed",
          duration,
        });

        console.log(`✅ ${scenario.name} passed (${duration}ms)`);
      } catch (error) {
        results.failed++;
        results.results.push({
          name: scenario.name,
          status: "failed",
          error: error.message,
        });

        console.error(`❌ ${scenario.name} failed:`, error.message);
      }
    }

    return results;
  }
}

interface TestRunnerResults {
  total: number;
  passed: number;
  failed: number;
  results: Array<{
    name: string;
    status: "passed" | "failed";
    duration?: number;
    error?: string;
  }>;
}

// Example usage of LocationTestRunner
export async function runLocationTestSuite() {
  const runner = new LocationTestRunner();

  runner.addScenario("Service Initialization", async () => {
    const service = LocationTrackingService.getInstance();
    await service.initializeData("test-token");

    if (!service) {
      throw new Error("Service failed to initialize");
    }
  });

  runner.addScenario("Permission Request Flow", async () => {
    const service = LocationTrackingService.getInstance();
    const result = await service.requestBackgroundLocationPermissions();

    if (!result.success) {
      throw new Error("Permission request failed");
    }
  });

  runner.addScenario("Location Tracking Start/Stop", async () => {
    const service = LocationTrackingService.getInstance();

    await service.startLocationTracking(false);

    if (!service.isTracking()) {
      throw new Error("Location tracking failed to start");
    }

    await service.stopLocationTracking("test-token");

    if (service.isTracking()) {
      throw new Error("Location tracking failed to stop");
    }
  });

  const results = await runner.runAll();

  console.log("\n=== Test Results ===");
  console.log(`Total: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);

  if (results.failed > 0) {
    console.log("\nFailed tests:");
    results.results
      .filter((r) => r.status === "failed")
      .forEach((r) => console.log(`- ${r.name}: ${r.error}`));
  }

  return results;
}
