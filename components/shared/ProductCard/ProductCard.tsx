import React from 'react';
import styles from './ProductCard.module.css';
import { formatVND } from '@/lib/utils';

interface ProductCardProps {
    name: string;
    price: number;
    brand: string;
    label?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ name, price, brand, label }) => {
    return (
        <div className={styles.card}>
            <div className={styles.imageWrapper}>
                {label && <span className={styles.label}>{label}</span>}
                <div className={styles.placeholder}>
                    {/* Sẽ thay thế bằng Image thật nếu có */}
                </div>
            </div>
            <div className={styles.info}>
                <div className={styles.header}>
                    <h3 className={styles.name}>{name}</h3>
                    <span className={styles.price}>{formatVND(price)}</span>
                </div>
                <p className={styles.brand}>{brand}</p>
            </div>
        </div>
    );
};

export default ProductCard;
