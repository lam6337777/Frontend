/**
 * Song ngữ Việt/Anh.
 *
 * - Từ điển chia theo khu vực trong ./messages/*.ts, mỗi file khai báo cả `vi` lẫn `en`
 *   (TypeScript bắt `en` có đủ khóa như `vi`).
 * - Ngôn ngữ lưu trong cookie `pf_locale` → server component đọc được (không bị nháy khi tải),
 *   client đổi ngôn ngữ thì ghi cookie + router.refresh().
 * - `t('cart.title')`, `t('products.count', { n: 12 })`. Tiếng Anh: nếu n === 1 và có khóa
 *   `<key>_one` thì dùng khóa đó (1 product / 2 products).
 */
import { messages as viMessages } from './messages';

export type Locale = 'vi' | 'en';
export const LOCALES: Locale[] = ['vi', 'en'];
export const DEFAULT_LOCALE: Locale = 'vi';
export const LOCALE_COOKIE = 'pf_locale';

type Dict<T> = { [K in keyof T]: T[K] extends string ? string : Dict<T[K]> };
export type Messages = Dict<typeof viMessages.vi>;

type Paths<T, P extends string = ''> = {
    [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Paths<T[K], `${P}${K}.`>;
}[keyof T & string];
export type TKey = Paths<Messages>;
export type TVars = Record<string, string | number>;
export type TFn = (key: TKey, vars?: TVars) => string;

export function isLocale(v: unknown): v is Locale {
    return v === 'vi' || v === 'en';
}

function lookup(dict: unknown, key: string): string | undefined {
    let cur: unknown = dict;
    for (const part of key.split('.')) {
        if (cur && typeof cur === 'object' && part in (cur as Record<string, unknown>)) cur = (cur as Record<string, unknown>)[part];
        else return undefined;
    }
    return typeof cur === 'string' ? cur : undefined;
}

export function createT(locale: Locale): TFn {
    const dict = viMessages[locale];
    const fallback = viMessages.vi;
    return (key, vars) => {
        let s: string | undefined;
        if (vars && vars.n === 1) s = lookup(dict, `${key}_one`);
        s ??= lookup(dict, key) ?? lookup(fallback, key) ?? key;
        if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
        return s;
    };
}

/** Tên danh mục lưu trong DB bằng tiếng Việt → hiển thị theo ngôn ngữ */
export function categoryLabel(locale: Locale, name: string | null | undefined): string {
    if (!name) return '';
    if (locale === 'vi') return name;
    const map = viMessages.en.categoryNames as Record<string, string>;
    return map[name] ?? name;
}

export const intlLocale = (l: Locale) => (l === 'en' ? 'en-US' : 'vi-VN');
