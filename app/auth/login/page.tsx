'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/redux/hooks';
import { clearError, loginUser } from '@/store/redux/authSlice';
import { mergeGuestCart } from '@/store/redux/cartSlice';
import { fetchWishlistIds } from '@/store/redux/wishlistSlice';
import { AuthShell, PasswordField, safeRedirect } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useT } from '@/lib/i18n/client';

function LoginForm() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const sp = useSearchParams();
    const toast = useToast();
    const t = useT();
    const { isLoading, error, isAuthenticated } = useAppSelector((s) => s.auth);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);
    const redirect = safeRedirect(sp.get('redirect'));

    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    // Đã đăng nhập mà vào trang này → chuyển đi luôn
    useEffect(() => {
        if (isAuthenticated) router.replace(redirect);
    }, [isAuthenticated, redirect, router]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await dispatch(loginUser({ email: email.trim(), password }));
        if (loginUser.fulfilled.match(res)) {
            await dispatch(mergeGuestCart());
            dispatch(fetchWishlistIds());
            toast(t('auth.welcomeBack', { name: res.payload.fullName }));
            router.replace(redirect);
        }
    };

    return (
        <AuthShell title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')}>
            <form onSubmit={submit} className="space-y-4">
                <label className="block">
                    <span className="mb-1.5 block text-sm font-medium">Email</span>
                    <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required placeholder="email@example.com" />
                </label>
                <PasswordField label={t('auth.password')} value={password} onChange={setPassword} autoComplete="current-password" show={show} onToggle={() => setShow(!show)} />
                <div className="text-right">
                    <Link href="/auth/forgot-password" className="inline-block py-1 text-sm font-semibold text-brand-600 hover:underline">
                        {t('auth.forgot')}
                    </Link>
                </div>
                {error && <p className="rounded-xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-600">{error}</p>}
                <Button type="submit" size="lg" className="w-full" loading={isLoading}>
                    {t('auth.login')}
                </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted">
                {t('auth.noAccount')}{' '}
                <Link href={`/auth/register${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="font-semibold text-brand-600 hover:underline">
                    {t('auth.registerNow')}
                </Link>
            </p>
        </AuthShell>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    );
}
