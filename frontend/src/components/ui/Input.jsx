import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const hasValue = props.value && props.value.length > 0;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
        )}
        <input
          type={inputType}
          className={`
            w-full px-4 py-3 
            ${Icon ? 'pl-10' : ''} 
            ${isPassword ? 'pr-10' : ''}
            bg-[var(--bg-surface)] 
            border rounded-[var(--radius-md)]
            text-[var(--text-primary)] text-[14px]
            placeholder:text-[var(--text-tertiary)]
            transition-all duration-150
            ${error 
              ? 'border-[var(--error)]' 
              : focused 
                ? 'border-[var(--border-focus)]' 
                : 'border-[var(--border-default)]'
            }
          `}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        {label && (
          <label
            className={`
              absolute left-3 px-1 bg-[var(--bg-surface)]
              transition-all duration-150 pointer-events-none
              ${(focused || hasValue) 
                ? '-top-2 text-[12px]' 
                : 'top-1/2 -translate-y-1/2 text-[14px]'
              }
              ${Icon && !(focused || hasValue) ? 'left-10' : ''}
              ${error 
                ? 'text-[var(--error)]' 
                : focused 
                  ? 'text-[var(--brand)]' 
                  : 'text-[var(--text-tertiary)]'
              }
            `}
          >
            {label}
          </label>
        )}
      </div>
      {error && (
        <p className="mt-1 text-[12px] text-[var(--error)]">{error}</p>
      )}
    </div>
  );
}
