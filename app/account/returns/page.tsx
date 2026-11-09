'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { ReturnRequestResponse } from '@/types/order';
import { RETURN_STATUS, RETURN_TYPE_LABEL } from '@/lib/orderStatus';
import { Badge, EmptyState } from '@/components/ui/misc';
import { formatDate } from '@/lib/utils';

export default function ReturnsPage() {
    const [list, setList] = useState<ReturnRequestResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        orderService
            .getMyReturnRequests()
            .then((r) => setList(r.data))
            .catch(() => setList([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <h1 className="mb-4 text-xl font-bold">Đổi trả & bảo hành</h1>
            {loading ? (
                <div className="skeleton h-40 rounded-3xl" />
            ) : list.length === 0 ? (
                <div className="card">
                    <EmptyState
                        icon={<RotateCcw className="h-9 w-9" />}
                        title="Chưa có yêu cầu nào"
                        description="Bạn có thể gửi yêu cầu đổi size, trả hàng hoặc bảo hành trong trang chi tiết đơn hàng đã giao."
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    {list.map((r) => {
                        const st = RETURN_STATUS[r.status] || RETURN_STATUS.PENDING;
                        return (
                            <div key={r.id} className="card p-5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="text-sm">
                                        <span className="font-bold">{RETURN_TYPE_LABEL[r.type]}</span>
                                        <span className="mx-2 text-muted">·</span>
                                        <Link href={`/account/orders/${r.orderCode}`} className="font-semibold text-brand-600 hover:underline">
                                            #{r.orderCode}
                                        </Link>
                                        <span className="ml-2 text-muted">{formatDate(r.createdAt, true)}</span>
                                    </div>
                                    <Badge tone={st.tone}>{st.label}</Badge>
                                </div>
                                {r.returnItems && r.returnItems.length > 0 && (
                                    <ul className="mt-3 space-y-1 text-sm">
                                        {r.returnItems.map((it) => (
                                            <li key={it.id}>
                                                • {it.productName} <span className="text-muted">(size {it.size}, SL {it.quantity})</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <p className="mt-3 rounded-xl bg-mint-50 p-3 text-sm">
                                    <span className="font-medium">Lý do:</span> {r.reason}
                                </p>
                                {r.adminNote && (
                                    <p className="mt-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">
                                        <span className="font-medium">Phản hồi của shop:</span> {r.adminNote}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
