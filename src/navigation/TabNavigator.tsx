import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Screens
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { ItemsListScreen } from '../screens/items/ItemsListScreen';
import { ItemDetailScreen } from '../screens/items/ItemDetailScreen';
import { AddEditItemScreen } from '../screens/items/AddEditItemScreen';
import { AddEditTaskScreen } from '../screens/tasks/AddEditTaskScreen';
import { CompleteTaskScreen } from '../screens/tasks/CompleteTaskScreen';
import { CalendarScreen } from '../screens/calendar/CalendarScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();
const ItemsStack = createNativeStackNavigator();

const DashboardStackNavigator = () => (
  <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
    <DashboardStack.Screen name="Dashboard" component={DashboardScreen} />
    <DashboardStack.Screen name="ItemDetail" component={ItemDetailScreen} />
    <DashboardStack.Screen name="AddItem" component={AddEditItemScreen} />
    <DashboardStack.Screen name="EditItem" component={AddEditItemScreen} />
    <DashboardStack.Screen name="AddTask" component={AddEditTaskScreen} />
    <DashboardStack.Screen name="EditTask" component={AddEditTaskScreen} />
    <DashboardStack.Screen name="CompleteTask" component={CompleteTaskScreen} />
  </DashboardStack.Navigator>
);

const ItemsStackNavigator = () => (
  <ItemsStack.Navigator screenOptions={{ headerShown: false }}>
    <ItemsStack.Screen name="ItemsList" component={ItemsListScreen} />
    <ItemsStack.Screen name="ItemDetail" component={ItemDetailScreen} />
    <ItemsStack.Screen name="AddItem" component={AddEditItemScreen} />
    <ItemsStack.Screen name="EditItem" component={AddEditItemScreen} />
    <ItemsStack.Screen name="AddTask" component={AddEditTaskScreen} />
    <ItemsStack.Screen name="EditTask" component={AddEditTaskScreen} />
    <ItemsStack.Screen name="CompleteTask" component={CompleteTaskScreen} />
  </ItemsStack.Navigator>
);

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'DashboardTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'ItemsTab':
              iconName = focused ? 'cube' : 'cube-outline';
              break;
            case 'CalendarTab':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'SettingsTab':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="ItemsTab"
        component={ItemsStackNavigator}
        options={{ tabBarLabel: 'Items' }}
      />
      <Tab.Screen
        name="CalendarTab"
        component={CalendarScreen}
        options={{ tabBarLabel: 'Calendar' }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};
