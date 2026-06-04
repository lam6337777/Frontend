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
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, salePrice, brand, image, label }) => {
    const isDiscounted = salePrice && salePrice < price;

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
                <div className={styles.header}>
                    <h3 className={styles.name}>{name}</h3>
                    <div className="flex flex-col items-end">
                        {isDiscounted ? (
                            <>
                                <span className={styles.price} style={{ color: '#ef4444' }}>
                                    {formatVND(salePrice)}
                                </span>
                                <span className="text-[10px] text-zinc-400 line-through">
                                    {formatVND(price)}
                                </span>
                            </>
                        ) : (
                            <span className={styles.price}>{formatVND(price)}</span>
                        )}
                    </div>
                </div>
                <p className={styles.brand}>{brand}</p>
            </div>
        </Link>
    );
};

export default ProductCard;
