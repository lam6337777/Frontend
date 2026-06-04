'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, User, ShoppingBag, LogOut } from 'lucide-react';
import styles from './Navbar.module.css';
import { useAppSelector, useAppDispatch } from '@/store/redux/hooks';
import { getMe, logout, setAuthChecked } from '@/store/redux/authSlice';
import { setCart, clearCart } from '@/store/redux/cartSlice';
import { cartService } from '@/services/cartService';

const Navbar = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const { items } = useAppSelector((state) => state.cart);
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !isAuthenticated) {
            dispatch(getMe());
        } else if (!token) {
            dispatch(setAuthChecked(true));
        }
        
        // Clear search input when user logs out
        if (!isAuthenticated) {
            setSearchQuery('');
        }
    }, [dispatch, isAuthenticated]);

    // Fetch & merge giỏ hàng khi đăng nhập
    useEffect(() => {
        const syncAndFetchCart = async () => {
            try {
                // Lưu lại items local (chưa đăng nhập) trước khi ghi đè
                const localItems = [...items];

                // Lấy giỏ hàng hiện tại từ server
                const serverRes = await cartService.getCart();
                const serverData = serverRes.data ?? [];

                // Kiểm tra xem đây là lần đầu đăng nhập hay chỉ là load lại trang
                const justLoggedIn = sessionStorage.getItem('justLoggedIn') === 'true';

                if (justLoggedIn) {
                    // Tập variantId đã có trên server
                    const serverVariantIds = new Set(serverData.map(i => i.variantId));

                    // Sync các item local chưa có trên server → gọi API thêm vào
                    const itemsToSync = localItems.filter(li => li.variantId && !serverVariantIds.has(li.variantId));
                    if (itemsToSync.length > 0) {
                        await Promise.all(
                            itemsToSync.map(li =>
                                cartService.addToCart({ variantId: li.variantId, quantity: li.quantity })
                            )
                        );
                    }
                    sessionStorage.removeItem('justLoggedIn');
                }

                // Fetch lại cart đầy đủ sau khi merge (nếu có merge)
                const finalRes = justLoggedIn ? await cartService.getCart() : serverRes;

                const finalData = finalRes.data ?? [];
                const mappedItems = finalData.map(item => ({
                    id: item.id.toString(),
                    variantId: item.variantId,
                    name: item.productName,
                    price: item.unitPrice,
                    brand: item.color ?? '',
                    size: item.size,
                    quantity: item.quantity,
                    image: item.primaryImageUrl
                }));
                dispatch(setCart(mappedItems));
            } catch (error) {
                console.error('Lỗi khi đồng bộ giỏ hàng:', error);
            }
        };

        if (isAuthenticated) {
            syncAndFetchCart();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, dispatch]);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(clearCart()); // Xóa cart khỏi Redux + sessionStorage khi đăng xuất
    };
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className={styles.navbar}>
            <div className={styles.container}>
                {/* LOGO */}
                <Link href="/" className={styles.logo}>
                    PF.
                </Link>

                {/* NAVIGATION MENU */}
                <nav className={styles.navMenu}>
                    <Link href="/products" className={styles.navLink}>
                        Sản phẩm
                    </Link>
                    <Link href="/policy" className={styles.navLink}>
                        Chính sách
                    </Link>
                    <Link href="/about" className={styles.navLink}>
                        Về công ty
                    </Link>
                </nav>

                {/* ACTIONS: Search, User, Cart */}
                <div className={styles.actions}>
                    <form onSubmit={handleSearch} className={styles.searchContainer}>
                        <Search 
                            size={18} 
                            color="var(--muted-foreground)" 
                            className="cursor-pointer"
                            onClick={handleSearch}
                        />
                        <input
                            type="text"
                            placeholder="Tìm kiếm"
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    {isAuthenticated ? (
                        <Link 
                            href="/profile" 
                            className="flex items-center gap-2 px-4 py-2 border border-zinc-200 hover:bg-zinc-100 rounded-full transition-all"
                            aria-label="Profile"
                        >
                            <User size={16} />
                            <span className="text-sm font-semibold truncate max-w-[100px]">
                                {user?.fullName?.split(' ').pop()}
                            </span>
                        </Link>
                    ) : (
                        <Link href="/auth/login" className={styles.authLink}>
                            Đăng nhập
                        </Link>
                    )}

                    <Link href="/cart" className={styles.iconButton} aria-label="Shopping cart">
                        <ShoppingBag size={22} />
                        {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
