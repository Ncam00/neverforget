# NeverForget — Setup Guide

## Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (for building): `npm install -g eas-cli`
- Expo Go app on your phone (for testing)

## Install & Run

```bash
cd neverforget
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

## Build for App Store / Google Play

1. Create an Expo account at expo.dev
2. Run: `eas login`
3. Run: `eas build:configure`
4. Update the `projectId` in app.json with your EAS project ID

### Android (APK for testing):
```bash
eas build -p android --profile preview
```

### iOS (requires Apple Developer account $99/yr):
```bash
eas build -p ios
```

### Submit to stores:
```bash
eas submit -p android
eas submit -p ios
```

## Assets needed before publishing
Place these in the `assets/` folder:
- `icon.png` — 1024x1024 app icon (black bg, gold elephant logo)
- `splash.png` — 1284x2778 splash screen
- `adaptive-icon.png` — 1024x1024 Android adaptive icon foreground
- `notification-icon.png` — 96x96 white icon for Android notifications

## Push Notifications
- Works on real devices only (not simulators)
- Android: notifications work out of the box with Expo
- iOS: requires an Apple Developer account for production push certificates

## Features
- Add tasks with optional notes and custom reminder times
- Tasks carry over to the next day if not completed
- 8 PM daily reminder for all pending tasks
- Per-task reminder at the time you set
- Gold elephant theme (🐘 "An elephant never forgets")
