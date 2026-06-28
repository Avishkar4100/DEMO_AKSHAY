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
import { useState, useEffect, useCallback } from 'react';

/**
 * useFormValidation - Manages form state, validation, and submission
 *
 * @param {Object} config - { fieldName: { value, rules, label } }
 * @returns {{ values, errors, touched, setValue, setTouched, reset, handleSubmit, isValid, validateAll }}
 *
 * Usage:
 *   const { values, errors, touched, setValue, handleSubmit } = useFormValidation({
 *     email: { value: '', rules: [validators.required, validators.email], label: 'Email' },
 *     password: { value: '', rules: [validators.required, validators.minLength(8)], label: 'Password' },
 *   });
 *
 *   <form onSubmit={handleSubmit((vals) => submitApi(vals))}> ... </form>
 */
export function useFormValidation(config = {}) {
  const fieldNames = Object.keys(config);

  const initialValues = {};
  const initialErrors = {};
  const initialTouched = {};
  fieldNames.forEach((key) => {
    initialValues[key] = config[key].value ?? '';
    initialErrors[key] = null;
    initialTouched[key] = false;
  });

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState(initialErrors);
  const [touched, setTouched] = useState(initialTouched);

  // Compute overall form validity
  const isValid = fieldNames.length > 0 && fieldNames.every((key) => {
    const val = values[key];
    const rules = config[key].rules || [];
    const label = config[key].label;
    return !validateField(val, rules, label) && touched[key];
  });

  // Re-validate when values or touched change
  useEffect(() => {
    const newErrors = {};
    fieldNames.forEach((key) => {
      if (touched[key]) {
        newErrors[key] = validateField(values[key], config[key].rules || [], config[key].label);
      } else {
        newErrors[key] = null;
      }
    });
    setErrors(newErrors);
  }, [values, touched, fieldNames.map((k) => config[k].rules).join(',')]);

  /** Set a single field value */
  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  /** Mark a field as touched (usually on blur) */
  const setFieldTouched = useCallback((name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  /** Touch all fields (used on submit attempt) */
  const touchAll = useCallback(() => {
    const allTouched = {};
    fieldNames.forEach((key) => { allTouched[key] = true; });
    setTouched((prev) => ({ ...prev, ...allTouched }));
  }, [fieldNames.join(',')]);

  /** Validate all fields and return whether the form is valid */
  const validateAll = useCallback(() => {
    touchAll();
    return fieldNames.every((key) => {
      const val = values[key];
      const rules = config[key].rules || [];
      const label = config[key].label;
      return !validateField(val, rules, label);
    });
  }, [values, fieldNames.join(','), config]);

  /** Reset form to initial state */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors(initialErrors);
    setTouched(initialTouched);
  }, [fieldNames.join(',')]);

  /** Handle form submission: validates, then calls onSubmit if valid */
  const handleSubmit = useCallback((onSubmit) => (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (validateAll()) {
      onSubmit(values);
    }
  }, [validateAll, values]);

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    reset,
    handleSubmit,
    isValid,
    validateAll,
    setValues,
    setTouched,
  };
}
