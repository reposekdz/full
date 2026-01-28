/**
 * Validation Utilities
 * Provides form validation and data sanitization functions
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateRequired = (value: any, fieldName: string): string | null => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName} cannot be empty`;
  }
  return null;
};

export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): string | null => {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string
): string | null => {
  if (value && value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return null;
};

export const validateNumber = (
  value: any,
  fieldName: string,
  options?: { min?: number; max?: number }
): string | null => {
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  if (options?.min !== undefined && num < options.min) {
    return `${fieldName} must be at least ${options.min}`;
  }
  if (options?.max !== undefined && num > options.max) {
    return `${fieldName} must not exceed ${options.max}`;
  }
  return null;
};

export const validateDate = (
  dateString: string,
  fieldName: string,
  options?: { minDate?: Date; maxDate?: Date }
): string | null => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return `${fieldName} must be a valid date`;
  }
  if (options?.minDate && date < options.minDate) {
    return `${fieldName} must be after ${options.minDate.toLocaleDateString()}`;
  }
  if (options?.maxDate && date > options.maxDate) {
    return `${fieldName} must be before ${options.maxDate.toLocaleDateString()}`;
  }
  return null;
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, Array<(value: any) => string | null>>
): ValidationResult => {
  const errors: string[] = [];

  Object.entries(rules).forEach(([field, validators]) => {
    validators.forEach((validator) => {
      const error = validator(data[field]);
      if (error) {
        errors.push(error);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ');
};

export const sanitizeHtml = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

export const validateFileSize = (
  file: File,
  maxSizeMB: number
): string | null => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File size must not exceed ${maxSizeMB}MB`;
  }
  return null;
};

export const validateFileType = (
  file: File,
  allowedTypes: string[]
): string | null => {
  if (!allowedTypes.includes(file.type)) {
    return `File type must be one of: ${allowedTypes.join(', ')}`;
  }
  return null;
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validatePercentage = (value: number): boolean => {
  return value >= 0 && value <= 100;
};

export const validateGrade = (grade: number): boolean => {
  return grade >= 0 && grade <= 100;
};

export const validateStudentData = (data: any): ValidationResult => {
  const errors: string[] = [];

  const requiredError = validateRequired(data.first_name, 'First name');
  if (requiredError) errors.push(requiredError);

  const lastNameError = validateRequired(data.last_name, 'Last name');
  if (lastNameError) errors.push(lastNameError);

  const emailError = validateRequired(data.email, 'Email');
  if (emailError) errors.push(emailError);
  else if (!validateEmail(data.email)) {
    errors.push('Email must be a valid email address');
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.push('Phone number must be valid');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateEmployeeData = (data: any): ValidationResult => {
  const errors: string[] = [];

  const firstNameError = validateRequired(data.first_name, 'First name');
  if (firstNameError) errors.push(firstNameError);

  const lastNameError = validateRequired(data.last_name, 'Last name');
  if (lastNameError) errors.push(lastNameError);

  const emailError = validateRequired(data.email, 'Email');
  if (emailError) errors.push(emailError);
  else if (!validateEmail(data.email)) {
    errors.push('Email must be a valid email address');
  }

  const positionError = validateRequired(data.position, 'Position');
  if (positionError) errors.push(positionError);

  if (data.salary) {
    const salaryError = validateNumber(data.salary, 'Salary', { min: 0 });
    if (salaryError) errors.push(salaryError);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateEventData = (data: any): ValidationResult => {
  const errors: string[] = [];

  const titleError = validateRequired(data.title, 'Event title');
  if (titleError) errors.push(titleError);

  const dateError = validateRequired(data.event_date, 'Event date');
  if (dateError) errors.push(dateError);
  else {
    const dateValidError = validateDate(data.event_date, 'Event date', {
      minDate: new Date(),
    });
    if (dateValidError) errors.push(dateValidError);
  }

  if (data.max_attendees) {
    const maxAttendError = validateNumber(data.max_attendees, 'Max attendees', {
      min: 1,
    });
    if (maxAttendError) errors.push(maxAttendError);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateInventoryItem = (data: any): ValidationResult => {
  const errors: string[] = [];

  const nameError = validateRequired(data.item_name, 'Item name');
  if (nameError) errors.push(nameError);

  const qtyError = validateNumber(data.quantity, 'Quantity', { min: 0 });
  if (qtyError) errors.push(qtyError);

  const priceError = validateNumber(data.unit_price, 'Unit price', { min: 0 });
  if (priceError) errors.push(priceError);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const formatValidationErrors = (errors: string[]): string => {
  return errors.join('\n');
};

export default {
  validateEmail,
  validatePhone,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateNumber,
  validateDate,
  validatePassword,
  validateForm,
  sanitizeString,
  sanitizeHtml,
  validateFileSize,
  validateFileType,
  validateUrl,
  validatePercentage,
  validateGrade,
  validateStudentData,
  validateEmployeeData,
  validateEventData,
  validateInventoryItem,
  formatValidationErrors,
};
