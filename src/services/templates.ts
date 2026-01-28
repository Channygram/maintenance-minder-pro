import { MaintenanceTask } from '../context/types';
import { generateId } from '../utils/helpers';
import { addDays } from 'date-fns';

interface TaskTemplate {
  name: string;
  intervalDays: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
}

export const CAR_TEMPLATES: TaskTemplate[] = [
  { name: 'Oil Change', intervalDays: 90, priority: 'high', description: 'Change engine oil and filter' },
  { name: 'Tire Rotation', intervalDays: 180, priority: 'medium', description: 'Rotate tires for even wear' },
  { name: 'Air Filter Replacement', intervalDays: 365, priority: 'low', description: 'Replace engine air filter' },
  { name: 'Brake Inspection', intervalDays: 365, priority: 'high', description: 'Check brake pads and rotors' },
  { name: 'Transmission Fluid', intervalDays: 730, priority: 'medium', description: 'Check/replace transmission fluid' },
  { name: 'Coolant Flush', intervalDays: 730, priority: 'medium', description: 'Flush and replace coolant' },
  { name: 'Battery Check', intervalDays: 365, priority: 'medium', description: 'Test battery health' },
  { name: 'Wiper Blade Replacement', intervalDays: 180, priority: 'low', description: 'Replace windshield wipers' },
];

export const HOME_TEMPLATES: TaskTemplate[] = [
  { name: 'HVAC Filter Change', intervalDays: 90, priority: 'high', description: 'Replace HVAC air filter' },
  { name: 'Smoke Detector Batteries', intervalDays: 180, priority: 'critical', description: 'Replace smoke detector batteries' },
  { name: 'Gutter Cleaning', intervalDays: 180, priority: 'medium', description: 'Clean gutters and downspouts' },
  { name: 'Water Heater Flush', intervalDays: 365, priority: 'medium', description: 'Drain and flush water heater' },
  { name: 'Dryer Vent Cleaning', intervalDays: 365, priority: 'high', description: 'Clean dryer vent to prevent fire' },
  { name: 'Pest Control', intervalDays: 90, priority: 'medium', description: 'Pest prevention treatment' },
  { name: 'Roof Inspection', intervalDays: 365, priority: 'medium', description: 'Inspect roof for damage' },
  { name: 'Septic Pump', intervalDays: 1095, priority: 'high', description: 'Pump septic tank' },
];

export const APPLIANCE_TEMPLATES: TaskTemplate[] = [
  { name: 'Refrigerator Coil Cleaning', intervalDays: 180, priority: 'medium', description: 'Clean condenser coils' },
  { name: 'Dishwasher Filter Clean', intervalDays: 30, priority: 'low', description: 'Clean dishwasher filter' },
  { name: 'Washing Machine Clean', intervalDays: 30, priority: 'low', description: 'Run cleaning cycle' },
  { name: 'Oven Deep Clean', intervalDays: 90, priority: 'low', description: 'Deep clean oven interior' },
  { name: 'Range Hood Filter Clean', intervalDays: 90, priority: 'low', description: 'Clean or replace range hood filter' },
];

export const getTemplatesForType = (type: string): TaskTemplate[] => {
  switch (type) {
    case 'car':
      return CAR_TEMPLATES;
    case 'home':
      return HOME_TEMPLATES;
    case 'appliance':
      return APPLIANCE_TEMPLATES;
    default:
      return [];
  }
};

export const createTasksFromTemplates = (
  itemId: string,
  templates: TaskTemplate[],
  reminderDays: number = 3
): MaintenanceTask[] => {
  const now = new Date();
  
  return templates.map((template) => ({
    id: generateId(),
    itemId,
    name: template.name,
    description: template.description,
    intervalDays: template.intervalDays,
    nextDue: addDays(now, template.intervalDays).toISOString(),
    reminderDaysBefore: reminderDays,
    priority: template.priority,
    isActive: true,
  }));
};
