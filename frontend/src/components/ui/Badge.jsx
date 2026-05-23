const colors = {
  brand: 'bg-[var(--brand-light)] text-[var(--brand)] border-[var(--brand)]',
  success: 'bg-green-50 text-[var(--success)] border-[var(--success)]',
  error: 'bg-red-50 text-[var(--error)] border-[var(--error)]',
  warning: 'bg-amber-50 text-[var(--warning)] border-[var(--warning)]',
  default: 'bg-[var(--bg-muted)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-[12px]',
  lg: 'px-3 py-1.5 text-[13px]',
};

export default function Badge({
  children,
  color = 'default',
  size = 'md',
  className = '',
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        font-medium rounded-[var(--radius-full)]
        border
        ${colors[color]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
