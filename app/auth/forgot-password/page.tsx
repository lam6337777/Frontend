'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import styles from '../Auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter();

  // Xử lý gửi mã OTP qua email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setIsOtpSent(true);
        setSuccessMessage('Mã xác thực đã được gửi thành công. Vui lòng kiểm tra email!');
      } else {
        setError(response.message || 'Gửi mã xác thực thất bại.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi gửi yêu cầu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý đặt lại mật khẩu mới
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Kiểm tra mật khẩu khớp
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.resetPassword({
        email,
        otpCode,
        newPassword
      });

      if (response.success) {
        setSuccessMessage('Đặt lại mật khẩu thành công! Đang chuyển hướng về trang Đăng nhập...');
        // Chuyển hướng sau 3 giây
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setError(response.message || 'Đặt lại mật khẩu thất bại.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.imageSection}>
        <Image 
          src="/images/auth-bg.png" 
          alt="Auth Background" 
          fill 
          priority
        />
        <div className={styles.imageOverlay} />
      </div>
      
      <div className={styles.formSection}>
        <div className={styles.formWrapper}>
          <h2 className={styles.title}>Quên mật khẩu</h2>
          <span className={styles.subtitle}>Khôi phục tài khoản của bạn</span>
          
          {successMessage && (
            <div className={styles.error} style={{ backgroundColor: '#F6FFED', border: '1px solid #B7EB8F', color: '#389E0D', marginBottom: '1.5rem' }}>
              {successMessage}
            </div>
          )}

          {error && (
            <div className={styles.error} style={{ marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          {!isOtpSent ? (
            // BƯỚC 1: NHẬP EMAIL ĐỂ GỬI MÃ OTP
            <form className={styles.form} onSubmit={handleRequestOtp}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Địa chỉ Email</label>
                <input
                  type="email"
                  required
                  className={styles.input}
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitBtn}
              >
                {isLoading ? 'Đang gửi...' : 'Gửi mã xác thực'}
              </button>

              <div className={styles.footer}>
                <span>Nhớ mật khẩu?</span>
                <Link href="/auth/login" className={styles.link}>
                  Đăng nhập
                </Link>
              </div>
            </form>
          ) : (
            // BƯỚC 2: NHẬP MÃ OTP VÀ MẬT KHẨU MỚI
            <form className={styles.form} onSubmit={handleResetPassword}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Địa chỉ Email</label>
                <input
                  type="email"
                  disabled
                  className={styles.input}
                  value={email}
                  style={{ backgroundColor: '#F5F5F5', color: '#737373', cursor: 'not-allowed' }}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Mã xác thực OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  className={styles.input}
                  placeholder="Mã OTP 6 số"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Mật khẩu mới</label>
                <input
                  type="password"
                  required
                  className={styles.input}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  required
                  className={styles.input}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitBtn}
              >
                {isLoading ? 'Đang đặt lại...' : 'Xác nhận đặt lại'}
              </button>

              <div className={styles.footer}>
                <span style={{ display: 'block', marginBottom: '0.5rem' }}>Không nhận được mã xác thực?</span>
                <button 
                  type="button" 
                  onClick={handleRequestOtp} 
                  disabled={isLoading}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  className={styles.link}
                >
                  Gửi lại mã
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
