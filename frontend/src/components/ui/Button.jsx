import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-[var(--brand)] text-[var(--text-on-brand)] hover:bg-[var(--brand-dark)] active:scale-[0.98]',
  ghost: 'bg-transparent text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-muted)]',
  danger: 'bg-[var(--error)] text-white hover:opacity-90 active:scale-[0.98]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-[13px]',
  md: 'px-4 py-2 text-[14px]',
  lg: 'px-6 py-3 text-[16px]',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-[var(--radius-md)]
        transition-all duration-150 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {!loading && children}
      {loading && <span>Carregando...</span>}
    </button>
  );
}
