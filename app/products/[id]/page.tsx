'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/redux/hooks';
import { addItem } from '@/store/redux/cartSlice';
import { cartService } from '@/services/cartService';
import { productService } from '@/services/productService';
import { ProductResponse, ProductVariant } from '@/types/product';
import { formatVND } from '@/lib/utils';
import { reviewService } from '@/services/reviewService';
import { ReviewResponse } from '@/types/review';
import { Star } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const [product, setProduct] = useState<ProductResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [reviews, setReviews] = useState<ReviewResponse[]>([]);
    const [reviewPage, setReviewPage] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            try {
                const res = await productService.getProductById(id);
                if (res.success) {
                    setProduct(res.data);
                    if (res.data.variants && res.data.variants.length > 0) {
                        setSelectedVariant(res.data.variants[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch product detail", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchReviews = async () => {
            try {
                const res = await reviewService.getProductReviews(id, 0, 5);
                if (res.success) {
                    setReviews(res.data.content);
                    setTotalReviews(res.data.totalElements);
                }
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            }
        };

        fetchProduct();
        fetchReviews();
    }, [id]);

    const handleAddToCart = async () => {
        if (!selectedVariant || !product) {
            alert("Vui lòng chọn kích thước!");
            return;
        }

        const cartItemData = {
            id: product.id,
            name: product.name,
            price: product.salePrice || product.originalPrice,
            brand: product.brandName,
            size: selectedVariant.size,
            variantId: selectedVariant.id,
            image: product.images.find(img => img.isPrimary)?.imageUrl || product.images[0]?.imageUrl,
            quantity: 1
        };

        if (isAuthenticated) {
            try {
                const res = await cartService.addToCart({
                    variantId: selectedVariant.id,
                    quantity: 1
                });
                
                if (res.success && res.data) {
                    const serverItem = res.data;
                    dispatch(addItem({
                        id: serverItem.id.toString(),
                        variantId: serverItem.variantId,
                        name: serverItem.productName,
                        price: serverItem.unitPrice,
                        brand: serverItem.color || '',
                        size: serverItem.size,
                        quantity: 1,
                        image: serverItem.primaryImageUrl
                    }));
                    alert("Đã thêm vào giỏ hàng!");
                } else {
                    alert(res.message || "Không thể thêm vào giỏ hàng");
                }
            } catch (error: any) {
                console.error("Lỗi thêm giỏ hàng:", error);
                alert(error.response?.data?.message || "Đã xảy ra lỗi khi thêm vào giỏ hàng");
            }
        } else {
            dispatch(addItem(cartItemData));
            alert("Đã thêm vào giỏ hàng!");
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest text-zinc-400">Đang tải sản phẩm...</div>;
    }

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest text-red-500">Không tìm thấy sản phẩm</div>;
    }

    const images = product.images.sort((a, b) => a.sortOrder - b.sortOrder);

    return (
        <div className="bg-white min-h-screen p-[5%]">
            <nav className="text-sm font-medium text-zinc-500 mb-12 flex items-center transition-all">
                <Link href="/" className="hover:text-black transition-colors">Trang chủ</Link> 
                <span className="mx-2">/</span> 
                <Link href={`/products?category=${encodeURIComponent(product.categoryName)}`} className="hover:text-black transition-colors capitalize">
                    {product.categoryName.toLowerCase()}
                </Link> 
                <span className="mx-2">/</span> 
                <span className="text-black">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-[1400px] mx-auto">
                {/* Product Gallery */}
                <div className="flex flex-col gap-4">
                    <div
                        className="aspect-[4/5] bg-zinc-100 rounded-2xl overflow-hidden relative cursor-zoom-in"
                        onMouseEnter={() => setIsZoomed(true)}
                        onMouseLeave={() => setIsZoomed(false)}
                    >
                        {images.length > 0 ? (
                            <img
                                src={images[activeImage].imageUrl.startsWith('http') ? images[activeImage].imageUrl : `${process.env.NEXT_PUBLIC_API_URL}/files/${images[activeImage].imageUrl}`}
                                alt={product.name}
                                className={`w-full h-full object-cover transition-transform duration-500 ease-out ${isZoomed ? 'scale-125' : 'scale-100'}`}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-300 font-black uppercase italic">Không có ảnh</div>
                        )}
                        {isZoomed && (
                            <div className="absolute top-4 right-4 bg-white/80 px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-black">Đang phóng to</div>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img, i) => (
                                <button
                                    key={img.id}
                                    onClick={() => setActiveImage(i)}
                                    className={`aspect-square bg-zinc-50 border rounded-xl overflow-hidden transition-all ${activeImage === i ? 'border-black ring-1 ring-black' : 'border-zinc-100 hover:border-zinc-300'}`}
                                >
                                    <img 
                                        src={img.imageUrl.startsWith('http') ? img.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}/files/${img.imageUrl}`} 
                                        alt="" 
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    <span className="text-zinc-400 text-xs font-bold tracking-widest uppercase mb-4">{product.brandName}</span>
                    <h1 className="text-3xl font-bold tracking-tight mb-4">{product.name}</h1>
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-3xl font-medium">
                            {formatVND(product.salePrice || product.originalPrice)}
                        </span>
                        {product.salePrice < product.originalPrice && (
                            <span className="text-xl text-zinc-400 line-through">{formatVND(product.originalPrice)}</span>
                        )}
                    </div>

                    <p className="text-zinc-600 leading-relaxed mb-12">
                        {product.description || "Defining minimalist luxury through monochrome architecture and performance materials."}
                    </p>

                    <div className="mb-12">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold uppercase tracking-widest">Chọn kích thước (EU)</span>
                            <button className="text-[10px] font-bold text-zinc-400 border-b border-zinc-200 uppercase hover:text-black hover:border-black transition-colors">Hướng dẫn chọn size</button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {product.variants.map(variant => (
                                <button
                                    key={variant.id}
                                    disabled={variant.stockQuantity <= 0}
                                    onClick={() => setSelectedVariant(variant)}
                                    className={`py-3 border rounded-xl ${selectedVariant?.id === variant.id ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 hover:border-zinc-400'} text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed`}
                                >
                                    {variant.size}
                                </button>
                            ))}
                        </div>
                        {selectedVariant && selectedVariant.stockQuantity <= 5 && selectedVariant.stockQuantity > 0 && (
                            <p className="text-[10px] text-red-500 font-bold uppercase mt-2">Chỉ còn {selectedVariant.stockQuantity} sản phẩm trong kho</p>
                        )}
                    </div>

                    <div className="space-y-4 mb-12">
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-zinc-900 text-white py-4 font-bold tracking-widest text-sm rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-4"
                        >
                            Thêm vào giỏ hàng
                        </button>
                    </div>

                    <div className="border-t border-zinc-100 pt-8 space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-4 h-4 mt-1 bg-zinc-100 rounded-full flex items-center justify-center text-[6px]">✓</div>
                            <div>
                                <h4 className="text-xs font-bold uppercase">Giao hàng miễn phí</h4>
                                <p className="text-[11px] text-zinc-500">Cho tất cả đơn hàng trên {formatVND(2000000)}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-4 h-4 mt-1 bg-zinc-100 rounded-full flex items-center justify-center text-[6px]">✓</div>
                            <div>
                                <h4 className="text-xs font-bold uppercase">Bảo hành giới hạn 2 năm</h4>
                                <p className="text-[11px] text-zinc-500">Đảm bảo chất lượng thủ công</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="max-w-[1400px] mx-auto mt-32">
                <div className="border-t border-zinc-100 pt-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Đánh giá từ khách hàng</h2>
                            <div className="flex items-center gap-4">
                                <div className="flex text-black">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star 
                                            key={s} 
                                            size={16} 
                                            fill={s <= Math.round(product.avgRating || 0) ? "black" : "none"} 
                                            className={s <= Math.round(product.avgRating || 0) ? "text-black" : "text-zinc-200"}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-bold uppercase tracking-widest">{product.avgRating?.toFixed(1) || "0.0"} / 5.0</span>
                                <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">({totalReviews} đánh giá)</span>
                            </div>
                        </div>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="py-20 bg-zinc-50 rounded-sm text-center">
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Sản phẩm này chưa có đánh giá nào</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                            {reviews.map((review) => (
                                <div key={review.id} className="border-b border-zinc-100 pb-12">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center overflow-hidden">
                                                {review.avatarUrl ? (
                                                    <img src={review.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[10px] font-black uppercase text-zinc-400">{review.fullName.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black uppercase tracking-wider">{review.fullName}</h4>
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star 
                                                    key={s} 
                                                    size={10} 
                                                    fill={s <= review.rating ? "black" : "none"} 
                                                    className={s <= review.rating ? "text-black" : "text-zinc-200"}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-600 leading-relaxed italic">"{review.comment}"</p>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {totalReviews > reviews.length && (
                        <button className="mt-16 w-full py-4 border border-zinc-200 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all">
                            Xem tất cả đánh giá
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
