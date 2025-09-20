// src/__tests__/e2e/LocationTrackingE2E.test.ts
import { LocationTrackingService } from '@/services/LocationTrackingService';
import { apiService } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface E2ETestScenario {
  name: string;
  description: string;
  steps: Array<{
    action: string;
    location?: { latitude: number; longitude: number };
    expectedStreetId?: string | null;
    expectedVisitCount?: number;
    waitTime?: number;
  }>;
}

const E2E_SCENARIOS: E2ETestScenario[] = [
  {
    name: 'Complete User Journey',
    description: 'Full user journey from app start to data persistence',
    steps: [
      { action: 'initialize', expectedStreetId: null },
      { action: 'start_tracking', expectedStreetId: null },
      { 
        action: 'move_to_street', 
        location: { latitude: 42.6977, longitude: 23.3219 },
        expectedStreetId: 'street_123',
        waitTime: 2000 
      },
      { 
        action: 'stay_on_street', 
        location: { latitude: 42.6978, longitude: 23.3220 },
        expectedStreetId: 'street_123',
        waitTime: 5000 
      },
      { 
        action: 'move_to_new_street', 
        location: { latitude: 42.6990, longitude: 23.3240 },
        expectedStreetId: 'street_456',
        expectedVisitCount: 1,
        waitTime: 3000 
      },
      { action: 'stop_tracking' },
      { action: 'save_data' },
    ],
  },
  {
    name: 'Rapid Street Changes',
    description: 'Test rapid movement between multiple streets',
    steps: [
      { action: 'initialize' },
      { action: 'start_tracking' },
      { 
        action: 'rapid_street_1', 
        location: { latitude: 42.6977, longitude: 23.3219 },
        waitTime: 1000 
      },
      { 
        action: 'rapid_street_2', 
        location: { latitude: 42.6990, longitude: 23.3240 },
        waitTime: 1000 
      },
      { 
        action: 'rapid_street_3', 
        location: { latitude: 42.7000, longitude: 23.3260 },
        waitTime: 1000 
      },
      { 
        action: 'rapid_street_1', 
        location: { latitude: 42.6977, longitude: 23.3219 },
        expectedVisitCount: 2,
        waitTime: 1000 
      },
      { action: 'stop_tracking' },
    ],
  },
  {
    name: 'Long Session Tracking',
    description: 'Test extended tracking session with time calculations',
    steps: [
      { action: 'initialize' },
      { action: 'start_tracking' },
      { 
        action: 'enter_street', 
        location: { latitude: 42.6977, longitude: 23.3219 },
        waitTime: 10000 // 10 seconds
      },
      { 
        action: 'stay_long', 
        location: { latitude: 42.6977, longitude: 23.3219 },
        waitTime: 30000 // 30 seconds
      },
      { 
        action: 'leave_street', 
        location: { latitude: 42.7000, longitude: 23.3300 },
        waitTime: 2000 
      },
      { action: 'stop_tracking' },
    ],
  },
];

export class LocationTrackingE2E {
  private service: LocationTrackingService;
  private testResults: Map<string, any> = new Map();

  constructor() {
    this.service = LocationTrackingService.getInstance();
  }

  async runAllScenarios(): Promise<E2EResults> {
    const results: E2EResults = {
      scenarios: [],
      totalPassed: 0,
      totalFailed: 0,
      startTime: Date.now(),
      endTime: 0,
    };

    for (const scenario of E2E_SCENARIOS) {
      console.log(`\n🚀 Starting E2E Scenario: ${scenario.name}`);
      console.log(`Description: ${scenario.description}`);
      
      const scenarioResult = await this.runScenario(scenario);
      results.scenarios.push(scenarioResult);
      
      if (scenarioResult.passed) {
        results.totalPassed++;
        console.log(`✅ ${scenario.name} PASSED`);
      } else {
        results.totalFailed++;
        console.log(`❌ ${scenario.name} FAILED`);
        console.log(`Errors: ${scenarioResult.errors.join(', ')}`);
      }

      // Clean up between scenarios
      await this.cleanupScenario();
    }

    results.endTime = Date.now();
    this.printFinalResults(results);
    return results;
  }

