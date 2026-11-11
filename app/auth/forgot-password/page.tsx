'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MailCheck } from 'lucide-react';
import { authService } from '@/services/authService';
import { AuthShell, PasswordField } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { errorMessage } from '@/lib/utils';
import { useT } from '@/lib/i18n/client';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const toast = useToast();
    const t = useT();
    const [step, setStep] = useState<'email' | 'reset'>('email');
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const requestOtp = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authService.forgotPassword(email.trim());
            setStep('reset');
            toast(t('auth.otpSent'));
        } catch (err) {
            setError(errorMessage(err, t('auth.otpFailed')));
        } finally {
            setLoading(false);
        }
    };

    const reset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirm) return setError(t('auth.mismatch'));
        setLoading(true);
        try {
            await authService.resetPassword({ email: email.trim(), otpCode: otpCode.trim(), newPassword: password });
            toast(t('auth.resetDone'));
            router.push('/auth/login');
        } catch (err) {
            setError(errorMessage(err, t('auth.resetFailed')));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title={t('auth.forgotTitle')}
            subtitle={step === 'email' ? t('auth.forgotEmail') : t('auth.forgotCode', { email })}
        >
            {step === 'email' ? (
                <form onSubmit={requestOtp} className="space-y-4">
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium">Email</span>
                        <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                    </label>
                    {error && <p className="rounded-xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-600">{error}</p>}
                    <Button type="submit" size="lg" className="w-full" loading={loading}>
                        {t('auth.sendOtp')}
                    </Button>
                </form>
            ) : (
                <form onSubmit={reset} className="space-y-4">
                    <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-4 text-sm text-brand-800">
                        <MailCheck className="h-5 w-5 shrink-0" /> {t('auth.otpNotice')}
                    </div>
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium">{t('auth.otp')}</span>
                        <input
                            className="input text-center font-mono text-lg tracking-[0.5em]"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\s/g, ''))}
                            required
                        />
                    </label>
                    <PasswordField label={t('auth.newPassword')} value={password} onChange={setPassword} autoComplete="new-password" show={show} onToggle={() => setShow(!show)} />
                    <PasswordField label={t('auth.confirmPassword')} value={confirm} onChange={setConfirm} autoComplete="new-password" show={show} onToggle={() => setShow(!show)} />
                    {error && <p className="rounded-xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-600">{error}</p>}
                    <Button type="submit" size="lg" className="w-full" loading={loading}>
                        {t('auth.reset')}
                    </Button>
                    <button type="button" onClick={() => requestOtp()} className="w-full py-2 text-sm font-semibold text-brand-600 hover:underline" disabled={loading}>
                        {t('auth.resend')}
                    </button>
                </form>
            )}
            <p className="mt-6 text-center text-sm text-muted">
                <Link href="/auth/login" className="font-semibold text-brand-600 hover:underline">
                    {t('auth.backToLogin')}
                </Link>
            </p>
        </AuthShell>
    );
}
