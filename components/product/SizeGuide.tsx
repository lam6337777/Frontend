'use client';

import { useState } from 'react';
import { Ruler } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

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
    const [open, setOpen] = useState(false);
    return (
        <>
            <button onClick={() => setOpen(true)} className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
                <Ruler className="h-4 w-4" /> Bảng size
            </button>
            <Modal open={open} onClose={() => setOpen(false)} title="Hướng dẫn chọn size">
                <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-muted">
                    <li>Đặt bàn chân lên tờ giấy, đánh dấu điểm gót và ngón dài nhất.</li>
                    <li>Đo khoảng cách giữa 2 điểm (cm), đo vào buổi chiều khi chân nở nhất.</li>
                    <li>Đối chiếu bảng dưới. Nếu ở giữa 2 size, nên chọn size lớn hơn.</li>
                </ol>
                <table className="w-full overflow-hidden rounded-xl text-center text-sm">
                    <thead className="bg-brand-50 text-brand-800">
                        <tr>
                            <th className="py-2.5">EU</th>
                            <th>US</th>
                            <th>Chiều dài chân (cm)</th>
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
                <p className="mt-3 text-xs text-muted">Bảng mang tính tham khảo, form giày có thể khác nhau giữa các dòng sản phẩm.</p>
            </Modal>
        </>
    );
}
