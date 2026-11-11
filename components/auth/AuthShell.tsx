'use client';

import Image from 'next/image';
import { Box, RotateCcw, Truck } from 'lucide-react';
import { useT } from '@/lib/i18n/client';

/** Khung chung cho trang đăng nhập / đăng ký / quên mật khẩu */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
    const t = useT();
    return (
        <div className="container-page py-8 md:py-12">
            <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-surface shadow-card md:grid-cols-2">
                <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-500 via-brand-400 to-emerald-300 p-10 text-white md:flex">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-2xl" />
                    <div className="relative">
                        <p className="text-sm font-semibold uppercase tracking-wider text-white/80">PF. Shoes</p>
                        <p className="mt-3 text-3xl font-extrabold leading-tight">
                            {t('auth.shellLine1')}
                            <br />
                            {t('auth.shellLine2')}
                        </p>
                    </div>
                    <Image src="/images/hero-shoe.png" alt="" width={1024} height={1024} className="relative mx-auto w-4/5 animate-float mix-blend-multiply" />
                    <ul className="relative space-y-2 text-sm text-white/90">
                        <li className="flex items-center gap-2">
                            <Truck className="h-4 w-4" /> {t('auth.perkShip')}
                        </li>
                        <li className="flex items-center gap-2">
                            <RotateCcw className="h-4 w-4" /> {t('auth.perkReturn')}
                        </li>
                        <li className="flex items-center gap-2">
                            <Box className="h-4 w-4" /> {t('auth.perk3d')}
                        </li>
                    </ul>
                </div>
                <div className="p-6 sm:p-10">
                    <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
                    {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
                    <div className="mt-7">{children}</div>
                </div>
            </div>
        </div>
    );
}

export function PasswordField({
    value,
    onChange,
    label,
    autoComplete,
    show,
    onToggle,
}: {
    value: string;
    onChange: (v: string) => void;
    label: string;
    autoComplete: string;
    show: boolean;
    onToggle: () => void;
}) {
    const t = useT();
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{label}</span>
            <span className="relative block">
                <input
                    type={show ? 'text' : 'password'}
                    className="input pr-16"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    required
                    minLength={6}
                />
                <button type="button" onClick={onToggle} aria-label={show ? t('auth.hidePassword') : t('auth.showPassword')} className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg px-3 py-2.5 text-xs font-semibold text-brand-600 hover:bg-brand-50">
                    {show ? t('auth.hide') : t('auth.show')}
                </button>
            </span>
        </label>
    );
}

/** Chỉ cho phép chuyển hướng trong nội bộ web (chặn open redirect như ?redirect=https://...) */
export function safeRedirect(path: string | null) {
    return path && path.startsWith('/') && !path.startsWith('//') ? path : '/';
}
