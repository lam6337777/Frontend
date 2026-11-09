'use client';

import { useEffect, useState } from 'react';
import { reviewService } from '@/services/reviewService';
import { OrderItemResponse } from '@/types/order';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { RatingInput } from '@/components/ui/Rating';
import { useToast } from '@/components/ui/Toast';
import { errorMessage, PLACEHOLDER_IMAGE, resolveAssetUrl } from '@/lib/utils';

const LABEL = ['', 'Rất tệ', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Tuyệt vời'];

export function ReviewModal({
    item,
    orderId,
    onClose,
    onDone,
}: {
    item: OrderItemResponse | null;
    orderId: number;
    onClose: () => void;
    onDone: () => void;
}) {
    const toast = useToast();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setRating(5);
        setComment('');
    }, [item]);

    const submit = async () => {
        if (!item) return;
        setSaving(true);
        try {
            await reviewService.createReview({ productId: item.productId, orderId, rating, comment: comment.trim() });
            toast('Cảm ơn bạn đã đánh giá!');
            onDone();
            onClose();
        } catch (e) {
            toast(errorMessage(e, 'Không gửi được đánh giá'), 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            open={!!item}
            onClose={onClose}
            title="Đánh giá sản phẩm"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Để sau
                    </Button>
                    <Button onClick={submit} loading={saving}>
                        Gửi đánh giá
                    </Button>
                </>
            }
        >
            {item && (
                <div className="space-y-5">
                    <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resolveAssetUrl(item.imageUrl) || PLACEHOLDER_IMAGE} alt="" className="h-16 w-16 rounded-xl object-cover" />
                        <div>
                            <p className="font-semibold">{item.productName}</p>
                            <p className="text-sm text-muted">Size {item.size}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <RatingInput value={rating} onChange={setRating} />
                        <p className="text-sm font-semibold text-amber-600">{LABEL[rating]}</p>
                    </div>
                    <textarea
                        className="input min-h-28"
                        maxLength={1000}
                        placeholder="Chia sẻ cảm nhận về form giày, chất liệu, độ êm…"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>
            )}
        </Modal>
    );
}