  private async runScenario(scenario: E2ETestScenario): Promise<ScenarioResult> {
    const result: ScenarioResult = {
      name: scenario.name,
      passed: true,
      errors: [],
      steps: [],
      startTime: Date.now(),
      endTime: 0,
    };

    try {
      for (const step of scenario.steps) {
        console.log(`  📍 Step: ${step.action}`);
        const stepResult = await this.executeStep(step);
        result.steps.push(stepResult);

        if (!stepResult.passed) {
          result.passed = false;
          result.errors.push(`Step '${step.action}' failed: ${stepResult.error}`);
        }

        if (step.waitTime) {
          await this.wait(step.waitTime);
        }
      }
    } catch (error) {
      result.passed = false;
      result.errors.push(`Scenario failed: ${error.message}`);
    }

    result.endTime = Date.now();
    return result;
  }

  private async executeStep(step: any): Promise<StepResult> {
    const stepResult: StepResult = {
      action: step.action,
      passed: true,
      error: null,
      actualValue: null,
      expectedValue: step.expectedStreetId || step.expectedVisitCount,
    };

    try {
      switch (step.action) {
        case 'initialize':
          await this.service.initializeData('test-token');
          stepResult.actualValue = 'initialized';
          break;

        case 'start_tracking':
          await this.service.startLocationTracking(false);
          stepResult.actualValue = this.service.isTracking();
          stepResult.passed = this.service.isTracking();
          break;

        case 'stop_tracking':
          await this.service.stopLocationTracking('test-token');
          stepResult.actualValue = this.service.isTracking();
          stepResult.passed = !this.service.isTracking();
          break;

        case 'move_to_street':
        case 'stay_on_street':
        case 'move_to_new_street':
        case 'enter_street':
        case 'stay_long':
        case 'rapid_street_1':
        case 'rapid_street_2':
        case 'rapid_street_3':
          if (step.location) {
            await this.simulateLocationUpdate(step.location);
            stepResult.actualValue = this.service.getCurrentStreetId();
            
            if (step.expectedStreetId !== undefined) {
              stepResult.passed = stepResult.actualValue === step.expectedStreetId;
            }
          }
          break;

        case 'leave_street':
          if (step.location) {
            await this.simulateLocationUpdate(step.location);
            stepResult.actualValue = this.service.getCurrentStreetId();
            stepResult.passed = stepResult.actualValue === null;
          }
          break;

        case 'save_data':
          await this.service.saveVisitedStreetsToDatabase('test-token');
          stepResult.actualValue = 'data_saved';
          stepResult.passed = true;
          break;

        default:
          throw new Error(`Unknown step action: ${step.action}`);
      }

      // Check visit count if specified
      if (step.expectedVisitCount !== undefined && stepResult.passed) {
        const streetId = this.service.getCurrentStreetId();
        if (streetId) {
          const visitData = this.service.getStreetVisitData(streetId);
          stepResult.actualValue = visitData?.visitCount || 0;
          stepResult.passed = stepResult.actualValue === step.expectedVisitCount;
        }
      }

    } catch (error) {
      stepResult.passed = false;
      stepResult.error = error.message;
    }

    return stepResult;
  }

  private async simulateLocationUpdate(coords: { latitude: number; longitude: number }) {
    const mockLocation = {
      coords: {
        ...coords,
        altitude: null,
        accuracy: 10,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    // Inject mock street data for testing
    (this.service as any).streetData = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'street_123',
          geometry: {
            type: 'LineString',
            coordinates: [[23.3219, 42.6977], [23.3225, 42.6983]],
          },
          properties: { name: 'Test Street 1', highway: 'residential' },
        },
        {
          type: 'Feature',
          id: 'street_456',
          geometry: {
            type: 'LineString',
            coordinates: [[23.3240, 42.6990], [23.3246, 42.6996]],
          },
          properties: { name: 'Test Street 2', highway: 'secondary' },
        },
      ],
    };

