#!/bin/bash
set -e

echo "========================================="
echo "  Al-Falah — Building Release APK"
echo "========================================="

# 1. Build the web assets
echo ""
echo "[1/4] Building React app (production)..."
npm run build

# 2. Sync with Capacitor
echo ""
echo "[2/4] Syncing Capacitor..."
npx cap sync android

# 3. Build the signed release APK
echo ""
echo "[3/4] Running Gradle assembleRelease..."
cd android
./gradlew assembleRelease
cd ..

# 4. Done
echo ""
echo "========================================="
echo "  ✅ Release APK ready!"
echo "  📦 android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "  To sign with your keystore:"
echo "  jarsigner -keystore al-falah.keystore \\"
echo "    android/app/build/outputs/apk/release/app-release-unsigned.apk \\"
echo "    al-falah"
echo "========================================="
