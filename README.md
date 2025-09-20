# CityStat

This is a mobile app build using expo, raec

## Tech Stack

 - react native
 - expo 



## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Create eas development build
 
  ```bash
    eas build --platform android --profile development      
   ```


3. Start the app

   ```bash
   npx expo start --clear
   ```

4. Scan the QR code and run the dev directly build on your phone

5. Strange error
 Comment this line 
  ```bash
 <data android:scheme="exp+[My app]"/>
   ```
   from AndroidManifest.xml file



## Build apk

```bash
# download credentials from EAS
eas credentials -p android

# move creadentials to android dir
cd android
cp ../credentials/android/keystore.jks app/keystore.jks
cd ..

# run build script
./build-android.sh
```

After the build is ready move the apk file to your phone(use usb) and execut




- chart you vs avg for yout town
- chartyou vs avg for you friend
- straight bars for the whole year showing how many streets you covered each mont
- curve line from the month showing streets covered each day
- comparison chart 1v1 compare
- func that constatnly tracks if the user is mooving, if he stops than "draw" cirly around him with x radius and start a timer(for later stat for most time spent im what places) 


- under profile/home add dashboard with statistics, achivements, goals, challenges 

using Observer Pattern (Event Listeners) for the location tracking(Why: Allows multiple components to react to location events without tight coupling.)

## To-Do List

- [x] Fix clerk webhhoks for persisting users into neon db
- [ ] Add error handlig in signin and sign up(wrong emeil, wrong passwrds ....)
- [ ] Add google auth sigin
- [] When onboarding user chooses the city to play
- [] Make a conetext for the lo0ged user data 
- [] make a speed cap(if user is faster thatn x do not save the data to db) - walk only game
- [] make a leaderboard
- [] add users default profile pick
- [] add image picker in the tutoriaol screen
- [] order friends in alphabetical order 
- [] fix share invite, copy link,....


- Walking/Running distance: Kilometers covered in the city by walking and by running
Speed trends: Average speed in different areas (walking in parks vs. traffic zones)
Most visited areas: "Your personal hotspots."
Green space coverage: % of your walking that’s inside parks/green zones.
Elevation changes: How much uphill/downhill travel you’ve done in the city.
Street streaks: Longest unbroken walk without repeating streets.
Color map: Heatmap of how much of the city you’ve “painted” by visiting.   
Friends overlap: Compare areas visited with friends (privacy-conscious, opt-in).
Shared challenges: Community quests like "cover the whole city as a group."
Everyday push notification to the user with reminder to start the apps traking

- location tracking enabling is saved but not fetched 


PREDICTIONS FEATURE:
Predictive patterns: Where you’re most likely to be at a given time.


onboarding flow:
after download the user first should see the tutrial, then the sigin(for user conversion purposes)
remove the imail verificationfrom clerk(why making it harder for your users)




- [] v2 - mutyple cities


NOW FIX: 
add Auth error handling
add filetringon the searched users in the topdrawer
userSearch should serach by username, first last name, city and so on...(currently searches only be userName)
searchUsers should give users that match100% if not 100% match then the closest to the search(currently it isdisplying only 100% match)
the app doesnt work offline(if user do not have networ access disply aller to start their wifi/mobile data)
sign in req, then server 503 error but user redirected to home screen(this should not happen, when server down suer should stayat sig in screen)
make the sign up and onboarding as easy as possible(clerk with google auth)
use the search icon in the home screento serach users and ther profiles
complete edit profile
added location acceptance in user details so update server to handle it in the suer details request
before tracking was tured on when getting the location, now that location is enabled in the onboarding tracking should be truned on in the initialization of the map(check background location access and start the location)
in the best case the app works, often there is big inconcistency in every part of it
chnage session street to daily street
huge inconsistency
total street is correct but do not drawing(sometimes) the streets
too much write operations with often server sync???
traking is sometimes inactive ?? why 
most time spent in map menu pane is displayed wrong and probsave in db wrong
duration filed in db in visited_streets in useless cause total_time_spent and avg_time+spend exist
in server duration is used to calculate thestreet distance
dublicated visited street ids
dont show suggestion if no users
points are wrong
visited streets dispy a single street miltioke times
make the sessions longer and if a street is already in a session do not add visited_count to it
dont add visit_COUNT TO A STREET IF USERS HASNT left it 
if user is not in the bbox of the city he has chosen do not save visited streets or street_visit_stat or activeHours - noting
wrong time in lastLogin & lastActivity and prob. in many more(prob. some timezones shit)


-----------------------------------------------------------------
FUTURE:

MovementPatternService
Gait Analysis: Detect walking patterns, stability, limping
Daily Movement Score: Rate how active the user was
Sedentary Time Tracking: Alert when user sits too long
Movement Consistency: Track regular vs irregular movement patterns


