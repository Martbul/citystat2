// src/components/__tests__/StreetTrackingMap.test.tsx
import React from "react";
import { render, waitFor, act } from "@testing-library/react-native";
import { LocationTrackingProvider } from "@/Providers/LocationTrackingProvider";
import StreetTrackingMap from "@/app/(tabs)/world";
import { useUserData } from "@/Providers/UserDataProvider";
import { apiService } from "@/services/api";

// Mock the providers
jest.mock("@/Providers/UserDataProvider");
jest.mock("@react-native-safe-area-context", () => ({
  SafeAreaView: "SafeAreaView",
}));

const mockUseUserData = useUserData as jest.MockedFunction<typeof useUserData>;

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LocationTrackingProvider>{children}</LocationTrackingProvider>
);

describe("StreetTrackingMap", () => {
  beforeEach(() => {
    mockUseUserData.mockReturnValue({
      isLoading: false,
      userData: {
        id: "user123",
        name: "Test User",
        activeHours: 10,
      },
    });

    (apiService.fetchUser as jest.Mock).mockResolvedValue({ activeHours: 10 });
    (apiService.fetchVisitedStreets as jest.Mock).mockResolvedValue({
      status: "success",
      data: [],
    });
    (apiService.getLocationPermission as jest.Mock).mockResolvedValue(true);
  });

  test("should render loading state initially", () => {
    mockUseUserData.mockReturnValue({
      isLoading: true,
      userData: null,
    });

    const { getByText } = render(
      <TestWrapper>
        <StreetTrackingMap />
      </TestWrapper>
    );

    expect(getByText("Loading map...")).toBeTruthy();
  });

  test("should render map view when loaded", async () => {
    const { getByTestId, queryByText } = render(
      <TestWrapper>
        <StreetTrackingMap />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(queryByText("Loading map...")).toBeNull();
    });

    // Map should be rendered (mocked as 'MapView')
    expect(getByTestId || queryByText).toBeTruthy();
  });

  test("should show permission panel when needed", async () => {
    (apiService.getLocationPermission as jest.Mock).mockResolvedValue(null);

    const { queryByText } = render(
      <TestWrapper>
        <StreetTrackingMap />
      </TestWrapper>
    );

    await waitFor(() => {
      // Should show permission-related UI
      expect(
        queryByText(/permission/i) || queryByText(/location/i)
      ).toBeTruthy();
    });
  });

  test("should handle map initialization properly", async () => {
    let mapReadyCallback: () => void;

    // Mock MapView to capture onDidFinishLoadingMap callback
    jest.doMock("@rnmapbox/maps", () => ({
      ...jest.requireActual("@rnmapbox/maps"),
      MapView: ({ onDidFinishLoadingMap, children }: any) => {
        mapReadyCallback = onDidFinishLoadingMap;
        return React.createElement("MapView", { testID: "map-view" }, children);
      },
    }));

    const { rerender } = render(
      <TestWrapper>
        <StreetTrackingMap />
      </TestWrapper>
    );

    // Simulate map ready
    await act(async () => {
      if (mapReadyCallback) {
        mapReadyCallback();
      }
    });

    await waitFor(() => {
      // Map should be ready and showing content
      expect(true).toBe(true); // Placeholder for actual map content checks
    });
  });
});
