import { useState, useEffect, useId } from 'react';
import { validateField } from '../utils/validation';

/**
 * FormSelect - Reusable validated select dropdown
 *
 * Props:
 *   label, icon, value, onChange, options, rules, placeholder,
 *   required, disabled, className
 *   options: [{ value, label }] or string[]
 */
export default function FormSelect({
  label,
  icon,
  value = '',
  onChange,
  options = [],
  rules = [],
  placeholder = 'Select...',
  required = false,
  disabled = false,
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
  const selectClasses = [
    'w-full px-4 py-3 border-2 rounded-lg text-sm outline-none transition-all duration-200 appearance-none',
    hasError
      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-indigo-500 focus:border-indigo-500',
    disabled ? 'bg-gray-100 dark:bg-slate-700 cursor-not-allowed' : '',
    'focus:ring-2',
    className,
  ].filter(Boolean).join(' ');

  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  return (
    <div>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
          {icon && <i className={`fas ${icon} text-indigo-400 mr-1.5`}></i>}
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          className={selectClasses}
          disabled={disabled}
          required={required}
          aria-invalid={hasError || undefined}
        >
          <option value="">{placeholder}</option>
          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <i className="fas fa-chevron-down text-xs"></i>
        </span>
      </div>

      {hasError && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1" role="alert">
          <i className="fas fa-info-circle"></i> {error}
        </p>
      )}
    </div>
  );
}
