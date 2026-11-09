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

export default function ForgotPasswordPage() {
    const router = useRouter();
    const toast = useToast();
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
            toast('Đã gửi mã xác thực, vui lòng kiểm tra email');
        } catch (err) {
            setError(errorMessage(err, 'Không gửi được mã xác thực'));
        } finally {
            setLoading(false);
        }
    };

    const reset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirm) return setError('Mật khẩu xác nhận không khớp');
        setLoading(true);
        try {
            await authService.resetPassword({ email: email.trim(), otpCode: otpCode.trim(), newPassword: password });
            toast('Đặt lại mật khẩu thành công, vui lòng đăng nhập');
            router.push('/auth/login');
        } catch (err) {
            setError(errorMessage(err, 'Đặt lại mật khẩu thất bại'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Quên mật khẩu"
            subtitle={step === 'email' ? 'Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác thực' : `Nhập mã đã gửi tới ${email}`}
        >
            {step === 'email' ? (
                <form onSubmit={requestOtp} className="space-y-4">
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium">Email</span>
                        <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                    </label>
                    {error && <p className="rounded-xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-600">{error}</p>}
                    <Button type="submit" size="lg" className="w-full" loading={loading}>
                        Gửi mã xác thực
                    </Button>
                </form>
            ) : (
                <form onSubmit={reset} className="space-y-4">
                    <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-4 text-sm text-brand-800">
                        <MailCheck className="h-5 w-5 shrink-0" /> Mã xác thực đã được gửi. Kiểm tra cả thư mục spam nếu chưa thấy.
                    </div>
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium">Mã xác thực (OTP)</span>
                        <input
                            className="input text-center font-mono text-lg tracking-[0.5em]"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\s/g, ''))}
                            required
                        />
                    </label>
                    <PasswordField label="Mật khẩu mới" value={password} onChange={setPassword} autoComplete="new-password" show={show} onToggle={() => setShow(!show)} />
                    <PasswordField label="Nhập lại mật khẩu mới" value={confirm} onChange={setConfirm} autoComplete="new-password" show={show} onToggle={() => setShow(!show)} />
                    {error && <p className="rounded-xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-600">{error}</p>}
                    <Button type="submit" size="lg" className="w-full" loading={loading}>
                        Đặt lại mật khẩu
                    </Button>
                    <button type="button" onClick={() => requestOtp()} className="w-full text-sm font-semibold text-brand-600 hover:underline" disabled={loading}>
                        Gửi lại mã
                    </button>
                </form>
            )}
            <p className="mt-6 text-center text-sm text-muted">
                <Link href="/auth/login" className="font-semibold text-brand-600 hover:underline">
                    ← Quay lại đăng nhập
                </Link>
            </p>
        </AuthShell>
    );
}
