'use client';

import { useEffect, useState } from 'react';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { addressService } from '@/services/addressService';
import { Address, formatAddress } from '@/types/address';
import { AddressFormModal } from '@/components/account/AddressForm';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/misc';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { errorMessage } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';

export default function AddressesPage() {
    const toast = useToast();
    const t = useT();
    const [list, setList] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{ open: boolean; editing: Address | null }>({ open: false, editing: null });
    const [deleting, setDeleting] = useState<Address | null>(null);
    const [busy, setBusy] = useState(false);

    const load = () =>
        addressService
            .getUserAddresses()
            .then((r) => setList(r.data))
            .catch(() => setList([]))
            .finally(() => setLoading(false));

    useEffect(() => {
        load();
    }, []);

    const makeDefault = async (a: Address) => {
        try {
            await addressService.setDefaultAddress(a.id);
            toast(t('addresses.defaultSet'));
            load();
        } catch (e) {
            toast(errorMessage(e), 'error');
        }
    };

    const remove = async () => {
        if (!deleting) return;
        setBusy(true);
        try {
            await addressService.deleteAddress(deleting.id);
            toast(t('addresses.deleted'));
            setDeleting(null);
            load();
        } catch (e) {
            toast(errorMessage(e), 'error');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">{t('addresses.title')}</h1>
                {list.length > 0 && (
                    <Button size="sm" onClick={() => setModal({ open: true, editing: null })}>
                        <Plus className="h-4 w-4" /> {t('addresses.add')}
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="skeleton h-40 rounded-3xl" />
            ) : list.length === 0 ? (
                <div className="card">
                    <EmptyState
                        icon={<MapPin className="h-9 w-9" />}
                        title={t('addresses.empty')}
                        description={t('addresses.emptyBody')}
                        action={<Button onClick={() => setModal({ open: true, editing: null })}>{t('addresses.add')}</Button>}
                    />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {list.map((a) => (
                        <div key={a.id} className={`card relative p-5 ${a.isDefault ? 'ring-2 ring-brand-400' : ''}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold">{a.fullName}</p>
                                    <p className="text-sm text-muted">{a.phoneNumber}</p>
                                </div>
                                {a.isDefault && <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">{t('addresses.default')}</span>}
                            </div>
                            <p className="mt-3 text-sm">{formatAddress(a)}</p>
                            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
                                <Button size="sm" variant="ghost" onClick={() => setModal({ open: true, editing: a })}>
                                    <Pencil className="h-3.5 w-3.5" /> {t('addresses.edit')}
                                </Button>
                                <Button size="sm" variant="ghost" className="text-coral-600" onClick={() => setDeleting(a)}>
                                    <Trash2 className="h-3.5 w-3.5" /> {t('addresses.delete')}
                                </Button>
                                {!a.isDefault && (
                                    <Button size="sm" variant="soft" className="ml-auto" onClick={() => makeDefault(a)}>
                                        {t('addresses.makeDefault')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddressFormModal open={modal.open} editing={modal.editing} onClose={() => setModal({ open: false, editing: null })} onSaved={() => load()} />
            <Modal
                open={!!deleting}
                onClose={() => setDeleting(null)}
                title={t('addresses.deleteTitle')}
                size="sm"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setDeleting(null)}>
                            {t('addresses.no')}
                        </Button>
                        <Button variant="coral" loading={busy} onClick={remove}>
                            {t('addresses.delete')}
                        </Button>
                    </>
                }
            >
                <p className="text-sm text-muted">{deleting && formatAddress(deleting)}</p>
            </Modal>
        </div>
    );
}
