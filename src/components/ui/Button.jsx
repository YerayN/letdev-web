// Nuestro botón de referencia — todo el proyecto usa este, no reinventamos la rueda
const variants = {
  primary:   'bg-gold hover:bg-gold-light text-navy font-semibold shadow-sm',
  secondary: 'bg-navy hover:bg-navy-light text-white font-semibold shadow-sm',
  ghost:     'bg-transparent hover:bg-navy/5 text-navy',
  danger:    'bg-red-500 hover:bg-red-600 text-white font-semibold',
  outline:   'border border-navy/20 hover:border-navy/40 text-navy bg-white',
}

const sizes = {
  sm:  'px-3 py-1.5 text-xs rounded-md',
  md:  'px-4 py-2   text-sm rounded-lg',
  lg:  'px-6 py-3   text-base rounded-xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  icon: Icon,
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="shrink-0" />
      ) : null}
      {children}
    </button>
  )
}
