# Maintenance Minder Pro 🔧

Never forget another maintenance task. Track your cars, home, and appliances in one place.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## Features

✅ **Track Everything** - Cars, homes, appliances, and more  
✅ **Smart Reminders** - Push notifications before maintenance is due  
✅ **Service History** - Complete log of all maintenance performed  
✅ **Quick Add** - One-tap add for common items with auto-generated tasks  
✅ **Service Providers** - Save your trusted mechanics, plumbers, electricians  
✅ **Statistics** - Track spending, completion rates, and trends  
✅ **Import/Export** - Backup and restore your data  
✅ **Beautiful UI** - Dark mode, clean, professional design  
✅ **Offline First** - All data stored locally  
✅ **Pre-built Templates** - 15+ common tasks per category added automatically  
✅ **Task Deferral** - Long-press to push tasks to later dates  
✅ **Sorting & Filtering** - Organize items by name, type, date, or priority

## Screenshots

| Dashboard | Items | Calendar | Statistics |
|-----------|-------|----------|------------|
| Stats & upcoming tasks | All your items | Visual schedule | Spending & trends |

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

# Configure your Apple Developer account in app.json
# Update bundleIdentifier, ascAppId, appleTeamId

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Android (Play Store)

```bash
# Build APK (with bundled JS)
eas build --platform android --profile production

# Or build locally
npx expo run:android --variant release

# Submit to Play Store
eas submit --platform android
```

## App Store Submission Checklist

Before submitting to the App Store, ensure:

- [ ] Update `app.json` with your bundle identifier
- [ ] Configure Apple Developer team ID in `eas.json`
- [ ] Create App Store listing (screenshots, description, keywords)
- [ ] Prepare privacy policy URL
- [ ] Test on physical device
- [ ] Verify push notifications work
- [ ] Test all flows (add item, complete task, etc.)

## Project Structure

```
maintenance-minder-pro/
├── App.tsx                 # App entry point
├── app.json               # Expo config
├── eas.json               # EAS Build config
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── FAB.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Header.tsx
│   │   ├── ItemCard.tsx
│   │   └── TaskCard.tsx
│   ├── context/           # React Context (state management)
│   │   ├── AppContext.tsx
│   │   └── types.ts
│   ├── navigation/        # React Navigation setup
│   │   ├── AppNavigator.tsx
│   │   ├── TabNavigator.tsx
│   │   └── types.ts
│   ├── screens/           # App screens
│   │   ├── dashboard/     # Home dashboard
│   │   ├── items/         # Item management
│   │   ├── tasks/         # Task management
│   │   ├── calendar/      # Calendar view
│   │   ├── settings/      # App settings
│   │   ├── stats/         # Statistics & analytics
│   │   ├── quickadd/      # Quick add items
│   │   ├── providers/     # Service providers
│   │   ├── notifications/ # Notification center
│   │   └── onboarding/    # First-time user flow
│   ├── services/          # Business logic
│   │   ├── storage.ts     # AsyncStorage helpers
│   │   ├── notifications.ts # Push notifications
│   │   ├── templates.ts   # Maintenance templates
│   │   └── sync.ts        # Cloud sync (placeholder)
│   ├── theme/             # Colors & styles
│   └── utils/             # Helper functions
└── assets/                # Images & icons
```

## Pre-built Maintenance Templates (15+ per category)

### Car Maintenance
- Oil Change, Tire Rotation, Air Filter, Brake Inspection
- Transmission Fluid, Coolant Flush, Battery Check, Wiper Blades
- Spark Plugs, Cabin Air Filter, Brake Fluid, Tire Pressure
- Car Wash, Interior Detail

### Home Maintenance
- HVAC Filter, Smoke/CO2 Detector Batteries
- Gutter Cleaning, Water Heater Flush, Dryer Vent
- Pest Control, Roof Inspection, Septic Pump
- Furnace Inspection, Chimney Sweep, Fire Extinguisher

### Appliance Maintenance
- Refrigerator Coil Cleaning, Dishwasher Filter
- Washing Machine Clean, Oven Deep Clean, Range Hood Filter
- Microwave Clean, Water Filter, AC Unit Filter
- Garage Door Service, Pool/Spa Maintenance

## Tech Stack

- **Framework**: React Native + Expo SDK 54
- **Navigation**: React Navigation 6
- **Storage**: AsyncStorage
- **Notifications**: Expo Notifications
- **Icons**: @expo/vector-icons (Ionicons)
- **Dates**: date-fns
- **UUID**: uuid
- **TypeScript**: Full type safety

## Data Model

### Item
- id, name, type (car/home/appliance/other)
- subtype, brand, model
- purchaseDate, warrantyExpiry
- notes, createdAt, updatedAt

### MaintenanceTask
- id, itemId, name, description
- intervalDays, lastCompleted, nextDue
- reminderDaysBefore, priority (low/medium/high/critical)
- estimatedCost, isActive

### MaintenanceLog
- id, taskId, itemId, completedAt
- cost, provider, notes

## Cloud Sync (Coming Soon)

The app includes sync infrastructure (`src/services/sync.ts`) ready for Supabase integration. To enable cloud backup:

1. Create a Supabase project
2. Add your credentials
3. Implement the cloud sync functions

## Privacy

- All data stored locally on device
- No data sent to external servers (current version)
- Notification preferences stored locally

## License

MIT License - feel free to use for commercial projects.

## Support

For issues or feature requests, open a GitHub issue.

---

Built with ❤️ for people who want to take better care of their stuff.
