/**
 * FormCard - Card wrapper for form sections
 *
 * Props: title, icon, children, className, actions (ReactNode for footer)
 */
export default function FormCard({ title, icon, children, className = '', actions }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,.3)] border border-gray-200 dark:border-slate-700 ${className}`}>
      {title && (
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          {icon && <i className={`fas ${icon} text-indigo-500`}></i>}
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
      {actions && (
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30 rounded-b-xl">
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * FormSection - Groups related fields with a heading
 *
 * Props: title, icon, children, className
 */
export function FormSection({ title, icon, children, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div className="flex items-center gap-2 pb-1">
          {icon && <i className={`fas ${icon} text-indigo-400 text-xs`}></i>}
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h4>
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * FormRow - Horizontal row of form fields
 * Props: cols (2 or 3), children, className
 */
export function FormRow({ cols = 2, children, className = '' }) {
  const gridCols = cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';
  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-4 ${className}`}>
      {children}
    </div>
  );
}
