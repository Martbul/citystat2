#!/bin/bash
set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting iOS build process...${NC}"

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ Error: iOS builds can only be created on macOS.${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from your project root.${NC}"
    exit 1
fi

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}❌ Error: Xcode not found. Please install Xcode from the App Store.${NC}"
    exit 1
fi

# Check for CocoaPods
if ! command -v pod &> /dev/null; then
    echo -e "${RED}❌ Error: CocoaPods not found. Installing...${NC}"
    sudo gem install cocoapods
fi

# Check if ios directory exists
if [ ! -d "ios" ]; then
    echo -e "${YELLOW}⚠️ iOS directory not found. Creating with prebuild...${NC}"
else
    # Clean previous builds
    echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
    cd ios && xcodebuild clean && cd ..
fi

# Prebuild
echo -e "${YELLOW}⚙️ Running prebuild...${NC}"
npx expo prebuild --platform ios --clean

# Install CocoaPods dependencies
echo -e "${YELLOW}📦 Installing CocoaPods dependencies...${NC}"
cd ios && pod install && cd ..

# Get app name from app.json or expo.json
APP_NAME=$(node -p "
const fs = require('fs');
let config;
if (fs.existsSync('app.json')) {
  config = require('./app.json');
} else if (fs.existsSync('expo.json')) {
  config = require('./expo.json');
} else {
  console.error('No app.json or expo.json found');
  process.exit(1);
}
config.expo ? config.expo.name : config.name;
")

# Set build configuration
BUILD_CONFIG="Release"
SCHEME="$APP_NAME"

# Create archive
echo -e "${YELLOW}📦 Creating iOS archive...${NC}"
ARCHIVE_PATH="build/${APP_NAME}.xcarchive"
mkdir -p build

cd ios
xcodebuild archive \
    -workspace "${APP_NAME}.xcworkspace" \
    -scheme "$SCHEME" \
    -configuration "$BUILD_CONFIG" \
    -archivePath "../$ARCHIVE_PATH" \
    -destination "generic/platform=iOS" \
    CODE_SIGNING_ALLOWED=NO \
    CODE_SIGN_IDENTITY="" \
    PROVISIONING_PROFILE=""
cd ..

# Check if archive was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Archive creation failed!${NC}"
    exit 1
fi

# Export IPA for development/ad-hoc distribution
echo -e "${YELLOW}📱 Exporting IPA...${NC}"

# Create export options plist for development
cat > build/ExportOptions.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>development</string>
    <key>thinning</key>
    <string>&lt;none&gt;</string>
</dict>
</plist>
EOF

# Export IPA
IPA_PATH="build/${APP_NAME}.ipa"
xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportOptionsPlist "build/ExportOptions.plist" \
    -exportPath "build/export"

# Move IPA to expected location
mv "build/export/${APP_NAME}.ipa" "$IPA_PATH"

# Check if export was successful
if [ $? -eq 0 ] && [ -f "$IPA_PATH" ]; then
    echo -e "${GREEN}✅ Build completed successfully!${NC}"
    echo -e "${BLUE}📱 IPA location: ${IPA_PATH}${NC}"
    
    # Optional: Copy to releases folder with timestamp
    echo -e "${YELLOW}📁 Creating releases folder and copying IPA...${NC}"
    mkdir -p releases
    
    # Get app version from package.json
    APP_VERSION=$(node -p "require('./package.json').version")
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    IPA_NAME="citystat2-ios-v${APP_VERSION}-${TIMESTAMP}.ipa"
    
    cp "$IPA_PATH" "releases/${IPA_NAME}"
    echo -e "${GREEN}📁 IPA copied to: releases/${IPA_NAME}${NC}"
    
    # Get file size
    FILE_SIZE=$(du -h "releases/${IPA_NAME}" | cut -f1)
    echo -e "${BLUE}📊 IPA size: ${FILE_SIZE}${NC}"
    
    # Open releases folder
    if command -v open &> /dev/null; then
        echo -e "${YELLOW}📂 Opening releases folder...${NC}"
        open releases
    fi
    
    echo -e "${GREEN}🎉 All done! Your IPA is ready.${NC}"
    echo -e "${YELLOW}📋 Installation instructions:${NC}"
    echo -e "${BLUE}1. For testing on your device:${NC}"
    echo -e "   • Use Xcode to install directly to connected device"
    echo -e "   • Or use tools like iOS App Installer, 3uTools, or Cydia Impactor"
    echo -e "${BLUE}2. For TestFlight distribution:${NC}"
    echo -e "   • Upload to App Store Connect for internal/external testing"
    echo -e "${BLUE}3. For enterprise distribution:${NC}"
    echo -e "   • Host the IPA file and create an installation manifest"
    
else
    echo -e "${RED}❌ IPA export failed!${NC}"
    exit 1
fi

# Clean up temporary files
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
rm -rf build/export
rm -f build/ExportOptions.plist