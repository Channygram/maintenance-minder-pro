import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction, Item, MaintenanceTask, MaintenanceLog, Settings } from './types';
import * as storage from '../services/storage';
import { DEFAULT_SETTINGS } from '../utils/constants';

const initialState: AppState = {
  items: [],
  tasks: [],
  logs: [],
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  onboardingComplete: false,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
        tasks: state.tasks.filter((task) => task.itemId !== action.payload),
      };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    case 'SET_LOGS':
      return { ...state, logs: action.payload };
    case 'ADD_LOG':
      return { ...state, logs: [...state.logs, action.payload] };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_ONBOARDING_COMPLETE':
      return { ...state, onboardingComplete: action.payload };
    case 'LOAD_ALL_DATA':
      return { ...state, ...action.payload, isLoading: false };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addItem: (item: Item) => Promise<void>;
  updateItem: (item: Item) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addTask: (task: MaintenanceTask) => Promise<void>;
  updateTask: (task: MaintenanceTask) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addLog: (log: MaintenanceLog) => Promise<void>;
  updateSettings: (settings: Settings) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [items, tasks, logs, settings, onboardingComplete] = await Promise.all([
        storage.loadItems(),
        storage.loadTasks(),
        storage.loadLogs(),
        storage.loadSettings(),
        storage.getOnboardingComplete(),
      ]);
      
      dispatch({
        type: 'LOAD_ALL_DATA',
        payload: { items, tasks, logs, settings, onboardingComplete },
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addItem = async (item: Item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
    await storage.saveItems([...state.items, item]);
  };

  const updateItem = async (item: Item) => {
    dispatch({ type: 'UPDATE_ITEM', payload: item });
    const updated = state.items.map((i) => (i.id === item.id ? item : i));
    await storage.saveItems(updated);
  };

  const deleteItem = async (id: string) => {
    dispatch({ type: 'DELETE_ITEM', payload: id });
    const filtered = state.items.filter((i) => i.id !== id);
    const filteredTasks = state.tasks.filter((t) => t.itemId !== id);
    await storage.saveItems(filtered);
    await storage.saveTasks(filteredTasks);
  };

  const addTask = async (task: MaintenanceTask) => {
    dispatch({ type: 'ADD_TASK', payload: task });
    await storage.saveTasks([...state.tasks, task]);
  };

  const updateTask = async (task: MaintenanceTask) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
    const updated = state.tasks.map((t) => (t.id === task.id ? task : t));
    await storage.saveTasks(updated);
  };

  const deleteTask = async (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
    const filtered = state.tasks.filter((t) => t.id !== id);
    await storage.saveTasks(filtered);
  };

  const addLog = async (log: MaintenanceLog) => {
    dispatch({ type: 'ADD_LOG', payload: log });
    await storage.saveLogs([...state.logs, log]);
  };

  const updateSettings = async (settings: Settings) => {
    dispatch({ type: 'SET_SETTINGS', payload: settings });
    await storage.saveSettings(settings);
  };

  const completeOnboarding = async () => {
    dispatch({ type: 'SET_ONBOARDING_COMPLETE', payload: true });
    await storage.setOnboardingComplete(true);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addItem,
        updateItem,
        deleteItem,
        addTask,
        updateTask,
        deleteTask,
        addLog,
        updateSettings,
        completeOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
