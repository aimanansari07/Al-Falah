#!/bin/bash
set -e

ADB=~/Library/Android/sdk/platform-tools/adb
APK=android/app/build/outputs/apk/debug/app-debug.apk

echo "========================================="
echo "  Al-Falah — Building Debug APK"
echo "========================================="

# 1. Build the web assets
echo ""
echo "[1/4] Building React app..."
npm run build

# 2. Sync with Capacitor
echo ""
echo "[2/4] Syncing Capacitor..."
npx cap sync android

# 3. Build the APK
echo ""
echo "[3/4] Running Gradle assembleDebug..."
cd android
./gradlew assembleDebug
cd ..

# 4. Install via USB if a device is connected
echo ""
DEVICES=$($ADB devices | grep -v "List of devices" | grep "device$" | wc -l | tr -d ' ')
if [ "$DEVICES" -gt "0" ]; then
  echo "[4/4] Installing on connected device via USB..."
  $ADB install -r "$APK"
  echo ""
  echo "========================================="
  echo "  ✅ Installed on your phone!"
  echo "========================================="
else
  echo "[4/4] No device connected — skipping install."
  echo ""
  echo "========================================="
  echo "  ✅ Debug APK ready!"
  echo "  📦 $APK"
  echo "  💡 Connect phone via USB and run:"
  echo "     $ADB install -r $APK"
  echo "========================================="
fi
