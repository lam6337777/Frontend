'use client';

import { Laptop, Moon, Sun } from 'lucide-react';
import { useI18n } from '@/lib/i18n/client';
import { ThemePref, useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

const iconBtn =
    'relative grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-brand-50 hover:text-brand-600';

/** Nút đổi ngôn ngữ + sáng/tối nhỏ gọn cho header (máy tính) */
export function PrefsButtons({ className }: { className?: string }) {
    const { locale, setLocale, t } = useI18n();
    const { dark, setPref } = useTheme();
    return (
        <div className={cn('flex items-center', className)}>
            <button
                onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
                className={cn(iconBtn, 'w-auto px-2.5 text-xs font-bold tracking-wide')}
                aria-label={`${t('prefs.language')}: ${locale === 'vi' ? t('prefs.switchToEnglish') : t('prefs.switchToVietnamese')}`}
                title={t('prefs.language')}
            >
                {locale === 'vi' ? 'EN' : 'VI'}
            </button>
            <button
                onClick={() => setPref(dark ? 'light' : 'dark')}
                className={iconBtn}
                aria-label={`${t('prefs.theme')}: ${dark ? t('prefs.light') : t('prefs.dark')}`}
                title={dark ? t('prefs.light') : t('prefs.dark')}
            >
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
        </div>
    );
}

/** Bảng chọn đầy đủ cho menu điện thoại: ngôn ngữ (VI/EN) + giao diện (Sáng/Tối/Hệ thống) */
export function PrefsPanel() {
    const { locale, setLocale, t } = useI18n();
    const { pref, setPref } = useTheme();
    const seg = (active: boolean) =>
        cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition',
            active ? 'bg-surface text-brand-700 shadow-sm' : 'text-muted'
        );
    const themes: { v: ThemePref; label: string; Icon: typeof Sun }[] = [
        { v: 'light', label: t('prefs.light'), Icon: Sun },
        { v: 'dark', label: t('prefs.dark'), Icon: Moon },
        { v: 'system', label: t('prefs.system'), Icon: Laptop },
    ];
    return (
        <div className="space-y-3 px-4">
            <div>
                <p className="mb-1.5 text-xs font-medium text-muted">{t('prefs.language')}</p>
                <div className="flex gap-1 rounded-xl bg-mint-100 p-1" role="radiogroup" aria-label={t('prefs.language')}>
                    {(['vi', 'en'] as const).map((l) => (
                        <button key={l} role="radio" aria-checked={locale === l} onClick={() => setLocale(l)} className={seg(locale === l)}>
                            {l === 'vi' ? 'Tiếng Việt' : 'English'}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <p className="mb-1.5 text-xs font-medium text-muted">{t('prefs.theme')}</p>
                <div className="flex gap-1 rounded-xl bg-mint-100 p-1" role="radiogroup" aria-label={t('prefs.theme')}>
                    {themes.map(({ v, label, Icon }) => (
                        <button key={v} role="radio" aria-checked={pref === v} onClick={() => setPref(v)} className={seg(pref === v)}>
                            <Icon className="h-4 w-4" /> {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
