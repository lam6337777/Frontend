'use client';

import { useEffect, useState } from 'react';
import { reviewService } from '@/services/reviewService';
import { OrderItemResponse } from '@/types/order';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { RatingInput } from '@/components/ui/Rating';
import { useToast } from '@/components/ui/Toast';
import { errorMessage, PLACEHOLDER_IMAGE, resolveAssetUrl } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';

const LABEL = ['', 'reviewModal.labels1', 'reviewModal.labels2', 'reviewModal.labels3', 'reviewModal.labels4', 'reviewModal.labels5'] as const;

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
    const t = useT();
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
            toast(t('reviewModal.thanks'));
            onDone();
            onClose();
        } catch (e) {
            toast(errorMessage(e, t('reviewModal.failed')), 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            open={!!item}
            onClose={onClose}
            title={t('reviewModal.title')}
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        {t('reviewModal.later')}
                    </Button>
                    <Button onClick={submit} loading={saving}>
                        {t('reviewModal.submit')}
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
                        <p className="text-sm font-semibold text-amber-600 dark:text-amber-300">{LABEL[rating] ? t(LABEL[rating] as 'reviewModal.labels1') : ''}</p>
                    </div>
                    <textarea
                        className="input min-h-28"
                        maxLength={1000}
                        placeholder={t('reviewModal.placeholder')}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>
            )}
        </Modal>
    );
}
