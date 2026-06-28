import { useId } from 'react';

/**
 * FormCheckbox - Reusable checkbox/toggle component
 *
 * Props:
 *   label, checked, onChange, disabled, description,
 *   toggle (boolean - renders as toggle switch), className
 */
export default function FormCheckbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  description,
  toggle = false,
  className = '',
}) {
  const fieldId = useId();

  if (toggle) {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div>
          {label && (
            <label htmlFor={fieldId} className="text-sm font-medium text-gray-900 dark:text-slate-100 cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-slate-400">{description}</p>
          )}
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            id={fieldId}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only peer"
          />
          <div className={`
            w-11 h-6 rounded-full transition-all duration-200
            peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500
            ${checked
              ? 'bg-indigo-600'
              : 'bg-gray-200 dark:bg-slate-600'
            }
            after:content-[''] after:absolute after:top-[2px] after:left-[2px]
            after:bg-white after:border-gray-300 after:border after:rounded-full
            after:h-5 after:w-5 after:transition-all
            peer-checked:after:translate-x-full peer-checked:after:border-white
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}></div>
        </label>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <input
        id={fieldId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={`
          mt-0.5 rounded border-gray-300 dark:border-slate-600
          text-indigo-600 focus:ring-indigo-500
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      />
      <div>
        {label && (
          <label htmlFor={fieldId} className={`text-sm font-medium ${disabled ? 'text-gray-400 dark:text-slate-500' : 'text-gray-900 dark:text-slate-100'} cursor-pointer`}>
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}
