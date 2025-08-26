
## Comands Reference
run: ./build-android.sh in the root to build the project
# Development workflow
npm run android:debug              # Build debug APK
npm run android:release           # Build release APK  
npm run android:bundle           # Build release AAB
npm run version:patch && npm run build:android  # Bump version & build

# Release workflow
./scripts/pre-build-checks.sh     # Run all checks
npm run version:minor             # Bump version
npm run build:android-bundle      # Build for Play Store
node scripts/generate-changelog.js # Update changelog

# Quick build
chmod +x scripts/build-android.sh
./scripts/build-android.sh

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

- [] v2 - mutyple cities





# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.





- chart you vs avg for yout town
- chartyou vs avg for you friend
- straight bars for the whole year showing how many streets you covered each mont
- curve line from the month showing streets covered each day
- comparison chart 1v1 compare
- func that constatnly tracks if the user is mooving, if he stops than "draw" cirly around him with x radius and start a timer(for later stat for most time spent im what places) 


- under profile/home add dashboard with statistics, achivements, goals, challenges 