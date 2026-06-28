import { useState, useEffect } from 'react';
import { validateField } from '../utils/validation';

/**
 * ValidatedInput - Reusable form field with HTML5 + JS validation & real-time feedback
 *
 * Props:
 *  - label: string
 *  - icon: string (Font Awesome class, e.g. 'fa-user')
 *  - value: string
 *  - onChange: (value) => void
 *  - rules: validatorFn[]  (from validation.js)
 *  - type: string (default 'text')
 *  - placeholder: string
 *  - html5: object  { required, minLength, maxLength, pattern, min, max, type, etc. }
 *  - autoFocus: boolean
 */
export default function ValidatedInput({
  label,
  icon,
  value,
  onChange,
  rules = [],
  type = 'text',
  placeholder = '',
  html5 = {},
  autoFocus = false,
}) {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (touched) {
      setError(validateField(value, rules, label));
    }
  }, [value, touched, rules, label]);

  const handleBlur = () => {
    setTouched(true);
    setError(validateField(value, rules, label));
  };

  const inputClasses = `
    w-full px-4 py-3 border-2 rounded-lg text-sm outline-none transition-all duration-200
    ${touched && error
      ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
      : touched && !error && value
        ? 'border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500'
        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
    }
    focus:ring-2
  `;

  const html5Attrs = {};
  if (html5.required) html5Attrs.required = true;
  if (html5.minLength) html5Attrs.minLength = html5.minLength;
  if (html5.maxLength) html5Attrs.maxLength = html5.maxLength;
  if (html5.pattern) html5Attrs.pattern = html5.pattern;
  if (html5.min !== undefined) html5Attrs.min = html5.min;
  if (html5.max !== undefined) html5Attrs.max = html5.max;
  if (html5.type) html5Attrs.type = html5.type;
  if (html5.autoComplete) html5Attrs.autoComplete = html5.autoComplete;
  if (html5.inputMode) html5Attrs.inputMode = html5.inputMode;
  if (html5.title) html5Attrs.title = html5.title;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {icon && <i className={`fas ${icon} text-indigo-400 mr-1.5`}></i>}
        {label}
        {html5.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={inputClasses}
          autoFocus={autoFocus}
          {...html5Attrs}
        />
        {/* Validation status icon */}
        {touched && value && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {error ? (
              <i className="fas fa-exclamation-circle text-red-400"></i>
            ) : (
              <i className="fas fa-check-circle text-green-400"></i>
            )}
          </span>
        )}
      </div>
      {/* Real-time error message */}
      {touched && error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <i className="fas fa-info-circle"></i>
          {error}
        </p>
      )}
      {/* HTML5 validation help (shown when field is valid) */}
      {touched && !error && html5.title && (
        <p className="mt-1 text-xs text-gray-400">{html5.title}</p>
      )}
    </div>
  );
}

/**
 * ValidatedSelect - Dropdown with validation
 */
export function ValidatedSelect({
  label,
  icon,
  value,
  onChange,
  rules = [],
  options = [],
  placeholder = 'Select...',
  html5 = {},
}) {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (touched) {
      setError(validateField(value, rules, label));
    }
  }, [value, touched, rules, label]);

  const handleBlur = () => {
    setTouched(true);
    setError(validateField(value, rules, label));
  };

  const selectClasses = `
    w-full px-4 py-3 border-2 rounded-lg text-sm outline-none transition-all duration-200 bg-white
    ${touched && error
      ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
    }
    focus:ring-2
  `;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {icon && <i className={`fas ${icon} text-indigo-400 mr-1.5`}></i>}
        {label}
        {html5.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        className={selectClasses}
        required={html5.required}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {touched && error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <i className="fas fa-info-circle"></i>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Modal - Reusable dialog with header, body, and optional footer
 *
 * Props:
 *   open, onClose, title, icon, children, footer (ReactNode), size ('sm' | 'md' | 'lg')
 */
export function Modal({ open, onClose, title, icon, children, footer, size = 'md' }) {
  if (!open) return null;

  const sizeMap = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeMap[size] || sizeMap.md} max-h-[90vh] overflow-y-auto animate-modal-in`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                <i className={`fas ${icon} text-white text-sm`}></i>
              </div>
            )}
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-in { animation: modalIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}