    (this.service as any).handleLocationUpdate(mockLocation);
  }

  private async cleanupScenario() {
    await this.service.destroy();
    (LocationTrackingService as any).instance = null;
    this.service = LocationTrackingService.getInstance();
    await AsyncStorage.clear();
  }

  private async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private printFinalResults(results: E2EResults) {
    console.log('\n' + '='.repeat(50));
    console.log('           E2E TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`Total Scenarios: ${results.scenarios.length}`);
    console.log(`Passed: ${results.totalPassed}`);
    console.log(`Failed: ${results.totalFailed}`);
    console.log(`Duration: ${results.endTime - results.startTime}ms`);
    
    if (results.totalFailed > 0) {
      console.log('\nFailed Scenarios:');
      results.scenarios
        .filter(s => !s.passed)
        .forEach(s => {
          console.log(`  - ${s.name}`);
          s.errors.forEach(error => console.log(`    Error: ${error}`));
        });
    }
    
    console.log('='.repeat(50));
  }
}

interface E2EResults {
  scenarios: ScenarioResult[];
  totalPassed: number;
  totalFailed: number;
  startTime: number;
  endTime: number;
}

interface ScenarioResult {
  name: string;
  passed: boolean;
  errors: string[];
  steps: StepResult[];
  startTime: number;
  endTime: number;
}

interface StepResult {
  action: string;
  passed: boolean;
  error: string | null;
  actualValue: any;
  expectedValue: any;
}

// Debug utilities for manual testing
export class LocationTrackingDebugger {
  private service: LocationTrackingService;
  private debugLog: DebugLogEntry[] = [];

  constructor() {
    this.service = LocationTrackingService.getInstance();
    this.setupDebugLogging();
  }

  private setupDebugLogging() {
    // Intercept console.log to capture debug info
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      this.addDebugLog('log', args.join(' '));
      originalLog(...args);
    };

    console.error = (...args) => {
      this.addDebugLog('error', args.join(' '));
      originalError(...args);
    };

    console.warn = (...args) => {
      this.addDebugLog('warn', args.join(' '));
      originalWarn(...args);
    };
  }

  private addDebugLog(level: 'log' | 'error' | 'warn', message: string) {
    this.debugLog.push({
      timestamp: Date.now(),
      level,
      message,
    });

    // Keep only last 100 entries
    if (this.debugLog.length > 100) {
      this.debugLog.shift();
    }
  }

  public getServiceState(): ServiceDebugInfo {
    return {
      currentStreetId: this.service.getCurrentStreetId(),
      isTracking: this.service.isTracking(),
      streetDataFeatures: this.service.getStreetData()?.features?.length || 0,
      visitedStreetsCount: this.service.getVisitedStreets().length,
      allVisitedStreetIds: Array.from(this.service.getAllVisitedStreetIds()),
      totalActiveHours: this.service.getTotalActiveHours(),
      currentSessionDuration: this.service.getCurrentSessionDuration(),
      mostVisitedStreets: this.service.getMostVisitedStreets(5),
    };
  }

  public getRecentLogs(count: number = 20): DebugLogEntry[] {
    return this.debugLog.slice(-count);
  }

  public simulateUserMovement(path: Array<{ lat: number; lng: number; waitMs?: number }>) {
    return new Promise<void>((resolve) => {
      let index = 0;
      
      const moveNext = () => {
        if (index >= path.length) {
          resolve();
          return;
        }

        const point = path[index];
        console.log(`Moving to: ${point.lat}, ${point.lng}`);
        
        const mockLocation = {
          coords: {
            latitude: point.lat,
            longitude: point.lng,
            altitude: null,
            accuracy: 10,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        };

        (this.service as any).handleLocationUpdate(mockLocation);
        
        index++;
        setTimeout(moveNext, point.waitMs || 2000);
      };

      moveNext();
    });
  }

  public generateReport(): string {
    const state = this.getServiceState();
    const logs = this.getRecentLogs(10);

    return `
LOCATION TRACKING DEBUG REPORT
Generated: ${new Date().toISOString()}

SERVICE STATE:
- Current Street: ${state.currentStreetId || 'None'}
- Is Tracking: ${state.isTracking}
- Street Data Features: ${state.streetDataFeatures}
- Visited Streets (Session): ${state.visitedStreetsCount}
- All Visited Streets: ${state.allVisitedStreetIds.length}
- Total Active Hours: ${state.totalActiveHours.toFixed(2)}
- Current Session: ${state.currentSessionDuration.toFixed(2)} hours

MOST VISITED STREETS:
${state.mostVisitedStreets.map(s => 
  `- Street ${s.streetId}: ${s.visitData.visitCount} visits`
).join('\n')}

RECENT LOGS:
${logs.map(log => 
  `[${new Date(log.timestamp).toISOString()}] ${log.level.toUpperCase()}: ${log.message}`
).join('\n')}
    `;
  }

  public exportDebugData(): DebugExportData {
    return {
      timestamp: Date.now(),
      serviceState: this.getServiceState(),
      debugLogs: this.debugLog,
      visitData: Array.from(this.service.getAllStreetVisitData().entries()),
    };
  }
}

