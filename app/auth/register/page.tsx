'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/redux/hooks';
import { registerUser, clearError } from '@/store/redux/authSlice';
import { Eye, EyeOff } from 'lucide-react';
import styles from '../Auth.module.css';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useAppDispatch();
    const router = useRouter();
    const { isLoading, error } = useAppSelector((state) => state.auth);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const resultAction = await dispatch(registerUser(formData));
        if (registerUser.fulfilled.match(resultAction)) {
            sessionStorage.setItem('justLoggedIn', 'true');
            router.push('/');
        }
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.imageSection}>
                <Image 
                    src="/images/auth-bg.png" 
                    alt="Register Background" 
                    fill 
                    priority
                />
                <div className={styles.imageOverlay} />
            </div>

            <div className={styles.formSection}>
                <div className={styles.formWrapper}>
                    <h2 className={styles.title}>Đăng ký</h2>
                    <span className={styles.subtitle}>Bắt đầu hành trình của bạn</span>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Họ và tên</label>
                            <input
                                name="fullName"
                                type="text"
                                required
                                className={styles.input}
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Địa chỉ Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className={styles.input}
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Số điện thoại</label>
                            <input
                                name="phone"
                                type="tel"
                                required
                                className={styles.input}
                                placeholder="0123 456 789"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Mật khẩu</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className={styles.input}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
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
                            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                        </button>

                        <div className={styles.footer}>
                            <span>Bạn đã có tài khoản?</span>
                            <Link href="/auth/login" className={styles.link} onClick={() => dispatch(clearError())}>
                                Đăng nhập
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
