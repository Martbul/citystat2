#!/bin/bash
set -e

echo "🚀 Starting Android build process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android && ./gradlew clean && cd ..

# Prebuild
echo "⚙️ Running prebuild..."
npx expo prebuild --platform android --clean

# Build release APK
echo "📦 Building release APK..."
cd android && ./gradlew assembleRelease

echo "✅ Build completed!"
echo "📱 APK location: android/app/build/outputs/apk/release/app-release.apk"

# Optional: Copy to releases folder
mkdir -p releases
cp android/app/build/outputs/apk/release/app-release.apk releases/citystat2-$(date +%Y%m%d-%H%M%S).apk

echo "📁 APK copied to releases folder"