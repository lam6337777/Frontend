'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react';
import { productService } from '@/services/productService';
import { ProductResponse } from '@/types/product';
import { useI18n } from '@/lib/i18n/client';
import { useDismiss } from '@/lib/useDismiss';
import { effectivePrice, formatNumber, formatVND, productImages } from '@/lib/utils';

/** Ô tìm kiếm có gợi ý sản phẩm khi gõ (debounce 250ms) */
export function SearchBox({ autoFocus, onDone }: { autoFocus?: boolean; onDone?: () => void }) {
    const router = useRouter();
    const { t } = useI18n();
    const [q, setQ] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<ProductResponse[]>([]);
    const [total, setTotal] = useState(0);
    const boxRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const term = q.trim();
        if (term.length < 2) {
            setResults([]);
            return;
        }
        setLoading(true);
        const tm = setTimeout(async () => {
            try {
                const res = await productService.getProducts({ q: term, size: 6, sortBy: 'best_selling' });
                setResults(res.data.content);
                setTotal(res.data.totalElements);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 250);
        return () => clearTimeout(tm);
    }, [q]);

    const close = useCallback(() => setOpen(false), []);
    useDismiss([boxRef], close, open);

    const done = () => {
        setOpen(false);
        inputRef.current?.blur(); // ẩn bàn phím điện thoại
        onDone?.();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const term = q.trim();
        if (!term) return;
        done();
        router.push(`/products?q=${encodeURIComponent(term)}`);
    };

    return (
        <div ref={boxRef} className="relative w-full">
            <form onSubmit={submit} role="search">
                <label className="flex h-11 items-center gap-2 rounded-full border-2 border-brand-100 bg-surface pl-4 pr-1.5 transition focus-within:border-brand-400">
                    <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                    <input
                        ref={inputRef}
                        value={q}
                        onChange={(e) => {
                            setQ(e.target.value);
                            setOpen(true);
                        }}
                        onFocus={() => setOpen(true)}
                        autoFocus={autoFocus}
                        enterKeyHint="search"
                        placeholder={t('search.placeholder')}
                        className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                        aria-label={t('search.label')}
                    />
                    {q && (
                        <button type="button" onClick={() => setQ('')} className="p-1.5 text-muted hover:text-ink" aria-label={t('search.clear')}>
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    <button type="submit" className="h-8 rounded-full bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600">
                        {t('search.submit')}
                    </button>
                </label>
            </form>

            {open && q.trim().length >= 2 && (
                <div className="absolute inset-x-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl bg-surface shadow-lift ring-1 ring-line">
                    {loading && results.length === 0 ? (
                        <div className="flex items-center gap-2 p-4 text-sm text-muted">
                            <Loader2 className="h-4 w-4 animate-spin" /> {t('search.searching')}
                        </div>
                    ) : results.length === 0 ? (
                        <p className="p-4 text-sm text-muted">{t('search.noResult', { q: q.trim() })}</p>
                    ) : (
                        <>
                            <ul>
                                {results.map((p) => (
                                    <li key={p.id}>
                                        <Link href={`/products/${p.id}`} onClick={done} className="flex items-center gap-3 px-4 py-2.5 hover:bg-mint-50 active:bg-mint-100">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={productImages(p)[0]} alt="" className="h-12 w-12 rounded-lg bg-surface object-cover" />
                                            <div className="min-w-0 flex-1">
                                                <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
                                                <p className="text-xs text-muted">{p.brandName}</p>
                                            </div>
                                            <span className="text-sm font-bold text-coral-500">{formatVND(effectivePrice(p))}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={submit}
                                className="w-full border-t border-line bg-mint-50 px-4 py-3 text-left text-sm font-semibold text-brand-700 hover:bg-brand-50"
                            >
                                {t('search.seeAll', { n: formatNumber(total), q: q.trim() })}
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
