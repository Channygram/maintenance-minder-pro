# Maintenance Minder Pro 🔧

Never forget another maintenance task. Track your cars, home, and appliances in one place.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## Features

✅ **Track Everything** - Cars, homes, appliances, and more
✅ **Smart Reminders** - Get notified before maintenance is due  
✅ **Service History** - Complete log of all maintenance performed
✅ **Beautiful UI** - Dark mode, clean design
✅ **Offline First** - All data stored locally
✅ **Pre-built Templates** - Common tasks added automatically

## Screenshots

| Dashboard | Items | Calendar | Settings |
|-----------|-------|----------|----------|
| Stats & upcoming tasks | All your items | Visual schedule | Preferences |

## Quick Start

```bash
# Install dependencies
npm install

# Start development
npx expo start

# Press 'i' for iOS simulator
# Press 'a' for Android emulator
```

## Build for Production

### iOS (App Store)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Android (Play Store)

```bash
# Build APK
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

## Project Structure

```
maintenance-minder-pro/
├── App.tsx                 # App entry point
├── app.json               # Expo config
├── eas.json               # EAS Build config
├── src/
│   ├── components/        # Reusable UI components
│   ├── context/           # React Context (state management)
│   ├── navigation/        # React Navigation setup
│   ├── screens/           # App screens
│   │   ├── dashboard/     # Home dashboard
│   │   ├── items/         # Item management
│   │   ├── tasks/         # Task management
│   │   ├── calendar/      # Calendar view
│   │   ├── settings/      # App settings
│   │   └── onboarding/    # First-time user flow
│   ├── services/          # Business logic
│   │   ├── storage.ts     # AsyncStorage helpers
│   │   ├── notifications.ts # Push notifications
│   │   └── templates.ts   # Maintenance templates
│   ├── theme/             # Colors & styles
│   └── utils/             # Helper functions
└── assets/                # Images & icons
```

## Pre-built Maintenance Templates

### Car Maintenance
- Oil Change (90 days)
- Tire Rotation (180 days)
- Air Filter (365 days)
- Brake Inspection (365 days)
- And more...

### Home Maintenance
- HVAC Filter (90 days)
- Smoke Detector Batteries (180 days)
- Gutter Cleaning (180 days)
- Water Heater Flush (365 days)
- And more...

### Appliance Maintenance
- Refrigerator Coils (180 days)
- Dishwasher Filter (30 days)
- Washing Machine Clean (30 days)
- And more...

## Tech Stack

- **Framework**: React Native + Expo
- **Navigation**: React Navigation 6
- **Storage**: AsyncStorage
- **Notifications**: Expo Notifications
- **Icons**: @expo/vector-icons
- **Dates**: date-fns
- **TypeScript**: Full type safety

## Configuration

### App Store Requirements

Before submitting to the App Store, update `eas.json`:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDE12345"
      }
    }
  }
}
```

### Privacy Policy

You'll need a privacy policy URL. The app collects:
- Item names and details (stored locally)
- Maintenance schedules (stored locally)
- Notification preferences (stored locally)

**No data is sent to external servers.**

## License

MIT License - feel free to use for commercial projects.

## Support

For issues or feature requests, open a GitHub issue.

---

Built with ❤️ for people who want to take better care of their stuff.
