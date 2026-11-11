import { cookies } from 'next/headers';
import { categoryLabel, createT, DEFAULT_LOCALE, isLocale, Locale, LOCALE_COOKIE } from './core';

/** Ngôn ngữ của request hiện tại (đọc cookie) — dùng trong Server Component */
export async function getLocale(): Promise<Locale> {
    const v = (await cookies()).get(LOCALE_COOKIE)?.value;
    return isLocale(v) ? v : DEFAULT_LOCALE;
}

export async function getT() {
    const locale = await getLocale();
    return { locale, t: createT(locale), cat: (name: string) => categoryLabel(locale, name) };
}
