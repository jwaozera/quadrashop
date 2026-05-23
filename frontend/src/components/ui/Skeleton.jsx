export default function Skeleton({
  width,
  height,
  rounded = 'md',
  className = '',
}) {
  const radiusClass = {
    none: 'rounded-none',
    sm: 'rounded-[var(--radius-sm)]',
    md: 'rounded-[var(--radius-md)]',
    lg: 'rounded-[var(--radius-lg)]',
    full: 'rounded-full',
  };

  return (
    <div
      className={`animate-shimmer ${radiusClass[rounded]} ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px',
      }}
      aria-busy="true"
      aria-label="Carregando..."
    />
  );
}
