import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="space-y-1">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={cn(
                        'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors',
                        error && 'border-red-500 focus:ring-red-500',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';