
export const validateRequired = (value, fieldName) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return '';
  };
  
  // Validate string length
  export const validateLength = (value, fieldName, { min, max }) => {
    if (!value) return '';
    
    if (min && value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    
    if (max && value.length > max) {
      return `${fieldName} cannot exceed ${max} characters`;
    }
    
    return '';
  };
  
  // Validate number range
  export const validateRange = (value, fieldName, { min, max }) => {
    if (value === null || value === undefined) return '';
    
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      return `${fieldName} must be a valid number`;
    }
    
    if (min !== undefined && numValue < min) {
      return `${fieldName} must be at least ${min}`;
    }
    
    if (max !== undefined && numValue > max) {
      return `${fieldName} cannot exceed ${max}`;
    }
    
    return '';
  };
  
  // Validate JSON format
  export const validateJson = (value) => {
    if (!value) return '';
    
    try {
      JSON.parse(value);
      return '';
    } catch (e) {
      return 'Invalid JSON format';
    }
  };
  
  // Validate form with multiple fields
  export const validateForm = (formData, validations) => {
    const errors = {};
    
    Object.entries(validations).forEach(([field, validationFns]) => {
      const value = formData[field];
      
      for (const validationFn of validationFns) {
        const error = validationFn(value);
        if (error) {
          errors[field] = error;
          break;
        }
      }
    });
    
    return errors;
  };