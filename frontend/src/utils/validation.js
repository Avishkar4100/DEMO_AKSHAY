/**
 * HMS Validation Utilities
 * Reusable validators, form field component, and useFormValidation hook
 */

// ===== VALIDATORS =====

export const validators = {
  required: (value, label = 'This field') =>
    !value || (typeof value === 'string' && !value.trim())
      ? `${label} is required`
      : null,

  email: (value) =>
    value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? 'Please enter a valid email address'
      : null,

  minLength: (min) => (value, label = 'This field') =>
    value && value.length < min
      ? `${label} must be at least ${min} characters`
      : null,

  maxLength: (max) => (value, label = 'This field') =>
    value && value.length > max
      ? `${label} must not exceed ${max} characters`
      : null,

  pattern: (regex, message) => (value) =>
    value && !regex.test(value) ? message : null,

  phone: (value) =>
    value && !/^[\+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(value)
      ? 'Please enter a valid phone number'
      : null,

  age: (value) => {
    if (!value) return null;
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num)) return 'Age must be a whole number';
    if (num < 0) return 'Age cannot be negative';
    if (num > 150) return 'Please enter a valid age';
    return null;
  },

  positiveNumber: (value, label = 'Amount') => {
    if (!value) return null;
    const num = Number(value);
    if (isNaN(num)) return `${label} must be a number`;
    if (num <= 0) return `${label} must be greater than zero`;
    return null;
  },

  futureDate: (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Please enter a valid date';
    return null;
  },

  username: (value) => {
    if (!value) return null;
    if (!/^[a-zA-Z0-9._-]+$/.test(value))
      return 'Username can only contain letters, numbers, dots, hyphens, and underscores';
    if (value.length < 3) return 'Username must be at least 3 characters';
    return null;
  },

  password: (value) => {
    if (!value) return null;
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(value)) return 'Password must contain a number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Password must contain a special character';
    return null;
  },

  match: (matchValue, label = 'This field') => (value) =>
    value !== matchValue ? `${label} does not match` : null,
};

// ===== RUN VALIDATION RULES =====

export function validateField(value, rules, label) {
  for (const rule of rules) {
    const error = typeof rule === 'function' ? rule(value, label) : null;
    if (error) return error;
  }
  return null;
}

// ===== useFormValidation HOOK =====

export function useFormValidation(fields) {
  // fields: { [fieldName]: { value: any, rules: validatorFn[], label: string } }
  const initialErrors = {};
  const initialTouched = {};
  Object.keys(fields).forEach((key) => {
    initialErrors[key] = null;
    initialTouched[key] = false;
  });

  // We use React useState/useCallback internally but return a simple object
  // that components can use. For simplicity, components will call validateField directly.
  return { validateField };
}
