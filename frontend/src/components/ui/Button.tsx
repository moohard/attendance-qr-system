import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        variant = 'primary',
        size = 'md',
        loading = false,
        children,
        className,
        disabled,
        ...props
    }, ref) => {
        const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants = {
            primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
            secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
            outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-primary-500',
            ghost: 'bg-transparent hover:bg-gray-100 focus:ring-primary-500',
            danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-base',
            lg: 'px-6 py-3 text-lg',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    baseClasses,
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={disabled || loading}
                {...props}
            >
                {loading && <LoadingSpinner size="sm" className="mr-2" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';