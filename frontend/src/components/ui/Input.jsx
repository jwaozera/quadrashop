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
  const isActive = focused || hasValue;

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-stretch h-12 overflow-hidden">
        {/* Ícone posicionado absolutamente */}
        {Icon && (
          <Icon 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] z-10 pointer-events-none" 
          />
        )}

        {/* Input com padding inline para garantir isolamento */}
        <input
          type={inputType}
          data-lpignore="true"
          autoComplete={isPassword ? 'new-password' : props.autoComplete || 'off'}
          className={`
            peer
            w-full h-full
            bg-[var(--bg-surface)] 
            border rounded-[var(--radius-md)]
            text-[var(--text-primary)] text-[14px]
            placeholder:text-transparent
            transition-all duration-150
            ${isPassword ? 'pr-10' : 'pr-4'}
            ${error 
              ? 'border-[var(--error)]' 
              : focused 
                ? 'border-[var(--border-focus)]' 
                : 'border-[var(--border-default)]'
            }
          `}
          style={{ 
            paddingLeft: Icon ? '44px' : '12px',
            paddingTop: '14px',
            paddingBottom: '6px'
          }}
          placeholder={label || ' '}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {/* Botão mostrar/ocultar senha */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] z-10"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}

        {/* Label flutuante com lógica peer */}
        {label && (
          <label
            className={`
              absolute px-1 bg-[var(--bg-surface)]
              transition-all duration-150 pointer-events-none
              peer-focus:text-[11px] peer-focus:top-1
              peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:top-1
              ${isActive 
                ? 'text-[11px] top-1' 
                : 'text-[14px] top-1/2 -translate-y-1/2'
              }
              ${error 
                ? 'text-[var(--error)]' 
                : focused 
                  ? 'text-[var(--brand)]' 
                  : 'text-[var(--text-tertiary)]'
              }
            `}
            style={{ 
              left: Icon ? (isActive ? '10px' : '44px') : '12px',
              transform: isActive ? 'none' : undefined
            }}
          >
            {label}
          </label>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <p className="mt-1 text-[12px] text-[var(--error)]">{error}</p>
      )}
    </div>
  );
}
