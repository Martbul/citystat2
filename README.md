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

PREDICTIONS FEATURE:
Predictive patterns: Where you’re most likely to be at a given time.




- [] v2 - mutyple cities

