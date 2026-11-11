import React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'coral' | 'outline' | 'ghost' | 'soft' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm shadow-brand-500/30',
    coral: 'bg-coral-500 text-white hover:bg-coral-600 shadow-sm shadow-coral-500/30',
    outline: 'border border-line bg-surface text-ink hover:border-brand-400 hover:text-brand-700',
    ghost: 'text-ink hover:bg-mint-100',
    soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
    dark: 'bg-night text-white hover:bg-brand-800',
};

const SIZE: Record<Size, string> = {
    sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-lg',
    md: 'h-11 px-5 text-sm gap-2 rounded-xl',
    lg: 'h-13 px-7 text-base gap-2 rounded-xl',
};

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
    return cn(
        'inline-flex items-center justify-center font-semibold whitespace-nowrap transition-all duration-150',
        'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        VARIANT[variant],
        SIZE[size],
        className
    );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
}

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: ButtonProps) {
    return (
        <button className={buttonClass(variant, size, className)} disabled={disabled || loading} {...props}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {children}
        </button>
    );
}

interface LinkButtonProps extends React.ComponentProps<typeof Link> {
    variant?: Variant;
    size?: Size;
}

export function LinkButton({ variant = 'primary', size = 'md', className, ...props }: LinkButtonProps) {
    return <Link className={buttonClass(variant, size, className)} {...props} />;
}
