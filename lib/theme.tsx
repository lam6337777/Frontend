'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

export type ThemePref = 'light' | 'dark' | 'system';
const KEY = 'pf:theme';

/**
 * Chạy trong <head> trước khi trang hiển thị: đặt class .dark ngay từ đầu để không bị
 * "chớp trắng" khi khách đang dùng chế độ tối. Giữ ngắn và không phụ thuộc gì.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem('${KEY}')||'system';var d=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;e.classList.toggle('dark',d);e.style.colorScheme=d?'dark':'light';}catch(_){}})();`;

interface ThemeCtx {
    pref: ThemePref;
    dark: boolean;
    setPref: (p: ThemePref) => void;
}

const Ctx = createContext<ThemeCtx>({ pref: 'system', dark: false, setPref: () => {} });

function readPref(): ThemePref {
    try {
        const v = localStorage.getItem(KEY);
        return v === 'light' || v === 'dark' ? v : 'system';
    } catch {
        return 'system';
    }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [pref, setPrefState] = useState<ThemePref>('system');
    const [dark, setDark] = useState(false);

    useEffect(() => {
        setPrefState(readPref());
    }, []);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const apply = () => {
            const d = pref === 'dark' || (pref === 'system' && mq.matches);
            const el = document.documentElement;
            el.classList.toggle('dark', d);
            el.style.colorScheme = d ? 'dark' : 'light';
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', d ? '#0a1412' : '#0ea893');
            setDark(d);
        };
        apply();
        if (pref !== 'system') return;
        mq.addEventListener('change', apply);
        return () => mq.removeEventListener('change', apply);
    }, [pref]);

    const setPref = useCallback((p: ThemePref) => {
        setPrefState(p);
        try {
            if (p === 'system') localStorage.removeItem(KEY);
            else localStorage.setItem(KEY, p);
        } catch {
            /* chế độ riêng tư: chỉ áp dụng trong phiên */
        }
    }, []);

    return <Ctx.Provider value={{ pref, dark, setPref }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
