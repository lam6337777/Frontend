'use client';

import { useState } from 'react';
import { Ruler } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useT } from '@/lib/i18n/client';

// Bảng quy đổi size giày nam/unisex phổ biến (EU → chiều dài bàn chân)
const ROWS = [
    ['38', '6', '24.0'],
    ['39', '6.5', '24.5'],
    ['40', '7', '25.0'],
    ['41', '8', '26.0'],
    ['42', '8.5', '26.5'],
    ['43', '9.5', '27.5'],
    ['44', '10', '28.0'],
    ['45', '11', '29.0'],
];

export function SizeGuide() {
    const t = useT();
    const [open, setOpen] = useState(false);
    return (
        <>
            <button onClick={() => setOpen(true)} className="flex items-center gap-1 py-1.5 text-sm font-semibold text-brand-600 hover:underline">
                <Ruler className="h-4 w-4" /> {t('sizeGuide.button')}
            </button>
            <Modal open={open} onClose={() => setOpen(false)} title={t('sizeGuide.title')}>
                <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-muted">
                    <li>{t('sizeGuide.step1')}</li>
                    <li>{t('sizeGuide.step2')}</li>
                    <li>{t('sizeGuide.step3')}</li>
                </ol>
                <table className="w-full overflow-hidden rounded-xl text-center text-sm">
                    <thead className="bg-brand-50 text-brand-800">
                        <tr>
                            <th className="py-2.5">EU</th>
                            <th>US</th>
                            <th>{t('sizeGuide.footLength')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ROWS.map((r) => (
                            <tr key={r[0]} className="border-b border-line last:border-0">
                                {r.map((c, i) => (
                                    <td key={i} className={i === 0 ? 'py-2 font-semibold' : 'py-2'}>
                                        {c}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="mt-3 text-xs text-muted">{t('sizeGuide.note')}</p>
            </Modal>
        </>
    );
}
