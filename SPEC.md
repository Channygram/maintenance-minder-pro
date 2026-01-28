# Maintenance Minder Pro - Complete Specification

## Overview
A React Native Expo app for tracking maintenance schedules for cars, homes, and appliances.
App Store ready - must be production quality.

## Tech Stack
- **Framework:** React Native with Expo (SDK 51+)
- **Navigation:** @react-navigation/native with bottom tabs + stack
- **Storage:** @react-native-async-storage/async-storage
- **Notifications:** expo-notifications
- **Icons:** @expo/vector-icons
- **Date handling:** date-fns
- **State:** React Context + useReducer
- **Styling:** StyleSheet (no external UI libraries for smaller bundle)

## Color Palette
```
Primary: #6366F1 (Indigo)
Secondary: #10B981 (Emerald)
Warning: #F59E0B (Amber)
Danger: #EF4444 (Red)
Background: #0F172A (Slate 900)
Surface: #1E293B (Slate 800)
Text: #F8FAFC (Slate 50)
TextMuted: #94A3B8 (Slate 400)
```

## Data Models

### Item
```typescript
interface Item {
  id: string;
  name: string;
  type: 'car' | 'home' | 'appliance' | 'other';
  subtype?: string; // e.g., 'sedan', 'hvac', 'refrigerator'
  brand?: string;
  model?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  location?: string;
  notes?: string;
  imageUri?: string;
  createdAt: string;
  updatedAt: string;
}
```

### MaintenanceTask
```typescript
interface MaintenanceTask {
  id: string;
  itemId: string;
  name: string;
  description?: string;
  intervalDays: number; // How often (0 = one-time)
  lastCompleted?: string;
  nextDue: string;
  reminderDaysBefore: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost?: number;
  notes?: string;
  isActive: boolean;
}
```

### MaintenanceLog
```typescript
interface MaintenanceLog {
  id: string;
  taskId: string;
  itemId: string;
  completedAt: string;
  cost?: number;
  provider?: string;
  notes?: string;
  receiptUri?: string;
}
```

## Screens

### 1. Onboarding (3 screens)
- Welcome screen with app benefits
- Quick setup: "What do you want to track?" (car/home/appliances)
- Notification permission request

### 2. Dashboard (Home Tab)
- Header: "Good morning!" + date
- Stats cards: Items tracked, Tasks due this week, Overdue tasks
- "Due Soon" section: Next 7 days tasks (sorted by date)
- "Overdue" section: Red highlighted, needs attention
- Quick action FAB: Add new item

### 3. Items Tab
- List of all items grouped by type
- Each item shows: icon, name, type, next maintenance due
- Search/filter functionality
- Tap to view item detail

### 4. Item Detail Screen
- Item info header (name, type, image)
- Warranty status badge (if applicable)
- Maintenance schedule list
- Service history
- Edit/Delete actions

### 5. Add/Edit Item Screen
- Form with all item fields
- Type selector with icons
- Date pickers for purchase/warranty
- Photo picker for item image
- Pre-populated maintenance suggestions based on type

### 6. Add/Edit Task Screen
- Task name and description
- Interval selector (custom days or presets)
- Priority selector
- Reminder settings
- Cost estimate

### 7. Complete Task Screen
- Quick completion form
- Cost input
- Provider/notes
- Receipt photo upload

### 8. Settings Tab
- Notification preferences
- Default reminder timing
- Data export (JSON)
- About/Version
- Rate app link
- Privacy policy link

### 9. Reminders Tab (or within Settings)
- Upcoming reminders list
- Snooze/dismiss actions

## Pre-populated Maintenance Templates

### Car Maintenance
- Oil Change: 90 days / 3000 miles
- Tire Rotation: 180 days
- Air Filter: 365 days
- Brake Inspection: 365 days
- Transmission Fluid: 730 days
- Coolant Flush: 730 days
- Battery Check: 365 days
- Wiper Blades: 180 days

### Home Maintenance
- HVAC Filter: 90 days
- Smoke Detector Batteries: 180 days
- Gutter Cleaning: 180 days
- Water Heater Flush: 365 days
- Dryer Vent Cleaning: 365 days
- Pest Control: 90 days
- Roof Inspection: 365 days
- Septic Pump: 1095 days (3 years)

