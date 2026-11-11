'use client';

import { useEffect, useState } from 'react';
import { Address, AddressRequest } from '@/types/address';
import { addressService } from '@/services/addressService';
import { PROVINCES } from '@/lib/provinces';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { errorMessage } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';

const EMPTY: AddressRequest = { fullName: '', phoneNumber: '', province: '', ward: '', addressDetail: '', isDefault: false };
const PHONE_RE = /^(0|\+84)[0-9]{9}$/;

/** Form thêm/sửa địa chỉ trong hộp thoại. Trả địa chỉ đã lưu qua onSaved. */
export function AddressFormModal({
    open,
    onClose,
    editing,
    onSaved,
    defaults,
}: {
    open: boolean;
    onClose: () => void;
    editing?: Address | null;
    onSaved: (a: Address) => void;
    defaults?: Partial<AddressRequest>;
}) {
    const toast = useToast();
    const t = useT();
    const [form, setForm] = useState<AddressRequest>(EMPTY);
    const [errors, setErrors] = useState<Partial<Record<keyof AddressRequest, string>>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setErrors({});
        setForm(editing ? { ...editing } : { ...EMPTY, ...defaults });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, editing]);

    const set = (k: keyof AddressRequest, v: string | boolean) => {
        setForm((f) => ({ ...f, [k]: v }));
        setErrors((e) => ({ ...e, [k]: undefined }));
    };

    const validate = () => {
        const e: typeof errors = {};
        if (!form.fullName.trim()) e.fullName = t('address.nameRequired');
        if (!PHONE_RE.test(form.phoneNumber.trim())) e.phoneNumber = t('address.phoneInvalid');
        if (!form.province) e.province = t('address.provinceRequired');
        if (!form.ward.trim()) e.ward = t('address.wardRequired');
        if (!form.addressDetail.trim()) e.addressDetail = t('address.detailRequired');
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try {
            const res = editing ? await addressService.updateAddress(editing.id, form) : await addressService.addAddress(form);
            toast(editing ? t('address.updated') : t('address.added'));
            onSaved(res.data);
            onClose();
        } catch (e) {
            toast(errorMessage(e, t('address.saveFailed')), 'error');
        } finally {
            setSaving(false);
        }
    };

    const field = (k: keyof AddressRequest, label: string, input: React.ReactNode) => (
        <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{label}</span>
            {input}
            {errors[k] && <span className="mt-1 block text-xs font-medium text-coral-600">{errors[k]}</span>}
        </label>
    );

    return (
        <Modal open={open} onClose={onClose} title={editing ? t('address.editTitle') : t('address.newTitle')}>
            <form onSubmit={submit} className="space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                    {field(
                        'fullName',
                        t('address.fullName'),
                        <input className="input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} aria-invalid={!!errors.fullName} autoComplete="name" />
                    )}
                    {field(
                        'phoneNumber',
                        t('address.phone'),
                        <input
                            className="input"
                            inputMode="tel"
                            value={form.phoneNumber}
                            onChange={(e) => set('phoneNumber', e.target.value.replace(/[^\d+]/g, ''))}
                            aria-invalid={!!errors.phoneNumber}
                            autoComplete="tel"
                        />
                    )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    {field(
                        'province',
                        t('address.province'),
                        <select className="input" value={form.province} onChange={(e) => set('province', e.target.value)} aria-invalid={!!errors.province}>
                            <option value="">{t('address.pickProvince')}</option>
                            {PROVINCES.map((p) => (
                                <option key={p}>{p}</option>
                            ))}
                        </select>
                    )}
                    {field(
                        'ward',
                        t('address.ward'),
                        <input className="input" placeholder={t('address.wardPlaceholder')} value={form.ward} onChange={(e) => set('ward', e.target.value)} aria-invalid={!!errors.ward} />
                    )}
                </div>
                {field(
                    'addressDetail',
                    t('address.detail'),
                    <input
                        className="input"
                        placeholder={t('address.detailPlaceholder')}
                        value={form.addressDetail}
                        onChange={(e) => set('addressDetail', e.target.value)}
                        aria-invalid={!!errors.addressDetail}
                        autoComplete="street-address"
                    />
                )}
                <p className="text-xs text-muted">{t('address.adminNote')}</p>
                <label className="flex items-center gap-2 py-1 text-sm">
                    <input type="checkbox" className="h-4 w-4 accent-brand-500" checked={!!form.isDefault} onChange={(e) => set('isDefault', e.target.checked)} />
                    {t('address.makeDefault')}
                </label>
                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        {t('address.cancel')}
                    </Button>
                    <Button type="submit" loading={saving}>
                        {t('address.save')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
