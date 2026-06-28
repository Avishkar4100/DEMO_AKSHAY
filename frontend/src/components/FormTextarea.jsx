import { useState, useEffect, useId } from 'react';
import { validateField } from '../utils/validation';

/**
 * FormTextarea - Reusable validated textarea
 *
 * Props:
 *   label, icon, value, onChange, rules, placeholder,
 *   required, disabled, rows, maxLength, helpText, className
 */
export default function FormTextarea({
  label,
  icon,
  value = '',
  onChange,
  rules = [],
  placeholder = '',
  required = false,
  disabled = false,
  rows = 3,
  maxLength,
  helpText,
  className = '',
}) {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState(null);
  const fieldId = useId();

  useEffect(() => {
    if (touched) setError(validateField(value, rules, label));
  }, [value, touched, rules, label]);

  const handleBlur = () => {
    setTouched(true);
    setError(validateField(value, rules, label));
  };

  const hasError = touched && error;
  const isValid = touched && !error && value;

  const textareaClasses = [
    'w-full px-4 py-3 border-2 rounded-lg text-sm outline-none transition-all duration-200 resize-y',
    hasError
      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500'
      : isValid
        ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 focus:ring-green-500 focus:border-green-500'
        : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-indigo-500 focus:border-indigo-500',
    disabled ? 'bg-gray-100 dark:bg-slate-700 cursor-not-allowed' : '',
    'focus:ring-2',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
          {icon && <i className={`fas ${icon} text-indigo-400 mr-1.5`}></i>}
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <textarea
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={textareaClasses}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={hasError || undefined}
      />

      {hasError && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1" role="alert">
          <i className="fas fa-info-circle"></i> {error}
        </p>
      )}

      {!hasError && helpText && (
        <p className="mt-1 text-xs text-gray-400">{helpText}</p>
      )}
    </div>
  );
}
