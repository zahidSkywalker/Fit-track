import React, { useState, useId } from 'react';

type InputType = 'text' | 'number' | 'email' | 'password' | 'tel' | 'search' | 'url';

interface NeuInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: 'raised' | 'pressed';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  inputSize?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
  raised: 'neu-raised-sm px-4',
  pressed: 'neu-pressed-sm px-4',
};

const sizeClasses = {
  sm: 'py-2 text-sm',
  md: 'py-3 text-sm',
  lg: 'py-3.5 text-base',
};

export const NeuInput: React.FC<NeuInputProps> = ({
  label,
  error,
  hint,
  variant = 'pressed',
  leftIcon,
  rightIcon,
  onRightIconClick,
  inputSize = 'md',
  type = 'text',
  className = '',
  id: externalId,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  ...props
}) => {
  const generatedId = useId();
  const id = externalId || generatedId;
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const wrapperClasses = [
    'relative flex items-center gap-2',
    variantClasses[variant],
    sizeClasses[inputSize],
    error ? 'ring-2 ring-neu-red/40' : '',
    isFocused && !error ? 'ring-2 ring-neu-blue/30' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-neu-text-secondary ml-1"
        >
          {label}
        </label>
      )}
      <div className={wrapperClasses}>
        {leftIcon && (
          <span className="text-neu-text-secondary flex-shrink-0">{leftIcon}</span>
        )}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-neu-text placeholder:text-neu-text-tertiary min-w-0"
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-neu-text-secondary hover:text-neu-text transition-colors flex-shrink-0 p-0.5"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <EyeIcon open={showPassword} size={18} />
          </button>
        )}
        {rightIcon && !isPassword && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="text-neu-text-secondary hover:text-neu-text transition-colors flex-shrink-0 p-0.5"
            tabIndex={-1}
          >
            {rightIcon}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-neu-red ml-1" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-neu-text-tertiary ml-1">
          {hint}
        </p>
      )}
    </div>
  );
};

/* ===== Simple Eye Icon for Password Toggle ===== */
const EyeIcon: React.FC<{ open: boolean; size: number }> = ({ open, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);
