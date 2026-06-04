'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/redux/hooks';
import { userService } from '@/services/userService';
import { orderService } from '@/services/orderService';
import { OrderResponse, OrderStatus, ReturnRequestType, OrderItemStatus } from '@/types/order';
import { UserResponse } from '@/types/user';
import { Package, User, LogOut, ChevronRight, AlertCircle, CheckCircle2, Clock, Truck, XCircle, RotateCcw } from 'lucide-react';
import styles from './profile.module.css';
import Link from 'next/link';
import { logout, updateUser } from '@/store/redux/authSlice';
import { clearCart } from '@/store/redux/cartSlice';
import { formatVND } from '@/lib/utils';
import { reviewService } from '@/services/reviewService';
import { Star } from 'lucide-react';

type Tab = 'profile' | 'orders';

export default function ProfilePage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated, isAuthChecked, user: authUser } = useAppSelector((state) => state.auth);
    
    const [activeTab, setActiveTab] = useState<Tab>('orders');
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [userProfile, setUserProfile] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);

    // Profile Form State
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        phone: ''
    });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Password Form State
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    
    // Review State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        productId: '',
        productName: '',
        orderId: 0,
        rating: 5,
        comment: ''
    });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Order Details Modal State
    const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderResponse | null>(null);

    const handleOpenOrderDetails = (order: OrderResponse) => {
        setSelectedOrderDetails(order);
        setIsOrderDetailsModalOpen(true);
    };

    useEffect(() => {
        // Chỉ redirect nếu đã kiểm tra auth xong mà vẫn chưa authenticated
        if (isAuthChecked && !isAuthenticated) {
            router.push('/auth/login?redirect=/profile');
            return;
        }

        // Nếu chưa kiểm tra xong hoặc đã authenticated thì tiếp tục
        if (!isAuthenticated) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [ordersRes, profileRes] = await Promise.all([
                    orderService.getUserOrders({ size: 50 }),
                    userService.getMyProfile()
                ]);

                if (ordersRes.success) setOrders(ordersRes.data.content);
                if (profileRes.success) {
                    setUserProfile(profileRes.data);
                    setProfileForm({
                        fullName: profileRes.data.fullName,
                        phone: profileRes.data.phone || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, router]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        try {
            const res = await userService.updateProfile(profileForm);
            if (res.success) {
                setUserProfile(res.data);
                // Map UserResponse sang User type của Redux
                dispatch(updateUser({
                    id: res.data.id,
                    email: res.data.email,
                    fullName: res.data.fullName,
                    phone: res.data.phone || '',
                    avatarUrl: res.data.avatarUrl || '',
                    role: res.data.role as 'CUSTOMER' | 'ADMIN',
                    isActive: res.data.isActive
                }));
                alert('Cập nhật thông tin thành công!');
            } else {
                alert(res.message || 'Cập nhật thất bại');
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('Mật khẩu mới không khớp!');
            return;
        }

        setIsChangingPassword(true);
        try {
            const res = await userService.changePassword({
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword
            });
            if (res.success) {
                alert('Đổi mật khẩu thành công!');
                setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                alert(res.message || 'Đổi mật khẩu thất bại');
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Đã xảy ra lỗi khi đổi mật khẩu');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleCancelOrder = async (code: string) => {
        if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
        
        try {
            const res = await orderService.cancelOrder(code);
            if (res.success) {
                alert('Hủy đơn hàng thành công');
                setOrders(prev => prev.map(o => o.orderCode === code ? { ...o, status: OrderStatus.CANCELLED } : o));
            } else {
                alert(res.message || 'Không thể hủy đơn hàng');
            }
        } catch (error) {
            alert('Đã xảy ra lỗi khi hủy đơn hàng');
        }
    };

    const handleRequestReturn = async (code: string) => {
        const reason = prompt('Vui lòng nhập lý do hoàn hàng:');
        if (!reason) return;

        try {
            // Lấy id của tất cả item trong đơn hàng (giả định hoàn cả đơn)
            const order = orders.find(o => o.orderCode === code);
            if (!order) return;

            const res = await orderService.createReturnRequest({
                orderCode: code,
                type: ReturnRequestType.RETURN,
                reason,
                orderItemIds: order.items.map(i => i.id)
            });

            if (res.success) {
                alert('Gửi yêu cầu hoàn hàng thành công. Chúng tôi sẽ phản hồi sớm nhất.');
                setOrders(prev => prev.map(o => o.orderCode === code ? { ...o, status: OrderStatus.RETURN_REQUESTED } : o));
            } else {
                alert(res.message || 'Không thể gửi yêu cầu hoàn hàng');
            }
        } catch (error) {
            alert('Đã xảy ra lỗi khi gửi yêu cầu');
        }
    };



    const handleLogout = () => {
        setProfileForm({ fullName: '', phone: '' });
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        dispatch(logout());
        dispatch(clearCart());
        router.push('/');
    };

    const handleOpenReviewModal = (item: any, orderId: number) => {
        setReviewForm({
            productId: item.productId,
            productName: item.productName,
            orderId: orderId,
            rating: 5,
            comment: ''
        });
        setIsReviewModalOpen(true);
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingReview(true);
        try {
            const res = await reviewService.createReview({
                productId: reviewForm.productId,
                orderId: reviewForm.orderId,
                rating: reviewForm.rating,
                comment: reviewForm.comment
            });
            if (res.success) {
                alert('Cảm ơn bạn đã đánh giá sản phẩm!');
                setIsReviewModalOpen(false);
            } else {
                alert(res.message || 'Đánh giá thất bại');
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Đã xảy ra lỗi khi gửi đánh giá');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (!isAuthenticated || loading) {
        return (
            <div className={styles.container}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.max}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Tài khoản<br />của bạn</h1>
                </header>

                <div className={styles.layout}>
                    {/* SIDEBAR */}
                    <aside className={styles.sidebar}>
                        <button 
                            className={`${styles.navItem} ${activeTab === 'orders' ? styles.navItemActive : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            Đơn hàng của tôi
                        </button>
                        <button 
                            className={`${styles.navItem} ${activeTab === 'profile' ? styles.navItemActive : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            Thông tin cá nhân
                        </button>
                        <button className={styles.navItem} onClick={handleLogout}>
                            Đăng xuất
                        </button>
                    </aside>

                    {/* CONTENT */}
                    <main className={styles.content}>
                        {activeTab === 'orders' ? (
                            <section>
                                <h2 className={styles.sectionTitle}>Lịch sử mua hàng</h2>
                                {orders.length === 0 ? (
                                    <div className="py-20 text-center flex flex-col items-center">
                                        <Package size={48} strokeWidth={1} className="text-zinc-200 mb-4" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Bạn chưa có đơn hàng nào</p>
                                        <Link href="/products" className="mt-8 text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1">
                                            Bắt đầu mua sắm ngay
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {orders.map((order) => (
                                            <div key={order.orderCode} className={styles.orderCard}>
                                                <div className={styles.orderHeader}>
                                                    <div className={styles.orderMeta}>
                                                        <span className={styles.orderCode}>#{order.orderCode}</span>
                                                        <span className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                                                    </div>
                                                    <span className={`${styles.statusBadge} ${styles[`status${order.status}`]}`}>
                                                        {order.status}
                                                    </span>
                                                </div>

                                                <div className={styles.orderItems}>
                                                    {order.items.map((item) => (
                                                        <div key={item.id} className={styles.orderItem}>
                                                            <img 
                                                                src={item.imageUrl?.startsWith('http') ? item.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}/files/${item.imageUrl}`} 
                                                                alt="" 
                                                                className={styles.itemImage}
                                                            />
                                                            <div className={styles.itemInfo}>
                                                                <h4 className={styles.itemName}>{item.productName}</h4>
                                                                <p className={styles.itemMeta}>Số lượng: {item.quantity} • Size: {item.size}</p>
                                                                {item.status && item.status !== OrderItemStatus.ACTIVE && (
                                                                    <span className="text-[9px] font-black text-black bg-zinc-100 px-2 py-0.5 mt-1 inline-block uppercase tracking-wider">
                                                                        {item.status === OrderItemStatus.RETURN_REQUESTED ? 'Đang yêu cầu hoàn hàng' :
                                                                         item.status === OrderItemStatus.RETURNED ? 'Đã hoàn hàng' :
                                                                         item.status === OrderItemStatus.EXCHANGE_REQUESTED ? 'Đang yêu cầu đổi hàng' :
                                                                         item.status === OrderItemStatus.EXCHANGED ? 'Đã đổi hàng' :
                                                                         item.status === OrderItemStatus.WARRANTY_REQUESTED ? 'Đang yêu cầu bảo hành' :
                                                                         item.status}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-end gap-2">
                                                                <span className="text-[11px] font-bold">{formatVND(item.totalPrice)}</span>
                                                                <Link 
                                                                    href={`/products/${item.productId}`}
                                                                    className="text-[10px] font-bold tracking-widest bg-zinc-900 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all inline-block"
                                                                >
                                                                    Mua lại
                                                                </Link>
                                                                {order.status === OrderStatus.DELIVERED && (
                                                                    <button 
                                                                        onClick={() => handleOpenReviewModal(item, (order as any).id)}
                                                                        disabled={item.isReviewed}
                                                                        className={`text-[10px] font-bold tracking-widest px-4 py-2 rounded-full transition-all ${
                                                                            item.isReviewed 
                                                                            ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                                                                            : "bg-white text-zinc-900 border border-zinc-200 hover:border-zinc-300 hover:shadow-md hover:-translate-y-0.5"
                                                                        }`}
                                                                    >
                                                                        {item.isReviewed ? 'Đã đánh giá' : 'Đánh giá'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className={styles.orderFooter}>
                                                    <div className={styles.total}>
                                                        <span className={styles.totalLabel}>Tổng thanh toán:</span>
                                                        {formatVND(order.totalAmount)}
                                                    </div>

                                                    <div className={styles.actions}>
                                                        {order.status === OrderStatus.PENDING && (
                                                            <button 
                                                                className={`${styles.btn} ${styles.btnDanger}`}
                                                                onClick={() => handleCancelOrder(order.orderCode)}
                                                            >
                                                                Hủy đơn hàng
                                                            </button>
                                                        )}
                                                        {order.status === OrderStatus.DELIVERED && 
                                                         order.items.every(item => !item.status || item.status === OrderItemStatus.ACTIVE) && (
                                                            <button 
                                                                className={`${styles.btn} ${styles.btnSecondary}`}
                                                                onClick={() => handleRequestReturn(order.orderCode)}
                                                            >
                                                                <RotateCcw size={12} className="inline mr-2" />
                                                                Yêu cầu hoàn hàng
                                                            </button>
                                                        )}
                                                        <button 
                                                            className={`${styles.btn} bg-white text-black border-2 border-black font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all`}
                                                            onClick={() => handleOpenOrderDetails(order)}
                                                        >
                                                            Xem chi tiết
                                                        </button>
                                                        {/* Nút Mua lại ở đây đã được thay thế bằng nút mua lại từng sản phẩm cho chính xác hơn */}
                                                        <Link href={`/products/${order.items[0]?.productId || ''}`} className={`${styles.btn} ${styles.btnPrimary}`}>
                                                            Xem lại sản phẩm
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        ) : (
                            <section>
                                <h2 className={styles.sectionTitle}>Thông tin tài khoản</h2>
                                <form className={styles.form} onSubmit={handleUpdateProfile}>
                                    <div className={styles.field}>
                                        <label className={styles.label}>Họ và tên</label>
                                        <input 
                                            type="text" 
                                            className={styles.input} 
                                            value={profileForm.fullName}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label className={styles.label}>Số điện thoại</label>
                                        <input 
                                            type="text" 
                                            className={styles.input} 
                                            value={profileForm.phone}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                                        />
                                    </div>
                                    <div className={`${styles.field} ${styles.fieldFull}`}>
                                        <label className={styles.label}>Email</label>
                                        <input type="email" className={styles.input} defaultValue={userProfile?.email} disabled />
                                    </div>
                                    <div className={`${styles.field} ${styles.fieldFull}`}>
                                        <button 
                                            type="submit" 
                                            className={`${styles.btn} ${styles.btnPrimary} w-fit mt-4 px-12`}
                                            disabled={isUpdatingProfile}
                                        >
                                            {isUpdatingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                    </div>
                                </form>

                                <h2 className={`${styles.sectionTitle} mt-20`}>Bảo mật</h2>
                                <form className={styles.form} onSubmit={handleChangePassword}>
                                    <div className={styles.field}>
                                        <label className={styles.label}>Mật khẩu hiện tại</label>
                                        <input 
                                            type="password" 
                                            className={styles.input} 
                                            value={passwordForm.oldPassword}
                                            onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label className={styles.label}>Mật khẩu mới</label>
                                        <input 
                                            type="password" 
                                            className={styles.input} 
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label className={styles.label}>Xác nhận mật khẩu</label>
                                        <input 
                                            type="password" 
                                            className={styles.input} 
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className={`${styles.field} ${styles.fieldFull}`}>
                                        <button 
                                            type="submit" 
                                            className={`${styles.btn} ${styles.btnSecondary} w-fit mt-4 px-12`}
                                            disabled={isChangingPassword}
                                        >
                                            {isChangingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
                                        </button>
                                    </div>
                                </form>
                            </section>
                        )}
                    </main>
                </div>
            </div>

            {/* Review Modal */}
            {isReviewModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md p-8 rounded-sm">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-2">Đánh giá sản phẩm</h3>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-8">{reviewForm.productName}</p>
                        
                        <form onSubmit={handleSubmitReview} className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest mb-4 block">Mức độ hài lòng</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                            className="transition-transform hover:scale-110"
                                        >
                                            <Star 
                                                size={24} 
                                                fill={star <= reviewForm.rating ? "black" : "none"} 
                                                className={star <= reviewForm.rating ? "text-black" : "text-zinc-200"}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest mb-4 block">Nhận xét của bạn</label>
                                <textarea
                                    className="w-full border border-zinc-200 p-4 text-sm focus:outline-none focus:border-black min-h-[120px]"
                                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsReviewModalOpen(false)}
                                    className="flex-1 py-3 bg-zinc-100 text-zinc-900 text-xs font-bold tracking-widest rounded-full hover:bg-zinc-200 transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingReview}
                                    className="flex-1 py-3 bg-zinc-900 text-white text-xs font-bold tracking-widest rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Order Details Modal */}
            {isOrderDetailsModalOpen && selectedOrderDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl p-8 rounded-sm max-h-[90vh] overflow-y-auto relative">
                        <button 
                            onClick={() => setIsOrderDetailsModalOpen(false)}
                            className="absolute top-6 right-6 text-zinc-400 hover:text-black transition-colors"
                        >
                            <XCircle size={24} strokeWidth={1.5} />
                        </button>
                        
                        <h3 className="text-xl font-black uppercase tracking-tight mb-6 border-b-2 border-black pb-4 inline-block">Chi tiết đơn hàng #{selectedOrderDetails.orderCode}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Thông tin giao hàng</h4>
                                <div className="space-y-2 text-sm font-medium">
                                    <p><span className="text-zinc-500">Người nhận:</span> {selectedOrderDetails.shippingName}</p>
                                    <p><span className="text-zinc-500">Số điện thoại:</span> {selectedOrderDetails.shippingPhone}</p>
                                    <p><span className="text-zinc-500">Địa chỉ:</span> {selectedOrderDetails.shippingAddress}</p>
                                    {selectedOrderDetails.note && (
                                        <p><span className="text-zinc-500">Ghi chú:</span> {selectedOrderDetails.note}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Thông tin thanh toán</h4>
                                <div className="space-y-2 text-sm font-medium">
                                    <p><span className="text-zinc-500">Phương thức:</span> {selectedOrderDetails.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : selectedOrderDetails.paymentMethod}</p>
                                    <p><span className="text-zinc-500">Trạng thái:</span> {selectedOrderDetails.paymentStatus}</p>
                                    <p><span className="text-zinc-500">Tạm tính:</span> {formatVND(selectedOrderDetails.subtotal)}</p>
                                    <p><span className="text-zinc-500">Phí giao hàng:</span> {formatVND(selectedOrderDetails.shippingFee)}</p>
                                    <p className="text-lg font-black mt-2 pt-2 border-t border-zinc-100"><span className="text-sm font-medium text-zinc-500">Tổng cộng:</span> {formatVND(selectedOrderDetails.totalAmount)}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Sản phẩm</h4>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                {selectedOrderDetails.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 border border-zinc-100 p-4">
                                        <img 
                                            src={item.imageUrl?.startsWith('http') ? item.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}/files/${item.imageUrl}`} 
                                            alt={item.productName} 
                                            className="w-20 h-20 object-cover bg-zinc-50"
                                        />
                                        <div className="flex-1">
                                            <h5 className="font-bold text-sm mb-1">{item.productName}</h5>
                                            <p className="text-xs text-zinc-500 mb-2">Phân loại: {item.color}, Size {item.size}</p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">{formatVND(item.unitPrice)} x {item.quantity}</span>
                                                <span className="text-sm font-black">{formatVND(item.totalPrice)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
