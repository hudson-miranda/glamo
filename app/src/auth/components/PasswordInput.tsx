// app/src/auth/components/PasswordInput.tsx
import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '../../lib/utils';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  showStrength?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, showStrength = false, className, value, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
      if (!password) return { strength: 0, label: '', color: '' };
      
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
      if (/\d/.test(password)) strength++;
      if (/[^a-zA-Z0-9]/.test(password)) strength++;

      const labels = ['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte'];
      const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];

      return {
        strength,
        label: labels[strength] || '',
        color: colors[strength] || 'bg-gray-300'
      };
    };

    const passwordValue = value as string || '';
    const { strength, label: strengthLabel, color } = showStrength ? getPasswordStrength(passwordValue) : { strength: 0, label: '', color: '' };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
          {label}
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            value={value}
            className={cn(
              "w-full pl-10 pr-12 py-3 rounded-xl border",
              "bg-white dark:bg-gray-800/50",
              "text-gray-900 dark:text-white",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-red-300 dark:border-red-500/50 focus:ring-red-500/50 focus:border-red-500"
                : "border-gray-200 dark:border-gray-700",
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Strength indicator */}
        {showStrength && passwordValue.length > 0 && (
          <div className="space-y-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-300",
                    level <= strength ? color : "bg-gray-200 dark:bg-gray-700"
                  )}
                />
              ))}
            </div>
            {strengthLabel && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Força da senha: <span className="font-semibold">{strengthLabel}</span>
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
