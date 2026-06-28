/**
 * Button - Reusable button component with variants
 *
 * Variants:
 *   primary (default) | secondary | danger | ghost | outline
 *
 * Sizes:
 *   sm | md (default) | lg
 *
 * Props:
 *   variant, size, icon, loading, disabled, type, onClick, children, className, fullWidth
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  children,
  className = '',
  fullWidth = false,
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm hover:shadow disabled:bg-indigo-300',
    secondary:
      'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-300',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm disabled:bg-red-300',
    ghost:
      'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-400 disabled:text-gray-300',
    outline:
      'bg-transparent text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500 disabled:border-gray-300 disabled:text-gray-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const classes = [
    base,
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    fullWidth ? 'w-full' : '',
    disabled || loading ? 'cursor-not-allowed' : 'cursor-pointer',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
    >
      {loading ? (
        <i className="fas fa-spinner fa-spin"></i>
      ) : icon ? (
        <i className={`fas ${icon}`}></i>
      ) : null}
      {children && <span>{children}</span>}
    </button>
  );
}

/**
 * IconButton - Square icon-only button
 */
export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  onClick,
  disabled = false,
  label = '',
  className = '',
}) {
  const sizeMap = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-12 h-12 text-lg' };
  const variantMap = {
    ghost: 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
    danger: 'text-red-400 hover:text-red-600 hover:bg-red-50',
    primary: 'text-indigo-600 hover:bg-indigo-50',
  };

  const classes = [
    'inline-flex items-center justify-center rounded-lg transition-all duration-200',
    sizeMap[size] || sizeMap.md,
    variantMap[variant] || variantMap.ghost,
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={classes}
      aria-label={label}
      title={label}
    >
      <i className={`fas ${icon}`}></i>
    </button>
  );
}
