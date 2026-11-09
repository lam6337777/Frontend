'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/redux/hooks';
import { clearError, registerUser } from '@/store/redux/authSlice';
import { mergeGuestCart } from '@/store/redux/cartSlice';
import { AuthShell, PasswordField, safeRedirect } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

function RegisterForm() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const sp = useSearchParams();
    const toast = useToast();
    const { isLoading, error } = useAppSelector((s) => s.auth);
    const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
    const [show, setShow] = useState(false);
    const [localError, setLocalError] = useState('');
    const redirect = safeRedirect(sp.get('redirect'));

    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');
        if (!/^(0|\+84)[0-9]{9}$/.test(form.phone)) return setLocalError('Số điện thoại gồm 10 số, bắt đầu bằng 0');
        if (form.password.length < 6) return setLocalError('Mật khẩu tối thiểu 6 ký tự');
        const res = await dispatch(registerUser({ ...form, email: form.email.trim(), fullName: form.fullName.trim() }));
        if (registerUser.fulfilled.match(res)) {
            await dispatch(mergeGuestCart());
            toast('Tạo tài khoản thành công!');
            router.replace(redirect);
        }
    };

    return (
        <AuthShell title="Tạo tài khoản" subtitle="Nhận ưu đãi thành viên và theo dõi đơn hàng dễ dàng">
            <form onSubmit={submit} className="space-y-4">
                <label className="block">
                    <span className="mb-1.5 block text-sm font-medium">Họ và tên</span>
                    <input className="input" value={form.fullName} onChange={set('fullName')} autoComplete="name" required />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium">Email</span>
                        <input type="email" className="input" value={form.email} onChange={set('email')} autoComplete="email" required />
                    </label>
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium">Số điện thoại</span>
                        <input
                            className="input"
                            inputMode="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d+]/g, '') })}
                            autoComplete="tel"
                            required
                        />
                    </label>
                </div>
                <PasswordField label="Mật khẩu" value={form.password} onChange={(v) => setForm({ ...form, password: v })} autoComplete="new-password" show={show} onToggle={() => setShow(!show)} />
                {(localError || error) && <p className="rounded-xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-600">{localError || error}</p>}
                <Button type="submit" size="lg" className="w-full" loading={isLoading}>
                    Đăng ký
                </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted">
                Đã có tài khoản?{' '}
                <Link href="/auth/login" className="font-semibold text-brand-600 hover:underline">
                    Đăng nhập
                </Link>
            </p>
        </AuthShell>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={null}>
            <RegisterForm />
        </Suspense>
    );
}