interface ServiceDebugInfo {
  currentStreetId: string | null;
  isTracking: boolean;
  streetDataFeatures: number;
  visitedStreetsCount: number;
  allVisitedStreetIds: string[];
  totalActiveHours: number;
  currentSessionDuration: number;
  mostVisitedStreets: any[];
}

interface DebugLogEntry {
  timestamp: number;
  level: 'log' | 'error' | 'warn';
  message: string;
}

interface DebugExportData {
  timestamp: number;
  serviceState: ServiceDebugInfo;
  debugLogs: DebugLogEntry[];
  visitData: [string, any][];
}

// Test runner command-line interface
export async function runLocationTests(testType: 'unit' | 'integration' | 'e2e' | 'all' = 'all') {
  console.log(`Starting Location Tracking Tests: ${testType}`);
  
  const results = {
    unit: null as any,
    integration: null as any,
    e2e: null as any,
  };

  try {
    if (testType === 'unit' || testType === 'all') {
      console.log('\n--- Running Unit Tests ---');
      // Unit tests would be run via Jest
      results.unit = 'Run via: npm test';
    }

    if (testType === 'integration' || testType === 'all') {
      console.log('\n--- Running Integration Tests ---');
      // Integration tests would also be run via Jest
      results.integration = 'Run via: npm test -- --testPathPattern=integration';
    }

    if (testType === 'e2e' || testType === 'all') {
      console.log('\n--- Running E2E Tests ---');
      const e2eRunner = new LocationTrackingE2E();
      results.e2e = await e2eRunner.runAllScenarios();
    }

    return results;
  } catch (error) {
    console.error('Test execution failed:', error);
    throw error;
  }
}

// Manual testing utilities for development
export const LocationTestUtils = {
  // Quick debug current state
  debugCurrentState: () => {
    const debugger = new LocationTrackingDebugger();
    console.log(debugger.generateReport());
  },

  // Test specific coordinates
  testCoordinates: async (coords: Array<{ lat: number; lng: number }>) => {
    const debugger = new LocationTrackingDebugger();
    await debugger.simulateUserMovement(
      coords.map(c => ({ ...c, waitMs: 3000 }))
    );
    console.log('Movement simulation complete');
    console.log(debugger.generateReport());
  },

  // Test street detection
  testStreetDetection: async () => {
    const sofiaCoords = [
      { lat: 42.6977, lng: 23.3219 }, // Downtown Sofia
      { lat: 42.6850, lng: 23.3200 }, // Move south
      { lat: 42.7100, lng: 23.3350 }, // Move north
      { lat: 42.6950, lng: 23.3100 }, // Move west
    ];

    await LocationTestUtils.testCoordinates(sofiaCoords);
  },
};