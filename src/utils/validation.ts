// Validation utilities for forms

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateRequired = (value: string | undefined, fieldName: string): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return {
      isValid: false,
      errors: [`${fieldName} is required`],
    };
  }
  return { isValid: true, errors: [] };
};

export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: true, errors: [] }; // Optional field
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      errors: ['Please enter a valid email address'],
    };
  }
  return { isValid: true, errors: [] };
};

export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: true, errors: [] }; // Optional field
  }
  
  // Remove formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  if (!/^\d{10,15}$/.test(cleaned)) {
    return {
      isValid: false,
      errors: ['Please enter a valid phone number'],
    };
  }
  return { isValid: true, errors: [] };
};

export const validatePositiveNumber = (value: string | undefined, fieldName: string): ValidationResult => {
  if (!value) {
    return { isValid: true, errors: [] }; // Optional field
  }
  
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) {
    return {
      isValid: false,
      errors: [`${fieldName} must be a positive number`],
    };
  }
  return { isValid: true, errors: [] };
};

export const validateUrl = (url: string): ValidationResult => {
  if (!url) {
    return { isValid: true, errors: [] }; // Optional field
  }
  
  try {
    new URL(url);
    return { isValid: true, errors: [] };
  } catch {
    return {
      isValid: false,
      errors: ['Please enter a valid URL'],
    };
  }
};

export const validateItem = (item: {
  name?: string;
  brand?: string;
  model?: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  // Name is required
  if (!item.name || item.name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  // Check name length
  if (item.name && item.name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateTask = (task: {
  name?: string;
  intervalDays?: number;
  estimatedCost?: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  // Name is required
  if (!task.name || task.name.trim().length === 0) {
    errors.push('Task name is required');
  }
  
  // Interval days must be valid
  if (task.intervalDays !== undefined && task.intervalDays < 0) {
    errors.push('Interval must be a positive number');
  }
  
  // Estimated cost must be valid if provided
  if (task.estimatedCost) {
    const cost = parseFloat(task.estimatedCost);
    if (isNaN(cost) || cost < 0) {
      errors.push('Estimated cost must be a positive number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateProvider = (provider: {
  name?: string;
  email?: string;
  phone?: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  // Name is required
  if (!provider.name || provider.name.trim().length === 0) {
    errors.push('Provider name is required');
  }
  
  // Validate email if provided
  if (provider.email) {
    const emailResult = validateEmail(provider.email);
    errors.push(...emailResult.errors);
  }
  
  // Validate phone if provided
  if (provider.phone) {
    const phoneResult = validatePhone(provider.phone);
    errors.push(...phoneResult.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateImportData = (jsonString: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!jsonString || jsonString.trim().length === 0) {
    errors.push('No data provided');
    return { isValid: false, errors };
  }
  
  try {
    const data = JSON.parse(jsonString);
    
    // Check for required structure
    if (!data.items && !data.tasks && !data.logs) {
      errors.push('Invalid data format: missing items, tasks, or logs');
    }
    
    // Validate items if present
    if (data.items && !Array.isArray(data.items)) {
      errors.push('Invalid items format: must be an array');
    }
    
    // Validate tasks if present
    if (data.tasks && !Array.isArray(data.tasks)) {
      errors.push('Invalid tasks format: must be an array');
    }
    
    // Validate logs if present
    if (data.logs && !Array.isArray(data.logs)) {
      errors.push('Invalid logs format: must be an array');
    }
    
  } catch (e) {
    errors.push('Invalid JSON format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
