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
  { name: 'Spark Plugs', intervalDays: 730, priority: 'medium', description: 'Replace spark plugs' },
  { name: 'Cabin Air Filter', intervalDays: 365, priority: 'low', description: 'Replace cabin air filter' },
  { name: 'Brake Fluid', intervalDays: 730, priority: 'medium', description: 'Flush and replace brake fluid' },
  { name: 'Power Steering Fluid', intervalDays: 730, priority: 'low', description: 'Check and replace power steering fluid' },
  { name: 'Tire Pressure Check', intervalDays: 30, priority: 'high', description: 'Check tire pressure and inflate' },
  { name: 'Car Wash', intervalDays: 14, priority: 'low', description: 'Wash and wax exterior' },
  { name: 'Interior Detail', intervalDays: 90, priority: 'low', description: 'Deep clean interior' },
];

export const HOME_TEMPLATES: TaskTemplate[] = [
  { name: 'HVAC Filter Change', intervalDays: 90, priority: 'high', description: 'Replace HVAC air filter' },
  { name: 'Smoke Detector Batteries', intervalDays: 180, priority: 'critical', description: 'Replace smoke detector batteries' },
  { name: 'CO2 Detector Batteries', intervalDays: 180, priority: 'critical', description: 'Replace carbon monoxide detector batteries' },
  { name: 'Gutter Cleaning', intervalDays: 180, priority: 'medium', description: 'Clean gutters and downspouts' },
  { name: 'Water Heater Flush', intervalDays: 365, priority: 'medium', description: 'Drain and flush water heater' },
  { name: 'Dryer Vent Cleaning', intervalDays: 365, priority: 'high', description: 'Clean dryer vent to prevent fire' },
  { name: 'Pest Control', intervalDays: 90, priority: 'medium', description: 'Pest prevention treatment' },
  { name: 'Roof Inspection', intervalDays: 365, priority: 'medium', description: 'Inspect roof for damage' },
  { name: 'Septic Pump', intervalDays: 1095, priority: 'high', description: 'Pump septic tank' },
  { name: 'Furnace Inspection', intervalDays: 365, priority: 'high', description: 'Professional furnace inspection' },
  { name: 'Chimney Sweep', intervalDays: 365, priority: 'high', description: 'Clean chimney and inspect' },
  { name: 'Exterior Paint', intervalDays: 1825, priority: 'medium', description: 'Repaint exterior walls' },
  { name: 'Deck/Stain', intervalDays: 1095, priority: 'medium', description: 'Reseal and stain deck' },
  { name: 'Window Seals', intervalDays: 365, priority: 'low', description: 'Check and replace window seals' },
  { name: 'Fire Extinguisher Check', intervalDays: 30, priority: 'high', description: 'Check fire extinguisher pressure' },
  { name: 'Whole House Fan', intervalDays: 180, priority: 'low', description: 'Clean and lubricate whole house fan' },
];

export const APPLIANCE_TEMPLATES: TaskTemplate[] = [
  { name: 'Refrigerator Coil Cleaning', intervalDays: 180, priority: 'medium', description: 'Clean condenser coils' },
  { name: 'Dishwasher Filter Clean', intervalDays: 30, priority: 'low', description: 'Clean dishwasher filter' },
  { name: 'Washing Machine Clean', intervalDays: 30, priority: 'low', description: 'Run cleaning cycle' },
  { name: 'Oven Deep Clean', intervalDays: 90, priority: 'low', description: 'Deep clean oven interior' },
  { name: 'Range Hood Filter Clean', intervalDays: 90, priority: 'low', description: 'Clean or replace range hood filter' },
  { name: 'Microwave Clean', intervalDays: 30, priority: 'low', description: 'Clean microwave interior' },
  { name: 'Water Filter Replacement', intervalDays: 180, priority: 'medium', description: 'Replace water filter' },
  { name: 'AC Unit Filter', intervalDays: 30, priority: 'high', description: 'Replace AC unit filter' },
  { name: 'Garage Door Service', intervalDays: 365, priority: 'medium', description: 'Lubricate and test garage door' },
  { name: 'Pool Pump Filter', intervalDays: 30, priority: 'medium', description: 'Clean or replace pool filter' },
  { name: 'Hot Tub/Spa Maintenance', intervalDays: 30, priority: 'high', description: 'Test water chemistry and clean' },
  { name: 'Vacuum Refrigerator Coils', intervalDays: 180, priority: 'low', description: 'Vacuum behind refrigerator' },
  { name: 'Dishwasher Deep Clean', intervalDays: 90, priority: 'low', description: 'Run dishwasher cleaner' },
  { name: 'Washing Machine Drain Filter', intervalDays: 90, priority: 'medium', description: 'Clean washing machine drain filter' },
  { name: 'Coffee Maker Descale', intervalDays: 90, priority: 'low', description: 'Descale coffee maker' },
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
