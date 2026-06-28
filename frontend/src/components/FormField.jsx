import { useState, useEffect, useId } from 'react';
import { validateField } from '../utils/validation';

/**
 * FormField - Reusable validated text input
 *
 * Props:
 *   label, icon, value, onChange, rules, type, placeholder,
 *   required, disabled, readOnly, minLength, maxLength, pattern,
 *   autoComplete, inputMode, autoFocus, helpText, className
 */
export default function FormField({
  label,
  icon,
  value = '',
  onChange,
  rules = [],
  type = 'text',
  placeholder = '',
  required = false,
  disabled = false,
  readOnly = false,
  minLength,
  maxLength,
  pattern,
  autoComplete,
  inputMode,
  autoFocus = false,
  helpText,
  className = '',
}) {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState(null);
  const fieldId = useId();

  useEffect(() => {
    if (touched) {
      setError(validateField(value, rules, label));
    }
  }, [value, touched, rules, label]);

  const handleBlur = () => {
    setTouched(true);
    setError(validateField(value, rules, label));
  };

  const hasError = touched && error;
  const isValid = touched && !error && value;

  const inputClasses = [
    'w-full px-4 py-3 border-2 rounded-lg text-sm outline-none transition-all duration-200',
    hasError
      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500'
      : isValid
        ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 focus:ring-green-500 focus:border-green-500'
        : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-indigo-500 focus:border-indigo-500',
    disabled ? 'bg-gray-100 dark:bg-slate-700 cursor-not-allowed' : '',
    readOnly ? 'bg-gray-50 dark:bg-slate-700' : '',
    'focus:ring-2',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div>
      {/* Label */}
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
          {icon && <i className={`fas ${icon} text-indigo-400 mr-1.5`}></i>}
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        <input
          id={fieldId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={inputClasses}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
          autoComplete={autoComplete}
          inputMode={inputMode}
          autoFocus={autoFocus}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${fieldId}-error` : undefined}
        />
        {/* Status icon */}
        {touched && value && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {error ? (
              <i className="fas fa-exclamation-circle text-red-400"></i>
            ) : (
              <i className="fas fa-check-circle text-green-400"></i>
            )}
          </span>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <p id={`${fieldId}-error`} className="mt-1.5 text-xs text-red-500 flex items-center gap-1" role="alert">
          <i className="fas fa-info-circle"></i> {error}
        </p>
      )}

      {/* Help text */}
      {!hasError && helpText && (
        <p className="mt-1 text-xs text-gray-400">{helpText}</p>
      )}
    </div>
  );
}
