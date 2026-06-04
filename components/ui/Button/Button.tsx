import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    fullWidth?: boolean;
}

const Button = ({
    children,
    variant = 'primary',
    fullWidth = false,
    className,
    disabled,
    ...props
}: ButtonProps) => {
    return (
        <button
            className={cn(
                styles.button,
                styles[variant],
                {
                    [styles.fullWidth]: fullWidth,
                    [styles.disabled]: disabled,
                },
                className
            )}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
