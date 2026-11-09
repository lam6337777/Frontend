'use client';

import { useEffect, useState } from 'react';
import { KeyRound, Package, Wallet } from 'lucide-react';
import { userService } from '@/services/userService';
import { UserResponse } from '@/types/user';
import { useAppDispatch } from '@/store/redux/hooks';
import { updateUser } from '@/store/redux/authSlice';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { errorMessage, formatDate, formatVND } from '@/lib/utils';

export default function ProfilePage() {
    const dispatch = useAppDispatch();
    const toast = useToast();
    const [profile, setProfile] = useState<(UserResponse & { totalOrders?: number; totalSpent?: number }) | null>(null);
    const [form, setForm] = useState({ fullName: '', phone: '' });
    const [saving, setSaving] = useState(false);
    const [pw, setPw] = useState({ oldPassword: '', newPassword: '', confirm: '' });
    const [pwError, setPwError] = useState('');
    const [changing, setChanging] = useState(false);

    useEffect(() => {
        userService
            .getMyProfile()
            .then((r) => {
                setProfile(r.data);
                setForm({ fullName: r.data.fullName || '', phone: r.data.phone || '' });
            })
            .catch(() => {});
    }, []);

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.fullName.trim()) return toast('Họ tên không được để trống', 'error');
        if (form.phone && !/^(0|\+84)[0-9]{9}$/.test(form.phone)) return toast('Số điện thoại không hợp lệ', 'error');
        setSaving(true);
        try {
            const res = await userService.updateProfile({ fullName: form.fullName.trim(), phone: form.phone || undefined });
            dispatch(updateUser({ fullName: res.data.fullName, phone: res.data.phone || '' }));
            toast('Đã cập nhật hồ sơ');
        } catch (err) {
            toast(errorMessage(err, 'Không cập nhật được hồ sơ'), 'error');
        } finally {
            setSaving(false);
        }
    };

    const changePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwError('');
        if (pw.newPassword.length < 6) return setPwError('Mật khẩu mới tối thiểu 6 ký tự');
        if (pw.newPassword !== pw.confirm) return setPwError('Mật khẩu xác nhận không khớp');
        setChanging(true);
        try {
            await userService.changePassword({ oldPassword: pw.oldPassword, newPassword: pw.newPassword });
            setPw({ oldPassword: '', newPassword: '', confirm: '' });
            toast('Đã đổi mật khẩu');
        } catch (err) {
            setPwError(errorMessage(err, 'Đổi mật khẩu thất bại'));
        } finally {
            setChanging(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="card flex items-center gap-4 p-5">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                        <Package className="h-6 w-6" />
                    </span>
                    <div>
                        <p className="text-sm text-muted">Đơn hàng</p>
                        <p className="text-xl font-extrabold">{profile?.totalOrders ?? '—'}</p>
                    </div>
                </div>
                <div className="card flex items-center gap-4 p-5">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-coral-50 text-coral-500">
                        <Wallet className="h-6 w-6" />
                    </span>
                    <div>
                        <p className="text-sm text-muted">Đã chi tiêu</p>
                        <p className="text-xl font-extrabold">{profile ? formatVND(profile.totalSpent) : '—'}</p>
                    </div>
                </div>
                <div className="card p-5">
                    <p className="text-sm text-muted">Thành viên từ</p>
                    <p className="text-xl font-extrabold">{profile ? formatDate(profile.createdAt) : '—'}</p>
                </div>
            </div>

            <form onSubmit={save} className="card space-y-4 p-6">
                <h1 className="text-xl font-bold">Hồ sơ của tôi</h1>
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium">Họ và tên</span>
                        <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} autoComplete="name" />
                    </label>
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium">Số điện thoại</span>
                        <input
                            className="input"
                            inputMode="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d+]/g, '') })}
                            autoComplete="tel"
                        />
                    </label>
                    <label className="block sm:col-span-2">
                        <span className="mb-1.5 block text-sm font-medium">Email</span>
                        <input className="input bg-mint-50 text-muted" value={profile?.email || ''} disabled />
                    </label>
                </div>
                <div className="flex justify-end">
                    <Button type="submit" loading={saving}>
                        Lưu thay đổi
                    </Button>
                </div>
            </form>

            <form onSubmit={changePassword} className="card space-y-4 p-6">
                <h2 className="flex items-center gap-2 text-xl font-bold">
                    <KeyRound className="h-5 w-5 text-brand-500" /> Đổi mật khẩu
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                    {(
                        [
                            ['oldPassword', 'Mật khẩu hiện tại', 'current-password'],
                            ['newPassword', 'Mật khẩu mới', 'new-password'],
                            ['confirm', 'Nhập lại mật khẩu mới', 'new-password'],
                        ] as const
                    ).map(([k, label, ac]) => (
                        <label key={k} className="block">
                            <span className="mb-1.5 block text-sm font-medium">{label}</span>
                            <input type="password" className="input" value={pw[k]} onChange={(e) => setPw({ ...pw, [k]: e.target.value })} autoComplete={ac} required />
                        </label>
                    ))}
                </div>
                {pwError && <p className="text-sm font-medium text-coral-600">{pwError}</p>}
                <div className="flex justify-end">
                    <Button type="submit" variant="dark" loading={changing}>
                        Đổi mật khẩu
                    </Button>
                </div>
            </form>
        </div>
    );
}