ActivityTrackingService
Walking/Running Detection: Detect different movement types (walking, running, cycling, driving)
Step Counter Integration: Track steps, distance, calories burned
Route Recording: Save favorite walking routes, track route completion
Activity Sessions: Detect when user starts/stops exercising
Health Metrics: Heart rate zones, pace tracking, elevation gain


SoundscapeTrackingService
Ambient Noise Detection: Traffic, nature, crowds, quiet areas
Noise Level Mapping: Create personal noise pollution maps
Sound Environment Preferences: Track preferred acoustic environments
Audio Location Fingerprinting: Identify locations by sound patterns



NetworkConnectivityService
WiFi Network Mapping: Automatically map and name WiFi networks by location
Connection Quality Tracking: Signal strength, speed patterns by location
Data Usage Patterns: Where you use most cellular data
Connectivity Dead Zones: Map areas with poor connection



CommuteAnalysisService
Route Optimization: Track which routes are fastest at different times
Transportation Mode Detection: Walking, driving, public transit, cycling
Commute Stress Analysis: Correlate routes with mood/stress indicators
Cost Tracking: Fuel costs, parking fees, transit expenses by route


MoodLocationService
Emotional Geography: Map your emotional states to locations
Mood Pattern Recognition: Predict mood based on location/time
Therapeutic Location Discovery: Find places that improve mood
Emotional Support Mapping: Where you go when feeling certain ways 

-----------------------------------------------------------



Areas for Improvement

1. Memory Management
// Current approach loads all streets in memory
private streetData: StreetData | null = null;

// Better: Implement spatial indexing
private streetIndex: RTree<Street> = new RTree();  

2. Error Recovery
// Add circuit breaker pattern for API calls
class ApiCircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  
  async call<T>(apiCall: () => Promise<T>): Promise<T> {
    if (this.shouldReject()) throw new Error("Circuit breaker open");
    
    try {
      const result = await apiCall();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}  

3. Performance Optimization
// Add debounced location updates
private debouncedLocationUpdate = debounce(this.handleLocationUpdate.bind(this), 1000);

// Implement spatial partitioning for street data
private getStreetsInBounds(bounds: BBox): Street[] {
  return this.streetIndex.search(bounds);
}




1. State Management Complexity
// Current: Multiple useState calls
const [userLocation, setUserLocation] = useState<UserCoords | null>(null);
const [currentStreetId, setCurrentStreetId] = useState<string | null>(null);
const [streetData, setStreetData] = useState<StreetData | null>(null);
// ... many more

// Better: Use useReducer for complex state
interface LocationState {
  userLocation: UserCoords | null;
  currentStreetId: string | null;
  streetData: StreetData | null;
  visitedStreets: VisitedStreet[];
  allVisitedStreetIds: Set<string>;
  // ... all other state
}

const locationReducer = (state: LocationState, action: LocationAction): LocationState => {
  switch (action.type) {
    case 'LOCATION_UPDATE':
      return { ...state, userLocation: action.payload };
    case 'STREET_CHANGE':
      return { 
        ...state, 
        currentStreetId: action.payload.streetId,
        visitedStreets: action.payload.visitedStreets,
        allVisitedStreetIds: action.payload.allVisitedStreetIds
      };
    // ... other cases
  }
};

2. Memory Leaks Prevention
// Add cleanup for all intervals and listeners
useEffect(() => {
  return () => {
    // Current cleanup is good, but could be more comprehensive
    locationService.destroy();
    // Clear any remaining timers/intervals
    if (sessionInterval) clearInterval(sessionInterval);
  };
}, []);


// Memoize expensive calculations
const mapConfiguration = useMemo(() => ({
  styleURL: Mapbox.StyleURL.Street,
  zoomLevel: 13,
  centerCoordinate: userLocation 
    ? [userLocation.longitude, userLocation.latitude]
    : [23.3219, 42.6977]
}), [userLocation]);

1. Component Decomposition
// Current: Large monolithic component
const StreetTrackingMap = () => {
  // 200+ lines of logic
};

// Better: Split into smaller components
const StreetTrackingMap = () => {
  return (
    <MapContainer>
      <MapView>
        <UserLocationMarker />
        <StreetLayers />
        <CurrentStreetHighlight />
      </MapView>
      <MapControls>
        <CenterButton />
        <MenuToggle />
      </MapControls>
      <MapMenu />
    </MapContainer>
  );
};


3. Performance Optimization   
// Virtualize large street datasets
const visibleStreets = useMemo(() => {
  if (!streetData || !mapBounds) return [];
  return streetData.features.filter(street => 
    isStreetInBounds(street, mapBounds)
  );
}, [streetData, mapBounds]);





Major Professional Improvements Needed

State Management: Replace multiple useState with useReducer or Redux Toolkit
Testing: Add unit, integration, and E2E tests
Performance: Implement spatial indexing and data virtualization for large datasets
Monitoring: Add telemetry, crash reporting, and performance metrics
Code Organization: Break down the large components into smaller, focused ones

The system shows excellent architectural thinking but needs production-ready enhancements for scalability, maintainability, and reliability.