### Appliance Maintenance
- Refrigerator Coils: 180 days
- Dishwasher Filter: 30 days
- Washing Machine Clean: 30 days
- Oven Deep Clean: 90 days
- Range Hood Filter: 90 days

## Navigation Structure
```
BottomTabs
├── Dashboard (Stack)
│   ├── DashboardHome
│   ├── ItemDetail
│   ├── AddEditItem
│   ├── AddEditTask
│   └── CompleteTask
├── Items (Stack)
│   ├── ItemsList
│   ├── ItemDetail
│   └── AddEditItem
├── Calendar (Stack)
│   └── CalendarView
└── Settings (Stack)
    ├── SettingsHome
    ├── Notifications
    ├── About
    └── Export
```

## Key Features to Implement

### 1. Smart Notifications
- Schedule local notifications for upcoming tasks
- Configurable reminder timing (1 day, 3 days, 1 week before)
- Overdue task notifications

### 2. Task Completion Flow
- Mark task complete with one tap
- Optional: add cost, notes, receipt
- Automatically reschedules recurring tasks

### 3. Data Persistence
- All data in AsyncStorage
- Auto-save on changes
- Export to JSON functionality

### 4. First-Time User Experience
- Guided onboarding
- Quick-add templates based on selections
- Sample data option for demo

### 5. Search & Filter
- Search items by name
- Filter by type
- Sort by next due date

## File Structure
```
maintenance-minder-pro/
├── App.tsx
├── app.json
├── package.json
├── src/
│   ├── components/
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── ItemCard.tsx
│   │   ├── TaskCard.tsx
│   │   ├── Header.tsx
│   │   ├── FAB.tsx
│   │   └── EmptyState.tsx
│   ├── screens/
│   │   ├── onboarding/
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── SetupScreen.tsx
│   │   │   └── PermissionsScreen.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   ├── items/
│   │   │   ├── ItemsListScreen.tsx
│   │   │   ├── ItemDetailScreen.tsx
│   │   │   └── AddEditItemScreen.tsx
│   │   ├── tasks/
│   │   │   ├── AddEditTaskScreen.tsx
│   │   │   └── CompleteTaskScreen.tsx
│   │   ├── calendar/
│   │   │   └── CalendarScreen.tsx
│   │   └── settings/
│   │       ├── SettingsScreen.tsx
│   │       └── AboutScreen.tsx
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── TabNavigator.tsx
│   │   └── types.ts
│   ├── context/
│   │   ├── AppContext.tsx
│   │   └── types.ts
│   ├── services/
│   │   ├── storage.ts
│   │   ├── notifications.ts
│   │   └── templates.ts
│   ├── utils/
│   │   ├── dates.ts
│   │   ├── helpers.ts
│   │   └── constants.ts
│   └── theme/
│       ├── colors.ts
│       └── styles.ts
├── assets/
│   ├── icon.png (1024x1024)
│   ├── splash.png (1284x2778)
│   └── adaptive-icon.png (1024x1024)
└── eas.json
```

## App Store Requirements

### app.json Configuration
```json
{
  "expo": {
    "name": "Maintenance Minder Pro",
    "slug": "maintenance-minder-pro",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0F172A"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.maintenanceminderpro",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "Take photos of items and receipts",
        "NSPhotoLibraryUsageDescription": "Save photos of items and receipts"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0F172A"
      },
      "package": "com.yourcompany.maintenanceminderpro"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#6366F1"
        }
      ]
    ]
  }
}
```

## Critical Success Criteria
1. ✅ App compiles without errors
2. ✅ All screens navigate correctly
3. ✅ Data persists across app restarts
4. ✅ Notifications can be scheduled
5. ✅ Clean, professional UI
6. ✅ No console warnings in production
7. ✅ Proper TypeScript types throughout
8. ✅ Ready for `eas build` command

## Build Command
After completing the app, test with:
```bash
npx expo start
# Then press 'i' for iOS simulator or 'a' for Android
```

For production build:
```bash
npx eas build --platform ios --profile preview
```

---

BUILD THIS COMPLETE APP. Every screen, every feature, production quality.
When done, commit all changes and run `npx expo start` to verify it works.

When completely finished, run this command to notify:
clawdbot gateway wake --text "Done: Maintenance Minder Pro app complete and ready for App Store" --mode now
