import React from 'react';
import Link from 'next/link';
import styles from './ProductCard.module.css';
import { formatVND } from '@/lib/utils';

interface ProductCardProps {
    id: string | number;
    name: string;
    price: number;
    salePrice?: number;
    brand: string;
    image?: string | null;
    label?: string;
    variants?: Array<{
        stockQuantity: number;
    }>;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, salePrice, brand, image, label, variants }) => {
    const isDiscounted = salePrice && salePrice < price;
    const totalStock = variants ? variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) : 0;

    // Hàm xử lý làm sạch tên sản phẩm (loại bỏ thương hiệu lặp ở đầu tên sản phẩm)
    const cleanName = (prodName: string, brandName: string) => {
        const trimmedBrand = brandName.trim().toLowerCase();
        let trimmedProd = prodName.trim();
        if (trimmedProd.toLowerCase().startsWith(trimmedBrand)) {
            // Cắt chữ brand ở đầu cùng với khoảng trắng sau nó
            trimmedProd = trimmedProd.substring(brandName.length).trim();
        }
        return trimmedProd;
    };

    const displayName = cleanName(name, brand);

    return (
        <Link href={`/products/${id}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                {image ? (
                    <img
                        src={image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_API_URL}/files/${image}`}
                        alt={name}
                        className={styles.image}
                    />
                ) : (
                    <div className={styles.placeholder}>KHÔNG CÓ ẢNH</div>
                )}
                {label && <span className={styles.label}>{label}</span>}
            </div>
            <div className={styles.info}>
                {/* 1. Thương hiệu ở trên cùng, nhỏ, tinh tế */}
                <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase m-0">
                    {brand}
                </p>

                {/* 2. Tên sản phẩm đã được làm sạch, chiếm trọn 1 dòng */}
                <h3 className="text-sm font-semibold text-zinc-800 m-0 truncate w-full" title={name}>
                    {displayName}
                </h3>

                {/* 3. Giá tiền chiếm dòng riêng biệt, định dạng rõ ràng */}
                <div className="flex items-baseline gap-2 mt-1">
                    {isDiscounted ? (
                        <>
                            <span className="text-sm font-bold text-red-500">
                                {formatVND(salePrice)}
                            </span>
                            <span className="text-xs text-zinc-400 line-through">
                                {formatVND(price)}
                            </span>
                        </>
                    ) : (
                        <span className="text-sm font-bold text-zinc-900">
                            {formatVND(price)}
                        </span>
                    )}
                </div>

                {/* 4. Nhãn trạng thái tồn kho thiết kế mới ở dưới cùng */}
                {variants && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                        <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Trạng thái</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            totalStock > 0 
                                ? 'text-emerald-700 bg-emerald-50' 
                                : 'text-rose-700 bg-rose-50'
                        }`}>
                            {totalStock > 0 ? `Còn hàng (${totalStock})` : 'Hết hàng'}
                        </span>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ProductCard;
