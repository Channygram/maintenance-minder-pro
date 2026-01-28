import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type MainTabParamList = {
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>;
  ItemsTab: NavigatorScreenParams<ItemsStackParamList>;
  CalendarTab: undefined;
  SettingsTab: undefined;
};

export type DashboardStackParamList = {
  Dashboard: undefined;
  ItemDetail: { itemId: string };
  AddItem: undefined;
  EditItem: { itemId: string };
  AddTask: { itemId: string };
  EditTask: { taskId: string };
  CompleteTask: { taskId: string };
};

export type ItemsStackParamList = {
  ItemsList: undefined;
  ItemDetail: { itemId: string };
  AddItem: undefined;
  EditItem: { itemId: string };
  AddTask: { itemId: string };
  EditTask: { taskId: string };
  CompleteTask: { taskId: string };
};
