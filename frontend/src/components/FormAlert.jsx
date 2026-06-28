/**
 * FormAlert - Reusable alert/notification component
 *
 * Variants: info (default) | success | warning | error
 *
 * Props:
 *   variant, title, message, dismissible, onDismiss, icon, className, children
 */
import { useState } from 'react';

const variantStyles = {
  info: {
    container: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
    icon: 'fa-info-circle text-blue-500 dark:text-blue-400',
  },
  success: {
    container: 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
    icon: 'fa-check-circle text-emerald-500 dark:text-emerald-400',
  },
  warning: {
    container: 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
    icon: 'fa-exclamation-triangle text-amber-500 dark:text-amber-400',
  },
  error: {
    container: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
    icon: 'fa-times-circle text-red-500 dark:text-red-400',
  },
};

const variantIcons = {
  info: 'fa-info-circle',
  success: 'fa-check-circle',
  warning: 'fa-exclamation-triangle',
  error: 'fa-times-circle',
};

export default function FormAlert({
  variant = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  icon,
  className = '',
  children,
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const styles = variantStyles[variant] || variantStyles.info;

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg text-sm ${styles.container} ${className}`}
      role="alert"
    >
      {/* Icon */}
      {icon !== false && (
        <i className={`fas ${icon || variantIcons[variant] || variantIcons.info} mt-0.5 flex-shrink-0`}></i>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {message && <p>{message}</p>}
        {children}
      </div>

      {/* Dismiss button */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
}

/**
 * FormError - Shorthand for a single validation error message
 * Props: message, className, field (optional - prepends field name)
 */
export function FormError({ message, field, className = '' }) {
  if (!message) return null;
  return (
    <p className={`mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1 ${className}`} role="alert">
      <i className="fas fa-info-circle flex-shrink-0"></i>
      <span>{field ? `${field}: ` : ''}{message}</span>
    </p>
  );
}
