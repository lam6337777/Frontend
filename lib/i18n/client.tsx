'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { categoryLabel, createT, Locale, LOCALE_COOKIE, TFn } from './core';
import { setFormatLocale } from '@/lib/utils';

interface I18nCtx {
    locale: Locale;
    t: TFn;
    cat: (name: string | null | undefined) => string;
    setLocale: (l: Locale) => void;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
    const router = useRouter();
    const [locale, setLocaleState] = useState<Locale>(initialLocale);
    // Định dạng tiền/ngày (formatVND, formatDate) theo ngôn ngữ hiện tại
    setFormatLocale(locale);

    const setLocale = useCallback(
        (l: Locale) => {
            document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
            document.documentElement.lang = l;
            setFormatLocale(l);
            setLocaleState(l);
            router.refresh(); // render lại Server Component (footer, trang chính sách…)
        },
        [router]
    );

    const value = useMemo<I18nCtx>(
        () => ({ locale, t: createT(locale), cat: (n) => categoryLabel(locale, n), setLocale }),
        [locale, setLocale]
    );
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
    const v = useContext(Ctx);
    if (!v) throw new Error('useI18n phải nằm trong <I18nProvider>');
    return v;
}

/** Hàm dịch cho component client: const t = useT(); t('cart.title') */
export const useT = () => useI18n().t;
