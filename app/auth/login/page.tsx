'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/redux/hooks';
import { loginUser, clearError } from '@/store/redux/authSlice';
import { Eye, EyeOff } from 'lucide-react';
import styles from '../Auth.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      sessionStorage.setItem('justLoggedIn', 'true');
      router.push('/');
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.imageSection}>
        <Image 
          src="/images/auth-bg.png" 
          alt="Login Background" 
          fill 
          priority
        />
        <div className={styles.imageOverlay} />
      </div>
      
      <div className={styles.formSection}>
        <div className={styles.formWrapper}>
          <h2 className={styles.title}>Đăng nhập</h2>
          <span className={styles.subtitle}>Truy cập vào phong cách của bạn</span>
          
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Địa chỉ Email</label>
              <input
                type="email"
                required
                className={styles.input}
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className={styles.label}>Mật khẩu</label>
                <Link href="/auth/forgot-password" className={styles.link} style={{ fontSize: '0.65rem', margin: 0, textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em' }}>
                  Quên mật khẩu?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--muted-foreground)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitBtn}
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>

            <div className={styles.footer}>
              <span>Bạn chưa có tài khoản?</span>
              <Link href="/auth/register" className={styles.link} onClick={() => dispatch(clearError())}>
                Đăng ký ngay
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
