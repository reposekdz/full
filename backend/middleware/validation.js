const validator = require('validator');

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return validator.trim(validator.escape(input));
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const key in input) {
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }
  return input;
};

const validateEmail = (email) => {
  return validator.isEmail(email);
};

const validatePhone = (phone) => {
  return validator.isMobilePhone(phone, 'any', { strictMode: false });
};

const validateDate = (date) => {
  return validator.isISO8601(date);
};

const validateURL = (url) => {
  return validator.isURL(url);
};

const validateNumber = (num, options = {}) => {
  const { min, max } = options;
  const isNum = validator.isNumeric(String(num));
  if (!isNum) return false;
  
  const numValue = parseFloat(num);
  if (min !== undefined && numValue < min) return false;
  if (max !== undefined && numValue > max) return false;
  
  return true;
};

const validateLength = (str, min = 0, max = Infinity) => {
  return validator.isLength(str, { min, max });
};

const validateAlphanumeric = (str) => {
  return validator.isAlphanumeric(str);
};

const validateRequired = (value) => {
  if (value === undefined || value === null || value === '') {
    return false;
  }
  return true;
};

const validationMiddleware = (schema) => {
  return (req, res, next) => {
    const errors = [];
    const data = { ...req.body, ...req.query, ...req.params };
    
    for (const field in schema) {
      const rules = schema[field];
      const value = data[field];
      
      if (rules.required && !validateRequired(value)) {
        errors.push(`${field} is required`);
        continue;
      }
      
      if (!value && !rules.required) continue;
      
      if (rules.email && !validateEmail(value)) {
        errors.push(`${field} must be a valid email`);
      }
      
      if (rules.phone && !validatePhone(value)) {
        errors.push(`${field} must be a valid phone number`);
      }
      
      if (rules.url && !validateURL(value)) {
        errors.push(`${field} must be a valid URL`);
      }
      
      if (rules.number && !validateNumber(value, { min: rules.min, max: rules.max })) {
        errors.push(`${field} must be a valid number${rules.min ? ` >= ${rules.min}` : ''}${rules.max ? ` <= ${rules.max}` : ''}`);
      }
      
      if (rules.minLength || rules.maxLength) {
        if (!validateLength(String(value), rules.minLength || 0, rules.maxLength || Infinity)) {
          errors.push(`${field} length must be between ${rules.minLength || 0} and ${rules.maxLength || 'unlimited'}`);
        }
      }
      
      if (rules.alphanumeric && !validateAlphanumeric(value)) {
        errors.push(`${field} must contain only letters and numbers`);
      }
      
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }
      
      if (rules.custom && typeof rules.custom === 'function') {
        const customError = rules.custom(value, data);
        if (customError) {
          errors.push(customError);
        }
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors
      });
    }
    
    req.sanitizedBody = sanitizeInput(req.body);
    req.sanitizedQuery = sanitizeInput(req.query);
    
    next();
  };
};

const sanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    req.sanitizedBody = sanitizeInput(req.body);
  }
  if (req.query) {
    req.sanitizedQuery = sanitizeInput(req.query);
  }
  if (req.params) {
    req.sanitizedParams = sanitizeInput(req.params);
  }
  next();
};

module.exports = {
  sanitizeInput,
  validateEmail,
  validatePhone,
  validateDate,
  validateURL,
  validateNumber,
  validateLength,
  validateAlphanumeric,
  validateRequired,
  validationMiddleware,
  sanitizeMiddleware
};
