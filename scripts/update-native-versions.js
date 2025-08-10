const fs = require("fs");
const path = require("path");

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = packageJson.version;

// Update app.json/app.config.js
const appConfigPath = "app.json";
if (fs.existsSync(appConfigPath)) {
  const appConfig = JSON.parse(fs.readFileSync(appConfigPath, "utf8"));
  appConfig.expo.version = version;

  // Increment version code for Android
  const currentVersionCode = appConfig.expo.android?.versionCode || 1;
  if (!appConfig.expo.android) appConfig.expo.android = {};
  appConfig.expo.android.versionCode = currentVersionCode + 1;

  fs.writeFileSync(appConfigPath, JSON.stringify(appConfig, null, 2));
  console.log(
    `Updated version to ${version}, versionCode: ${appConfig.expo.android.versionCode}`
  );
}
